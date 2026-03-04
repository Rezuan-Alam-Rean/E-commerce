import { Schema, model, models, type InferSchemaType } from "mongoose";

const wishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1 }, { unique: true });

export type WishlistDocument = InferSchemaType<typeof wishlistSchema>;

export const WishlistModel = models.Wishlist || model("Wishlist", wishlistSchema);
