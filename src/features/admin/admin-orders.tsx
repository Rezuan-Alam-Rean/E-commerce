"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrderSummary } from "@/types/order";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 8;

export function AdminOrders() {
  const { push } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.success ? data.data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      push({ title: "Update failed", description: "Try again." });
      return;
    }

    push({ title: "Order updated" });
    load();
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders will appear once customers check out."
        />
      ) : (
        <Table headers={["Order", "Status", "Total", "Delivery", "Actions"]}>
          {paged.map((order) => (
            <Fragment key={order.id}>
              <TableRow>
                <TableCell>#{order.id.slice(-6).toUpperCase()}</TableCell>
                <TableCell className="uppercase text-muted">{order.status}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell className="uppercase text-muted">
                  {order.deliveryOption}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-xs"
                      onClick={() =>
                        setExpandedId((value) => (value === order.id ? null : order.id))
                      }
                    >
                      View
                    </button>
                    <select
                      className="rounded-full border border-border bg-surface-strong px-3 py-2 text-xs"
                      defaultValue={order.status}
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
                                {item.quantity} × ${item.unitPrice.toFixed(2)}
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
      )}
      {orders.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-border px-3 py-1"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-full border border-border px-3 py-1"
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
