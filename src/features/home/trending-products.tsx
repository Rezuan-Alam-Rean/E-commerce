import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/products/product-grid";
import { listProducts } from "@/services/product.service";

export async function TrendingProducts() {
  const products = await listProducts({ trending: true, limit: 8 });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Trending"
        title="Momentum-ready best sellers"
        description="High-interest products trending across regions."
      />
      <div className="mt-8">
        <ProductGrid
          products={products.items}
          emptyTitle="No trending products"
          emptyDescription="Flag products as trending to feature them here."
        />
      </div>
    </section>
  );
}
