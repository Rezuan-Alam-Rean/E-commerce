"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function ToastViewport() {
  const { toasts, remove } = useToast();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => remove(toast.id), 4000)
    );
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, remove]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[160] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-4 rounded-[28px] border border-black/5 bg-white/95 px-5 py-4 text-sm text-foreground shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur"
        >
          <span className="mt-1 h-10 w-1 rounded-full bg-gradient-to-b from-[#0d111f] via-[#181725] to-[#2e2a52]" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-xs text-muted">{toast.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="ml-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted transition hover:text-foreground"
            onClick={() => remove(toast.id)}
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
