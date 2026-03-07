"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart.store";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";

export function CartView() {
  const { cart, load, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    load();
  }, [load]);

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products to start building your order."
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
                updateItem(item.product.id, Number(event.target.value))
              }
              className="w-20 rounded-full border border-border px-3 py-2 text-sm"
            />
            <Button variant="ghost" type="button" onClick={() => removeItem(item.product.id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] bg-surface-strong p-6 md:flex-row md:items-center">
        <div>
          <span className="text-sm font-semibold text-foreground">Total</span>
          <p className="text-sm font-semibold text-foreground">{formatCurrency(cart.total)}</p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent-strong"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
