import type { FetchArgs } from "@reduxjs/toolkit/query";
import type { ApiResponse } from "@/types/api";
import type { ProductFilters } from "./types";

export const unwrap = <T>(response: ApiResponse<T>) => {
  if (!response.success) {
    throw new Error(response.error ?? "Request failed");
  }
  return response.data;
};

export const buildProductQueryParams = (filters?: ProductFilters): FetchArgs["params"] => {
  if (!filters) {
    return { page: 1, limit: 8 };
  }

  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 8,
  };

  if (filters.search) {
    params.search = filters.search;
  }
  if (filters.category) {
    params.category = filters.category;
  }
  if (filters.featured) {
    params.featured = "true";
  }
  if (filters.trending) {
    params.trending = "true";
  }
  if (filters.flash) {
    params.flash = "true";
  }

  return params;
};
