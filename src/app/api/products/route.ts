import { NextRequest } from 'next/server';
import { ProductController } from '@/controllers/product.controller';

const controller = new ProductController();

export async function GET(request: NextRequest) {
  return controller.getAll(request);
}

export async function POST(request: NextRequest) {
  return controller.create(request);
}
