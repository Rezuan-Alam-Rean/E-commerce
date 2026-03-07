import { getAuthPayload } from "@/lib/auth";
import { listOrders } from "@/services/order.service";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";

export async function UserDashboard() {
  const auth = await getAuthPayload();
  if (!auth) {
    return null;
  }

  const orders = await listOrders(auth.userId, auth.role);
  const totalSpend = orders.reduce((sum, order) => sum + order.total, 0);
  const latestOrder = orders[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Total orders</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{orders.length}</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Total spend</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(totalSpend)}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Last order</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {latestOrder
                ? `#${latestOrder.id.slice(-6).toUpperCase()}`
                : "No orders"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {latestOrder ? latestOrder.status : "Start shopping to place your first order."}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Delivery mode</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {latestOrder ? latestOrder.deliveryOption : "-"}
            </p>
            <p className="mt-1 text-xs text-muted">Managed during checkout.</p>
          </div>
        </div>
      </div>
      <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Place your first order to see it here."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {orders.slice(0, 5).map((order) => (
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
    </div>
  );
}
