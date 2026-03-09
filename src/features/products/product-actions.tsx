"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { useToast } from "@/hooks/use-toast";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    price: number;
    categories?: string[];
    image?: string;
  };
};

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCartStore();
  const { add } = useWishlistStore();
  const { push } = useToast();
  const router = useRouter();
  const currency = "BDT";
  const baseContent = {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    content_category: product.categories?.join(", ") ?? undefined,
    currency,
    value: product.price,
    contents: [
      {
        id: product.id,
        quantity: 1,
        item_price: product.price,
      },
    ],
  };

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, 1);
      push({ title: "Added to cart", description: "The item is now in your cart." });
      trackMetaEvent("AddToCart", baseContent);
    } catch {
      push({ title: "Cart update failed", description: "Please try again." });
    }
  };

  const handleWishlist = async () => {
    try {
      await add(product.id);
      push({ title: "Saved to wishlist", description: "We'll keep this item handy for later." });
      trackMetaEvent("AddToWishlist", baseContent);
    } catch {
      push({ title: "Wishlist update failed", description: "Please try again." });
    }
  };

  const handleBuyNow = async () => {
    trackMetaEvent("InitiateCheckout", {
      ...baseContent,
      num_items: 1,
    });
    router.push(`/checkout?productId=${product.id}&quantity=1`);
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
