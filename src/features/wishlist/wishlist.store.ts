import { create } from "zustand";
import type { WishlistState } from "@/types/wishlist";
import { apiRequest } from "@/services/api-client";

type WishlistStore = {
  wishlist: WishlistState | null;
  loading: boolean;
  load: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  reset: () => void;
};

export const useWishlistStore = create<WishlistStore>((set) => ({
  wishlist: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const wishlist = await apiRequest<WishlistState>("/api/wishlist");
      set({ wishlist, loading: false });
    } catch {
      set({ wishlist: null, loading: false });
    }
  },
  add: async (productId) => {
    set({ loading: true });
    try {
      const wishlist = await apiRequest<WishlistState>("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      set({ wishlist, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  remove: async (productId) => {
    set({ loading: true });
    try {
      const wishlist = await apiRequest<WishlistState>("/api/wishlist", {
        method: "DELETE",
        body: JSON.stringify({ productId }),
      });
      set({ wishlist, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  reset: () => set({ wishlist: null, loading: false }),
}));
