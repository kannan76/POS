import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems } from '@/db/schema';
import { eq, like, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerPhone = searchParams.get('customerPhone');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(invoices);

    const conditions = [];

    if (startDate) {
      conditions.push(gte(invoices.createdAt, startDate));
    }

    if (endDate) {
      const endDateTime = `${endDate}T23:59:59.999Z`;
      conditions.push(lte(invoices.createdAt, endDateTime));
    }

    if (customerPhone) {
      conditions.push(like(invoices.customerPhone, `%${customerPhone}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      subtotal,
      grandTotal,
      customerName,
      customerPhone,
      discountAmount = 0,
      discountPercentage = 0,
      taxPercentage = 0,
      taxAmount = 0,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required', code: 'MISSING_ITEMS' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Items array cannot be empty', code: 'EMPTY_ITEMS' },
        { status: 400 }
      );
    }

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required', code: 'INVALID_SUBTOTAL' },
        { status: 400 }
      );
    }

    if (!grandTotal || grandTotal <= 0) {
      return NextResponse.json(
        { error: 'Valid grand total is required', code: 'INVALID_GRAND_TOTAL' },
        { status: 400 }
      );
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.productName) {
        return NextResponse.json(
          {
            error: `Item ${i + 1}: Product name is required`,
            code: 'MISSING_PRODUCT_NAME',
          },
          { status: 400 }
        );
      }

      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: `Item ${i + 1}: Valid quantity is required`,
            code: 'INVALID_QUANTITY',
          },
          { status: 400 }
        );
      }

      if (!item.price || item.price <= 0) {
        return NextResponse.json(
          {
            error: `Item ${i + 1}: Valid price is required`,
            code: 'INVALID_PRICE',
          },
          { status: 400 }
        );
      }

      if (!item.lineTotal || item.lineTotal <= 0) {
        return NextResponse.json(
          {
            error: `Item ${i + 1}: Valid line total is required`,
            code: 'INVALID_LINE_TOTAL',
          },
          { status: 400 }
        );
      }
    }

    // Generate invoice number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    const todayInvoices = await db
      .select()
      .from(invoices)
      .where(like(invoices.invoiceNumber, `KPS-${dateStr}-%`))
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1);

    let sequenceNumber = 1;
    if (todayInvoices.length > 0) {
      const lastNumber = todayInvoices[0].invoiceNumber;
      const lastSeq = parseInt(lastNumber.split('-')[2]);
      sequenceNumber = lastSeq + 1;
    }

    const invoiceNumber = `KPS-${dateStr}-${String(sequenceNumber).padStart(3, '0')}`;
    const createdAt = now.toISOString();

    // Create invoice
    const newInvoice = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        customerName: customerName?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        subtotal,
        discountAmount,
        discountPercentage,
        taxPercentage,
        taxAmount,
        grandTotal,
        createdAt,
      })
      .returning();

    if (newInvoice.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create invoice', code: 'INVOICE_CREATE_FAILED' },
        { status: 500 }
      );
    }

    const invoice = newInvoice[0];

    // Create invoice items
    const itemsToInsert = items.map((item: any) => ({
      invoiceId: invoice.id,
      productId: item.productId || null,
      productName: item.productName.trim(),
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.lineTotal,
      createdAt,
    }));

    const createdItems = await db
      .insert(invoiceItems)
      .values(itemsToInsert)
      .returning();

    // Return invoice with items
    const response = {
      ...invoice,
      items: createdItems,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}