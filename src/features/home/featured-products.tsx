"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid, ProductGridSkeleton } from "@/components/products/product-grid";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import { usePaginatedProducts } from "@/hooks/use-paginated-products";

export function FeaturedProducts() {
  const { products, loading, page, totalPages, setPage } = usePaginatedProducts({ featured: true });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Featured Picks"
        title="এই মুহূর্তের সেরা অফার"
        description="যে প্যাকগুলো গ্রাহকেরা বারবার অর্ডার করছেন সেগুলো দেখুন।"
      />
      <div className="mt-8 space-y-6">
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid
            products={products}
            emptyTitle="No featured products yet"
            emptyDescription="Tag items as featured to automatically populate this grid."
          />
        )}
        <PaginationButtons page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}
