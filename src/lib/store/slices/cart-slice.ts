import { createSlice } from "@reduxjs/toolkit";
import type { CartState } from "@/types/cart";
import { cartApi } from "../api/cart";

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
      .addMatcher(cartApi.endpoints.getCart.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(cartApi.endpoints.getCart.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.getCart.matchRejected, (state) => {
        state.cart = null;
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.addCartItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(cartApi.endpoints.addCartItem.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.addCartItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.updateCartItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(cartApi.endpoints.updateCartItem.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.updateCartItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.removeCartItem.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(cartApi.endpoints.removeCartItem.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.removeCartItem.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.updateCartDelivery.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(cartApi.endpoints.updateCartDelivery.matchFulfilled, (state, { payload }) => {
        state.cart = payload;
        state.loading = false;
      })
      .addMatcher(cartApi.endpoints.updateCartDelivery.matchRejected, (state) => {
        state.loading = false;
      });
  },
});

export const cartReducer = cartSlice.reducer;
export const cartActions = cartSlice.actions;
