import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import { listTopCategories } from "@/services/product.service";
import { EmptyState } from "@/components/ui/empty-state";

export async function CategorySection() {
  const categories = await listTopCategories(8);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20">
      <SectionHeading
        label="Collections"
        title="সব বিভাগ এক নজরে"
        description="শপিংয়ের জন্য জনপ্রিয় পোশাক ও এক্সেসরিজ বিভাগের সেরা তালিকা থেকে বেছে নিন।"
      />
      
      <div className="mt-12">
        {categories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Newly published products will automatically create categories here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative h-[300px] overflow-hidden rounded-3xl bg-muted transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20"
              >
                {/* Background Image */}
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:via-black/50" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 font-english transition-transform duration-500 group-hover:translate-x-1">
                      {category.count} {category.count === 1 ? 'Item' : 'Items'}
                    </span>
                    <h3 className="text-2xl font-bold text-white transition-transform duration-500 group-hover:translate-x-1">
                      {category.name}
                    </h3>
                    
                    <div className="mt-4 flex items-center gap-2 overflow-hidden">
                      <span className="translate-y-10 text-sm font-medium text-white/90 transition-all duration-500 group-hover:translate-y-0 font-english">
                        Browse Category
                      </span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-4 w-4 -translate-x-10 text-white opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Subtle Border Overlay */}
                <div className="absolute inset-0 rounded-3xl border border-white/10 transition-colors duration-500 group-hover:border-white/20" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
