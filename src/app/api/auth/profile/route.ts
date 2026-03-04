import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { getUserProfile } from "@/services/user.service";

export async function GET() {
  try {
    const auth = await getAuthPayload();
    if (!auth) {
      return fail("Unauthorized", 401);
    }

    const profile = await getUserProfile(auth.userId);
    if (!profile) {
      return fail("User not found", 404);
    }

    return ok(profile);
  } catch {
    return fail("Unable to load profile", 500);
  }
}
