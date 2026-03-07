import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type Toast = {
  id: string;
  title: string;
  description?: string;
};

export type ToastState = Toast[];

const initialState: ToastState = [];

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    pushToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.push(action.payload);
      },
      prepare: (toast: Omit<Toast, "id">) => ({
        payload: { ...toast, id: nanoid() },
      }),
    },
    removeToast: (state, action: PayloadAction<string>) =>
      state.filter((toast) => toast.id !== action.payload),
    clearToasts: () => initialState,
  },
});

export const toastReducer = toastSlice.reducer;
export const toastActions = toastSlice.actions;
