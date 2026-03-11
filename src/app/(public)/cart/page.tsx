import { CartView } from "@/features/cart/cart-view";

export default function CartPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex flex-col gap-2 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english">Shopping Cart</p>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">আপনার কার্ট</h1>
        <p className="text-sm text-gray-500 font-medium">পছন্দের পণ্যগুলো চেকআউট করার জন্য তৈরি করুন।</p>
      </div>

      <CartView />
    </section>
  );
}
