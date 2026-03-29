"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import { formatCurrency } from "@/utils/format";
import type { ProductSummary } from "@/types/product";

export function WishlistView() {
  const { wishlist, load, remove } = useWishlistStore();
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => { load(); }, [load]);

  const totalPages = useMemo(() => {
    const count = wishlist?.products.length ?? 0;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [wishlist?.products.length, pageSize]);

  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  const pagedProducts: ProductSummary[] = useMemo(() => {
    if (!wishlist) return [];
    const start = (currentPage - 1) * pageSize;
    return wishlist.products.slice(start, start + pageSize);
  }, [currentPage, pageSize, wishlist]);

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">My Wishlist</h2>
          <p className="text-sm text-gray-500 font-medium">
            {wishlist?.products.length
              ? `${wishlist.products.length} saved item${wishlist.products.length !== 1 ? "s" : ""}`
              : "Products you save for later will appear here."}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {(!wishlist || wishlist.products.length === 0) ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div>
              <p className="font-black text-gray-900 font-english text-lg mb-1">Your wishlist is empty</p>
              <p className="text-sm text-gray-500">Browse the store and save products you love for later.</p>
            </div>
            <Link
              href="/products"
              className="mt-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-english"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_28px_rgb(0,0,0,0.07)] overflow-hidden transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-50 shrink-0">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                  )}
                  {/* Remove button on hover */}
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    title="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-white shadow-md flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-3 p-4 flex-1">
                  <div className="flex-1">
                    <p className="font-black text-gray-900 font-english text-sm leading-snug line-clamp-2">{product.name}</p>
                    <p className="text-base font-black text-gray-900 font-english mt-1">{formatCurrency(product.price)}</p>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-gray-50">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 text-center bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors font-english"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 text-gray-400 transition-colors"
                      title="Remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer — always visible */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] px-5 py-3">
            <span className="text-xs font-semibold text-gray-500 font-english">
              Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> &nbsp;·&nbsp; {wishlist?.products.length ?? 0} saved items
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-english"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-english"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
