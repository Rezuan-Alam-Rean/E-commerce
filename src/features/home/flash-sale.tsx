"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid, ProductGridSkeleton } from "@/components/products/product-grid";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import { usePaginatedProducts } from "@/hooks/use-paginated-products";

export function FlashSale() {
  const { products, loading, page, totalPages, setPage } = usePaginatedProducts({ flash: true });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Flash Sale"
        title="Limited-time offers"
        description="Create urgency with short-window promotional items."
      />
      <div className="mt-8 space-y-6">
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid
            products={products}
            emptyTitle="No flash sale products"
            emptyDescription="Enable flash sale for products to show them here."
          />
        )}
        <PaginationButtons page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}
