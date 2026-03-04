"use client";

import { create } from "zustand";
import type { UserProfile } from "@/types/user";

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  load: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/profile", { credentials: "include" });
      if (!res.ok) {
        set({ user: null, loading: false });
        return;
      }
      const data = await res.json();
      if (!data.success) {
        set({ user: null, loading: false });
        return;
      }
      set({ user: data.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null });
    }
  },
}));
