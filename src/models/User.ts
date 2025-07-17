import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  isPremium: boolean;
  premiumPurchasedAt?: Date;
  stripeCustomerId?: string;
  phone?: string;
  smsNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  alertPreferences: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    alertFrequency: 'instant' | 'hourly' | 'daily';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  smsNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  alertPreferences?: Partial<User['alertPreferences']>;
}

export interface UserPublic {
  _id: string;
  email: string;
  name: string;
  isPremium: boolean;
  phone?: string;
  smsNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  alertPreferences: User['alertPreferences'];
  createdAt: Date;
}

export function createUser(input: CreateUserInput): Omit<User, '_id'> {
  const now = new Date();
  return {
    email: input.email.toLowerCase().trim(),
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    isPremium: false,
    phone: input.phone?.trim(),
    smsNotificationsEnabled: false,
    emailNotificationsEnabled: true,
    alertPreferences: {
      emailAlerts: true,
      smsAlerts: false,
      alertFrequency: 'instant',
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function toUserPublic(user: User): UserPublic {
  return {
    _id: user._id!.toString(),
    email: user.email,
    name: user.name,
    isPremium: user.isPremium,
    phone: user.phone,
    smsNotificationsEnabled: user.smsNotificationsEnabled,
    emailNotificationsEnabled: user.emailNotificationsEnabled,
    alertPreferences: user.alertPreferences,
    createdAt: user.createdAt,
  };
}
