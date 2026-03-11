import { SectionHeading } from "@/components/ui/section-heading";
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
    limit: 8,
  });
  const categories = await listCategories();
  const totalPages = Math.max(products.pages, 1);
  const makeHref = (targetPage: number) =>
    `/products${buildQuery({ search, category, page: String(targetPage) })}`;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-6">
        <SectionHeading
          label="Our Collection"
          title="সম্পূর্ণ পোশাকের কালেকশন ঘুরে দেখুন"
          description="শার্ট, টি-শার্ট, হুডি, জিন্স ও অন্যান্য ফ্যাশন আইটেম সহজেই খুঁজে বের করুন ও ফিল্টার করুন।"
        />
        <ProductFilters search={search} category={category} categories={categories} />
        <ProductGrid
          products={products.items}
          emptyTitle="No products match the filters"
          emptyDescription="Once admins add new inventory it will automatically appear in this catalog."
        />
        <PaginationLinks
          page={products.page}
          totalPages={totalPages}
          makeHref={makeHref}
        />
      </div>
    </section>
  );
}
