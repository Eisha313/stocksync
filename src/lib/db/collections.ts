import { getDatabase } from '../mongodb';
import { Product, AlertConfig, User } from '@/types';
import { Collection } from 'mongodb';

export async function getProductsCollection(): Promise<Collection<Product>> {
  const db = await getDatabase();
  return db.collection<Product>('products');
}

export async function getAlertConfigsCollection(): Promise<Collection<AlertConfig>> {
  const db = await getDatabase();
  return db.collection<AlertConfig>('alert_configs');
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDatabase();
  return db.collection<User>('users');
}

export async function initializeIndexes(): Promise<void> {
  const products = await getProductsCollection();
  const alertConfigs = await getAlertConfigsCollection();
  const users = await getUsersCollection();

  // Create indexes for better query performance
  await products.createIndex({ sku: 1 }, { unique: true });
  await products.createIndex({ userId: 1 });
  await products.createIndex({ quantity: 1 });
  
  await alertConfigs.createIndex({ productId: 1 });
  await alertConfigs.createIndex({ userId: 1 });
  
  await users.createIndex({ email: 1 }, { unique: true });
}
