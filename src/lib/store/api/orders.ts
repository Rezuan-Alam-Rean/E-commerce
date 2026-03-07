import type { ApiResponse, PaginatedResult } from "@/types/api";
import type { OrderSummary } from "@/types/order";
import { api } from "./base";
import { unwrap } from "./helpers";
import type { CheckoutPayload, OrdersMutationPayload, OrdersQuery } from "./types";

const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<PaginatedResult<OrderSummary>, OrdersQuery | void>({
      query: (params) => ({
        url: "orders",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 8,
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<OrderSummary>>) => unwrap(response),
      providesTags: ["Orders"],
    }),
    updateOrder: build.mutation<OrderSummary, { id: string; body: OrdersMutationPayload }>({
      query: ({ id, body }) => ({ url: `orders/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<OrderSummary>) => unwrap(response),
      invalidatesTags: ["Orders"],
    }),
    cancelOrder: build.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `orders/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<{ success: boolean }>) => unwrap(response),
      invalidatesTags: ["Orders"],
    }),
    createOrder: build.mutation<OrderSummary, CheckoutPayload>({
      query: (body) => ({ url: "orders", method: "POST", body }),
      transformResponse: (response: ApiResponse<OrderSummary>) => unwrap(response),
      invalidatesTags: ["Orders", "Cart"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useLazyGetOrdersQuery,
  useUpdateOrderMutation,
  useCancelOrderMutation,
  useCreateOrderMutation,
} = ordersApi;
