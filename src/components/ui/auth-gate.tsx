"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading, load } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    load().finally(() => {
      if (active) {
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => {
    if (ready && !loading && !user) {
      const nextPath = pathname ?? "/";
      router.replace(`/login?reason=auth&from=${encodeURIComponent(nextPath)}`);
    }
  }, [user, loading, pathname, router, ready]);

  if (!ready || loading || !user) {
    return null;
  }

  return <>{children}</>;
}
