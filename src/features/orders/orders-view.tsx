"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import type { OrderSummary } from "@/types/order";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import { PaginationButtons } from "@/components/ui/pagination-buttons";

export function OrdersView() {
  const { push } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(
    async (pageToLoad: number) => {
      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: "8",
      });
      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!data.success) {
        push({ title: "Load failed", description: data.error ?? "Unable to fetch orders." });
        setOrders([]);
        setTotalPages(1);
        setPage(1);
        return;
      }
      setOrders(data.data.items);
      setTotalPages(Math.max(1, data.data.pages));
      setPage(data.data.page);
    },
    [push],
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
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const cancelOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (!res.ok) {
      push({ title: "Cancel failed", description: "Try again." });
      return;
    }
    push({ title: "Order cancelled" });
    load(page);
  };

  const updateDelivery = async (orderId: string, option: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryOption: option }),
    });

    if (!res.ok) {
      push({ title: "Update failed", description: "Try again." });
      return;
    }

    push({ title: "Delivery updated" });
    load(page);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }
    setLoading(true);
    void fetchOrders(nextPage).finally(() => setLoading(false));
  };

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
                defaultValue={order.deliveryOption}
                onChange={(event) => updateDelivery(order.id, event.target.value)}
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
