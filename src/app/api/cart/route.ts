import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { resolveSessionOwner } from "@/lib/session-owner";
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
  const owner = await resolveSessionOwner(auth?.userId);
  const cart = await getOrCreateCart(owner);
  const state = await mapCartState(cart);
  return ok(state);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  const owner = await resolveSessionOwner(auth?.userId);
  const body = await parseBody(req, cartItemSchema);
  const cart = await addCartItem(owner, body.productId, body.quantity);
  const state = await mapCartState(cart);
  return ok(state, 201);
}

export async function PATCH(req: Request) {
  const auth = await getAuthPayload();
  const owner = await resolveSessionOwner(auth?.userId);
  const body = await req.json();
  if (body.deliveryOption) {
    const parsed = cartDeliverySchema.parse(body);
    const cart = await updateDeliveryOption(owner, parsed.deliveryOption);
    if (!cart) {
      return fail("Cart not found", 404);
    }
    const state = await mapCartState(cart);
    return ok(state);
  }

  const parsed = cartItemSchema.parse(body);
  const cart = await updateCartItem(owner, parsed.productId, parsed.quantity);
  const state = await mapCartState(cart);
  return ok(state);
}

export async function DELETE(req: Request) {
  const auth = await getAuthPayload();
  const owner = await resolveSessionOwner(auth?.userId);
  const body = await req.json();
  const parsed = cartRemoveSchema.parse(body);
  const cart = await removeCartItem(owner, parsed.productId);
  const state = await mapCartState(cart);
  return ok(state);
}
