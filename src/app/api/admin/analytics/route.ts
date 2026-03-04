import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { getAnalyticsSummary } from "@/services/analytics.service";

export async function GET() {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Forbidden", 403);
  }

  const summary = await getAnalyticsSummary();
  return ok(summary);
}
