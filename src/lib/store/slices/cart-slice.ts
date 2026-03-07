import { createSlice } from "@reduxjs/toolkit";
import type { CartState } from "@/types/cart";
import { api } from "../api";

export type CartSliceState = {
  cart: CartState | null;
  loading: boolean;
};

const initialState: CartSliceState = {
  cart: null,
  loading: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.getCart.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.getCart.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.getCart.matchRejected, (state) => {
        state.cart = null;
        state.loading = false;
      })
      .addMatcher(api.endpoints.addCartItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.addCartItem.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.addCartItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.updateCartItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.updateCartItem.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.updateCartItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.removeCartItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.removeCartItem.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.removeCartItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.updateCartDelivery.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.updateCartDelivery.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.updateCartDelivery.matchRejected, (state) => {
        state.loading = false;
      });
  },
});

export const cartReducer = cartSlice.reducer;
export const cartActions = cartSlice.actions;
