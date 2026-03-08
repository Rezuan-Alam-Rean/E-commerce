"use client";

import { useCallback } from "react";
import type { DeliveryOption } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { cartApi } from "@/lib/store/api/cart";
import { cartActions } from "@/lib/store/slices/cart-slice";

export function useCartStore() {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);

  const load = useCallback(async () => {
    const action = dispatch(
      cartApi.endpoints.getCart.initiate(undefined, {
        forceRefetch: true,
      }),
    );
    await action.unwrap();
  }, [dispatch]);

  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      const action = dispatch(
        cartApi.endpoints.addCartItem.initiate({ productId, quantity }),
      );
      await action.unwrap();
    },
    [dispatch],
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      const action = dispatch(
        cartApi.endpoints.updateCartItem.initiate({ productId, quantity }),
      );
      await action.unwrap();
    },
    [dispatch],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const action = dispatch(
        cartApi.endpoints.removeCartItem.initiate({ productId }),
      );
      await action.unwrap();
    },
    [dispatch],
  );

  const updateDelivery = useCallback(
    async (deliveryOption: DeliveryOption) => {
      const action = dispatch(
        cartApi.endpoints.updateCartDelivery.initiate({ deliveryOption }),
      );
      await action.unwrap();
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
