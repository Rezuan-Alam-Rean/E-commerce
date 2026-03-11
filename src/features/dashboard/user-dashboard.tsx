import Link from "next/link";
import { getAuthPayload } from "@/lib/auth";
import { listOrders } from "@/services/order.service";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";

// Icons for overview cards
const BagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)


export async function UserDashboard() {
  const auth = await getAuthPayload();
  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
          <LogOutIcon className="text-gray-400 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">সারাংশ দেখতে সাইন ইন করুন</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            আপনার অর্ডারের অগ্রগতি, ব্যয় এবং সাম্প্রতিক আপডেট শুধুমাত্র লগইন করা গ্রাহকদের জন্য উপলব্ধ।
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/login"
            className="rounded-full bg-[#0d111f] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition-colors shadow-lg hover:shadow-black/20 font-english"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-gray-300 bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-colors font-english"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const orders = await listOrders(auth.userId, auth.role);
  const totalSpend = orders.reduce((sum, order) => sum + order.total, 0);
  const latestOrder = orders[0];

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_1fr]">
      {/* Overview Stats Section */}
      <div className="flex flex-col gap-6 sm:gap-8">
        <h2 className="text-lg font-black text-gray-900 font-english flex items-center justify-between">
          <span>Overview Summary</span>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Lifetime Balance</span>
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">

          {/* Total Orders Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 p-6 sm:p-7 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all group">
            <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <BagIcon />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50/50 rounded-2xl">
                <BagIcon />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Orders Placed</p>
            </div>
            <p className="text-4xl font-black text-gray-900 font-english leading-none">{orders.length}</p>
          </div>

          {/* Total Spend Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 p-6 sm:p-7 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all group">
            <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarIcon />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50/50 rounded-2xl">
                <DollarIcon />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Total Purchase</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-english tracking-tight leading-none">
              {formatCurrency(totalSpend)}
            </p>
          </div>

          {/* Last Order Card */}
          <div className="rounded-[2.5rem] bg-white border border-gray-100 p-6 sm:p-7 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50/50 rounded-xl">
                  <ClockIcon />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Recent Activity</p>
              </div>
              <div className="mt-auto">
                <p className="text-lg font-black text-gray-900 font-english truncate">
                  {latestOrder ? `#${latestOrder.id.slice(-6).toUpperCase()}` : "No Activity"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {latestOrder ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-english">{latestOrder.status}</span>
                    </>
                  ) : <span className="text-[10px] font-bold text-gray-400 font-english">Start shopping now.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Mode Card */}
          <div className="rounded-[2.5rem] bg-white border border-gray-100 p-6 sm:p-7 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-purple-50/50 rounded-xl">
                  <TruckIcon />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-english">Latest Delivery</p>
              </div>
              <div className="mt-auto">
                <p className="text-lg font-black text-gray-900 font-english capitalize">
                  {latestOrder ? latestOrder.deliveryOption : "Standard"}
                </p>
                <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-english">
                  Option preference
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Orders List Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 font-english">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-english"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No orders yet"
                description="Place your first order to see it here."
              />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between group cursor-default text-english">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-bold text-gray-900">
                        Order #{order.id.slice(-6).toUpperCase()}
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
    </div>
  );
}

// Ensure LogOutIcon is available globally for Empty State 
const LogOutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
