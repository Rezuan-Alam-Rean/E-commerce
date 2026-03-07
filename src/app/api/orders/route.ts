import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { createOrderSchema } from "@/lib/validators/order";
import { createOrderFromCart, listOrdersPaginated } from "@/services/order.service";

export async function GET(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "8");

  const orders = await listOrdersPaginated(auth.userId, auth.role, { page, limit });
  return ok(orders);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  try {
    const json = await req.json();
    const parsed = createOrderSchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid order details";
      return fail(message, 400);
    }

    const order = await createOrderFromCart(auth.userId, parsed.data);
    return ok(order, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return fail(message, 400);
  }
}
