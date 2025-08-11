import { NextRequest } from 'next/server';
import { productRepository } from '@/lib/db/repositories';
import { validateProduct } from '@/lib/validators/product';
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lowStock = searchParams.get('lowStock');

    let products;

    if (userId && lowStock === 'true') {
      products = await productRepository.findLowStockByUser(userId);
    } else if (userId) {
      products = await productRepository.findByUserId(userId);
    } else {
      products = await productRepository.findAll();
    }

    return successResponse(products);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateProduct(body);
    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const product = await productRepository.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return createdResponse(product);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
