import type { ApiResponse } from "@/types/api";
import type { WishlistState } from "@/types/wishlist";
import { api } from "./base";
import { unwrap } from "./helpers";
import type { WishlistPayload } from "./types";

const wishlistApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistState, void>({
      query: () => ({ url: "wishlist" }),
      transformResponse: (response: ApiResponse<WishlistState>) => unwrap(response),
      providesTags: ["Wishlist"],
    }),
    addWishlistItem: build.mutation<WishlistState, WishlistPayload>({
      query: (body) => ({ url: "wishlist", method: "POST", body }),
      transformResponse: (response: ApiResponse<WishlistState>) => unwrap(response),
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistItem: build.mutation<WishlistState, WishlistPayload>({
      query: (body) => ({ url: "wishlist", method: "DELETE", body }),
      transformResponse: (response: ApiResponse<WishlistState>) => unwrap(response),
      invalidatesTags: ["Wishlist"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} = wishlistApi;
