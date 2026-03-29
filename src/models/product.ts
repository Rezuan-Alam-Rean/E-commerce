import { Schema, model, models, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ isFeatured: 1, isTrending: 1, isFlashSale: 1 });
productSchema.index({ status: 1 });
productSchema.index({ categories: 1 });

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const ProductModel = models.Product || model("Product", productSchema);
