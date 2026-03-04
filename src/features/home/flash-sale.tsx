import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/products/product-grid";
import { listProducts } from "@/services/product.service";

export async function FlashSale() {
  const products = await listProducts({ flash: true, limit: 4 });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Flash Sale"
        title="Limited-time offers"
        description="Create urgency with short-window promotional items."
      />
      <div className="mt-8">
        <ProductGrid
          products={products.items}
          emptyTitle="No flash sale products"
          emptyDescription="Enable flash sale for products to show them here."
        />
      </div>
    </section>
  );
}
