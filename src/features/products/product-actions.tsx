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
      push({ title: "Added to cart", description: "The item is now in your cart." });
    } catch {
      push({ title: "Cart update failed", description: "Please try again." });
    }
  };

  const handleWishlist = async () => {
    try {
      await add(productId);
      push({ title: "Saved to wishlist", description: "We'll keep this item handy for later." });
    } catch {
      push({ title: "Wishlist update failed", description: "Please try again." });
    }
  };

  const handleBuyNow = async () => {
    router.push(`/checkout?productId=${productId}&quantity=1`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={handleAddToCart} className="font-english">
        Add to Cart
      </Button>
      <Button type="button" onClick={handleBuyNow} className="font-english">
        Buy Now
      </Button>
      <Button variant="ghost" type="button" onClick={handleWishlist} className="font-english">
        Save to Wishlist
      </Button>
    </div>
  );
}
