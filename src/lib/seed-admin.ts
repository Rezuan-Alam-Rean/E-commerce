import { getEnv } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { UserModel } from "@/models/user";

export async function seedAdmin() {
  const email = getEnv("ADMIN_EMAIL");
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(getEnv("ADMIN_PASSWORD"));
  await UserModel.create({
    name: "Store Admin",
    email,
    passwordHash,
    role: "admin",
  });
}
