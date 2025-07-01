// Product and Inventory Types
export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  currentStock: number;
  alertThreshold: number;
  criticalThreshold: number;
  unit: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  category?: string;
  currentStock: number;
  alertThreshold: number;
  criticalThreshold: number;
  unit: string;
  price?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// Alert Types
export type AlertLevel = 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  _id: string;
  productId: string;
  level: AlertLevel;
  status: AlertStatus;
  message: string;
  currentStock: number;
  threshold: number;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

// User and Subscription Types
export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  isPremium: boolean;
  stripeCustomerId?: string;
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  alertLevels: AlertLevel[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
