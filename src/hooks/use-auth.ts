"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { authApi } from "@/lib/store/api/auth";
import { authActions } from "@/lib/store/slices/auth-slice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const load = useCallback(async () => {
    const action = dispatch(
      authApi.endpoints.getProfile.initiate(undefined, {
        forceRefetch: true,
      }),
    );
    await action.unwrap();
  }, [dispatch]);

  const logout = useCallback(async () => {
    const action = dispatch(authApi.endpoints.logout.initiate(undefined));
    await action.unwrap();
    dispatch(authActions.resetAuth());
  }, [dispatch]);

  return {
    user,
    loading,
    load,
    logout,
  };
}
