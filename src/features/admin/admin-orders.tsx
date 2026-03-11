"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
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

const statusConfig: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  processing: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  shipped: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  delivered: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
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
  const [fetchOrdersQuery] = useLazyGetOrdersQuery();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const [fetchProductDetail] = useLazyGetProductQuery();
  const [updateProductMutation] = useUpdateProductMutation();

  const fetchOrders = useCallback(
    async (pageToLoad: number) => {
      try {
        const data = await fetchOrdersQuery({ page: pageToLoad, limit: PAGE_SIZE }, true).unwrap();
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
      if (nextPage === page) return;
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
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const closeConfirm = () => {
    if (confirmBusy) return;
    setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  };

  const requestConfirm = (config: Partial<ConfirmState> & { title: string; action: () => Promise<void> | void }) => {
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
    if (!confirmState.action) { closeConfirm(); return; }
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
      push({ title: "Order updated successfully" });
      await refreshOrders();
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    } finally {
      setTableBusy(false);
    }
  };

  const handleStatusSelect = (order: OrderSummary, status: OrderStatus) => {
    requestConfirm({
      title: "Update Order Status?",
      description: `Change order #${order.id.slice(-6).toUpperCase()} to "${status}"?`,
      confirmText: "Update",
      cancelText: "Cancel",
      action: () => updateStatus(order, status),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">Manage Orders</h2>
          <p className="text-sm text-gray-500 font-medium">
            {loading ? "Loading orders..." : `${orders.length} orders on this page · Page ${page} of ${totalPages}`}
          </p>
        </div>
        {tableBusy && (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold font-english">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Updating...
          </div>
        )}
      </div>

      {/* Table / States */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex items-center justify-center text-gray-400 text-sm font-medium shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
            Loading orders...
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <EmptyState title="No orders yet" description="Orders will appear once customers check out." />
        </div>
      ) : (
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Order ID", "Items", "Total", "Delivery", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-5 py-4 first:pl-6 last:pr-6 font-english whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const sc = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 pl-6 py-4">
                        <span className="font-black text-gray-900 font-english text-sm tracking-wider">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </td>
                      <td className="px-5 py-4 font-black text-gray-900 font-english whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium capitalize">
                        {order.deliveryOption}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-english ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 pr-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewing(order)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-english"
                          >
                            View
                          </button>
                          <select
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer font-english shadow-sm"
                            value={order.status}
                            onChange={(e) => handleStatusSelect(order, e.target.value as OrderStatus)}
                            disabled={tableBusy}
                          >
                            {ORDER_STATUS.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Busy overlay */}
          {tableBusy && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="px-6 py-3 bg-white shadow-xl rounded-full border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Updating order...
              </div>
            </div>
          )}
        </div>
      )}

      {orders.length > 0 && (
        <PaginationButtons page={page} totalPages={totalPages} onPageChange={handlePageChange} disabled={tableBusy} />
      )}

      {/* ─── Order Details Modal ─── */}
      {viewing && (
        <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 py-0 sm:py-8">
          <div className="flex flex-col w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] border border-gray-100 bg-white shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english mb-0.5">
                  Order Details
                </p>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-gray-900 font-english">
                    #{viewing.id.slice(-6).toUpperCase()}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-english ${statusConfig[viewing.status].bg} ${statusConfig[viewing.status].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[viewing.status].dot}`}></span>
                    {viewing.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-1">Order Total</p>
                  <p className="text-2xl font-black text-emerald-600 font-english">{formatCurrency(viewing.total)}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-1">Delivery</p>
                  <p className="text-lg font-bold text-gray-900 font-english capitalize">{viewing.deliveryOption}</p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
                <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-700 font-english mb-4 border-b border-gray-200 pb-2">
                  Shipping Details
                </h4>
                <div className="flex flex-col gap-3 text-sm text-gray-600">
                  {[
                    { label: "Name", value: viewing.shippingName ?? "N/A" },
                    { label: "Phone", value: viewing.shippingPhone ?? "N/A" },
                    { label: "Address", value: viewing.shippingAddress ?? "N/A" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-2">
                      <span className="font-bold text-gray-900 w-20 shrink-0">{row.label}:</span>
                      <span className="flex-1">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-700 font-english mb-4 border-b border-gray-200 pb-2">
                  Purchased Items ({viewing.items.length})
                </h4>
                <div className="flex flex-col gap-3">
                  {viewing.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        {item.product.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate font-english">{item.product.name}</p>
                        <p className="text-xs text-gray-500 font-medium font-english mt-0.5">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-black text-gray-900 font-english whitespace-nowrap">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all font-english"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
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
