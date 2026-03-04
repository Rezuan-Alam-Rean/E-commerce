import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/user";
import type { UserProfile } from "@/types/user";

type UserLean = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  avatar?: string;
};

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  await connectDb();
  const user = await UserModel.create({ ...data, role: "user" });
  return user;
}

export async function findUserByEmail(email: string) {
  await connectDb();
  return UserModel.findOne({ email });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await connectDb();
  const user = await UserModel.findById(userId).lean<UserLean>();
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar,
  };
}

export async function updateUserProfile(
  userId: string,
  updates: { name: string; phone?: string; address?: string; avatar?: string }
) {
  await connectDb();
  const user = await UserModel.findByIdAndUpdate(userId, updates, {
    new: true,
  }).lean<UserLean>();
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar,
  };
}
