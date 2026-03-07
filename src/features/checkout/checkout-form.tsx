"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/features/cart/cart.store";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrderMutation } from "@/lib/store/api";
import { formatCurrency } from "@/utils/format";

export function CheckoutForm() {
  const router = useRouter();
  const { cart, load } = useCartStore();
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const { push } = useToast();
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
  });
  const [deliveryOption, setDeliveryOption] = useState("standard");

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.shippingName.trim().length < 2) {
      push({ title: "Name required", description: "Enter at least 2 characters." });
      return;
    }
    if (form.shippingPhone.trim().length < 7) {
      push({ title: "Phone required", description: "Enter a valid phone number." });
      return;
    }
    if (form.shippingAddress.trim().length < 6) {
      push({ title: "Address required", description: "Enter a full delivery address." });
      return;
    }
    if (!cart || cart.items.length === 0) {
      push({ title: "Cart empty", description: "Add items before checkout." });
      return;
    }
    try {
      await createOrder({ ...form, deliveryOption }).unwrap();
      push({ title: "Order placed", description: "Cash on delivery confirmed." });
      router.push("/dashboard");
    } catch (error) {
      const message =
        typeof error === "object" && error && "data" in error
          ? ((error as { data?: { error?: string } }).data?.error ?? "Please try again.")
          : error instanceof Error
            ? error.message
            : "Please try again.";
      push({ title: "Checkout failed", description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Delivery details
        </p>
        <div className="mt-4 grid gap-4">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Full name
            <Input
              placeholder="Full name"
              value={form.shippingName}
              onChange={updateField("shippingName")}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Phone
            <Input
              placeholder="Phone"
              value={form.shippingPhone}
              onChange={updateField("shippingPhone")}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Address
            <Input
              placeholder="Address"
              value={form.shippingAddress}
              onChange={updateField("shippingAddress")}
              required
            />
          </label>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Delivery speed
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border p-4 text-sm transition ${
              deliveryOption === "standard"
                ? "border-accent bg-accent/10"
                : "border-border bg-surface-strong"
            }`}
          >
            <input
              type="radio"
              name="delivery"
              value="standard"
              className="sr-only"
              checked={deliveryOption === "standard"}
              onChange={() => setDeliveryOption("standard")}
            />
            <span className="font-semibold text-foreground">Standard delivery</span>
            <span className="text-xs text-muted">3-5 business days</span>
          </label>
          <label
            className={`flex cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border p-4 text-sm transition ${
              deliveryOption === "express"
                ? "border-accent bg-accent/10"
                : "border-border bg-surface-strong"
            }`}
          >
            <input
              type="radio"
              name="delivery"
              value="express"
              className="sr-only"
              checked={deliveryOption === "express"}
              onChange={() => setDeliveryOption("express")}
            />
            <span className="font-semibold text-foreground">Express delivery</span>
            <span className="text-xs text-muted">1-2 business days</span>
          </label>
        </div>
      </div>
      <Button type="submit" disabled={!cart || cart.items.length === 0 || placingOrder}>
        {placingOrder ? "Placing order" : "Place order"}
      </Button>
      {cart ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Order summary
          </p>
          <div className="mt-4 grid gap-3">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-[var(--radius-sm)] bg-white">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <span className="text-foreground">{item.product.name}</span>
                </div>
                <span className="text-xs text-muted">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
