"use client";

import { useRouter } from "next/navigation";
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
      push({ title: "ব্যাগ-এ যোগ করা হয়েছে", description: `${product.name} আপনার কার্টে যোগ হয়েছে।` });
      trackMetaEvent("AddToCart", baseContent);
    } catch {
      push({ title: "থামুন", description: "আবার চেষ্টা করুন।" });
    }
  };

  const handleWishlist = async () => {
    try {
      await add(product.id);
      push({ title: "উইশলিস্ট-এ সংরক্ষিত", description: "আপনার পছন্দের তালিকায় এটি যুক্ত হয়েছে।" });
      trackMetaEvent("AddToWishlist", baseContent);
    } catch {
      push({ title: "ব্যর্থ হয়েছে", description: "আবার চেষ্টা করুন।" });
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-black hover:bg-emerald-600 text-white px-10 py-5 rounded-[24px] text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-black/10 active:scale-95 font-english"
        >
          Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-white text-black border-2 border-gray-100 hover:border-emerald-500 hover:text-emerald-600 px-10 py-5 rounded-[24px] text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 font-english"
        >
          Add to Bag
        </button>
      </div>

      <button
        onClick={handleWishlist}
        className="w-full flex items-center justify-center gap-3 bg-gray-50/50 hover:bg-rose-50 hover:text-rose-600 text-gray-500 py-4 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-transparent hover:border-rose-100 active:scale-[0.98] font-english"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
        Save to Wishlist
      </button>
    </div>
  );
}
