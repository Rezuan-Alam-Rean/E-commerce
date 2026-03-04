import { Schema, model, models, type InferSchemaType } from "mongoose";
import { DELIVERY_OPTIONS } from "@/lib/constants";

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [cartItemSchema], default: [] },
    deliveryOption: { type: String, enum: DELIVERY_OPTIONS, default: "standard" },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true });

export type CartDocument = InferSchemaType<typeof cartSchema>;

export const CartModel = models.Cart || model("Cart", cartSchema);
