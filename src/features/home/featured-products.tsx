import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/products/product-grid";
import { listProducts } from "@/services/product.service";

export async function FeaturedProducts() {
  const products = await listProducts({ featured: true, limit: 8 });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Featured"
        title="Premium picks for the spotlight"
        description="Curated selections driving the highest conversions."
      />
      <div className="mt-8">
        <ProductGrid
          products={products.items}
          emptyTitle="No featured products"
          emptyDescription="Mark products as featured to highlight them here."
        />
      </div>
    </section>
  );
}
