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

  // Calculate avg order value, rounded
  const avgOrderValue = analytics.totalOrders > 0
    ? analytics.totalSales / analytics.totalOrders
    : 0;

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(analytics.totalSales),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
          <line x1="12" x2="12" y1="1" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      iconBg: "bg-emerald-50",
      desc: "Cumulative revenue from all confirmed orders",
    },
    {
      label: "Total Orders",
      value: analytics.totalOrders.toLocaleString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      iconBg: "bg-amber-50",
      desc: "Number of orders placed across your store",
    },
    {
      label: "Products Listed",
      value: analytics.totalProducts.toLocaleString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
      ),
      iconBg: "bg-purple-50",
      desc: "Active products available in the catalog",
    },
    {
      label: "Registered Users",
      value: analytics.totalUsers.toLocaleString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconBg: "bg-blue-50",
      desc: "Customers who have created an account",
    },
    {
      label: "Avg. Order Value",
      value: formatCurrency(avgOrderValue),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600">
          <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      iconBg: "bg-rose-50",
      desc: "Revenue divided by total number of orders",
    },
    {
      label: "Catalog Coverage",
      value: analytics.totalProducts > 0 ? `${Math.round((analytics.totalOrders / Math.max(analytics.totalProducts, 1)) * 10) / 10}x` : "—",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
          <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
        </svg>
      ),
      iconBg: "bg-indigo-50",
      desc: "Average orders received per product listed",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 font-english mb-1">Store Analytics</h2>
        <p className="text-sm text-gray-500 font-medium">A real-time overview of your store&apos;s key performance metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_28px_rgb(0,0,0,0.07)] transition-all duration-300"
          >
            {/* Icon Row */}
            <div className="flex items-center justify-between mb-5">
              <div className={`p-3 rounded-2xl ${stat.iconBg} border border-white shadow-sm`}>
                {stat.icon}
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </div>
            </div>

            {/* Value */}
            <div className="mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 font-english mb-1.5">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 font-english tracking-tight">{stat.value}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 font-medium leading-relaxed border-t border-gray-50 pt-3 mt-3">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6">
        <h3 className="text-sm font-bold text-gray-900 font-english mb-6 border-b border-gray-50 pb-4">Quick Summary</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Revenue per User", value: analytics.totalUsers > 0 ? formatCurrency(analytics.totalSales / analytics.totalUsers) : "—" },
            { label: "Orders per User", value: analytics.totalUsers > 0 ? (analytics.totalOrders / analytics.totalUsers).toFixed(1) : "—" },
            { label: "Total Users", value: analytics.totalUsers.toLocaleString() },
            { label: "Total Revenue", value: formatCurrency(analytics.totalSales) },
          ].map((item) => (
            <div key={item.label} className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-1">{item.label}</p>
              <p className="text-xl font-black text-gray-900 font-english">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Note */}
      <div className="flex items-start gap-3 bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <div className="mt-0.5 p-1.5 rounded-full bg-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900 font-english">Live Data</p>
          <p className="text-xs text-blue-600 mt-0.5">All metrics on this page are fetched in real-time from the database and reflect the current state of your store.</p>
        </div>
      </div>
    </div>
  );
}
