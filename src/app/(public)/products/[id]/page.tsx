import { ProductDetail } from "@/features/products/product-detail";
import { AuthGate } from "@/components/ui/auth-gate";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGate>
      <ProductDetail id={id} />
    </AuthGate>
  );
}
