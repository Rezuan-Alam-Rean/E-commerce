"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import type { OrderSummary } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/format";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants";
import {
  useLazyGetOrdersQuery,
  useUpdateOrderMutation,
  useLazyGetProductQuery,
  useUpdateProductMutation,
} from "@/lib/store/api";

const PAGE_SIZE = 8;

type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  action: null | (() => Promise<void> | void);
};

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
  return "Unable to process request.";
};

export function AdminOrders() {
  const { push } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableBusy, setTableBusy] = useState(false);
  const [viewing, setViewing] = useState<OrderSummary | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    action: null,
  });
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [fetchOrdersQuery, { isFetching: ordersFetching }] = useLazyGetOrdersQuery();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const [fetchProductDetail] = useLazyGetProductQuery();
  const [updateProductMutation] = useUpdateProductMutation();

  const fetchOrders = useCallback(
    async (pageToLoad: number) => {
      try {
        const data = await fetchOrdersQuery(
          { page: pageToLoad, limit: PAGE_SIZE },
          true,
        ).unwrap();
        setOrders(data.items);
        setTotalPages(Math.max(1, data.pages));
        setPage(data.page);
        return true;
      } catch (error) {
        console.error(error);
        push({ title: "Load failed", description: resolveErrorMessage(error) });
        setOrders([]);
        setTotalPages(1);
        return false;
      }
    },
    [fetchOrdersQuery, push],
  );

  const refreshOrders = useCallback(
    async (fallbackPage?: number) => {
      const target = fallbackPage ?? page;
      const success = await fetchOrders(target);
      if (!success && target > 1) {
        await fetchOrders(Math.max(1, target - 1));
      }
    },
    [fetchOrders, page],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage === page) {
        return;
      }
      setTableBusy(true);
      void fetchOrders(nextPage).finally(() => setTableBusy(false));
    },
    [fetchOrders, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await fetchOrders(1);
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const adjustProductStock = useCallback(
    async (productId: string, delta: number) => {
      if (delta === 0) {
        return;
      }
      try {
        const detail = await fetchProductDetail(
          { id: productId },
          true,
        ).unwrap();
        const currentStock = detail.stock ?? 0;
        const nextStock = Math.max(0, currentStock - delta);
        await updateProductMutation({ id: productId, stock: nextStock }).unwrap();
      } catch (error) {
        console.error(error);
        push({ title: "Inventory update failed", description: resolveErrorMessage(error) });
      }
    },
    [fetchProductDetail, updateProductMutation, push],
  );

  const syncStockForStatusChange = useCallback(
    async (order: OrderSummary, nextStatus: OrderStatus) => {
      if (order.status === nextStatus) {
        return;
      }

      const deliveredBefore = order.status === "delivered";
      const deliveredAfter = nextStatus === "delivered";
      const adjustments: Array<{ productId: string; delta: number }> = [];

      for (const item of order.items) {
        let delta = 0;
        if (!deliveredBefore && deliveredAfter) {
          delta = item.quantity;
        } else if (deliveredBefore && !deliveredAfter) {
          delta = -item.quantity;
        }
        if (delta !== 0) {
          adjustments.push({ productId: item.product.id, delta });
        }
      }

      if (adjustments.length === 0) {
        return;
      }

      await Promise.all(
        adjustments.map(({ productId, delta }) => adjustProductStock(productId, delta)),
      );
    },
    [adjustProductStock],
  );

  const closeConfirm = () => {
    if (confirmBusy) {
      return;
    }
    setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  };

  const requestConfirm = (
    config: Partial<ConfirmState> & { title: string; action: () => Promise<void> | void },
  ) => {
    setConfirmState({
      open: true,
      title: config.title,
      description: config.description ?? "",
      confirmText: config.confirmText ?? "Confirm",
      cancelText: config.cancelText ?? "Cancel",
      action: config.action,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState.action) {
      closeConfirm();
      return;
    }
    setConfirmBusy(true);
    try {
      await confirmState.action();
    } finally {
      setConfirmBusy(false);
      setConfirmState((prev) => ({ ...prev, open: false, action: null }));
    }
  };

  const updateStatus = async (order: OrderSummary, status: OrderStatus) => {
    setTableBusy(true);
    try {
      await updateOrderMutation({ id: order.id, body: { status } }).unwrap();
      await syncStockForStatusChange(order, status);
      push({ title: "Order updated" });
      await refreshOrders();
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    } finally {
      setTableBusy(false);
    }
  };

  const openViewModal = (order: OrderSummary) => {
    setViewing(order);
  };

  const closeViewModal = () => {
    setViewing(null);
  };

  const handleStatusSelect = (order: OrderSummary, status: OrderStatus) => {
    requestConfirm({
      title: "Update order status?",
      description: `Change status to ${status}?`,
      confirmText: "Update",
      action: () => updateStatus(order, status),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-strong p-6 text-sm text-muted">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders will appear once customers check out."
        />
      ) : (
        <div className="relative">
          <Table headers={["Order", "Status", "Total", "Delivery", "Actions"]}>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell className="uppercase text-muted">{order.status}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell className="uppercase text-muted">{order.deliveryOption}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" onClick={() => openViewModal(order)}>
                      View
                    </Button>
                    <select
                      className="rounded-full border border-border bg-surface-strong px-3 py-2 text-xs"
                      value={order.status}
                      onChange={(event) =>
                        handleStatusSelect(order, event.target.value as OrderStatus)
                      }
                      disabled={tableBusy}
                    >
                      {ORDER_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {tableBusy ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-white/70 text-sm font-medium">
              Updating orders...
            </div>
          ) : null}
        </div>
      )}
      <PaginationButtons
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={tableBusy}
      />

      {viewing ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-border bg-white p-6 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Order overview
                </p>
                <h3 className="text-xl font-semibold text-foreground">
                  #{viewing.id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <Button type="button" variant="ghost" onClick={closeViewModal}>
                Close
              </Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold uppercase text-foreground">
                  {viewing.status}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Delivery
                </p>
                <p className="mt-2 text-sm font-semibold uppercase text-foreground">
                  {viewing.deliveryOption}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Total
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCurrency(viewing.total)}
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Shipping details
              </p>
              <div className="mt-2 text-sm text-foreground">
                <p>{viewing.shippingName ?? "N/A"}</p>
                <p className="text-muted">{viewing.shippingPhone ?? ""}</p>
                <p className="text-muted">{viewing.shippingAddress ?? ""}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Line items
              </p>
              {viewing.items.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-[var(--radius-lg)] border border-border bg-surface-strong p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[var(--radius-md)] bg-white">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
