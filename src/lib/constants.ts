import { AlertType } from '@/models/Alert';

export const APP_NAME = 'StockSync';
export const APP_DESCRIPTION = 'A lightweight inventory alert system';

export const MONGODB_DATABASE = 'stocksync';

export const COLLECTIONS = {
  PRODUCTS: 'products',
  ALERTS: 'alerts',
  USERS: 'users',
  PAYMENTS: 'payments',
} as const;

export const ALERT_TYPES: AlertType[] = ['email', 'sms', 'push'];

export const PREMIUM_ALERT_TYPES: AlertType[] = ['sms', 'push'];

export const VALIDATION = {
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MIN_STOCK: 0,
  MAX_STOCK: 1000000,
  MIN_SKU_LENGTH: 3,
  MAX_SKU_LENGTH: 50,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 200,
  MIN_THRESHOLD: 1,
  MAX_THRESHOLD: 10000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
