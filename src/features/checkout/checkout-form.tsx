"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  const shippingOptions: { value: DeliveryOption; label: string; fee: number; description: string }[] = [
    { value: "standard", label: "ঢাকা সিটি", fee: 60, description: "১-২ কার্যদিবস" },
    { value: "express", label: "ঢাকার বাইরে", fee: 100, description: "৩-৫ কার্যদিবস" },
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
    <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-5 items-start">
      {/* Billing Info Section */}
      <div className="lg:col-span-3 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black font-english">1</div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest font-english">ডেলিভারি তথ্য</h2>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english ml-1">
                আপনার নাম
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="রাফি হাসান"
                  value={form.shippingName}
                  onChange={updateField("shippingName")}
                  required
                  className="w-full rounded-2xl border border-gray-100 bg-white pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english ml-1">
                  মোবাইল নাম্বার
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.shippingPhone}
                    onChange={updateField("shippingPhone")}
                    required
                    className="w-full rounded-2xl border border-gray-100 bg-white pl-12 pr-4 py-4 text-sm font-medium font-english focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english ml-1">
                  ইমেইল (ঐচ্ছিক)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={promoEmail}
                    onChange={(event) => setPromoEmail(event.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-white pl-12 pr-4 py-4 text-sm font-medium font-english focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english ml-1">
                সম্পূর্ণ ঠিকানা
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-4 text-gray-400 group-focus-within:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="বাড়ি নং, রোড নং, এলাকা এবং শহর"
                  value={form.shippingAddress}
                  onChange={updateField("shippingAddress")}
                  required
                  className="w-full rounded-2xl border border-gray-100 bg-white pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black font-english">2</div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest font-english">ডেলিভারি পদ্ধতি</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {shippingOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center p-5 rounded-[28px] border-2 cursor-pointer transition-all ${deliveryOption === option.value
                    ? "border-emerald-500 bg-emerald-50/10 shadow-[0_4px_16px_rgb(16,185,129,0.08)]"
                    : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option.value}
                  checked={deliveryOption === option.value}
                  onChange={() => setDeliveryOption(option.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-black ${deliveryOption === option.value ? "text-gray-900" : "text-gray-700"}`}>
                      {option.label}
                    </span>
                    <span className="text-sm font-black text-gray-900 font-english">
                      {formatCurrency(option.fee)}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-english">
                    {option.description}
                  </p>
                </div>
                {deliveryOption === option.value && (
                  <div className="ml-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-2 lg:sticky lg:top-28">
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_2px_24px_rgb(0,0,0,0.02)] p-8 flex flex-col gap-8">
          <div>
            <h3 className="text-lg font-black text-gray-900 font-english mb-1">Order Summary</h3>
            <p className="text-xs text-gray-500 font-medium">Review items before placing order.</p>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {summaryItems.length > 0 ? (
              summaryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-50 border border-gray-50 group-hover:scale-105 transition-transform duration-300">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                    <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-bl-xl font-english">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-gray-900 truncate leading-tight mb-1">{item.name}</h4>
                    <span className="text-xs font-black text-gray-500 font-english">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-900 font-english">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 font-medium py-4 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                {isDirectPurchase ? "Searching product..." : "Cart is empty."}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-8 border-t border-gray-50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium tracking-tight">সাবটোটাল</span>
              <span className="text-gray-900 font-black font-english">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium tracking-tight">ডেলিভারি চার্জ</span>
              <span className="text-gray-900 font-black font-english">{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-gray-50">
              <span className="text-base font-black text-gray-900">মোট</span>
              <span className="text-2xl font-black text-gray-900 font-english tracking-tight">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-3xl p-4 flex gap-3 border border-emerald-100/50">
              <div className="mt-0.5 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
              </div>
              <p className="text-[10px] text-emerald-700/80 font-bold leading-relaxed">
                পণ্য হাতে পেয়ে টাকা পরিশোধ করুন। কোনো অগ্রিম ফি লাগবে না।
              </p>
            </div>

            <button
              type="submit"
              disabled={disableSubmit}
              className="w-full bg-black hover:bg-emerald-500 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-emerald-500/20 disabled:bg-gray-200 disabled:shadow-none font-english"
            >
              {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
            </button>

            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest font-english">
              Secure Checkout · 100% Privacy Guaranteed
            </p>
          </div>
        </div>
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
