import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:justify-between">
      <div className="flex max-w-xl flex-col gap-6">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#0f5132] font-english">
          Bangladeshi Flavor
        </span>
        <h1 className="font-serif text-4xl font-semibold text-foreground md:text-6xl">
          বাসায় বসেই দেশজ ভাত, ভর্তা, মসলা ও রেডি মিল অর্ডার করুন।
        </h1>
        <p className="text-sm text-muted md:text-base">
          স্থানীয় কারিগরের বানানো আচার, ভাজা মসলা ও আঞ্চলিক রান্নার উপকরণ এক ক্লিকে পাবেন—ঢাকা থেকে বরিশাল সবখানেই দ্রুত ডেলিভারি।
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/products"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent-strong font-english"
          >
            Shop Now
          </Link>
          <Link
            href="/products?featured=true"
            className="rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-surface-strong font-english"
          >
            See Featured Picks
          </Link>
        </div>
      </div>
      <div className="relative flex h-72 w-full flex-1 items-end justify-end overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[#0d3d2b] via-[#0f663b] to-[#ba1b1d] p-6 shadow-[var(--shadow)] md:h-96">
        <div className="flex w-full max-w-xs flex-col gap-4 rounded-[var(--radius-md)] bg-white/90 p-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted font-english">
            Regional Special Pack
          </p>
          <p className="text-lg font-semibold text-foreground">
            ভুনা খিচুড়ি মিক্স + শুটকি-ভর্তা কম্বো
          </p>
          <p className="text-xs text-muted">সীমিত সময়ের অফার। ৭২ ঘন্টার মধ্যে সারা দেশে ডেলিভারি।</p>
        </div>
      </div>
    </section>
  );
}
