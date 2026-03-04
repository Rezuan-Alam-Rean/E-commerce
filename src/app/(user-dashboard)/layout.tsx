import { DashboardShell } from "@/components/layout/dashboard-shell";

const userItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Orders", href: "/dashboard/orders" },
  { label: "Wishlist", href: "/dashboard/wishlist" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Customer Dashboard" items={userItems} requiredRole="user">
      {children}
    </DashboardShell>
  );
}
