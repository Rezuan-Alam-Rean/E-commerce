import type { ApiResponse } from "@/types/api";
import type { CategorySummary } from "@/types/category";
import { api } from "./base";
import { unwrap } from "./helpers";
import type { CategoryDeletePayload, CategoryPayload } from "./types";

const categoriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<CategorySummary[], void>({
      query: () => ({ url: "categories" }),
      transformResponse: (response: ApiResponse<CategorySummary[]>) => unwrap(response),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<CategorySummary, CategoryPayload>({
      query: (body) => ({ url: "categories", method: "POST", body }),
      transformResponse: (response: ApiResponse<CategorySummary>) => unwrap(response),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: build.mutation<{ success: boolean }, CategoryDeletePayload>({
      query: ({ id }) => ({ url: `categories/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ success: boolean }>) => unwrap(response),
      invalidatesTags: ["Categories"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
