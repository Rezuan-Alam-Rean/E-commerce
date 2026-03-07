import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { getProductByIdOrSlug, listProducts } from "@/services/product.service";
import { ProductActions } from "@/features/products/product-actions";
import { ProductGallery } from "@/features/products/product-gallery";
import { formatCurrency } from "@/utils/format";

export async function ProductDetail({ id }: { id: string }) {
  const product = await getProductByIdOrSlug(id);
  if (!product) {
    notFound();
  }

  const related = product.categories.length
    ? await listProducts({ category: product.categories[0], limit: 4 })
    : { items: [] };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-4xl font-semibold text-foreground">
            {product.name}
          </h1>
          <p className="text-sm text-muted">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-muted line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <ProductActions productId={product.id} />
          <div className="text-xs text-muted">
            Stock available: {product.stock}
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">Related products</h2>
        <div className="mt-6">
          <ProductGrid
            products={related.items}
            emptyTitle="No related products"
            emptyDescription="This category is waiting for more products."
          />
        </div>
      </div>
    </section>
  );
}
