import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function connectWithRetry(retries = MAX_RETRIES): Promise<MongoClient> {
  try {
    const mongoClient = new MongoClient(uri, options);
    await mongoClient.connect();
    console.log('Successfully connected to MongoDB');
    return mongoClient;
  } catch (error) {
    if (retries > 0) {
      console.warn(`MongoDB connection failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(retries - 1);
    }
    console.error('Failed to connect to MongoDB after retries:', error);
    throw error;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectWithRetry();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = connectWithRetry();
}

export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName || process.env.MONGODB_DB_NAME || 'stocksync');
}

export async function closeConnection() {
  const client = await clientPromise;
  await client.close();
  console.log('MongoDB connection closed');
}

export default clientPromise;
