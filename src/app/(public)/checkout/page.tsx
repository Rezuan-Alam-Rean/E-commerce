import { CheckoutForm } from "@/features/checkout/checkout-form";
import { AuthGate } from "@/components/ui/auth-gate";

export default function CheckoutPage() {
  return (
    <AuthGate>
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Checkout</p>
          <h1 className="text-3xl font-semibold text-foreground">Complete your delivery</h1>
          <p className="text-sm text-muted">
            Payment method: Cash on Delivery only. Delivery preferences are saved with your order.
          </p>
        </div>
        <div className="mt-8 rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow)]">
          <CheckoutForm />
        </div>
      </section>
    </AuthGate>
  );
}
