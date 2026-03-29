import { ProductDetail } from "@/features/products/product-detail";

export const revalidate = 60;

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
