import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, invoices } from '@/db/schema';
import { eq, gte, lte, desc, count, sum, lt, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const startOfDayISO = startOfDay.toISOString();
    const endOfDayISO = endOfDay.toISOString();

    // Query 1: Daily sales (sum of grandTotal from today's invoices)
    const dailySalesResult = await db
      .select({
        total: sum(invoices.grandTotal)
      })
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, startOfDayISO),
          lte(invoices.createdAt, endOfDayISO)
        )
      );

    const dailySales = dailySalesResult[0]?.total ?? 0;

    // Query 2: Total active products count
    const totalProductsResult = await db
      .select({
        count: count()
      })
      .from(products)
      .where(eq(products.isActive, true));

    const totalProducts = totalProductsResult[0]?.count ?? 0;

    // Query 3: Low stock products count (stockQuantity < 10 and isActive = true)
    const lowStockProductsResult = await db
      .select({
        count: count()
      })
      .from(products)
      .where(
        and(
          lt(products.stockQuantity, 10),
          eq(products.isActive, true)
        )
      );

    const lowStockProducts = lowStockProductsResult[0]?.count ?? 0;

    // Query 4: Recent 5 invoices ordered by createdAt DESC
    const recentInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerName: invoices.customerName,
        grandTotal: invoices.grandTotal,
        createdAt: invoices.createdAt
      })
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    return NextResponse.json({
      dailySales: Number(dailySales),
      totalProducts,
      lowStockProducts,
      recentInvoices
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}