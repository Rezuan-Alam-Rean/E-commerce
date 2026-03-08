"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import type { OrderSummary } from "@/types/order";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
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
      if (typeof message === "string") {
        return message;
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to complete request.";
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

  const fetchOrders = useCallback(
    async (pageToLoad: number) => {
      try {
        const data = await fetchOrdersQuery(
          { page: pageToLoad, limit: 8 },
          true,
        ).unwrap();
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
      try {
        await fetchOrders(targetPage);
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders],
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [user, load]);

  const cancelOrder = async (orderId: string) => {
    try {
      await cancelOrderMutation({ id: orderId }).unwrap();
      push({ title: "Order cancelled" });
      load(page);
    } catch (error) {
      push({ title: "Cancel failed", description: resolveErrorMessage(error) });
    }
  };

  const updateDelivery = async (orderId: string, option: DeliveryOption) => {
    try {
      await updateOrderMutation({ id: orderId, body: { deliveryOption: option } }).unwrap();
      push({ title: "Delivery updated" });
      load(page);
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }
    setLoading(true);
    void fetchOrders(nextPage).finally(() => setLoading(false));
  };

  if (!user && !authLoading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-strong p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Please login to view your orders</h2>
        <p className="mt-2 text-sm text-muted">
          Sign in or create an account to track your deliveries and view past purchases.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-foreground px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white font-english"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-border px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground font-english"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Place an order to see it in your history."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Table headers={["Order", "Status", "Total", "Delivery", "Actions"]}>
        {orders.map((order) => (
        <Fragment key={order.id}>
          <TableRow>
            <TableCell>#{order.id.slice(-6).toUpperCase()}</TableCell>
            <TableCell className="uppercase text-muted">{order.status}</TableCell>
            <TableCell>{formatCurrency(order.total)}</TableCell>
            <TableCell>
              <select
                className="rounded-full border border-border bg-surface-strong px-3 py-2 text-xs"
                disabled={order.status !== "pending"}
                defaultValue={order.deliveryOption ?? "standard"}
                onChange={(event) =>
                  updateDelivery(order.id, event.target.value as DeliveryOption)
                }
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
              </select>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setExpandedId((value) => (value === order.id ? null : order.id))
                  }
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  disabled={order.status !== "pending"}
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel
                </Button>
              </div>
            </TableCell>
          </TableRow>
          {expandedId === order.id ? (
            <tr className="bg-white">
              <td colSpan={5} className="px-4 pb-4">
                <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4 text-xs">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    Delivery address
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {order.shippingName}
                  </p>
                  <p className="text-xs text-muted">{order.shippingPhone}</p>
                  <p className="text-xs text-muted">{order.shippingAddress}</p>
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Items
                    </p>
                    <div className="mt-2 grid gap-2">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-[var(--radius-sm)] bg-white">
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
                            <span className="text-sm text-foreground">{item.product.name}</span>
                          </div>
                          <span className="text-xs text-muted">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ) : null}
        </Fragment>
        ))}
      </Table>
      <PaginationButtons
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={loading}
      />
    </div>
  );
}
