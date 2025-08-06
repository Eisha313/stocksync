import { ObjectId, Collection } from 'mongodb';
import { BaseRepository } from './base';
import { User } from '@/types';
import { COLLECTIONS } from '../collections';

export class UserRepository extends BaseRepository<User> {
  protected getCollectionName(): string {
    return COLLECTIONS.USERS;
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ email }) as Promise<User | null>;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ stripeCustomerId }) as Promise<User | null>;
  }

  async findPremiumUsers(): Promise<User[]> {
    const collection = await this.getCollection();
    return collection.find({ isPremium: true }).toArray() as Promise<User[]>;
  }

  async updateAlertPreferences(
    userId: string,
    preferences: User['alertPreferences']
  ): Promise<User | null> {
    return this.update(userId, { alertPreferences: preferences });
  }

  async upgradeToPremium(
    userId: string,
    features: string[]
  ): Promise<User | null> {
    return this.update(userId, {
      isPremium: true,
      premiumFeatures: features,
      paymentStatus: 'completed',
    });
  }

  async downgradeToPremium(userId: string): Promise<User | null> {
    return this.update(userId, {
      isPremium: false,
      premiumFeatures: [],
      paymentStatus: 'pending',
    });
  }

  async getUsersWithSmsEnabled(): Promise<User[]> {
    const collection = await this.getCollection();
    return collection.find({
      isPremium: true,
      premiumFeatures: { $in: ['sms_notifications'] },
      'alertPreferences.smsEnabled': true,
    }).toArray() as Promise<User[]>;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const collection = await this.getCollection();
    return collection.findOne({ phoneNumber }) as Promise<User | null>;
  }
}