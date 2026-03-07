"use client";

import type { ReactNode } from "react";

export type PaginationButtonsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  label?: ReactNode;
};

export function PaginationButtons({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  label,
}: PaginationButtonsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const isPrevDisabled = page === 1 || disabled;
  const isNextDisabled = page === totalPages || disabled;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <span>
        {label ?? (
          <>
            Page {page} of {totalPages}
          </>
        )}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(prevPage)}
          disabled={isPrevDisabled}
        >
          Prev
        </button>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(nextPage)}
          disabled={isNextDisabled}
        >
          Next
        </button>
      </div>
    </div>
  );
}
