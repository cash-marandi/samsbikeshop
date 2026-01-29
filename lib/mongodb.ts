import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error(
    'Please define the MONGODB_URL environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially during API routes when
 * using Next.js.
 */
let cached = global as typeof global & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Log a redacted version of the connection string to help debug
    try {
      const redactedUrl = new URL(MONGODB_URL!);
      redactedUrl.password = '<redacted>';
      console.log(`Attempting to connect with URL: ${redactedUrl.toString()}`);
    } catch (e) {
      console.log('Could not parse MONGODB_URL. Please ensure it is a valid MongoDB connection string.');
    }

    cached.mongoose.promise = mongoose.connect(MONGODB_URL!, opts)
      .then((mongoose) => {
        console.log('MongoDB connection successful!');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error; // Re-throw the error to ensure the API route catches it
      });
  }
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export default dbConnect;
