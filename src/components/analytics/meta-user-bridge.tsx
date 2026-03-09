"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { setMetaUserData, type MetaClientUserData } from "@/lib/analytics/meta-client";

export function MetaUserBridge() {
  const { user, load } = useAuth();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function syncPixelUserData() {
      if (!user) {
        setMetaUserData(undefined);
        if (typeof window !== "undefined" && typeof window.fbq === "function") {
          window.fbq("set", "userData", {});
        }
        return;
      }

      const payload: MetaClientUserData = {
        em: user.email ? [user.email] : undefined,
        ph: user.phone ? [user.phone] : undefined,
        external_id: user.id ? [user.id] : undefined,
      };

      setMetaUserData(payload);

      if (typeof window === "undefined" || typeof window.fbq !== "function") {
        return;
      }

      const hashedEntries = await buildHashedPixelUserData(payload);
      if (!cancelled && hashedEntries) {
        window.fbq("set", "userData", hashedEntries);
      }
    }

    void syncPixelUserData();

    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.phone, user?.id]);

  return null;
}

async function buildHashedPixelUserData(payload: MetaClientUserData) {
  const entries = Object.entries({
    em: payload.em?.[0]?.trim().toLowerCase(),
    ph: payload.ph?.[0]?.replace(/[^0-9]/g, ""),
    external_id: payload.external_id?.[0]?.trim().toLowerCase(),
  }).filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  if (!entries.length || typeof crypto === "undefined" || !crypto.subtle) {
    return undefined;
  }

  const hashedPairs = await Promise.all(
    entries.map(async ([key, value]) => {
      const hashed = await hashSha256(value);
      return [key, hashed] as const;
    }),
  );

  return hashedPairs.length ? Object.fromEntries(hashedPairs) : undefined;
}

async function hashSha256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
