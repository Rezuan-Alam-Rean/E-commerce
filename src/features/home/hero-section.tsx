import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:justify-between">
      <div className="flex max-w-xl flex-col gap-6">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#0f5132]">
          Bangladesh 2026
        </span>
        <h1 className="font-serif text-4xl font-semibold text-foreground md:text-6xl">
          Modern staples crafted across Dhaka, Rajshahi, and Chattogram.
        </h1>
        <p className="text-sm text-muted md:text-base">
          Celebrate locally sourced leather, handloomed textiles, and contemporary silhouettes
          engineered for the Bangladeshi shopper with nationwide delivery.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/products"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent-strong"
          >
            Shop Bangladesh Edit
          </Link>
          <Link
            href="/products?featured=true"
            className="rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-surface-strong"
          >
            Discover Artisans
          </Link>
        </div>
      </div>
      <div className="relative flex h-72 w-full flex-1 items-end justify-end overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[#0d3d2b] via-[#0f663b] to-[#ba1b1d] p-6 shadow-[var(--shadow)] md:h-96">
        <div className="flex w-full max-w-xs flex-col gap-4 rounded-[var(--radius-md)] bg-white/90 p-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Jamdani Atelier
          </p>
          <p className="text-lg font-semibold text-foreground">
            Rajshahi silk + Dhaka brass accessories
          </p>
          <p className="text-xs text-muted">Limited drop. Ships anywhere in Bangladesh within 72 hours.</p>
        </div>
      </div>
    </section>
  );
}
