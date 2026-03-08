import { CheckoutForm } from "@/features/checkout/checkout-form";

export const dynamic = "force-dynamic";

type CheckoutSearchParams = Record<string, string | string[] | undefined>;

type CheckoutPageProps = {
  searchParams?: Promise<CheckoutSearchParams>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params: CheckoutSearchParams = searchParams ? await searchParams : {};
  const productId = typeof params.productId === "string" ? params.productId : undefined;
  const quantityParam = typeof params.quantity === "string" ? Number(params.quantity) : undefined;
  const quantity = Number.isFinite(quantityParam) ? Math.max(1, Math.floor(quantityParam!)) : 1;
  const buyNowItem = productId ? { productId, quantity } : undefined;

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">চেকআউট</p>
        <h1 className="text-3xl font-semibold text-foreground">ডেলিভারির তথ্য নিশ্চিত করুন</h1>
        <p className="text-sm text-muted">
          পরিশোধের মাধ্যম: ক্যাশ অন ডেলিভারি। ভেতরের ফর্ম পূরণ করলে আপনার অর্ডার তৈরি হয়ে যাবে।
        </p>
      </div>
      <div className="mt-8 rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
        <CheckoutForm buyNowItem={buyNowItem} />
      </div>
    </section>
  );
}
