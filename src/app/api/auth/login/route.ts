import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { parseBody } from "@/lib/validation";
import { loginSchema } from "@/lib/validators/auth";
import { findUserByEmail } from "@/services/user.service";
import { verifyPassword } from "@/lib/password";
import { signToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/lib/constants";
import { ok, fail } from "@/lib/response";

export async function POST(req: Request) {
  const { allowed } = rateLimit(`login:${req.headers.get("x-forwarded-for") ?? "local"}`);
  if (!allowed) {
    return fail("Too many requests", 429);
  }

  const body = await parseBody(req, loginSchema);
  const user = await findUserByEmail(body.email);
  if (!user) {
    return fail("Invalid credentials", 401);
  }

  const isValid = await verifyPassword(body.password, user.passwordHash);
  if (!isValid) {
    return fail("Invalid credentials", 401);
  }

  const token = await signToken({ userId: user._id.toString(), role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return ok({ id: user._id.toString(), email: user.email, role: user.role });
}
