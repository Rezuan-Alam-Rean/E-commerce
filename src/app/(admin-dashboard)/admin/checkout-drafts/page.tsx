import { AdminCheckoutDrafts } from "@/features/admin/admin-checkout-drafts";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminCheckoutDraftsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <AdminCheckoutDrafts searchParams={searchParams} />;
}
