"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import type { ProductSummary } from "@/types/product";

export function WishlistView() {
  const { wishlist, load, remove } = useWishlistStore();
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => {
    const count = wishlist?.products.length ?? 0;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [wishlist?.products.length, pageSize]);

  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  const pagedProducts: ProductSummary[] = useMemo(() => {
    if (!wishlist) {
      return [];
    }
    const start = (currentPage - 1) * pageSize;
    return wishlist.products.slice(start, start + pageSize);
  }, [currentPage, pageSize, wishlist]);

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
      {pagedProducts.map((product) => (
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
              <p className="text-xs text-muted">{formatCurrency(product.price)}</p>
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
      <PaginationButtons page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
