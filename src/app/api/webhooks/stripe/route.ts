import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { ApiResponse } from '@/lib/api/response';
import { PaymentService } from '@/services/payment.service';
import { UserRepository } from '@/lib/db/repositories/user.repository';

const paymentService = new PaymentService();
const userRepository = new UserRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return ApiResponse.badRequest('Missing Stripe signature');
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not configured');
      return ApiResponse.error('Webhook configuration error');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', message);
      return ApiResponse.badRequest(`Webhook signature verification failed: ${message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return ApiResponse.success({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return ApiResponse.error('Webhook processing failed');
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as 'sms' | 'premium' | undefined;

  if (!userId || !planType) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  try {
    // Record the payment
    await paymentService.recordPayment(userId, {
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
      planType,
    });

    // Update user subscription
    const user = await userRepository.findById(userId);
    if (user) {
      const features = user.features || {
        smsNotifications: false,
        emailNotifications: true,
        maxProducts: 50,
        maxAlerts: 100,
      };

      if (planType === 'sms') {
        features.smsNotifications = true;
      } else if (planType === 'premium') {
        features.smsNotifications = true;
        features.maxProducts = 500;
        features.maxAlerts = 1000;
      }

      await userRepository.update(userId, {
        subscription: {
          plan: planType === 'premium' ? 'premium' : 'basic',
          status: 'active',
          startDate: new Date(),
        },
        features,
      });
    }

    console.log(`Successfully processed payment for user ${userId}, plan: ${planType}`);
  } catch (error) {
    console.error('Error processing checkout session:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
  // Additional processing if needed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;

  if (userId) {
    await paymentService.recordPayment(userId, {
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      planType: paymentIntent.metadata?.planType as 'sms' | 'premium' || 'sms',
    });
  }

  console.log(`PaymentIntent ${paymentIntent.id} failed`);
}
