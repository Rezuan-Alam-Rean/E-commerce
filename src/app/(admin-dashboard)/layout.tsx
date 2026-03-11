import { DashboardShell } from "@/components/layout/dashboard-shell";

const adminItems = [
  { label: "Overview", href: "/admin" },
  { label: "Add Product", href: "/admin/products/new" },
  { label: "Manage Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Manage Orders", href: "/admin/orders" },
  { label: "Checkout Drafts", href: "/admin/checkout-drafts" },
  { label: "Analytics", href: "/admin/analytics" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Admin Console" items={adminItems} requiredRole="admin">
      {children}
    </DashboardShell>
  );
}
