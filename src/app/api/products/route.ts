import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isActiveParam = searchParams.get('isActive');

    let query = db.select().from(products);
    const conditions = [];

    // Filter by category
    if (category) {
      conditions.push(eq(products.category, category));
    }

    // Filter by isActive status
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      conditions.push(eq(products.isActive, isActive));
    }

    // Search across name, category, and barcode
    if (search) {
      const searchCondition = or(
        like(products.name, `%${search}%`),
        like(products.category, `%${search}%`),
        like(products.barcode, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering and pagination
    const results = await query
      .orderBy(desc(products.createdAt))
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
    const { name, category, mrp, sellingPrice, unit, barcode, stockQuantity, isActive } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Product name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { error: 'Product category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    if (mrp === undefined || mrp === null) {
      return NextResponse.json(
        { error: 'MRP is required', code: 'MISSING_MRP' },
        { status: 400 }
      );
    }

    if (sellingPrice === undefined || sellingPrice === null) {
      return NextResponse.json(
        { error: 'Selling price is required', code: 'MISSING_SELLING_PRICE' },
        { status: 400 }
      );
    }

    // Validate price values
    const mrpValue = parseFloat(mrp);
    const sellingPriceValue = parseFloat(sellingPrice);

    if (isNaN(mrpValue) || mrpValue <= 0) {
      return NextResponse.json(
        { error: 'MRP must be a positive number', code: 'INVALID_MRP' },
        { status: 400 }
      );
    }

    if (isNaN(sellingPriceValue) || sellingPriceValue <= 0) {
      return NextResponse.json(
        { error: 'Selling price must be a positive number', code: 'INVALID_SELLING_PRICE' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults and sanitization
    const now = new Date().toISOString();
    const insertData = {
      name: name.trim(),
      category: category.trim(),
      mrp: mrpValue,
      sellingPrice: sellingPriceValue,
      unit: unit?.trim() || 'piece',
      barcode: barcode?.trim() || null,
      stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: now,
      updatedAt: now,
    };

    // Validate stockQuantity if provided
    if (isNaN(insertData.stockQuantity)) {
      return NextResponse.json(
        { error: 'Stock quantity must be a valid number', code: 'INVALID_STOCK_QUANTITY' },
        { status: 400 }
      );
    }

    const newProduct = await db.insert(products)
      .values(insertData)
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}