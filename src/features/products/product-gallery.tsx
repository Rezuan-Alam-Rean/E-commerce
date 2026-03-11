"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image Container */}
      <div className="relative aspect-square sm:aspect-auto sm:h-[500px] lg:h-[600px] overflow-hidden rounded-[32px] sm:rounded-[48px] bg-gray-50 border border-gray-100/50 shadow-[0_4px_32px_rgb(0,0,0,0.02)] transition-all duration-500">
        {current ? (
          <Image
            src={current}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 font-english">
            Product Preview Coming Soon
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {images.length > 1 ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-[20px] transition-all duration-300 border-2 overflow-hidden ${index === active
                  ? "border-emerald-500 shadow-[0_8px_24px_rgb(16,185,129,0.2)] scale-[1.05]"
                  : "border-gray-50 bg-white hover:border-emerald-200 grayscale-[0.5] hover:grayscale-0"
                }`}
              onClick={() => setActive(index)}
            >
              <Image src={image} alt={`${name} view ${index + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
