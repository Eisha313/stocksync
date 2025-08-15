import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { PaymentService } from '@/services/payment.service';
import { UserRepository } from '@/lib/db/repositories/user.repository';

const paymentService = new PaymentService();
const userRepository = new UserRepository();

export class PaymentController {
  static async createCheckoutSession(request: NextRequest) {
    try {
      const body = await request.json();
      const { userId, planType } = body;

      if (!userId || !planType) {
        return ApiResponse.badRequest('userId and planType are required');
      }

      if (!['sms', 'premium'].includes(planType)) {
        return ApiResponse.badRequest('Invalid plan type');
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return ApiResponse.notFound('User not found');
      }

      const session = await paymentService.createCheckoutSession(
        userId,
        user.email,
        planType
      );

      return ApiResponse.success({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return ApiResponse.error('Failed to create checkout session');
    }
  }

  static async getPaymentHistory(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return ApiResponse.badRequest('userId is required');
      }

      const payments = await paymentService.getPaymentHistory(userId);
      return ApiResponse.success({ payments });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return ApiResponse.error('Failed to fetch payment history');
    }
  }

  static async verifyPayment(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get('sessionId');

      if (!sessionId) {
        return ApiResponse.badRequest('sessionId is required');
      }

      const payment = await paymentService.verifyPayment(sessionId);

      if (!payment) {
        return ApiResponse.notFound('Payment not found');
      }

      return ApiResponse.success({ payment });
    } catch (error) {
      console.error('Error verifying payment:', error);
      return ApiResponse.error('Failed to verify payment');
    }
  }
}
