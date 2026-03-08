import { getAuthPayload } from "@/lib/auth";
import { ok } from "@/lib/response";
import { resolveSessionOwner } from "@/lib/session-owner";
import { parseBody } from "@/lib/validation";
import { z } from "zod";
import { addToWishlist, getWishlistState, removeFromWishlist } from "@/services/wishlist.service";

const wishlistSchema = z.object({
  productId: z.string(),
});

export async function GET() {
  const auth = await getAuthPayload();
  const owner = await resolveSessionOwner(auth?.userId);
  const wishlist = await getWishlistState(owner);
  return ok(wishlist);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  const owner = await resolveSessionOwner(auth?.userId);
  const body = await parseBody(req, wishlistSchema);
  const wishlist = await addToWishlist(owner, body.productId);
  return ok(wishlist, 201);
}

export async function DELETE(req: Request) {
  const auth = await getAuthPayload();
  const owner = await resolveSessionOwner(auth?.userId);
  const body = await parseBody(req, wishlistSchema);
  const wishlist = await removeFromWishlist(owner, body.productId);
  return ok(wishlist);
}
