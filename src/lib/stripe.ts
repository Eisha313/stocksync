import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || '';

export const PREMIUM_FEATURES = {
  smsNotifications: true,
  emailNotifications: true,
  unlimitedProducts: true,
  advancedAnalytics: true,
  prioritySupport: true,
} as const;

export const FREE_TIER_LIMITS = {
  maxProducts: 10,
  maxAlerts: 5,
  smsNotifications: false,
  emailNotifications: true,
} as const;

export async function createCheckoutSession({
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price: PREMIUM_PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function verifyPayment(sessionId: string): Promise<{
  success: boolean;
  userId?: string;
}> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      return {
        success: true,
        userId: session.metadata?.userId,
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false };
  }
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
