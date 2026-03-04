import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import { verifyToken } from "@/lib/jwt";
import type { UserRole } from "@/lib/constants";

export type AuthPayload = {
  userId: string;
  role: UserRole;
};

export async function getAuthPayload() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return { userId: payload.userId, role: payload.role } as AuthPayload;
  } catch {
    return null;
  }
}
