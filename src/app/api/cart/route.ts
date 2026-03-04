import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { cartDeliverySchema, cartItemSchema, cartRemoveSchema } from "@/lib/validators/cart";
import {
  addCartItem,
  getOrCreateCart,
  mapCartState,
  removeCartItem,
  updateCartItem,
  updateDeliveryOption,
} from "@/services/cart.service";

export async function GET() {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const cart = await getOrCreateCart(auth.userId);
  const state = await mapCartState(cart);
  return ok(state);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const body = await parseBody(req, cartItemSchema);
  const cart = await addCartItem(auth.userId, body.productId, body.quantity);
  const state = await mapCartState(cart);
  return ok(state, 201);
}

export async function PATCH(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const body = await req.json();
  if (body.deliveryOption) {
    const parsed = cartDeliverySchema.parse(body);
    const cart = await updateDeliveryOption(auth.userId, parsed.deliveryOption);
    if (!cart) {
      return fail("Cart not found", 404);
    }
    const state = await mapCartState(cart);
    return ok(state);
  }

  const parsed = cartItemSchema.parse(body);
  const cart = await updateCartItem(auth.userId, parsed.productId, parsed.quantity);
  const state = await mapCartState(cart);
  return ok(state);
}

export async function DELETE(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const body = await req.json();
  const parsed = cartRemoveSchema.parse(body);
  const cart = await removeCartItem(auth.userId, parsed.productId);
  const state = await mapCartState(cart);
  return ok(state);
}
