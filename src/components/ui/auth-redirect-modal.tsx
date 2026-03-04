"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function AuthRedirectModal() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("reason") === "auth") {
      setOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = setTimeout(() => setOpen(false), 2000);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Sign in required
        </p>
        <p className="mt-3 text-lg font-semibold text-foreground">
          Please sign in to continue
        </p>
        <p className="mt-2 text-sm text-muted">
          You must be logged in to access that page.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
