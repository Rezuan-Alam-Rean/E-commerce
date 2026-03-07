"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toastActions } from "@/lib/store/slices/toast-slice";

export function useToast() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast);

  const push = useCallback(
    (toast: { title: string; description?: string }) => {
      dispatch(toastActions.pushToast(toast));
    },
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(toastActions.removeToast(id));
    },
    [dispatch],
  );

  return { toasts, push, remove };
}
