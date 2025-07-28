import { BaseRepository } from './base';
import { Product } from '@/types';
import { COLLECTIONS } from '../collections';
import { ObjectId, Filter } from 'mongodb';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(COLLECTIONS.PRODUCTS);
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const collection = await this.getCollection();
    return collection
      .find({ userId: new ObjectId(userId) } as Filter<Product>)
      .toArray();
  }

  async findBySku(sku: string, userId: string): Promise<Product | null> {
    const collection = await this.getCollection();
    return collection.findOne({
      sku,
      userId: new ObjectId(userId),
    } as Filter<Product>);
  }

  async findLowStock(userId: string, threshold: number): Promise<Product[]> {
    const collection = await this.getCollection();
    return collection
      .find({
        userId: new ObjectId(userId),
        quantity: { $lte: threshold },
        isActive: true,
      } as Filter<Product>)
      .toArray();
  }

  async updateQuantity(id: string, quantity: number): Promise<Product | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          quantity,
          updatedAt: new Date(),
        } 
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  async incrementQuantity(id: string, amount: number): Promise<Product | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $inc: { quantity: amount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  async decrementQuantity(id: string, amount: number): Promise<Product | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(id),
        quantity: { $gte: amount },
      },
      { 
        $inc: { quantity: -amount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  async searchProducts(
    userId: string,
    query: string
  ): Promise<Product[]> {
    const collection = await this.getCollection();
    return collection
      .find({
        userId: new ObjectId(userId),
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      } as Filter<Product>)
      .toArray();
  }
}
