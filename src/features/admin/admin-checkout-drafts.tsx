"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import { useToast } from "@/hooks/use-toast";
import type { CheckoutIntentSummary } from "@/types/checkout-intent";
import { useLazyGetCheckoutIntentsQuery } from "@/lib/store/api";

const PAGE_SIZE = 10;
const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const resolveErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { error?: string } }).data;
    if (data && typeof data === "object" && "error" in data) {
      const message = (data as { error?: string }).error;
      if (typeof message === "string") {
        return message;
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to load checkout drafts.";
};

export function AdminCheckoutDrafts() {
  const { push } = useToast();
  const [drafts, setDrafts] = useState<CheckoutIntentSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableBusy, setTableBusy] = useState(false);
  const [fetchDrafts] = useLazyGetCheckoutIntentsQuery();

  const loadPage = useCallback(
    async (targetPage: number) => {
      try {
        const data = await fetchDrafts({ page: targetPage, limit: PAGE_SIZE }, true).unwrap();
        setDrafts(data.items);
        setTotalPages(Math.max(1, data.pages));
        setPage(data.page);
        return true;
      } catch (error) {
        console.error(error);
        push({ title: "Load failed", description: resolveErrorMessage(error) });
        setDrafts([]);
        setTotalPages(1);
        return false;
      }
    },
    [fetchDrafts, push],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadPage(1).finally(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [loadPage]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage === page) {
        return;
      }
      setTableBusy(true);
      loadPage(nextPage).finally(() => setTableBusy(false));
    },
    [loadPage, page],
  );

  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface-strong p-6 text-sm text-muted">
        Loading checkout drafts...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {drafts.length === 0 ? (
        <EmptyState
          title="No checkout drafts"
          description="Drafts appear when a customer fills the checkout form but does not place an order."
        />
      ) : (
        <div className="relative">
          <Table headers={["Name", "Phone", "Address", "Email", "Updated"]}>
            {drafts.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell className="font-semibold text-foreground">{draft.shippingName}</TableCell>
                <TableCell className="text-muted">{draft.shippingPhone}</TableCell>
                <TableCell className="text-muted">{draft.shippingAddress}</TableCell>
                <TableCell className="text-muted">{draft.promoEmail ?? "—"}</TableCell>
                <TableCell className="text-xs uppercase tracking-[0.2em] text-muted">
                  {timestampFormatter.format(new Date(draft.updatedAt))}
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {tableBusy ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-white/75 text-sm font-semibold text-muted">
              Updating drafts...
            </div>
          ) : null}
        </div>
      )}
      <PaginationButtons
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={tableBusy || drafts.length === 0}
      />
    </div>
  );
}
