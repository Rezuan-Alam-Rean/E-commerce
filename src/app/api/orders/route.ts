import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { createOrderSchema } from "@/lib/validators/order";
import { createOrderFromCart, listOrders } from "@/services/order.service";

export async function GET() {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const orders = await listOrders(auth.userId, auth.role);
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
