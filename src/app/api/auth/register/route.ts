import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { parseBody } from "@/lib/validation";
import { registerSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/password";
import { createUser, findUserByEmail } from "@/services/user.service";
import { signToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/lib/constants";
import { ok, fail } from "@/lib/response";

export async function POST(req: Request) {
  const { allowed } = rateLimit(`register:${req.headers.get("x-forwarded-for") ?? "local"}`);
  if (!allowed) {
    return fail("Too many requests", 429);
  }

  const body = await parseBody(req, registerSchema);
  const existing = await findUserByEmail(body.email);
  if (existing) {
    return fail("Email already in use", 409);
  }

  const passwordHash = await hashPassword(body.password);
  const user = await createUser({
    name: body.name,
    email: body.email,
    passwordHash,
  });

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
