"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { wishlistApi } from "@/lib/store/api/wishlist";
import { wishlistActions } from "@/lib/store/slices/wishlist-slice";

export function useWishlistStore() {
  const dispatch = useAppDispatch();
  const { wishlist, loading } = useAppSelector((state) => state.wishlist);

  const load = useCallback(async () => {
    const action = dispatch(
      wishlistApi.endpoints.getWishlist.initiate(undefined, {
        forceRefetch: true,
      }),
    );
    await action.unwrap();
  }, [dispatch]);

  const add = useCallback(
    async (productId: string) => {
      const action = dispatch(
        wishlistApi.endpoints.addWishlistItem.initiate({ productId }),
      );
      await action.unwrap();
    },
    [dispatch],
  );

  const remove = useCallback(
    async (productId: string) => {
      const action = dispatch(
        wishlistApi.endpoints.removeWishlistItem.initiate({ productId }),
      );
      await action.unwrap();
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
