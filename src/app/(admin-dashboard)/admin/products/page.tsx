import { AdminProducts } from "@/features/admin/admin-products";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return <AdminProducts mode="manage" />;
}
