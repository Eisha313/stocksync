import { ObjectId, Filter, UpdateFilter } from 'mongodb';
import { BaseRepository } from './base';
import { Alert, AlertSeverity, AlertStatus } from '@/types';
import { COLLECTIONS } from '../collections';

export class AlertRepository extends BaseRepository<Alert> {
  constructor() {
    super(COLLECTIONS.ALERTS);
  }

  async findByProductId(productId: string): Promise<Alert[]> {
    return this.findMany({ productId } as Filter<Alert>);
  }

  async findByUserId(userId: string): Promise<Alert[]> {
    return this.findMany({ userId } as Filter<Alert>);
  }

  async findActiveAlerts(userId: string): Promise<Alert[]> {
    return this.findMany({
      userId,
      status: AlertStatus.ACTIVE,
    } as Filter<Alert>);
  }

  async findBySeverity(userId: string, severity: AlertSeverity): Promise<Alert[]> {
    return this.findMany({
      userId,
      severity,
    } as Filter<Alert>);
  }

  async acknowledgeAlert(id: string): Promise<Alert | null> {
    return this.updateOne(id, {
      $set: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
        updatedAt: new Date(),
      },
    } as UpdateFilter<Alert>);
  }

  async resolveAlert(id: string): Promise<Alert | null> {
    return this.updateOne(id, {
      $set: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
    } as UpdateFilter<Alert>);
  }

  async dismissAlert(id: string): Promise<Alert | null> {
    return this.updateOne(id, {
      $set: {
        status: AlertStatus.DISMISSED,
        updatedAt: new Date(),
      },
    } as UpdateFilter<Alert>);
  }

  async createAlert(data: Omit<Alert, '_id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const now = new Date();
    const alertData: Omit<Alert, '_id'> = {
      ...data,
      status: AlertStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
    return this.create(alertData);
  }

  async countActiveAlerts(userId: string): Promise<number> {
    return this.count({
      userId,
      status: AlertStatus.ACTIVE,
    } as Filter<Alert>);
  }

  async deleteByProductId(productId: string): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({ productId } as Filter<Alert>);
    return result.deletedCount;
  }
}

export const alertRepository = new AlertRepository();
