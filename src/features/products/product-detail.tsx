import { notFound } from "next/navigation";
import { MetaProductView } from "@/components/analytics/meta-product-view";
import { ProductGrid } from "@/components/products/product-grid";
import { getProductByIdOrSlug, listProducts } from "@/services/product.service";
import { ProductActions } from "@/features/products/product-actions";
import { ProductGallery } from "@/features/products/product-gallery";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";

export async function ProductDetail({ id }: { id: string }) {
  const product = await getProductByIdOrSlug(id);
  if (!product) {
    notFound();
  }

  const related = product.categories.length
    ? await listProducts({ category: product.categories[0], limit: 4 })
    : { items: [] };

  const isOutOfStock = product.stock <= 0;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-20">
      <MetaProductView
        product={{ id: product.id, name: product.name, price: product.price, categories: product.categories }}
      />

      {/* Breadcrumbs - Responsive visibility */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8 sm:mb-16 font-english overflow-hidden">
        <Link href="/" className="hover:text-gray-900 transition-colors shrink-0">Home</Link>
        <span className="text-gray-200 shrink-0">/</span>
        <Link href="/products" className="hover:text-gray-900 transition-colors shrink-0">Products</Link>
        <span className="text-gray-200 shrink-0">/</span>
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Gallery Column - Sticky Desktop */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Info Column - Sticky for Large Screens */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col pt-4 lg:pt-0">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 ${isOutOfStock
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}>
              {isOutOfStock ? "Stock Out" : "Limited Available"}
            </span>
            {!isOutOfStock && (
              <span className="bg-amber-50 text-amber-600 border-2 border-amber-100 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                Authentic Item
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.05] mb-8 tracking-tighter">
            {product.name}
          </h1>

          <div className="flex items-start gap-5 mb-10 pb-10 border-b border-gray-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-english mb-1">Current Price</span>
              <span className="text-5xl sm:text-6xl font-black text-[#ff4d6d] font-english tabular-nums tracking-tighter">
                {formatCurrency(product.price)}
              </span>
            </div>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <div className="flex flex-col mt-4">
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em] font-english mb-1">
                  -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </span>
                <span className="text-2xl text-gray-300 line-through font-english tabular-nums leading-none">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mb-12">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-english mb-4">Description</h4>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-lg">
              {product.description}
            </p>
          </div>

          <div className="mb-12">
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                categories: product.categories,
                image: product.images?.[0],
              }}
            />
          </div>

          {/* Inventory Status Card */}
          <div className="mt-8 mb-10 p-5 rounded-[28px] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOutOfStock ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-english">Current Inventory</span>
                <span className={`text-lg font-black font-english ${isOutOfStock ? "text-rose-600" : "text-gray-900"}`}>
                  {isOutOfStock ? "Out of Stock" : `${product.stock} Units Ready`}
                </span>
              </div>
            </div>
            {!isOutOfStock && product.stock <= 5 && (
              <span className="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100 animate-pulse">
                Hurry Up!
              </span>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest font-english mb-1">SKU REFERENCE</p>
              <p className="text-[10px] font-bold text-gray-900 font-english uppercase">SKU-{product.id.slice(-6)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Overhaul */}
      <div className="mt-24 sm:mt-32 pt-16 border-t font-english-ignore">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-12 sm:mb-16">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500 font-english">More Collections</p>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">আপনার জন্য আরও কিছু</h2>
          </div>
          <Link href="/products" className="group flex items-center gap-3 text-xs font-black text-gray-400 hover:text-black transition-all uppercase tracking-widest">
            Browse Entire Shop
            <span className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center transition-all group-hover:bg-black group-hover:text-white group-hover:border-black">→</span>
          </Link>
        </div>

        <ProductGrid
          products={related.items}
          emptyTitle="No similar products yet"
          emptyDescription="Add more items to this category to populate related suggestions."
        />
      </div>
    </section>
  );
}
