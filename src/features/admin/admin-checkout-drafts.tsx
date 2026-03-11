import type { CheckoutIntentSummary } from "@/types/checkout-intent";
import { EmptyState } from "@/components/ui/empty-state";
import { handleCheckoutDraftsParams } from "@/utils/params";
import { paginateCheckoutIntents } from "@/services/checkout-intent.service";

type SearchParams = { [key: string]: string | string[] | undefined };

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export async function AdminCheckoutDrafts({ searchParams }: PageProps) {
  const { page, limit } = await handleCheckoutDraftsParams(searchParams);

  const { total: totalItems, items: intents, pages: totalPages } = await paginateCheckoutIntents({
    page: page + 1, // Service expects 1-based page
    limit,
  });

  const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 font-english mb-1">Checkout Drafts & Abandoned Carts</h2>
        <p className="text-sm text-gray-500 font-medium">
          Review sessions where customers started the checkout process but did not complete their order.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
        {intents.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No abandoned checkouts"
              description="Drafts will appear here when customers leave checkout forms incomplete."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {intents.map((intent: CheckoutIntentSummary) => (
              <div key={intent.id} className="p-6 hover:bg-gray-50/50 transition-colors">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        <path d="m14 8 3-3 3 3" /><path d="M17 5v8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg font-english">{intent.shippingName}</p>
                      <p className="text-xs font-semibold text-gray-400 font-english truncate max-w-[200px] sm:max-w-xs">{intent.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 self-start md:self-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-english">
                      {timestampFormatter.format(new Date(intent.updatedAt))}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-1">Contact Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{intent.shippingPhone}</p>
                  </div>
                  {intent.promoEmail && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-1">Promo Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{intent.promoEmail}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2 md:col-span-1 border-t border-gray-100 sm:border-t-0 pt-3 sm:pt-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english mb-1">Shipping Target</p>
                    <p className="text-sm font-medium text-gray-600 line-clamp-2">{intent.shippingAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 font-english mt-2">
          <span>Page {page + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <a
              href={page > 0 ? `/admin/checkout-drafts?page=${page}` : '#'}
              className={`rounded-full border border-gray-200 px-4 py-2 font-bold uppercase tracking-[0.1em] transition ${page <= 0 ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}
            >
              Previous
            </a>
            <a
              href={page + 1 < totalPages ? `/admin/checkout-drafts?page=${page + 2}` : '#'}
              className={`rounded-full border border-gray-200 px-4 py-2 font-bold uppercase tracking-[0.1em] transition ${page + 1 >= totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}
            >
              Next
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
