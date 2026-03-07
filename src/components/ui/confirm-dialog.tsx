"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-[24px] border border-border bg-white p-6 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1"
          >
            {busy ? "Working..." : confirmText}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
            className="flex-1"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}
