"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Slide = {
  id: string;
  title: string;
  image?: string;
};

const staticSlides: Slide[] = [
  {
    id: "demo-1",
    title: "Spring capsule collection",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "demo-2",
    title: "Minimal essentials",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "demo-3",
    title: "Warm neutrals edit",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80",
  },
];

export function HomeSlider() {
  const [slides] = useState<Slide[]>(staticSlides);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[active];
  const indicators = useMemo(() => Array.from({ length: slides.length }), [slides.length]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-surface-strong shadow-[var(--shadow)]">
        <div className="relative h-[420px] w-full">
          {current?.image ? (
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col justify-between gap-6 p-8 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Featured drop
            </p>
            <p className="mt-3 font-serif text-3xl">{current?.title ?? "Featured selection"}</p>
            <p className="mt-4 text-sm text-white/80">
              Curated essentials for elevated everyday routines.
            </p>
          </div>
          {slides.length > 1 ? (
            <div className="flex gap-2">
              {indicators.map((_, index) => (
                <button
                  key={`slide-${index}`}
                  type="button"
                  className={`h-2 w-10 rounded-full transition ${
                    index === active ? "bg-white" : "bg-white/40"
                  }`}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
