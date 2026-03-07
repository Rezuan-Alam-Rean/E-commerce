import type { ApiResponse } from "@/types/api";
import type { UserProfile } from "@/types/user";
import { api } from "./base";
import { unwrap } from "./helpers";
import type { LoginPayload, RegisterPayload, UpdateProfilePayload } from "./types";

const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<UserProfile, void>({
      query: () => ({ url: "auth/profile" }),
      transformResponse: (response: ApiResponse<UserProfile>) => unwrap(response),
      providesTags: ["Auth"],
    }),
    login: build.mutation<UserProfile, LoginPayload>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
      transformResponse: (response: ApiResponse<UserProfile>) => unwrap(response),
      invalidatesTags: ["Auth"],
    }),
    register: build.mutation<UserProfile, RegisterPayload>({
      query: (body) => ({ url: "auth/register", method: "POST", body }),
      transformResponse: (response: ApiResponse<UserProfile>) => unwrap(response),
      invalidatesTags: ["Auth"],
    }),
    logout: build.mutation<{ success: boolean }, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
      transformResponse: (response: ApiResponse<{ success: boolean }>) => unwrap(response),
      invalidatesTags: ["Auth", "Cart", "Wishlist"],
    }),
    updateProfile: build.mutation<UserProfile, UpdateProfilePayload>({
      query: (body) => ({ url: "users/me", method: "PUT", body }),
      transformResponse: (response: ApiResponse<UserProfile>) => unwrap(response),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
