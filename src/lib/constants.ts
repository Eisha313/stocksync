export const APP_NAME = 'StockSync';
export const APP_DESCRIPTION = 'A lightweight inventory alert system';

export const INVENTORY_THRESHOLDS = {
  LOW_STOCK_DEFAULT: 10,
  CRITICAL_STOCK_DEFAULT: 5,
  OUT_OF_STOCK: 0,
} as const;

export const ALERT_TYPES = {
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  REORDER: 'reorder',
} as const;

export const ALERT_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export const PREMIUM_FEATURES = {
  SMS_NOTIFICATIONS: 'sms_notifications',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PRIORITY_SUPPORT: 'priority_support',
  UNLIMITED_PRODUCTS: 'unlimited_products',
} as const;

export const FREE_TIER_LIMITS = {
  MAX_PRODUCTS: 50,
  MAX_ALERTS_PER_DAY: 10,
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

export const API_ROUTES = {
  PRODUCTS: '/api/products',
  ALERTS: '/api/alerts',
  USERS: '/api/users',
  PAYMENTS: '/api/payments',
  WEBHOOKS: '/api/webhooks',
} as const;

export const MONGODB_COLLECTIONS = {
  PRODUCTS: 'products',
  ALERTS: 'alerts',
  USERS: 'users',
  PAYMENTS: 'payments',
} as const;
