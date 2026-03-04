import { getAuthPayload } from "@/lib/auth";
import { getAnalyticsSummary } from "@/services/analytics.service";
import { listOrders } from "@/services/order.service";
import { EmptyState } from "@/components/ui/empty-state";

export async function AdminDashboard() {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return null;
  }

  const analytics = await getAnalyticsSummary();
  const orders = await listOrders(auth.userId, auth.role);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Total Sales</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            ${analytics.totalSales.toFixed(2)}
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
                  {order.items.length} items · ${order.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
