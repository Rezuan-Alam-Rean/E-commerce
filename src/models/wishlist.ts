import { Schema, model, models, type InferSchemaType } from "mongoose";

const wishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestToken: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

wishlistSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);
wishlistSchema.index(
  { guestToken: 1 },
  { unique: true, partialFilterExpression: { guestToken: { $type: "string" } } }
);

wishlistSchema.pre("validate", function ensureOwner(next) {
  if (!this.user && !this.guestToken) {
    next(new Error("Wishlist owner is required"));
    return;
  }
  next();
});

export type WishlistDocument = InferSchemaType<typeof wishlistSchema>;

if (models.Wishlist) {
  delete models.Wishlist;
}

export const WishlistModel = model("Wishlist", wishlistSchema);
