import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/lib/db/repositories';
import { validateProduct } from '@/lib/validators/product';
import { Product } from '@/types';

const productRepository = new ProductRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lowStock = searchParams.get('lowStock');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let products: Product[];

    if (lowStock === 'true') {
      products = await productRepository.findLowStockProducts(userId);
    } else {
      products = await productRepository.findByUserId(userId);
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = validateProduct(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: body.userId,
      name: body.name,
      sku: body.sku,
      quantity: body.quantity,
      threshold: body.threshold,
      category: body.category,
      description: body.description,
    };

    const product = await productRepository.create(productData);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
