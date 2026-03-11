import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/features/products/product-filters";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { PaginationLinks } from "@/components/ui/pagination-links";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function ProductListing({ searchParams }: { searchParams: SearchParams }) {
  const search = getParam(searchParams.search);
  const category = getParam(searchParams.category);
  const page = Number(getParam(searchParams.page) ?? "1");

  const products = await listProducts({
    search,
    category,
    page,
    limit: 12,
  });
  const categories = await listCategories();
  const totalPages = Math.max(products.pages, 1);
  const makeHref = (targetPage: number) =>
    `/products${buildQuery({ search, category, page: String(targetPage) })}`;

  const activeFilters = [search, category].filter(Boolean).length;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english mb-2">Our Collection</p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              সব পণ্য দেখুন
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium max-w-lg">
              শার্ট, টি-শার্ট, হুডি, জিন্স ও অন্যান্য ফ্যাশন আইটেম ঘুরে দেখুন। আপনার পছন্দের পণ্যটি সহজেই খুঁজে পেতে নিচের ফিল্টারগুলো ব্যবহার করুন।
            </p>
          </div>
          {/* Result count badge */}
          <div className="shrink-0 flex items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-2.5 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-gray-700 font-english whitespace-nowrap">
              {products.items.length > 0 ? `${products.items.length} products` : "No results"}
              {activeFilters > 0 ? " found" : " listed"}
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <ProductFilters search={search} category={category} categories={categories} />
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products.items}
          emptyTitle="No products match the filters"
          emptyDescription="Try a different search term or category, or reset the filters."
        />

        {/* Pagination — always visible */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] px-5 py-3 mt-2">
          <span className="text-xs font-semibold text-gray-500 font-english">
            Page <strong className="text-gray-900">{products.page}</strong> of <strong className="text-gray-900">{totalPages}</strong>
            {products.total > 0 && (
              <> &nbsp;·&nbsp; <strong className="text-gray-900">{products.total}</strong> total items</>
            )}
          </span>
          <div className="flex gap-2">
            {page <= 1 ? (
              <span className="px-4 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-300 cursor-not-allowed font-english">← Previous</span>
            ) : (
              <a href={makeHref(page - 1)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-english">
                ← Previous
              </a>
            )}
            {page >= totalPages ? (
              <span className="px-4 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-300 cursor-not-allowed font-english">Next →</span>
            ) : (
              <a href={makeHref(page + 1)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-english">
                Next →
              </a>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
