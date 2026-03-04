import { AdminProducts } from "@/features/admin/admin-products";

export const dynamic = "force-dynamic";

export default function AdminAddProductPage() {
  return <AdminProducts mode="create" />;
}
