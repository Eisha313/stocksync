// Application Constants
export const APP_NAME = 'StockSync';
export const APP_DESCRIPTION = 'Lightweight inventory alert system for store owners';

// Default Values
export const DEFAULT_ALERT_THRESHOLD = 10;
export const DEFAULT_CRITICAL_THRESHOLD = 5;
export const DEFAULT_PAGE_SIZE = 20;

// Alert Messages
export const ALERT_MESSAGES = {
  warning: (productName: string, stock: number) =>
    `Low stock warning: ${productName} has only ${stock} units remaining.`,
  critical: (productName: string, stock: number) =>
    `Critical stock alert: ${productName} has only ${stock} units remaining. Restock immediately!`,
} as const;

// Stripe
export const PREMIUM_PRICE_AMOUNT = 2999; // $29.99 in cents
export const PREMIUM_FEATURES = [
  'SMS notifications for critical alerts',
  'Priority email alerts',
  'Advanced analytics dashboard',
  'Custom alert schedules',
  'API access for integrations',
] as const;

// API Routes
export const API_ROUTES = {
  products: '/api/products',
  alerts: '/api/alerts',
  users: '/api/users',
  payments: '/api/payments',
  webhooks: '/api/webhooks',
} as const;

// Validation
export const VALIDATION = {
  sku: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[A-Za-z0-9-_]+$/,
  },
  productName: {
    minLength: 2,
    maxLength: 100,
  },
  stock: {
    min: 0,
    max: 1000000,
  },
} as const;
