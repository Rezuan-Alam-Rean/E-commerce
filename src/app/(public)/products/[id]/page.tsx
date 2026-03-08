import { ProductDetail } from "@/features/products/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ProductDetail id={id} />
  );
}
