import { ProductListing } from "@/features/products/product-listing";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  return <ProductListing searchParams={resolvedParams} />;
}
