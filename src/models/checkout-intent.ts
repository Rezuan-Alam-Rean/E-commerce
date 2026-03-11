import { Schema, model, models, type InferSchemaType } from "mongoose";

const checkoutIntentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestToken: { type: String },
    shippingName: { type: String, required: true },
    shippingPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    promoEmail: { type: String, default: "" },
    status: { type: String, enum: ["pending", "converted"], default: "pending" },
  },
  { timestamps: true }
);

checkoutIntentSchema.index({ user: 1, updatedAt: -1 }, { sparse: true });
checkoutIntentSchema.index({ guestToken: 1, updatedAt: -1 }, { sparse: true });

checkoutIntentSchema.pre("validate", function ensureOwner(next) {
  if (!this.user && !this.guestToken) {
    next(new Error("Checkout intent owner is required"));
    return;
  }
  next();
});

export type CheckoutIntentDocument = InferSchemaType<typeof checkoutIntentSchema>;

if (models.CheckoutIntent) {
  delete models.CheckoutIntent;
}

export const CheckoutIntentModel = model("CheckoutIntent", checkoutIntentSchema);
