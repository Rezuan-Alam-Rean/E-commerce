import mongoose from "mongoose";
import { getEnv } from "@/lib/env";
import { seedAdmin } from "@/lib/seed-admin";
import { CartModel } from "@/models/cart";
import { WishlistModel } from "@/models/wishlist";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  indexesPromise?: Promise<void> | null;
};

const globalCache = globalThis as unknown as { mongoose?: MongooseCache };

const cached = globalCache.mongoose ?? { conn: null, promise: null, indexesPromise: null };

async function syncApplicationIndexes() {
  await Promise.all([CartModel.syncIndexes(), WishlistModel.syncIndexes()]);
}

export async function connectDb() {
  if (cached.conn) {
    if (!cached.indexesPromise) {
      cached.indexesPromise = syncApplicationIndexes();
    }
    await cached.indexesPromise;
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getEnv("MONGODB_URI");
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  globalCache.mongoose = cached;

  if (!cached.indexesPromise) {
    cached.indexesPromise = syncApplicationIndexes();
  }

  await cached.indexesPromise;

  await seedAdmin();

  return cached.conn;
}
