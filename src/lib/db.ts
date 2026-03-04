import mongoose from "mongoose";
import { getEnv } from "@/lib/env";
import { seedAdmin } from "@/lib/seed-admin";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as unknown as { mongoose?: MongooseCache };

const cached = globalCache.mongoose ?? { conn: null, promise: null };

export async function connectDb() {
  if (cached.conn) {
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

  await seedAdmin();

  return cached.conn;
}
