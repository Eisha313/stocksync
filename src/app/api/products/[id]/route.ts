import { NextRequest } from 'next/server';
import { productRepository } from '@/lib/db/repositories';
import { validateProduct } from '@/lib/validators/product';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = await productRepository.findById(params.id);

    if (!product) {
      return notFoundResponse('Product');
    }

    return successResponse(product);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    const validation = validateProduct(body, true);
    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const product = await productRepository.update(params.id, {
      ...body,
      updatedAt: new Date(),
    });

    if (!product) {
      return notFoundResponse('Product');
    }

    return successResponse(product);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const success = await productRepository.delete(params.id);

    if (!success) {
      return notFoundResponse('Product');
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
