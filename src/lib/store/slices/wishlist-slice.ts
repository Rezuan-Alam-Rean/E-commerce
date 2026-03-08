import { createSlice } from "@reduxjs/toolkit";
import type { WishlistState } from "@/types/wishlist";
import { wishlistApi } from "../api/wishlist";

export type WishlistSliceState = {
  wishlist: WishlistState | null;
  loading: boolean;
};

const initialState: WishlistSliceState = {
  wishlist: null,
  loading: false,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(wishlistApi.endpoints.getWishlist.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(wishlistApi.endpoints.getWishlist.matchFulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.loading = false;
      })
      .addMatcher(wishlistApi.endpoints.getWishlist.matchRejected, (state) => {
        state.wishlist = null;
        state.loading = false;
      })
      .addMatcher(wishlistApi.endpoints.addWishlistItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(wishlistApi.endpoints.addWishlistItem.matchFulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.loading = false;
      })
      .addMatcher(wishlistApi.endpoints.addWishlistItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(wishlistApi.endpoints.removeWishlistItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(wishlistApi.endpoints.removeWishlistItem.matchFulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.loading = false;
      })
      .addMatcher(wishlistApi.endpoints.removeWishlistItem.matchRejected, (state) => {
        state.loading = false;
      });
  },
});

export const wishlistReducer = wishlistSlice.reducer;
export const wishlistActions = wishlistSlice.actions;
