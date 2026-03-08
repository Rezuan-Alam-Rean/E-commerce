import { Schema, model, models, type InferSchemaType } from "mongoose";
import { DELIVERY_OPTIONS, ORDER_STATUS } from "@/lib/constants";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestToken: { type: String },
    items: { type: [orderItemSchema], default: [] },
    status: { type: String, enum: ORDER_STATUS, default: "pending" },
    deliveryOption: { type: String, enum: DELIVERY_OPTIONS, default: "standard" },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "cod" },
    shippingName: { type: String },
    shippingPhone: { type: String },
    shippingAddress: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ guestToken: 1, createdAt: -1 }, { sparse: true });
orderSchema.pre("validate", function ensureOwner(next) {
  if (!this.user && !this.guestToken) {
    next(new Error("Order owner is required"));
    return;
  }
  next();
});
orderSchema.index({ status: 1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

if (models.Order) {
  delete models.Order;
}

export const OrderModel = model("Order", orderSchema);
