import type { ProductSummary } from "@/types/product";

export type WishlistState = {
  id: string;
  products: ProductSummary[];
};
