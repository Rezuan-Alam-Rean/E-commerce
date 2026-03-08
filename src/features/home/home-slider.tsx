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
    title: "ফ্যামিলি ম্যাচিং সেট",
    image:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "demo-2",
    title: "কিডস ফেস্টিভ কালেকশন",
    image:
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "demo-3",
    title: "বেবি কমফোর্ট এসেন্সিয়ালস",
    image:
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1600&q=80",
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80 font-english">
              Family Highlights
            </p>
            <p className="mt-3 font-serif text-3xl">{current?.title ?? "Top Picks of the Week"}</p>
            <p className="mt-4 text-sm text-white/80">
              বাছাইকৃত ফ্যামিলি আউটফিট, উৎসব ও দৈনন্দিন স্টাইলে সবার জন্য উপযোগী।
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
