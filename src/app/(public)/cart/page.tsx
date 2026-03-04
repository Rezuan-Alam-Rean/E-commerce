import { CartView } from "@/features/cart/cart-view";

export default function CartPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-foreground">Your Cart</h1>
      <div className="mt-6">
        <CartView />
      </div>
    </section>
  );
}
