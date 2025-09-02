import {
  Collection,
  Document,
  Filter,
  OptionalId,
  UpdateFilter,
  FindOptions,
  WithId,
  ObjectId,
  Db,
} from 'mongodb';
import { getDb } from '@/lib/mongodb';

export abstract class BaseRepository<T extends Document> {
  protected abstract collectionName: string;
  private _collection: Collection<T> | null = null;
  private _db: Db | null = null;

  protected async getCollection(): Promise<Collection<T>> {
    // Always get fresh db reference to handle reconnections
    const db = await getDb();
    
    // Only reuse collection if db reference is the same
    if (this._collection && this._db === db) {
      return this._collection;
    }
    
    this._db = db;
    this._collection = db.collection<T>(this.collectionName);
    return this._collection;
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return collection.findOne({ _id: objectId } as Filter<T>);
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    const collection = await this.getCollection();
    return collection.findOne(filter);
  }

  async findMany(
    filter: Filter<T> = {},
    options: FindOptions<T> = {}
  ): Promise<WithId<T>[]> {
    const collection = await this.getCollection();
    const cursor = collection.find(filter, options);
    
    try {
      return await cursor.toArray();
    } finally {
      // Ensure cursor is closed to prevent memory leaks
      await cursor.close();
    }
  }

  async create(data: OptionalId<T>): Promise<WithId<T>> {
    const collection = await this.getCollection();
    const now = new Date();
    const documentWithTimestamps = {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as OptionalId<T>;

    const result = await collection.insertOne(documentWithTimestamps);
    return { ...documentWithTimestamps, _id: result.insertedId } as WithId<T>;
  }

  async createMany(data: OptionalId<T>[]): Promise<WithId<T>[]> {
    const collection = await this.getCollection();
    const now = new Date();
    const documentsWithTimestamps = data.map((doc) => ({
      ...doc,
      createdAt: now,
      updatedAt: now,
    })) as OptionalId<T>[];

    const result = await collection.insertMany(documentsWithTimestamps);
    return documentsWithTimestamps.map((doc, index) => ({
      ...doc,
      _id: result.insertedIds[index],
    })) as WithId<T>[];
  }

  async updateById(
    id: string | ObjectId,
    update: UpdateFilter<T> | Partial<T>
  ): Promise<WithId<T> | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;

    const updateDoc = this.isUpdateFilter(update)
      ? {
          ...update,
          $set: { ...update.$set, updatedAt: new Date() },
        }
      : {
          $set: { ...update, updatedAt: new Date() },
        };

    const result = await collection.findOneAndUpdate(
      { _id: objectId } as Filter<T>,
      updateDoc as UpdateFilter<T>,
      { returnDocument: 'after' }
    );

    return result;
  }

  async updateMany(
    filter: Filter<T>,
    update: UpdateFilter<T> | Partial<T>
  ): Promise<number> {
    const collection = await this.getCollection();

    const updateDoc = this.isUpdateFilter(update)
      ? {
          ...update,
          $set: { ...update.$set, updatedAt: new Date() },
        }
      : {
          $set: { ...update, updatedAt: new Date() },
        };

    const result = await collection.updateMany(filter, updateDoc as UpdateFilter<T>);
    return result.modifiedCount;
  }

  async deleteById(id: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
    return result.deletedCount === 1;
  }

  async deleteMany(filter: Filter<T>): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany(filter);
    return result.deletedCount;
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments(filter);
  }

  async exists(filter: Filter<T>): Promise<boolean> {
    const collection = await this.getCollection();
    const count = await collection.countDocuments(filter, { limit: 1 });
    return count > 0;
  }

  private isUpdateFilter(update: unknown): update is UpdateFilter<T> {
    if (typeof update !== 'object' || update === null) return false;
    const keys = Object.keys(update);
    return keys.some((key) => key.startsWith('$'));
  }
}
