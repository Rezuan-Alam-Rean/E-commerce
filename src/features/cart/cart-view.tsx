"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart.store";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

export function CartView() {
  const { cart, load, updateItem, removeItem } = useCartStore();
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      viewTrackedRef.current = false;
      return;
    }
    if (viewTrackedRef.current) {
      return;
    }

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
    } catch {
      // silent fail keeps existing UX; toast logic handled elsewhere
    }
  };

  const handleRemoveItem = async (
    productId: string,
    quantity: number,
    unitPrice: number,
  ) => {
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
    } catch {
      // silent fail
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="আপনার কার্ট খালি"
        description="পছন্দের পণ্য কার্টে যোগ করলেই এখানে দেখা যাবে।"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {cart.items.map((item) => (
        <div
          key={item.product.id}
          className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-[var(--radius-sm)] bg-surface-strong">
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.product.name}</p>
              <p className="text-xs text-muted">{formatCurrency(item.unitPrice)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) =>
                void handleQuantityChange(
                  item.product.id,
                  Number(event.target.value),
                  item.unitPrice,
                )
              }
              className="w-20 rounded-full border border-border px-3 py-2 text-sm"
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() =>
                void handleRemoveItem(
                  item.product.id,
                  item.quantity,
                  item.unitPrice,
                )
              }
              className="font-english"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] bg-surface-strong p-6 md:flex-row md:items-center">
        <div>
          <span className="text-sm font-semibold text-foreground">মোট</span>
          <p className="text-sm font-semibold text-foreground">{formatCurrency(cart.total)}</p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent-strong font-english"
        >
          Go to Checkout
        </Link>
      </div>
    </div>
  );
}
