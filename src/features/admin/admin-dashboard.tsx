import Link from "next/link";
import { getAuthPayload } from "@/lib/auth";
import { getAnalyticsSummary } from "@/services/analytics.service";
import { listOrders } from "@/services/order.service";
import { listCheckoutIntents } from "@/services/checkout-intent.service";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";

export async function AdminDashboard() {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return null;
  }

  const analytics = await getAnalyticsSummary();
  const orders = await listOrders(auth.userId, auth.role);
  const checkoutIntents = await listCheckoutIntents(8);
  const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Total Sales</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {formatCurrency(analytics.totalSales)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Orders</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {analytics.totalOrders}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Products</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {analytics.totalProducts}
          </p>
        </div>
      </div>
      <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-foreground">Latest Orders</h2>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Orders will appear once customers check out."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="rounded-[var(--radius-md)] border border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {order.items.length} items · {formatCurrency(order.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Checkout Drafts</h2>
            <p className="mt-1 text-sm text-muted">
              Customers who started checkout but never confirmed the order.
            </p>
          </div>
          <Link href="/admin/checkout-drafts" className="text-sm font-semibold text-accent">
            View all
          </Link>
        </div>
        {checkoutIntents.length === 0 ? (
          <EmptyState
            title="No pending drafts"
            description="Drafts appear once someone fills the checkout form without placing the order."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {checkoutIntents.map((intent) => (
              <div key={intent.id} className="rounded-[var(--radius-md)] border border-border p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
                  <span>{intent.shippingName}</span>
                  <span className="text-xs font-normal uppercase tracking-[0.2em] text-muted">
                    {timestampFormatter.format(new Date(intent.updatedAt))}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted">
                  <p>{intent.shippingPhone}</p>
                  <p className="mt-1">{intent.shippingAddress}</p>
                  {intent.promoEmail ? <p className="mt-1">{intent.promoEmail}</p> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
