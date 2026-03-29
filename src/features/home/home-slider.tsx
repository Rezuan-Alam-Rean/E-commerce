"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  ctaText: string;
  ctaLink: string;
};

const staticSlides: Slide[] = [
  {
    id: "demo-1",
    subtitle: "Premium Collection",
    title: "ফ্যামিলি ম্যাচিং সেট",
    description: "বাছাইকৃত ফ্যামিলি আউটফিট, উৎসব ও দৈনন্দিন স্টাইলে সবার জন্য উপযোগী।",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    ctaText: "Shop Collection",
    ctaLink: "/products",
  },
  {
    id: "demo-2",
    subtitle: "Festive Vibes",
    title: "কিডস ফেস্টিভ কালেকশন",
    description: "শিশুদের উৎসবের আনন্দ রাঙাতে আমাদের নতুন কালারফুল কালেকশন থেকে বেছে নিন।",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1600&q=80",
    ctaText: "Explore Now",
    ctaLink: "/products",
  },
  {
    id: "demo-3",
    subtitle: "New Arrivals",
    title: "বেবি কমফোর্ট এসেন্সিয়ালস",
    description: "নরম সুতির আরামদায়ক পোশাক যা আপনার সোনামণির জন্য সব ঋতুতে সেরা।",
    image: "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1600&q=80",
    ctaText: "View Essentials",
    ctaLink: "/products",
  },
];

export function HomeSlider() {
  const [slides] = useState<Slide[]>(staticSlides);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const indicators = useMemo(() => Array.from({ length: slides.length }), [slides.length]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-gray-100 bg-gray-50 shadow-[0_4px_32px_rgb(0,0,0,0.04)] aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[550px]">
        {/* Carousel Content */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === active ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            {/* Background Image with Zoom Animation */}
            {slide.image && (
              <div className="absolute inset-0 scale-105">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className={`object-cover object-center transition-transform duration-[6000ms] ease-linear ${index === active ? "scale-100" : "scale-110"
                    }`}
                  priority={index === 0}
                />
              </div>
            )}

            {/* Premium Gradient Overlays - Mobile Centered vs Desktop Left */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent" />

            {/* Slide Information */}
            <div className="relative h-full flex flex-col justify-end sm:justify-center px-6 py-12 sm:px-16 md:px-24">
              <div className="max-w-2xl transform transition-all duration-700 delay-300 translate-y-0 opacity-100 text-center sm:text-left">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-emerald-400 font-english mb-3 sm:mb-4">
                  {slide.subtitle}
                </p>
                <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-4 sm:mb-6">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-lg text-white/80 max-w-lg mb-8 sm:mb-10 leading-relaxed mx-auto sm:mx-0">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  <Link
                    href={slide.ctaLink}
                    className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-black px-10 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-emerald-500/10 font-english"
                  >
                    {slide.ctaText}
                  </Link>
                  <Link
                    href="/products"
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 px-10 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all font-english"
                  >
                    New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        <div className="absolute top-6 sm:top-auto sm:bottom-12 left-0 right-0 sm:left-16 md:left-24 z-20 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6">
          {/* Indicators */}
          <div className="flex gap-2">
            {indicators.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => setActive(index)}
                className={`group relative h-1 rounded-full transition-all duration-300 ${index === active ? "w-10 sm:w-12 bg-white" : "w-4 sm:w-6 bg-white/20 hover:bg-white/40"
                  }`}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <div className="hidden sm:block text-[10px] font-bold text-white/40 font-english tracking-widest">
            {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>
        </div>

        {/* Arrow Controls (Desktop Only) */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:flex gap-3">
          <button
            onClick={() => setActive((v) => (v === 0 ? slides.length - 1 : v - 1))}
            className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            onClick={() => setActive((v) => (v + 1) % slides.length)}
            className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
