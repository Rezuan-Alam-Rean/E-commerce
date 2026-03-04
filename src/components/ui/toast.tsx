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
    <div className="fixed right-6 top-6 z-50 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-[var(--radius-md)] border border-border bg-white p-4 shadow-[var(--shadow)]"
        >
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-xs text-muted">{toast.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
