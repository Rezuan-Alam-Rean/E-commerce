import { getAuthPayload } from "@/lib/auth";
import { resolveSessionOwner } from "@/lib/session-owner";
import { ok, fail } from "@/lib/response";
import { checkoutIntentSchema } from "@/lib/validators/checkout-intent";
import { paginateCheckoutIntents, saveCheckoutIntent } from "@/services/checkout-intent.service";

export async function GET(req: Request) {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return fail("Unauthorized", 401);
  }

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const result = await paginateCheckoutIntents({ page, limit });
  return ok(result);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = checkoutIntentSchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid checkout details";
      return fail(message, 400);
    }

    const auth = await getAuthPayload();
    const owner = await resolveSessionOwner(auth?.userId);
    const intent = await saveCheckoutIntent(owner, parsed.data);
    return ok(intent, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to store checkout draft";
    return fail(message, 400);
  }
}
