import { ObjectId } from 'mongodb';

export interface Alert {
  _id?: ObjectId;
  productId: ObjectId;
  userId: string;
  thresholdLevel: number;
  alertType: AlertType;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertType = 'email' | 'sms' | 'push';

export interface AlertWithProduct extends Alert {
  product?: {
    name: string;
    sku: string;
    currentStock: number;
  };
}

export interface CreateAlertInput {
  productId: string;
  userId: string;
  thresholdLevel: number;
  alertType: AlertType;
}

export interface UpdateAlertInput {
  thresholdLevel?: number;
  alertType?: AlertType;
  isActive?: boolean;
}

export const createAlert = (input: CreateAlertInput): Omit<Alert, '_id'> => {
  const now = new Date();
  return {
    productId: new ObjectId(input.productId),
    userId: input.userId,
    thresholdLevel: input.thresholdLevel,
    alertType: input.alertType,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
};
