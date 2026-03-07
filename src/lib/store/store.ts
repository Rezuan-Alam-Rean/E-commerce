import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import { authReducer } from "./slices/auth-slice";
import { cartReducer } from "./slices/cart-slice";
import { wishlistReducer } from "./slices/wishlist-slice";
import { toastReducer } from "./slices/toast-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
      toast: toastReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

export const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
