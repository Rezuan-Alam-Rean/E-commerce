import Link from "next/link";
import type { ReactNode } from "react";

type PaginationLinksProps = {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
  label?: ReactNode;
};

export function PaginationLinks({ page, totalPages, makeHref, label }: PaginationLinksProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const prevDisabled = page === 1;
  const nextDisabled = page === totalPages;

  const pillClass = "rounded-full border border-border px-4 py-2 font-semibold uppercase tracking-[0.2em] transition";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted font-english">
      <span>
        {label ?? (
          <>
            Page {page} / {totalPages}
          </>
        )}
      </span>
      <div className="flex gap-2">
        {prevDisabled ? (
          <span className={`${pillClass} opacity-40`}>Previous</span>
        ) : (
          <Link href={makeHref(prevPage)} className={pillClass}>
            Previous
          </Link>
        )}
        {nextDisabled ? (
          <span className={`${pillClass} opacity-40`}>Next</span>
        ) : (
          <Link href={makeHref(nextPage)} className={pillClass}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
