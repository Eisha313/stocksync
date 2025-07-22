import { Collection, Document, Filter, OptionalUnlessRequiredId, UpdateFilter, FindOptions, WithId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { DB_NAME } from '@/lib/constants';

export abstract class BaseRepository<T extends Document> {
  protected abstract collectionName: string;

  protected async getCollection(): Promise<Collection<T>> {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return db.collection<T>(this.collectionName);
  }

  async findById(id: string): Promise<WithId<T> | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id: id } as Filter<T>);
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    const collection = await this.getCollection();
    return collection.findOne(filter);
  }

  async findMany(filter: Filter<T> = {}, options?: FindOptions<T>): Promise<WithId<T>[]> {
    const collection = await this.getCollection();
    return collection.find(filter, options).toArray();
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(data);
    return { ...data, _id: result.insertedId } as WithId<T>;
  }

  async updateById(id: string, update: UpdateFilter<T>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: id } as Filter<T>,
      update
    );
    return result.modifiedCount > 0;
  }

  async deleteById(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id } as Filter<T>);
    return result.deletedCount > 0;
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments(filter);
  }

  async exists(filter: Filter<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }
}
