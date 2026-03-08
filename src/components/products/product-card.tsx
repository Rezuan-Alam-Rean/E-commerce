import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import type { ProductSummary } from "@/types/product";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const isOutOfStock = product.stock <= 0;
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col gap-4 rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow)] transition hover:-translate-y-1"
    >
      <div className="relative h-52 overflow-hidden rounded-[var(--radius-md)] bg-surface-strong">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-muted font-english">
            No Image
          </div>
        )}
        {isOutOfStock ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-xs font-semibold uppercase tracking-[0.3em] text-white font-english">
            Out of Stock
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">{formatCurrency(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-muted line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        {isOutOfStock ? (
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500 font-english">
            Out of Stock
          </span>
        ) : null}
      </div>
    </Link>
  );
}
