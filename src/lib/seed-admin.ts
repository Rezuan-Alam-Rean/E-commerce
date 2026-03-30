import { getEnv } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { UserModel } from "@/models/user";

export async function seedAdmin() {
  const email = getEnv("ADMIN_EMAIL").toLowerCase();
  const password = getEnv("ADMIN_PASSWORD");
  const name = "Store Admin";
  const passwordHash = await hashPassword(password);

  try {
    // Atomic upsert: Update if exists, Create if not.
    // This prevents E11000 race conditions common in concurrent Next.js server starts.
    const result = await UserModel.findOneAndUpdate(
      { email },
      { 
        $set: { 
          name, 
          passwordHash, 
          role: "admin" 
        } 
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    );

    if (result) {
      console.log(`[SeedAdmin] Admin account for ${email} is synchronized (Created/Updated).`);
    }
  } catch (error) {
    console.error(`[SeedAdmin] Error ensuring admin account:`, error);
  }
}
