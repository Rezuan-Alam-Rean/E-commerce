"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import type { OrderSummary } from "@/types/order";
import { formatCurrency } from "@/utils/format";
import {
  useLazyGetOrdersQuery,
  useCancelOrderMutation,
  useUpdateOrderMutation,
} from "@/lib/store/api";
import type { DeliveryOption } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

const resolveErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { error?: string } }).data;
    if (data && typeof data === "object" && "error" in data) {
      const message = (data as { error?: string }).error;
      if (typeof message === "string") return message;
    }
  }
  if (error instanceof Error) return error.message;
  return "Unable to complete request.";
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  processing: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  shipped: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  delivered: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
};

export function OrdersView() {
  const { push } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchOrdersQuery, { isFetching: ordersFetching }] = useLazyGetOrdersQuery();
  const [cancelOrderMutation] = useCancelOrderMutation();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const [busy, setBusy] = useState(false);

  const fetchOrders = useCallback(
    async (pageToLoad: number) => {
      try {
        const data = await fetchOrdersQuery({ page: pageToLoad, limit: 8 }, true).unwrap();
        setOrders(data.items);
        setTotalPages(Math.max(1, data.pages));
        setPage(data.page);
      } catch (error) {
        push({ title: "Load failed", description: resolveErrorMessage(error) });
        setOrders([]);
        setTotalPages(1);
        setPage(1);
      }
    },
    [fetchOrdersQuery, push],
  );

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      try { await fetchOrders(targetPage); }
      finally { setLoading(false); }
    },
    [fetchOrders],
  );

  useEffect(() => {
    if (!user) { setLoading(false); setOrders([]); return; }
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [user, load]);

  const cancelOrder = async (orderId: string) => {
    setBusy(true);
    try {
      await cancelOrderMutation({ id: orderId }).unwrap();
      push({ title: "Order cancelled" });
      void load(page);
    } catch (error) {
      push({ title: "Cancel failed", description: resolveErrorMessage(error) });
    } finally { setBusy(false); }
  };

  const updateDelivery = async (orderId: string, option: DeliveryOption) => {
    setBusy(true);
    try {
      await updateOrderMutation({ id: orderId, body: { deliveryOption: option } }).unwrap();
      push({ title: "Delivery updated" });
      void load(page);
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    } finally { setBusy(false); }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    setLoading(true);
    void fetchOrders(nextPage).finally(() => setLoading(false));
  };

  // ── Not logged in ──
  if (!user && !authLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">My Orders</h2>
          <p className="text-sm text-gray-500 font-medium">Track and manage your purchases.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900 font-english mb-2">Sign in to view your orders</h3>
          <p className="text-sm text-gray-500 mb-6">Track deliveries and view your purchase history after logging in.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-english">
              Login
            </Link>
            <Link href="/register" className="border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all font-english">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">My Orders</h2>
          <p className="text-sm text-gray-500 font-medium">Track and manage your purchases.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex items-center justify-center text-gray-400 text-sm font-medium shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
            Loading your orders...
          </div>
        </div>
      </div>
    );
  }

  // ── Empty ──
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">My Orders</h2>
          <p className="text-sm text-gray-500 font-medium">Track and manage your purchases.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <EmptyState title="No orders yet" description="Place an order to see it in your history." />
        </div>
      </div>
    );
  }

  // ── Orders List ──
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">My Orders</h2>
          <p className="text-sm text-gray-500 font-medium">
            {orders.length} orders · Page {page} of {totalPages}
          </p>
        </div>
        {(ordersFetching || busy) && (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold font-english">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Updating...
          </div>
        )}
      </div>

      {/* Orders Table — Mobile: cards, Desktop: table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Order", "Status", "Total", "Delivery", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-5 py-4 first:pl-6 last:pr-6 font-english whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const sc = statusConfig[order.status] ?? statusConfig.pending;
                const isExpanded = expandedId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 pl-6 py-4 font-black text-gray-900 font-english tracking-wider text-sm">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-english ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-900 font-english whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer font-english disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={order.status !== "pending" || busy}
                          defaultValue={order.deliveryOption ?? "standard"}
                          onChange={(event) => updateDelivery(order.id, event.target.value as DeliveryOption)}
                        >
                          <option value="standard">Standard</option>
                          <option value="express">Express</option>
                        </select>
                      </td>
                      <td className="px-5 pr-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId((v) => (v === order.id ? null : order.id))}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-english"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                          {order.status === "pending" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => cancelOrder(order.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-english"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="bg-gray-50/70">
                        <td colSpan={5} className="px-6 py-5">
                          <div className="grid md:grid-cols-2 gap-5">
                            {/* Shipping */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_6px_rgb(0,0,0,0.02)]">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-3">Delivery Address</p>
                              <p className="font-bold text-gray-900 font-english">{order.shippingName}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{order.shippingPhone}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{order.shippingAddress}</p>
                            </div>
                            {/* Items */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_6px_rgb(0,0,0,0.02)]">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-3">Items ({order.items.length})</p>
                              <div className="flex flex-col gap-3">
                                {order.items.map((item) => (
                                  <div key={item.product.id} className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                      {item.product.images?.[0] ? (
                                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" unoptimized />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">□</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-900 truncate font-english">{item.product.name}</p>
                                      <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 font-english whitespace-nowrap">{formatCurrency(item.quantity * item.unitPrice)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: card list */}
        <div className="md:hidden divide-y divide-gray-50">
          {orders.map((order) => {
            const sc = statusConfig[order.status] ?? statusConfig.pending;
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-black text-gray-900 font-english tracking-wider">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm font-bold text-gray-900 font-english mt-0.5">{formatCurrency(order.total)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-english shrink-0 ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId((v) => (v === order.id ? null : order.id))}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-english"
                  >
                    {isExpanded ? "Hide" : "View Details"}
                  </button>
                  {order.status === "pending" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => cancelOrder(order.id)}
                      className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg disabled:opacity-50 font-english"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Delivery</p>
                      <p className="font-bold text-gray-900 text-sm">{order.shippingName}</p>
                      <p className="text-xs text-gray-500">{order.shippingPhone}</p>
                      <p className="text-xs text-gray-500">{order.shippingAddress}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white">
                            {item.product.images?.[0] && <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" unoptimized />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Footer — always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] px-5 py-3">
        <span className="text-xs font-semibold text-gray-500 font-english">
          Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong> &nbsp;·&nbsp; {orders.length} orders
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading || busy}
            onClick={() => handlePageChange(page - 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-english"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading || busy}
            onClick={() => handlePageChange(page + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-english"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
