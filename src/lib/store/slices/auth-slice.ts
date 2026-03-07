import { createSlice } from "@reduxjs/toolkit";
import type { UserProfile } from "@/types/user";
import { api } from "../api";

export type AuthSliceState = {
  user: UserProfile | null;
  loading: boolean;
};

const initialState: AuthSliceState = {
  user: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.getProfile.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.getProfile.matchRejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addMatcher(api.endpoints.login.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.login.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.register.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(api.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.loading = false;
      })
      .addMatcher(api.endpoints.register.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addMatcher(api.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
      });
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
