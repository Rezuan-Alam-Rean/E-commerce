import { getAuthPayload } from "@/lib/auth";
import { getAnalyticsSummary } from "@/services/analytics.service";
import { formatCurrency } from "@/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const auth = await getAuthPayload();
  if (!auth || auth.role !== "admin") {
    return null;
  }

  const analytics = await getAnalyticsSummary();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-[var(--radius-lg)] bg-surface-strong p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Total Sales</p>
        <p className="mt-3 text-2xl font-semibold text-foreground">
          {formatCurrency(analytics.totalSales)}
        </p>
      </div>
      <div className="rounded-[var(--radius-lg)] bg-surface-strong p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Orders</p>
        <p className="mt-3 text-2xl font-semibold text-foreground">
          {analytics.totalOrders}
        </p>
      </div>
      <div className="rounded-[var(--radius-lg)] bg-surface-strong p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Products</p>
        <p className="mt-3 text-2xl font-semibold text-foreground">
          {analytics.totalProducts}
        </p>
      </div>
    </div>
  );
}
