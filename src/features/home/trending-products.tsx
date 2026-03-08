"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid, ProductGridSkeleton } from "@/components/products/product-grid";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import { usePaginatedProducts } from "@/hooks/use-paginated-products";

export function TrendingProducts() {
  const { products, loading, page, totalPages, setPage } = usePaginatedProducts({ trending: true });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Trending Now"
        title="সবার মুখে মুখে যে পণ্যগুলো"
        description="ঢাকা, চট্টগ্রাম ও বরিশালে যেগুলো সবচেয়ে বেশি অর্ডার হচ্ছে সেগুলো এখানে।"
      />
      <div className="mt-8 space-y-6">
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid
            products={products}
            emptyTitle="No trending products yet"
            emptyDescription="Mark an item as trending to have it highlighted in this list."
          />
        )}
        <PaginationButtons page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}
