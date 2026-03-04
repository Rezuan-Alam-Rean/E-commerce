import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { listTopCategories } from "@/services/product.service";
import { EmptyState } from "@/components/ui/empty-state";

export async function CategorySection() {
  const categories = await listTopCategories(6);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <SectionHeading
        label="Collections"
        title="Categories with momentum"
        description="Browse the categories your customers gravitate toward the most."
      />
      <div className="mt-8">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Add products to start seeing category insights."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-6 transition hover:-translate-y-1"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {category.count} products
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {category.name}
                </h3>
                <span className="text-xs text-muted">Explore the collection</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
