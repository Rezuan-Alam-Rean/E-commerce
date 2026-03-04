import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { updateDeliverySchema, updateOrderStatusSchema } from "@/lib/validators/order";
import { cancelOrder, updateOrderDeliveryOption, updateOrderStatus } from "@/services/order.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    const json = await req.json();
    if (!auth) {
      return fail("Unauthorized", 401);
    }
    if (!json?.deliveryOption) {
      return fail("Forbidden", 403);
    }

    const body = updateDeliverySchema.parse(json);
    const order = await updateOrderDeliveryOption(
      id,
      auth.userId,
      body.deliveryOption
    );
    if (!order) {
      return fail("Order not found", 404);
    }
    return ok(order);
  }

  const body = updateOrderStatusSchema.parse(await req.json());
  const order = await updateOrderStatus(id, body.status);
  if (!order) {
    return fail("Order not found", 404);
  }
  return ok(order);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const order = await cancelOrder(id, auth.userId);
  if (!order) {
    return fail("Order not found", 404);
  }

  return ok(order);
}
