import type { ApiResponse, PaginatedResult } from "@/types/api";
import type { ProductDetail, ProductSummary } from "@/types/product";
import { api } from "./base";
import { buildProductQueryParams, unwrap } from "./helpers";
import type { ProductFilters, ProductIdPayload, ProductMutationPayload } from "./types";

const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<PaginatedResult<ProductSummary>, ProductFilters | void>({
      query: (filters) => ({
        url: "products",
        params: buildProductQueryParams(filters),
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<ProductSummary>>) => unwrap(response),
      providesTags: ["Products"],
    }),
    getProduct: build.query<ProductDetail, ProductIdPayload>({
      query: ({ id }) => ({ url: `products/${id}` }),
      transformResponse: (response: ApiResponse<ProductDetail>) => unwrap(response),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<ProductDetail, ProductMutationPayload>({
      query: (body) => ({ url: "products", method: "POST", body }),
      transformResponse: (response: ApiResponse<ProductDetail>) => unwrap(response),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<ProductDetail, Partial<ProductMutationPayload> & ProductIdPayload>({
      query: ({ id, ...body }) => ({ url: `products/${id}`, method: "PUT", body }),
      transformResponse: (response: ApiResponse<ProductDetail>) => unwrap(response),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation<{ success: boolean }, ProductIdPayload>({
      query: ({ id }) => ({ url: `products/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ success: boolean }>) => unwrap(response),
      invalidatesTags: ["Products"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductQuery,
  useLazyGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
