"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { useToast } from "@/hooks/use-toast";

export function ProductActions({ productId }: { productId: string }) {
  const { addItem } = useCartStore();
  const { add } = useWishlistStore();
  const { push } = useToast();
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      await addItem(productId, 1);
      push({ title: "Added to cart", description: "Item is now in your cart." });
    } catch {
      push({ title: "Cart update failed", description: "Please try again." });
    }
  };

  const handleWishlist = async () => {
    try {
      await add(productId);
      push({ title: "Saved to wishlist" });
    } catch {
      push({ title: "Wishlist update failed", description: "Please try again." });
    }
  };

  const handleBuyNow = async () => {
    try {
      await addItem(productId, 1);
      router.push("/checkout");
    } catch {
      push({ title: "Checkout failed", description: "Please try again." });
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={handleAddToCart}>
        Add to Cart
      </Button>
      <Button type="button" onClick={handleBuyNow}>
        Buy Now
      </Button>
      <Button variant="ghost" type="button" onClick={handleWishlist}>
        Save to Wishlist
      </Button>
    </div>
  );
}
