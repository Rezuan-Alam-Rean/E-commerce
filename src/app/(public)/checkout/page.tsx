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
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex flex-col gap-3 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english">Secure Checkout</p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">ডেলিভারির তথ্য নিশ্চিত করুন</h1>
        <p className="text-sm text-gray-500 font-medium">
          পরিশোধের মাধ্যম: ক্যাশ অন ডেলিভারি। নিচের তথ্যগুলো পূরণ করে আপনার অর্ডারটি সম্পন্ন করুন।
        </p>
      </div>

      <CheckoutForm buyNowItem={buyNowItem} />
    </section>
  );
}
