import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { profileSchema } from "@/lib/validators/profile";
import { getUserProfile, updateUserProfile } from "@/services/user.service";

export async function GET() {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const profile = await getUserProfile(auth.userId);
  if (!profile) {
    return fail("User not found", 404);
  }

  return ok(profile);
}

export async function PUT(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const body = await parseBody(req, profileSchema);
  const updated = await updateUserProfile(auth.userId, body);
  if (!updated) {
    return fail("User not found", 404);
  }

  return ok(updated);
}
