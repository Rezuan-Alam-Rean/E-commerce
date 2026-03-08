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
        title="সীমিত সময়ের অফার"
        description="যে সব কম্বো প্যাক মাত্র কয়েকদিনের জন্য ছাড়ে চলছে সেগুলো দেখতে থাকুন।"
      />
      <div className="mt-8 space-y-6">
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid
            products={products}
            emptyTitle="No flash deals right now"
            emptyDescription="As soon as a flash sale goes live, qualifying items will show up here."
          />
        )}
        <PaginationButtons page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}
