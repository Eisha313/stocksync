import { ObjectId, Filter, UpdateFilter } from 'mongodb';
import { BaseRepository } from './base';
import { User, SubscriptionTier } from '@/types';
import { COLLECTIONS } from '../collections';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() } as Filter<User>);
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    return this.findOne({ stripeCustomerId } as Filter<User>);
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash?: string;
  }): Promise<User> {
    const now = new Date();
    const userData: Omit<User, '_id'> = {
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: data.passwordHash,
      subscription: {
        tier: SubscriptionTier.FREE,
        features: {
          maxProducts: 10,
          maxAlerts: 5,
          smsNotifications: false,
          emailNotifications: true,
          webhookIntegrations: false,
        },
      },
      createdAt: now,
      updatedAt: now,
    };
    return this.create(userData);
  }

  async updateStripeCustomerId(id: string, stripeCustomerId: string): Promise<User | null> {
    return this.updateOne(id, {
      $set: {
        stripeCustomerId,
        updatedAt: new Date(),
      },
    } as UpdateFilter<User>);
  }

  async upgradeToPremium(id: string, paymentId: string): Promise<User | null> {
    return this.updateOne(id, {
      $set: {
        'subscription.tier': SubscriptionTier.PREMIUM,
        'subscription.paymentId': paymentId,
        'subscription.activatedAt': new Date(),
        'subscription.features': {
          maxProducts: 100,
          maxAlerts: 50,
          smsNotifications: true,
          emailNotifications: true,
          webhookIntegrations: true,
        },
        updatedAt: new Date(),
      },
    } as UpdateFilter<User>);
  }

  async updateNotificationPreferences(
    id: string,
    preferences: User['notificationPreferences']
  ): Promise<User | null> {
    return this.updateOne(id, {
      $set: {
        notificationPreferences: preferences,
        updatedAt: new Date(),
      },
    } as UpdateFilter<User>);
  }

  async updatePhoneNumber(id: string, phoneNumber: string): Promise<User | null> {
    return this.updateOne(id, {
      $set: {
        phoneNumber,
        updatedAt: new Date(),
      },
    } as UpdateFilter<User>);
  }

  async findPremiumUsers(): Promise<User[]> {
    return this.findMany({
      'subscription.tier': SubscriptionTier.PREMIUM,
    } as Filter<User>);
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}

export const userRepository = new UserRepository();
