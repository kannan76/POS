import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(product[0], { status: 200 });
  } catch (error: any) {
    console.error('GET product error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate mrp if provided
    if (body.mrp !== undefined) {
      const mrp = parseFloat(body.mrp);
      if (isNaN(mrp) || mrp <= 0) {
        return NextResponse.json(
          { error: 'MRP must be a positive number', code: 'INVALID_MRP' },
          { status: 400 }
        );
      }
    }

    // Validate sellingPrice if provided
    if (body.sellingPrice !== undefined) {
      const sellingPrice = parseFloat(body.sellingPrice);
      if (isNaN(sellingPrice) || sellingPrice <= 0) {
        return NextResponse.json(
          {
            error: 'Selling price must be a positive number',
            code: 'INVALID_SELLING_PRICE',
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }

    if (body.category !== undefined) {
      updateData.category = body.category.trim();
    }

    if (body.mrp !== undefined) {
      updateData.mrp = parseFloat(body.mrp);
    }

    if (body.sellingPrice !== undefined) {
      updateData.sellingPrice = parseFloat(body.sellingPrice);
    }

    if (body.unit !== undefined) {
      updateData.unit = body.unit.trim();
    }

    if (body.barcode !== undefined) {
      updateData.barcode = body.barcode ? body.barcode.trim() : null;
    }

    if (body.stockQuantity !== undefined) {
      updateData.stockQuantity = parseInt(body.stockQuantity);
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const updated = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update product', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT product error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete product', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        product: deleted[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE product error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}