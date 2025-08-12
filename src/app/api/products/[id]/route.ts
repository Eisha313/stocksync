import { NextRequest } from 'next/server';
import { ProductController } from '@/controllers/product.controller';

const controller = new ProductController();

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return controller.getById(request, params.id);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return controller.update(request, params.id);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return controller.delete(request, params.id);
}
