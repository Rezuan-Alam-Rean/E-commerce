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

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      const normalizedEntries = Object.entries({
        em: payload.em?.[0]?.trim().toLowerCase(),
        ph: payload.ph?.[0]?.replace(/[^0-9]/g, ""),
        external_id: payload.external_id?.[0]?.trim().toLowerCase(),
      }).filter(([, value]) => Boolean(value)) as Array<[string, string]>;

      if (normalizedEntries.length) {
        window.fbq("set", "userData", Object.fromEntries(normalizedEntries));
      }
    }
  }, [user?.email, user?.phone, user?.id]);

  return null;
}
