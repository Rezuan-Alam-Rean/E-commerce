"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/features/cart/cart.store";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

export function CartView() {
  const { cart, load, updateItem, removeItem } = useCartStore();
  const [busy, setBusy] = useState(false);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      viewTrackedRef.current = false;
      return;
    }
    if (viewTrackedRef.current) return;

    trackMetaEvent("ViewCart", {
      value: cart.total,
      currency: "BDT",
      num_items: cart.items.length,
      contents: cart.items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        item_price: item.unitPrice,
      })),
      content_type: "product",
    });

    viewTrackedRef.current = true;
  }, [cart]);

  const handleQuantityChange = async (
    productId: string,
    quantity: number,
    unitPrice: number,
  ) => {
    if (quantity < 1) return;
    setBusy(true);
    try {
      await updateItem(productId, quantity);
      trackMetaEvent("UpdateCart", {
        currency: "BDT",
        value: unitPrice * quantity,
        content_ids: [productId],
        contents: [
          {
            id: productId,
            quantity,
            item_price: unitPrice,
          },
        ],
        content_type: "product",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveItem = async (
    productId: string,
    quantity: number,
    unitPrice: number,
  ) => {
    setBusy(true);
    try {
      await removeItem(productId);
      trackMetaEvent("RemoveFromCart", {
        currency: "BDT",
        value: unitPrice * quantity,
        content_ids: [productId],
        contents: [
          {
            id: productId,
            quantity,
            item_price: unitPrice,
          },
        ],
        content_type: "product",
      });
    } finally {
      setBusy(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-12 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="max-w-xs">
            <h3 className="text-xl font-black text-gray-900 mb-2">আপনার কার্ট খালি</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">পছন্দের পণ্য কার্টে যোগ করলেই এখানে দেখা যাবে। এখনই শপিং শুরু করুন!</p>
          </div>
          <Link href="/products" className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-black/10 font-english">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 items-start">
      {/* Items Column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {cart.items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-4 bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-[0_2px_12px_rgb(0,0,0,0.01)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.03)] transition-all group"
          >
            {/* Image */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-50 bg-gray-50">
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <Link href={`/products/${item.product.id}`} className="block">
                  <h3 className="text-sm sm:text-base font-black text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <button
                  onClick={() => handleRemoveItem(item.product.id, item.quantity, item.unitPrice)}
                  disabled={busy}
                  className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
              </div>
              <p className="text-sm font-black text-gray-900 font-english mb-3">
                {formatCurrency(item.unitPrice)}
              </p>

              {/* Controls */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.unitPrice)}
                    disabled={item.quantity <= 1 || busy}
                    className="p-2 text-gray-500 hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="w-10 text-center text-xs font-black text-gray-900 font-english">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.unitPrice)}
                    disabled={busy}
                    className="p-2 text-gray-500 hover:bg-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[.15em] text-gray-400 font-english">Subtotal</p>
                  <p className="text-sm font-black text-gray-900 font-english">{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Column */}
      <div className="lg:sticky lg:top-28">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-black text-gray-900 font-english mb-1">Order Summary</h2>
            <p className="text-xs text-gray-500 font-medium">Review your items before proceeding to checkout.</p>
          </div>

          <div className="flex flex-col gap-3 py-6 border-y border-gray-50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-900 font-black font-english">{formatCurrency(cart.total)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Estimated Shipping</span>
              <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest font-english">Calculated at next step</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-black text-gray-900">মোট</span>
              <span className="text-2xl font-black text-gray-900 font-english tracking-tight">{formatCurrency(cart.total)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-gray-900 hover:bg-black text-white text-center py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-black/10 font-english"
            >
              Go to Checkout
            </Link>

            <Link href="/products" className="text-center text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors font-english py-2">
              ← Continue Shopping
            </Link>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-relaxed">
                Secure SSL encrypted checkout. We accept Cash on Delivery and all major digital wallets in Bangladesh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
