"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-80 overflow-hidden rounded-[var(--radius-lg)] bg-surface-strong md:h-[420px]">
        {current ? (
          <Image src={current} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-muted">
            No Image
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3 overflow-auto">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`relative h-16 w-16 rounded-[var(--radius-sm)] border ${
                index === active ? "border-accent" : "border-border"
              }`}
              onClick={() => setActive(index)}
            >
              <Image src={image} alt={name} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
