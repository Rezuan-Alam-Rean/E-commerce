"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/format";
import type { ProductSummary } from "@/types/product";
import { useCartStore } from "@/features/cart/cart.store";
import { useToast } from "@/hooks/use-toast";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { push } = useToast();

  const image = product.images?.[0];
  const isOutOfStock = product.stock <= 0;
  const currency = "BDT";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id, 1);
      push({ title: "ব্যাগ-এ যোগ করা হয়েছে", description: `${product.name} আপনার কার্টে যোগ হয়েছে।` });
      trackMetaEvent("AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        currency,
        value: product.price,
      });
    } catch {
      push({ title: "থামুন", description: "আবার চেষ্টা করুন।" });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trackMetaEvent("InitiateCheckout", {
      content_ids: [product.id],
      content_name: product.name,
      currency,
      value: product.price,
    });
    router.push(`/checkout?productId=${product.id}&quantity=1`);
  };

  return (
    <div className="group relative flex flex-col gap-5 rounded-[36px] bg-white p-3 border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.01)] transition-all duration-700 hover:shadow-[0_24px_48px_rgb(0,0,0,0.08)] hover:-translate-y-2">
      {/* Image Container with Premium Hover Actions */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden rounded-[28px] bg-gray-50/50">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-200 font-english">
            No Image
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[4px]">
            <span className="px-6 py-2.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
              Stock Out
            </span>
          </div>
        )}

        {/* Desktop Quick Actions Overlay (Large Devices) */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 z-20 p-5 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 hidden lg:block pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={handleBuyNow}
                className="w-full bg-black text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/20 font-english"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full bg-white/90 backdrop-blur-md text-black px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 hover:scale-[1.02] active:scale-95 shadow-xl font-english"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </Link>

      {/* Info Content */}
      <div className="flex flex-col gap-3 px-2 pb-2">
        <Link href={`/products/${product.id}`} className="flex flex-col gap-1.5 flex-1 cursor-pointer">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors duration-300">
            {product.name}
          </h3>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#ff4d6d] font-english tabular-nums tracking-tight">
                {formatCurrency(product.price)}
              </span>
              {!isOutOfStock && product.stock <= 5 && (
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  Only {product.stock}
                </span>
              )}
            </div>

            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 line-through font-english tabular-nums">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <span className="text-xs sm:text-sm font-black text-teal-500 font-english">
                  -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Mobile & Tablet Quick Actions (Stacked Buttons) */}
        {!isOutOfStock && (
          <div className="flex gap-2 lg:hidden pt-1">
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-black text-white h-11 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all font-english"
            >
              Buy
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gray-50 text-gray-900 border border-gray-100 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all font-english flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
