import { MongoClient, MongoClientOptions, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'stocksync';

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<MongoConnection> | null = null;

async function connectToDatabase(): Promise<MongoConnection> {
  // Return cached connection if available and connected
  if (cachedClient && cachedDb) {
    try {
      // Verify the connection is still alive
      await cachedClient.db('admin').command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection lost, clear cache and reconnect
      console.warn('MongoDB connection lost, reconnecting...');
      cachedClient = null;
      cachedDb = null;
      connectionPromise = null;
    }
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      const client = new MongoClient(uri, options);
      await client.connect();
      
      const db = client.db(dbName);
      
      // Set up connection event handlers
      client.on('close', () => {
        console.warn('MongoDB connection closed');
        cachedClient = null;
        cachedDb = null;
        connectionPromise = null;
      });

      client.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        cachedClient = null;
        cachedDb = null;
        connectionPromise = null;
      });

      cachedClient = client;
      cachedDb = db;

      console.log('Connected to MongoDB successfully');
      
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getClient(): Promise<MongoClient> {
  const { client } = await connectToDatabase();
  return client;
}

export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    connectionPromise = null;
    console.log('MongoDB connection closed gracefully');
  }
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
  });
}

export { connectToDatabase };
export default connectToDatabase;
