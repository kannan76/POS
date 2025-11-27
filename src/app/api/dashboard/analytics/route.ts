import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, invoiceItems, products } from '@/db/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate date 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Include today, so -6
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    // Query 1: Daily Sales for Last 7 Days
    const dailySalesQuery = await db
      .select({
        date: sql<string>`DATE(${invoices.createdAt})`.as('date'),
        sales: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.as('sales'),
      })
      .from(invoices)
      .where(sql`DATE(${invoices.createdAt}) >= ${startDate}`)
      .groupBy(sql`DATE(${invoices.createdAt})`)
      .orderBy(sql`DATE(${invoices.createdAt}) ASC`);

    // Create array of last 7 days with zero sales
    const dailySalesMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailySalesMap.set(dateStr, 0);
    }

    // Fill in actual sales data
    dailySalesQuery.forEach((row) => {
      dailySalesMap.set(row.date, Number(row.sales) || 0);
    });

    // Convert map to array
    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Query 2: Sales by Product Category
    const salesByCategoryQuery = await db
      .select({
        category: products.category,
        sales: sql<number>`COALESCE(SUM(${invoiceItems.lineTotal}), 0)`.as('sales'),
      })
      .from(invoiceItems)
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .groupBy(products.category)
      .orderBy(desc(sql`COALESCE(SUM(${invoiceItems.lineTotal}), 0)`));

    const salesByCategory = salesByCategoryQuery.map((row) => ({
      category: row.category,
      sales: Number(row.sales) || 0,
    }));

    // Query 3: Top 5 Selling Products by Revenue
    const topProductsQuery = await db
      .select({
        name: products.name,
        revenue: sql<number>`COALESCE(SUM(${invoiceItems.lineTotal}), 0)`.as('revenue'),
      })
      .from(invoiceItems)
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`COALESCE(SUM(${invoiceItems.lineTotal}), 0)`))
      .limit(5);

    const topProducts = topProductsQuery.map((row) => ({
      name: row.name,
      revenue: Number(row.revenue) || 0,
    }));

    return NextResponse.json(
      {
        dailySales,
        salesByCategory,
        topProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/dashboard/analytics error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}