import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

function getSecret() {
  return new TextEncoder().encode(getEnv("JWT_SECRET"));
}

export async function signToken(payload: Record<string, string>) {
  const expiresIn = getEnv("JWT_EXPIRES_IN");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as Record<string, string>;
}
