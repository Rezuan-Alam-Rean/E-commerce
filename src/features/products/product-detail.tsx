import { notFound } from "next/navigation";
import { MetaProductView } from "@/components/analytics/meta-product-view";
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
      <MetaProductView
        product={{ id: product.id, name: product.name, price: product.price, categories: product.categories }}
      />
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
          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              categories: product.categories,
              image: product.images?.[0],
            }}
          />
          <div className="text-xs text-muted font-english">
              Current Stock: {product.stock}
          </div>
        </div>
      </div>
      <div className="mt-12">
          <h2 className="text-lg font-semibold text-foreground font-english">Related Products</h2>
        <div className="mt-6">
          <ProductGrid
            products={related.items}
              emptyTitle="No similar products yet"
              emptyDescription="Add more items to this category to populate related suggestions."
          />
        </div>
      </div>
    </section>
  );
}
