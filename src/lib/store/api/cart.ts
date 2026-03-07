import type { ApiResponse } from "@/types/api";
import type { CartState } from "@/types/cart";
import { api } from "./base";
import { unwrap } from "./helpers";
import type { CartDeliveryPayload, CartItemPayload } from "./types";

const cartApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<CartState, void>({
      query: () => ({ url: "cart" }),
      transformResponse: (response: ApiResponse<CartState>) => unwrap(response),
      providesTags: ["Cart"],
    }),
    addCartItem: build.mutation<CartState, CartItemPayload>({
      query: (body) => ({ url: "cart", method: "POST", body }),
      transformResponse: (response: ApiResponse<CartState>) => unwrap(response),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: build.mutation<CartState, CartItemPayload>({
      query: (body) => ({ url: "cart", method: "PATCH", body }),
      transformResponse: (response: ApiResponse<CartState>) => unwrap(response),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: build.mutation<CartState, { productId: string }>({
      query: (body) => ({ url: "cart", method: "DELETE", body }),
      transformResponse: (response: ApiResponse<CartState>) => unwrap(response),
      invalidatesTags: ["Cart"],
    }),
    updateCartDelivery: build.mutation<CartState, CartDeliveryPayload>({
      query: (body) => ({ url: "cart", method: "PATCH", body }),
      transformResponse: (response: ApiResponse<CartState>) => unwrap(response),
      invalidatesTags: ["Cart"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useUpdateCartDeliveryMutation,
} = cartApi;
