import type { ApiResponse, PaginatedResult } from "@/types/api";
import type { CheckoutIntentSummary } from "@/types/checkout-intent";
import { api } from "./base";
import { unwrap } from "./helpers";
import type { CheckoutIntentPayload, CheckoutIntentQuery } from "./types";

const checkoutIntentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCheckoutIntents: build.query<PaginatedResult<CheckoutIntentSummary>, CheckoutIntentQuery | void>({
      query: (params) => ({
        url: "checkout-intents",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: ApiResponse<PaginatedResult<CheckoutIntentSummary>>) => unwrap(response),
      providesTags: ["CheckoutIntents"],
    }),
    saveCheckoutIntent: build.mutation<CheckoutIntentSummary, CheckoutIntentPayload>({
      query: (body) => ({ url: "checkout-intents", method: "POST", body }),
      transformResponse: (response: ApiResponse<CheckoutIntentSummary>) => unwrap(response),
      invalidatesTags: ["CheckoutIntents"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCheckoutIntentsQuery,
  useLazyGetCheckoutIntentsQuery,
  useSaveCheckoutIntentMutation,
} = checkoutIntentApi;
