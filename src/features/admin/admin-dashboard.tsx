import Link from "next/link";
import { getAuthPayload } from "@/lib/auth";
import { getAnalyticsSummary } from "@/services/analytics.service";
import { listOrders } from "@/services/order.service";
import { listCheckoutIntents } from "@/services/checkout-intent.service";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";

// Icons for overview cards
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
)

const BagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
)

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

      {/* Overview Stats Section */}
      <section>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Sales */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] transition-all group">
            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ChartIcon />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50/50 rounded-2xl">
                <ChartIcon />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Total Sales</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-english tracking-tight">
              {formatCurrency(analytics.totalSales)}
            </p>
          </div>

          {/* Total Orders */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] transition-all group">
            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BagIcon />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50/50 rounded-2xl">
                <BagIcon />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Total Orders</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-english tracking-tight">
              {analytics.totalOrders}
            </p>
          </div>

          {/* Products */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] transition-all group xs:col-span-2 lg:col-span-1">
            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BoxIcon />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50/50 rounded-2xl">
                <BoxIcon />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Active Products</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-english tracking-tight">
              {analytics.totalProducts}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Latest Orders */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 font-english">Latest Orders</h2>
            {orders.length > 6 && (
              <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-800 font-english">
                View all orders
              </Link>
            )}
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No orders yet"
                  description="Orders will appear once customers check out."
                />
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between group cursor-default text-english">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-bold text-gray-900">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 tracking-tight">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout Drafts */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 font-english">Checkout Drafts</h2>
            <Link href="/admin/checkout-drafts" className="text-xs font-semibold text-blue-600 hover:text-blue-800 font-english">
              View all drafts
            </Link>
          </div>
          <p className="text-sm text-gray-500 -mt-2">Customers who started checkout but didn't finish.</p>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
            {checkoutIntents.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No pending drafts"
                  description="Drafts appear here when checkout forms are filled out."
                />
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {checkoutIntents.map((intent) => (
                  <div key={intent.id} className="p-5 hover:bg-gray-50/50 transition-colors cursor-default text-english">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 truncate pr-4">
                        {intent.shippingName}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-md">
                        {timestampFormatter.format(new Date(intent.updatedAt))}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        {intent.shippingPhone}
                      </p>
                      {intent.promoEmail && (
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                          <span className="truncate">{intent.promoEmail}</span>
                        </p>
                      )}
                      <p className="flex items-start gap-2 pt-1 border-t border-gray-100 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span className="line-clamp-2">{intent.shippingAddress}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
