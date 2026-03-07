import { createSlice } from "@reduxjs/toolkit";
import type { WishlistState } from "@/types/wishlist";
import { api } from "../api";

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
      .addMatcher(api.endpoints.getWishlist.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.getWishlist.matchFulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.getWishlist.matchRejected, (state) => {
        state.wishlist = null;
        state.loading = false;
      })
      .addMatcher(api.endpoints.addWishlistItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.addWishlistItem.matchFulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.addWishlistItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.removeWishlistItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.removeWishlistItem.matchFulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.removeWishlistItem.matchRejected, (state) => {
        state.loading = false;
      });
  },
});

export const wishlistReducer = wishlistSlice.reducer;
export const wishlistActions = wishlistSlice.actions;
