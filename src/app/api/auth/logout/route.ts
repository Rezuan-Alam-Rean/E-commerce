import { cookies } from "next/headers";
import { ok } from "@/lib/response";
import { COOKIE_NAME } from "@/lib/constants";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, maxAge: 0, path: "/" });
  return ok({ message: "Logged out" });
}
