import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import type { SessionOwner } from "@/types/session";

const GUEST_SESSION_COOKIE = "guest_session";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function resolveSessionOwner(userId?: string | null): Promise<SessionOwner> {
  if (userId) {
    return { kind: "user", userId };
  }

  const store = await cookies();
  let token = store.get(GUEST_SESSION_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    store.set(GUEST_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: DEFAULT_MAX_AGE,
      path: "/",
    });
  }

  return { kind: "guest", guestToken: token };
}

export function getGuestSessionCookieName() {
  return GUEST_SESSION_COOKIE;
}
