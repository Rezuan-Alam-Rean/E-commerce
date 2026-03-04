import type { ApiResponse } from "@/types/api";
import type { ProductDetail } from "@/types/product";

export async function fetchProducts(query: string) {
  const res = await fetch(`/api/products${query}`, { next: { revalidate: 30 } });
  const data = (await res.json()) as ApiResponse<{
    items: ProductDetail[];
    total: number;
    page: number;
    pages: number;
  }>;
  if (!data.success) {
    throw new Error(data.error);
  }
  return data.data;
}
