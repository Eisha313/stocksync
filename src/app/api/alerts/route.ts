import { NextRequest } from 'next/server';
import { AlertController } from '@/controllers/alert.controller';

const controller = new AlertController();

export async function GET(request: NextRequest) {
  return controller.getAll(request);
}

export async function POST(request: NextRequest) {
  return controller.create(request);
}
