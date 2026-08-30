import mongoose from 'mongoose';

interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache || { conn: null, promise: null };

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

async function connectToDatabase(): Promise<mongoose.Mongoose> {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // 1. Return active connection if readyState === 1
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. Clear stale connection if state is disconnected (0) or disconnecting (3)
  if (cached.conn && (cached.conn.connection.readyState === 0 || cached.conn.connection.readyState === 3)) {
    cached.conn = null;
    cached.promise = null;
  }

  // 3. Initiate single connection promise for concurrent requests
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(mongodbUri, opts)
      .then((instance) => {
        return instance;
      })
      .catch((err) => {
        cached.conn = null;
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.conn || cached.conn.connection.readyState !== 1) {
      cached.conn = null;
      cached.promise = null;
      throw new Error('Failed to establish active MongoDB connection');
    }
  } catch (e) {
    cached.conn = null;
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
