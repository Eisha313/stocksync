import { Filter } from 'mongodb';
import { BaseRepository } from './base';
import { Product } from '@/types';
import { COLLECTIONS } from '@/lib/constants';

export class ProductRepository extends BaseRepository<Product> {
  protected collectionName = COLLECTIONS.PRODUCTS;

  async findByUserId(userId: string): Promise<Product[]> {
    return this.findMany({ userId } as Filter<Product>);
  }

  async findBySku(sku: string, userId: string): Promise<Product | null> {
    return this.findOne({ sku, userId } as Filter<Product>);
  }

  async findLowStock(userId: string): Promise<Product[]> {
    const collection = await this.getCollection();
    return collection.find({
      userId,
      $expr: { $lte: ['$quantity', '$threshold'] }
    } as Filter<Product>).toArray();
  }

  async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    return this.updateById(productId, {
      $set: { quantity, updatedAt: new Date() }
    });
  }

  async updateThreshold(productId: string, threshold: number): Promise<boolean> {
    return this.updateById(productId, {
      $set: { threshold, updatedAt: new Date() }
    });
  }

  async incrementQuantity(productId: string, amount: number): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: productId } as Filter<Product>,
      {
        $inc: { quantity: amount },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  async decrementQuantity(productId: string, amount: number): Promise<boolean> {
    return this.incrementQuantity(productId, -amount);
  }
}

export const productRepository = new ProductRepository();
