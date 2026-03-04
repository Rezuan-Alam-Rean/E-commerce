import { create } from "zustand";
import type { CartState } from "@/types/cart";
import { apiRequest } from "@/services/api-client";

type CartStore = {
  cart: CartState | null;
  loading: boolean;
  load: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateDelivery: (deliveryOption: string) => Promise<void>;
  reset: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const cart = await apiRequest<CartState>("/api/cart");
      set({ cart, loading: false });
    } catch {
      set({ cart: null, loading: false });
    }
  },
  addItem: async (productId, quantity) => {
    set({ loading: true });
    try {
      const cart = await apiRequest<CartState>("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  updateItem: async (productId, quantity) => {
    set({ loading: true });
    try {
      const cart = await apiRequest<CartState>("/api/cart", {
        method: "PATCH",
        body: JSON.stringify({ productId, quantity }),
      });
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  removeItem: async (productId) => {
    set({ loading: true });
    try {
      const cart = await apiRequest<CartState>("/api/cart", {
        method: "DELETE",
        body: JSON.stringify({ productId }),
      });
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  updateDelivery: async (deliveryOption) => {
    set({ loading: true });
    try {
      const cart = await apiRequest<CartState>("/api/cart", {
        method: "PATCH",
        body: JSON.stringify({ deliveryOption }),
      });
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  reset: () => set({ cart: null, loading: false }),
}));
