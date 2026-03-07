"use client";

import { useCallback } from "react";
import type { DeliveryOption } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { api } from "@/lib/store/api";
import { cartActions } from "@/lib/store/slices/cart-slice";

export function useCartStore() {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);

  const load = useCallback(async () => {
    const action = dispatch(
      api.endpoints.getCart.initiate(undefined, {
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

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      const action = dispatch(
        api.endpoints.addCartItem.initiate(
          { productId, quantity },
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

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      const action = dispatch(
        api.endpoints.updateCartItem.initiate(
          { productId, quantity },
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

  const removeItem = useCallback(
    async (productId: string) => {
      const action = dispatch(
        api.endpoints.removeCartItem.initiate(
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

  const updateDelivery = useCallback(
    async (deliveryOption: DeliveryOption) => {
      const action = dispatch(
        api.endpoints.updateCartDelivery.initiate(
          { deliveryOption },
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
    dispatch(cartActions.resetCart());
  }, [dispatch]);

  return {
    cart,
    loading,
    load,
    addItem,
    updateItem,
    removeItem,
    updateDelivery,
    reset,
  };
}
