import Stripe from 'stripe';
import { stripe, STRIPE_PRICES, PREMIUM_FEATURES } from '@/lib/stripe';
import { UserRepository } from '@/lib/db/repositories';
import { User, PaymentStatus } from '@/types';

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  priceType: keyof typeof STRIPE_PRICES;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  eventType?: string;
  error?: string;
}

export class PaymentService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<PaymentResult> {
    const { userId, userEmail, priceType, successUrl, cancelUrl } = params;

    try {
      const priceId = STRIPE_PRICES[priceType];
      
      if (!priceId) {
        return {
          success: false,
          error: `Invalid price type: ${priceType}`,
        };
      }

      // Get or create Stripe customer
      let user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });
        
        customerId = customer.id;
        
        await this.userRepository.update(userId, {
          stripeCustomerId: customerId,
        });
      }

      // Create checkout session for one-time payment
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          priceType: priceType,
        },
      });

      return {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url || undefined,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      };
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return {
        success: true,
        eventType: event.type,
      };
    } catch (error) {
      console.error('Error handling webhook event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle webhook event',
      };
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const priceType = session.metadata?.priceType as keyof typeof STRIPE_PRICES;

    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }

    // Get premium features for this price type
    const features = PREMIUM_FEATURES[priceType] || [];

    // Update user with premium features
    await this.userRepository.update(userId, {
      isPremium: true,
      premiumFeatures: features,
      paymentStatus: 'completed' as PaymentStatus,
    });

    console.log(`User ${userId} upgraded to premium with features:`, features);
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log(`Payment succeeded: ${paymentIntent.id}`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const customerId = paymentIntent.customer as string;
    
    if (customerId) {
      const users = await this.userRepository.findByStripeCustomerId(customerId);
      
      if (users) {
        await this.userRepository.update(users._id!.toString(), {
          paymentStatus: 'failed' as PaymentStatus,
        });
      }
    }

    console.log(`Payment failed: ${paymentIntent.id}`);
  }

  async getCustomerPaymentHistory(userId: string): Promise<Stripe.PaymentIntent[]> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user?.stripeCustomerId) {
        return [];
      }

      const paymentIntents = await stripe.paymentIntents.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });

      return paymentIntents.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  async verifyPremiumStatus(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      return user?.isPremium || false;
    } catch (error) {
      console.error('Error verifying premium status:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();