"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductSummary } from "@/types/product";

type PaginatedProductFilters = {
  search?: string;
  category?: string;
  featured?: boolean;
  trending?: boolean;
  flash?: boolean;
};

const DEFAULT_PAGE_SIZE = 8;

type PaginatedProductsResult = {
  products: ProductSummary[];
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (nextPage: number) => void;
};

export function usePaginatedProducts(
  filters: PaginatedProductFilters = {},
  pageSize = DEFAULT_PAGE_SIZE,
): PaginatedProductsResult {
  const [page, setInternalPage] = useState(1);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { search, category, featured, trending, flash } = filters;

  const setPage = useCallback((nextPage: number) => {
    setInternalPage(Math.max(1, nextPage));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
        });

        if (search) {
          params.set("search", search);
        }
        if (category) {
          params.set("category", category);
        }
        if (featured) {
          params.set("featured", "true");
        }
        if (trending) {
          params.set("trending", "true");
        }
        if (flash) {
          params.set("flash", "true");
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (data?.success) {
          setProducts(data.data.items);
          setTotalPages(Math.max(1, data.data.pages));
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [category, featured, flash, page, pageSize, search, trending]);

  return {
    products,
    loading,
    page,
    totalPages,
    setPage,
  };
}
