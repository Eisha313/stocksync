import { Collection, Db, Document, Filter, FindOptions, ObjectId, OptionalUnlessRequiredId, UpdateFilter, WithId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export abstract class BaseRepository<T extends Document> {
  protected abstract collectionName: string;
  private _collection: Collection<T> | null = null;
  private _db: Db | null = null;

  protected async getDb(): Promise<Db> {
    if (!this._db) {
      this._db = await getDatabase();
    }
    return this._db;
  }

  protected async getCollection(): Promise<Collection<T>> {
    if (!this._collection) {
      const db = await this.getDb();
      this._collection = db.collection<T>(this.collectionName);
    }
    return this._collection;
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      return await collection.findOne({ _id: objectId } as Filter<T>);
    } catch (error) {
      console.error(`Error finding document by id in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      return await collection.findOne(filter);
    } catch (error) {
      console.error(`Error finding document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findMany(filter: Filter<T> = {}, options?: FindOptions<T>): Promise<WithId<T>[]> {
    try {
      const collection = await this.getCollection();
      return await collection.find(filter, options).toArray();
    } catch (error) {
      console.error(`Error finding documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const documentWithTimestamps = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as OptionalUnlessRequiredId<T>;
      
      const result = await collection.insertOne(documentWithTimestamps);
      const inserted = await this.findById(result.insertedId);
      
      if (!inserted) {
        throw new Error('Failed to retrieve inserted document');
      }
      
      return inserted;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async updateById(id: string | ObjectId, update: UpdateFilter<T> | Partial<T>): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      
      const updateWithTimestamp = {
        $set: {
          ...(update as Partial<T>),
          updatedAt: new Date(),
        },
      };

      await collection.updateOne(
        { _id: objectId } as Filter<T>,
        updateWithTimestamp as UpdateFilter<T>
      );
      
      return await this.findById(objectId);
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async deleteById(id: string | ObjectId): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`Error deleting document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments(filter);
    } catch (error) {
      console.error(`Error counting documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async exists(filter: Filter<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }
}
