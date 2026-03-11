import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { CheckoutIntentModel, type CheckoutIntentDocument } from "@/models/checkout-intent";
import type { SessionOwner } from "@/types/session";
import type { CheckoutIntentSummary } from "@/types/checkout-intent";

const ownerFilter = (owner: SessionOwner) =>
  owner.kind === "user" ? { user: owner.userId } : { guestToken: owner.guestToken };

type CheckoutIntentLean = CheckoutIntentDocument & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

const toSummary = (intent: CheckoutIntentLean): CheckoutIntentSummary => ({
  id: intent._id.toString(),
  shippingName: intent.shippingName,
  shippingPhone: intent.shippingPhone,
  shippingAddress: intent.shippingAddress,
  promoEmail: intent.promoEmail ? intent.promoEmail : undefined,
  createdAt: intent.createdAt.toISOString(),
  updatedAt: intent.updatedAt.toISOString(),
});

export async function saveCheckoutIntent(
  owner: SessionOwner,
  input: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    promoEmail?: string;
  }
) {
  await connectDb();

  const ownerFields = ownerFilter(owner);
  const normalizedInput = {
    shippingName: input.shippingName.trim(),
    shippingPhone: input.shippingPhone.trim(),
    shippingAddress: input.shippingAddress.trim(),
    promoEmail: input.promoEmail?.trim() ?? "",
  };

  const signatureFilter = {
    ...ownerFields,
    ...normalizedInput,
  };

  const updatedIntent = await CheckoutIntentModel.findOneAndUpdate(
    signatureFilter,
    { ...signatureFilter, status: "pending" as const },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<CheckoutIntentLean | null>();

  if (!updatedIntent) {
    throw new Error("Unable to store checkout draft");
  }

  return toSummary(updatedIntent);
}

export async function clearCheckoutIntent(owner: SessionOwner) {
  await connectDb();
  await CheckoutIntentModel.deleteMany(ownerFilter(owner));
}

export async function listCheckoutIntents(limit = 6) {
  const { items } = await paginateCheckoutIntents({ page: 1, limit });
  return items;
}

export async function paginateCheckoutIntents(options?: { page?: number; limit?: number }) {
  await connectDb();
  const page = Math.max(options?.page ?? 1, 1);
  const limit = Math.min(Math.max(options?.limit ?? 10, 1), 100);
  const skip = (page - 1) * limit;
  const query = { status: "pending" } as const;

  const [intents, total] = await Promise.all([
    CheckoutIntentModel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<CheckoutIntentLean[]>(),
    CheckoutIntentModel.countDocuments(query),
  ]);

  return {
    items: intents.map(toSummary),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
