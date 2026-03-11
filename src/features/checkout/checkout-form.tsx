"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/features/cart/cart.store";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateOrderMutation,
  useGetProductQuery,
  useSaveCheckoutIntentMutation,
  type CheckoutPayload,
} from "@/lib/store/api";
import type { DeliveryOption } from "@/lib/constants";
import { formatCurrency } from "@/utils/format";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

type CheckoutFormProps = {
  buyNowItem?: {
    productId: string;
    quantity: number;
  };
};

type SummaryItem = {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
};

export function CheckoutForm({ buyNowItem }: CheckoutFormProps) {
  const router = useRouter();
  const { cart, load } = useCartStore();
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [saveCheckoutIntent] = useSaveCheckoutIntentMutation();
  const { push } = useToast();
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
  });
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("standard");
  const [promoEmail, setPromoEmail] = useState("");

  const isDirectPurchase = Boolean(buyNowItem);
  const directQuantity = buyNowItem ? Math.max(1, Math.floor(buyNowItem.quantity || 1)) : 0;
  const shouldFetchDirectProduct = Boolean(buyNowItem?.productId);
  const { data: directProduct, isFetching: fetchingDirectProduct } = useGetProductQuery(
    { id: buyNowItem?.productId ?? "" },
    { skip: !shouldFetchDirectProduct }
  );

  const shippingOptions: { value: DeliveryOption; label: string; fee: number }[] = [
    { value: "standard", label: "ঢাকা সিটির ভিতরে", fee: 60 },
    { value: "express", label: "ঢাকার বাইরে", fee: 100 },
  ];
  const currency = "BDT";
  const checkoutTrackedRef = useRef(false);
  const checkoutDraftSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isDirectPurchase) {
      load();
    }
  }, [isDirectPurchase, load]);

  useEffect(() => {
    const shippingName = form.shippingName.trim();
    const shippingPhone = form.shippingPhone.trim();
    const shippingAddress = form.shippingAddress.trim();
    const email = promoEmail.trim();

    const ready =
      shippingName.length >= 2 && shippingPhone.length >= 7 && shippingAddress.length >= 6;
    if (!ready) {
      return;
    }

    const payload = {
      shippingName,
      shippingPhone,
      shippingAddress,
      promoEmail: email.length ? email : undefined,
    };
    const signature = JSON.stringify(payload);
    if (signature === checkoutDraftSignatureRef.current) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      saveCheckoutIntent(payload)
        .unwrap()
        .then(() => {
          if (!cancelled) {
            checkoutDraftSignatureRef.current = signature;
          }
        })
        .catch((error) => {
          console.error("Failed to store checkout draft", error);
        });
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.shippingName, form.shippingPhone, form.shippingAddress, promoEmail, saveCheckoutIntent]);

  const summaryItems: SummaryItem[] = useMemo(() => {
    if (isDirectPurchase) {
      if (!directProduct) {
        return [];
      }
      return [
        {
          id: directProduct.id,
          name: directProduct.name,
          image: directProduct.images?.[0],
          quantity: directQuantity,
          unitPrice: directProduct.price,
        },
      ];
    }
    return (
      cart?.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.images?.[0],
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) ?? []
    );
  }, [cart?.items, directProduct, directQuantity, isDirectPurchase]);

  const updateField = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.shippingName.trim().length < 2) {
      push({ title: "Name required", description: "Please enter at least two characters." });
      return;
    }
    if (form.shippingPhone.trim().length < 7) {
      push({ title: "Phone number required", description: "Provide an active mobile number." });
      return;
    }
    if (form.shippingAddress.trim().length < 6) {
      push({ title: "Address required", description: "Share the complete delivery address." });
      return;
    }
    if (isDirectPurchase) {
      if (!directProduct) {
        push({ title: "Selected product unavailable", description: "Please choose another item." });
        return;
      }
      if (directProduct.stock <= 0) {
        push({ title: "Out of stock", description: `${directProduct.name} is currently unavailable.` });
        return;
      }
    } else if (summaryItems.length === 0) {
      push({ title: "Cart empty", description: "Add items before checking out." });
      return;
    }
    try {
      const payload: CheckoutPayload = {
        ...form,
        deliveryOption,
      };
      if (isDirectPurchase && buyNowItem) {
        payload.items = [
          {
            productId: buyNowItem.productId,
            quantity: directQuantity || 1,
          },
        ];
      }
      const order = await createOrder(payload).unwrap();
      const normalizedEmail = promoEmail.trim();
      const normalizedPhone = form.shippingPhone.trim();
      const purchaseDeliveryCategory = toMetaDeliveryCategory(order.deliveryOption);
      trackMetaEvent(
        "Purchase",
        {
          currency,
          value: order.total,
          order_id: order.id,
          num_items: order.items.length,
          contents: order.items.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
            item_price: item.unitPrice,
          })),
          content_type: "product",
          delivery_category: purchaseDeliveryCategory,
        },
        {
          userData: {
            em: normalizedEmail ? [normalizedEmail] : undefined,
            ph: normalizedPhone ? [normalizedPhone] : undefined,
          },
        },
      );
      push({ title: "Order confirmed", description: "Cash on delivery is scheduled." });
      router.push("/dashboard");
    } catch (error) {
      const message =
        typeof error === "object" && error && "data" in error
          ? ((error as { data?: { error?: string } }).data?.error ?? "Please try again.")
          : error instanceof Error
            ? error.message
            : "Please try again.";
      push({ title: "Checkout failed", description: message || "Please try again shortly." });
    }
  };

  const subtotal = summaryItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const shippingCost = summaryItems.length
    ? shippingOptions.find((option) => option.value === deliveryOption)?.fee ?? 60
    : 0;
  const grandTotal = summaryItems.length ? subtotal + shippingCost : 0;
  const summaryContents = useMemo(
    () =>
      summaryItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.unitPrice,
      })),
    [summaryItems],
  );
  const summarySignature = summaryContents.map((item) => `${item.id}:${item.quantity}`).join("|");
  const disableSubmit = placingOrder || summaryItems.length === 0 || (isDirectPurchase && (!directProduct || fetchingDirectProduct));
  const metaDeliveryCategory = toMetaDeliveryCategory(deliveryOption);

  useEffect(() => {
    if (!summaryContents.length) {
      checkoutTrackedRef.current = false;
      return;
    }
    if (checkoutTrackedRef.current) {
      return;
    }
    trackMetaEvent("InitiateCheckout", {
      currency,
      value: subtotal,
      num_items: summaryItems.length,
      contents: summaryContents,
      content_type: "product",
      delivery_category: metaDeliveryCategory,
    });
    checkoutTrackedRef.current = true;
  }, [currency, metaDeliveryCategory, subtotal, summaryContents.length, summarySignature, summaryItems.length]);

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            বিলিং তথ্য
          </p>
          <div className="mt-4 grid gap-4">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              আপনার নাম লিখুন
              <Input
                placeholder="উদাহরণ: রাফি হাসান"
                value={form.shippingName}
                onChange={updateField("shippingName")}
                required
                aria-required="true"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              সম্পূর্ণ ঠিকানা লিখুন
              <Input
                placeholder="বাড়ি, রোড, এলাকা"
                value={form.shippingAddress}
                onChange={updateField("shippingAddress")}
                required
                aria-required="true"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              মোবাইল নাম্বার লিখুন
              <Input
                placeholder="01XXXXXXXXX"
                value={form.shippingPhone}
                onChange={updateField("shippingPhone")}
                required
                aria-required="true"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              অফার আপডেট পেতে ইমেইল দিন (ঐচ্ছিক)
              <Input
                placeholder="name@example.com"
                value={promoEmail}
                onChange={(event) => setPromoEmail(event.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-white p-6 shadow-[var(--shadow)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            অর্ডার সারাংশ
          </p>
          {summaryItems.length > 0 ? (
            <div className="mt-4 space-y-3">
              {summaryItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-[var(--radius-sm)] bg-surface-strong">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {isDirectPurchase
                ? fetchingDirectProduct
                  ? "Selected product details are loading..."
                  : "Selected product is unavailable."
                : "কার্টে কোন পণ্য নেই।"}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">শিপমেন্ট</p>
          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <input
                  type="radio"
                  name="delivery"
                  value={option.value}
                  checked={deliveryOption === option.value}
                  onChange={() => setDeliveryOption(option.value)}
                />
                <span>
                  {option.label}: {formatCurrency(option.fee)}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">সাবটোটাল</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">ডেলিভারি চার্জ</span>
            <span className="font-semibold text-foreground">{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
            <span>মোট</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-3 text-sm text-muted">
          ক্যাশ অন ডেলিভারি · পণ্য হাতে পেয়েই টাকা পরিশোধ করুন।
        </div>
        <Button
          type="submit"
          disabled={disableSubmit}
          className="font-english"
        >
          {placingOrder ? "Processing Order..." : "Place Order"}
        </Button>
      </div>
    </form>
  );
}

function toMetaDeliveryCategory(option?: DeliveryOption) {
  if (!option) {
    return undefined;
  }
  return "home_delivery";
}
