import { createSlice } from "@reduxjs/toolkit";
import type { UserProfile } from "@/types/user";
import { authApi } from "../api/auth";

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
      .addMatcher(authApi.endpoints.getProfile.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.getProfile.matchRejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
      });
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
