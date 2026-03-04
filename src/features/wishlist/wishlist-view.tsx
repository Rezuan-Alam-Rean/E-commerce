"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function WishlistView() {
  const { wishlist, load, remove } = useWishlistStore();

  useEffect(() => {
    load();
  }, [load]);

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save products to keep track of future buys."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {wishlist.products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-white p-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-[var(--radius-sm)] bg-surface-strong">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{product.name}</p>
              <p className="text-xs text-muted">${product.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/products/${product.id}`} className="text-xs font-semibold uppercase tracking-[0.2em]">
              View
            </Link>
            <Button variant="ghost" type="button" onClick={() => remove(product.id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
