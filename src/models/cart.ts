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
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestToken: { type: String },
    items: { type: [cartItemSchema], default: [] },
    deliveryOption: { type: String, enum: DELIVERY_OPTIONS, default: "standard" },
  },
  { timestamps: true }
);

cartSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);
cartSchema.index(
  { guestToken: 1 },
  { unique: true, partialFilterExpression: { guestToken: { $type: "string" } } }
);

cartSchema.pre("validate", function ensureOwner(next) {
  if (!this.user && !this.guestToken) {
    next(new Error("Cart owner is required"));
    return;
  }
  next();
});

export type CartDocument = InferSchemaType<typeof cartSchema>;

if (models.Cart) {
  delete models.Cart;
}

export const CartModel = model("Cart", cartSchema);
