import { NextRequest } from 'next/server';
import { PaymentController } from '@/controllers/payment.controller';

export async function POST(request: NextRequest) {
  return PaymentController.createCheckoutSession(request);
}
