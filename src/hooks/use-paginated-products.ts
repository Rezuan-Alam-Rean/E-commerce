"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductSummary } from "@/types/product";
import { useGetProductsQuery } from "@/lib/store/api";

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
  const { search, category, featured, trending, flash } = filters;

  const setPage = useCallback((nextPage: number) => {
    setInternalPage(Math.max(1, nextPage));
  }, []);

  const queryArgs = useMemo(
    () => ({ page, limit: pageSize, search, category, featured, trending, flash }),
    [page, pageSize, search, category, featured, trending, flash],
  );

  const { data, isFetching } = useGetProductsQuery(queryArgs);

  useEffect(() => {
    setInternalPage(1);
  }, [search, category, featured, trending, flash, pageSize]);

  const products = data?.items ?? [];
  const totalPages = Math.max(1, data?.pages ?? 1);

  return {
    products,
    loading: isFetching,
    page,
    totalPages,
    setPage,
  };
}
