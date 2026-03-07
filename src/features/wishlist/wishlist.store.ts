"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { api } from "@/lib/store/api";
import { wishlistActions } from "@/lib/store/slices/wishlist-slice";

export function useWishlistStore() {
  const dispatch = useAppDispatch();
  const { wishlist, loading } = useAppSelector((state) => state.wishlist);

  const load = useCallback(async () => {
    const action = dispatch(
      api.endpoints.getWishlist.initiate(undefined, {
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

  const add = useCallback(
    async (productId: string) => {
      const action = dispatch(
        api.endpoints.addWishlistItem.initiate(
          { productId },
          { subscribe: false },
        ),
      );
      try {
        await action.unwrap();
      } finally {
        action.unsubscribe();
      }
    },
    [dispatch],
  );

  const remove = useCallback(
    async (productId: string) => {
      const action = dispatch(
        api.endpoints.removeWishlistItem.initiate(
          { productId },
          { subscribe: false },
        ),
      );
      try {
        await action.unwrap();
      } finally {
        action.unsubscribe();
      }
    },
    [dispatch],
  );

  const reset = useCallback(() => {
    dispatch(wishlistActions.resetWishlist());
  }, [dispatch]);

  return {
    wishlist,
    loading,
    load,
    add,
    remove,
    reset,
  };
}
