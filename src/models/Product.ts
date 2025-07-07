import { ObjectId } from 'mongodb';
import { Product, CreateProductInput, UpdateProductInput } from '@/types';
import { getCollection, COLLECTIONS } from '@/lib/db/collections';

export class ProductModel {
  private static async collection() {
    return getCollection<Product>(COLLECTIONS.PRODUCTS);
  }

  static async create(input: CreateProductInput, userId: string): Promise<Product> {
    const collection = await this.collection();
    
    const now = new Date();
    const product: Omit<Product, 'id'> & { _id?: ObjectId } = {
      ...input,
      userId,
      currentStock: input.currentStock ?? 0,
      lowStockThreshold: input.lowStockThreshold ?? 10,
      criticalStockThreshold: input.criticalStockThreshold ?? 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(product as any);
    
    return {
      ...product,
      id: result.insertedId.toString(),
    } as Product;
  }

  static async findById(id: string): Promise<Product | null> {
    const collection = await this.collection();
    
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const doc = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!doc) {
      return null;
    }

    return this.mapToProduct(doc);
  }

  static async findByUserId(userId: string): Promise<Product[]> {
    const collection = await this.collection();
    
    const docs = await collection
      .find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(this.mapToProduct);
  }

  static async findLowStock(userId: string): Promise<Product[]> {
    const collection = await this.collection();
    
    const docs = await collection
      .find({
        userId,
        isActive: true,
        $expr: {
          $lte: ['$currentStock', '$lowStockThreshold']
        }
      })
      .sort({ currentStock: 1 })
      .toArray();

    return docs.map(this.mapToProduct);
  }

  static async findCriticalStock(userId: string): Promise<Product[]> {
    const collection = await this.collection();
    
    const docs = await collection
      .find({
        userId,
        isActive: true,
        $expr: {
          $lte: ['$currentStock', '$criticalStockThreshold']
        }
      })
      .sort({ currentStock: 1 })
      .toArray();

    return docs.map(this.mapToProduct);
  }

  static async update(id: string, input: UpdateProductInput): Promise<Product | null> {
    const collection = await this.collection();
    
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...input,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return this.mapToProduct(result);
  }

  static async updateStock(id: string, quantity: number): Promise<Product | null> {
    const collection = await this.collection();
    
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          currentStock: quantity,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return this.mapToProduct(result);
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.collection();
    
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          isActive: false,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async hardDelete(id: string): Promise<boolean> {
    const collection = await this.collection();
    
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  private static mapToProduct(doc: any): Product {
    const { _id, ...rest } = doc;
    return {
      ...rest,
      id: _id.toString(),
    };
  }
}
