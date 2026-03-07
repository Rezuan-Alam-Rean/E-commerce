"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { api } from "@/lib/store/api";
import { authActions } from "@/lib/store/slices/auth-slice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const load = useCallback(async () => {
    const action = dispatch(
      api.endpoints.getProfile.initiate(undefined, {
        subscribe: false,
        forceRefetch: true,
      }),
    );
    try {
      await action.unwrap();
    } finally {
      action.unsubscribe();
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    const action = dispatch(
      api.endpoints.logout.initiate(undefined, {
        subscribe: false,
      }),
    );
    try {
      await action.unwrap();
    } finally {
      action.unsubscribe();
    }
    dispatch(authActions.resetAuth());
  }, [dispatch]);

  return {
    user,
    loading,
    load,
    logout,
  };
}
