import { BaseRepository } from './base';
import { Alert } from '@/types';
import { getCollection, COLLECTIONS } from '../collections';
import { ObjectId, WithId, Document } from 'mongodb';

class AlertRepositoryClass extends BaseRepository<Alert> {
  constructor() {
    super(COLLECTIONS.ALERTS);
  }

  async findByProductId(productId: string): Promise<Alert[]> {
    const collection = await getCollection<Alert>(this.collectionName);
    const documents = await collection
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return documents.map(this.mapDocument);
  }

  async findUnacknowledged(): Promise<Alert[]> {
    const collection = await getCollection<Alert>(this.collectionName);
    const documents = await collection
      .find({ acknowledged: false })
      .sort({ createdAt: -1 })
      .toArray();
    
    return documents.map(this.mapDocument);
  }

  async findBySeverity(severity: string): Promise<Alert[]> {
    const collection = await getCollection<Alert>(this.collectionName);
    const documents = await collection
      .find({ severity })
      .sort({ createdAt: -1 })
      .toArray();
    
    return documents.map(this.mapDocument);
  }

  async acknowledge(alertId: string, userId: string): Promise<Alert | null> {
    if (!ObjectId.isValid(alertId)) {
      throw new Error('Invalid alert ID format');
    }

    const collection = await getCollection<Alert>(this.collectionName);
    
    // Use findOneAndUpdate with proper options to prevent race conditions
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(alertId),
        acknowledged: false // Only update if not already acknowledged
      },
      { 
        $set: { 
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: userId,
          updatedAt: new Date(),
        } 
      },
      { 
        returnDocument: 'after'
      }
    );

    if (!result) {
      // Check if alert exists but was already acknowledged
      const existingAlert = await collection.findOne({ _id: new ObjectId(alertId) });
      if (existingAlert && existingAlert.acknowledged) {
        return this.mapDocument(existingAlert as WithId<Document> & Alert);
      }
      return null;
    }

    return this.mapDocument(result as WithId<Document> & Alert);
  }

  async deleteByProductId(productId: string): Promise<number> {
    const collection = await getCollection<Alert>(this.collectionName);
    const result = await collection.deleteMany({ productId });
    return result.deletedCount;
  }

  async findRecent(limit: number = 50): Promise<Alert[]> {
    const collection = await getCollection<Alert>(this.collectionName);
    const documents = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    return documents.map(this.mapDocument);
  }

  async countBySeverity(): Promise<Record<string, number>> {
    const collection = await getCollection<Alert>(this.collectionName);
    const pipeline = [
      { $match: { acknowledged: false } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    
    const counts: Record<string, number> = {
      critical: 0,
      warning: 0,
      low: 0,
    };

    for (const result of results) {
      if (result._id && typeof result._id === 'string') {
        counts[result._id] = result.count;
      }
    }

    return counts;
  }

  private mapDocument(doc: WithId<Document> & Alert): Alert {
    return {
      ...doc,
      _id: doc._id,
    } as Alert;
  }
}

export const AlertRepository = new AlertRepositoryClass();
