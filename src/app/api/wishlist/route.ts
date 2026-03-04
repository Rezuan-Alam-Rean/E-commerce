import { getAuthPayload } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { z } from "zod";
import { addToWishlist, getWishlistState, removeFromWishlist } from "@/services/wishlist.service";

const wishlistSchema = z.object({
  productId: z.string(),
});

export async function GET() {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const wishlist = await getWishlistState(auth.userId);
  return ok(wishlist);
}

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const body = await parseBody(req, wishlistSchema);
  const wishlist = await addToWishlist(auth.userId, body.productId);
  return ok(wishlist, 201);
}

export async function DELETE(req: Request) {
  const auth = await getAuthPayload();
  if (!auth) {
    return fail("Unauthorized", 401);
  }

  const body = await parseBody(req, wishlistSchema);
  const wishlist = await removeFromWishlist(auth.userId, body.productId);
  return ok(wishlist);
}
