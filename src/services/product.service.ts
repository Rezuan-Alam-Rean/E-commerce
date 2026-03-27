import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/product";
import { toSlug } from "@/lib/slug";
import type { ProductDetail, ProductSummary } from "@/types/product";

type ProductLean = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categories: string[];
  tags: string[];
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  description?: string;
};

const toSummary = (product: ProductLean): ProductSummary => ({
  id: product._id.toString(),
  name: product.name,
  slug: product.slug,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  images: product.images,
  categories: product.categories,
  tags: product.tags,
  stock: product.stock,
  ratingAverage: product.ratingAverage,
  ratingCount: product.ratingCount,
  isFeatured: product.isFeatured,
  isTrending: product.isTrending,
  isFlashSale: product.isFlashSale,
});

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  categories?: string[];
  tags?: string[];
  stock: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashSale?: boolean;
}) {
  await connectDb();
  const slug = toSlug(input.name);
  const product = await ProductModel.create({
    ...input,
    slug,
    images: input.images ?? [],
    categories: input.categories ?? [],
    tags: input.tags ?? [],
    isFeatured: input.isFeatured ?? false,
    isTrending: input.isTrending ?? false,
    isFlashSale: input.isFlashSale ?? false,
  });
  return toSummary(product);
}

export async function listProducts(filters: {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  trending?: boolean;
  flash?: boolean;
}) {
  await connectDb();

  const query: Record<string, unknown> = { status: "active" };

  if (filters.search) {
    const safeSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (filters.category) {
    const safeCategory = filters.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.categories = { $regex: `^${safeCategory}$`, $options: "i" };
  }

  if (filters.featured) {
    query.isFeatured = true;
  }

  if (filters.trending) {
    query.isTrending = true;
  }

  if (filters.flash) {
    query.isFlashSale = true;
  }

  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(filters.limit ?? 12, 48);
  const skip = (page - 1) * limit;

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (filters.sort) {
    case "price-asc":
      sort = { price: 1 };
      break;
    case "price-desc":
      sort = { price: -1 };
      break;
    case "popular":
      sort = { ratingAverage: -1, ratingCount: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const [items, total] = await Promise.all([
    ProductModel.find(query).sort(sort).skip(skip).limit(limit).lean<ProductLean[]>(),
    ProductModel.countDocuments(query),
  ]);

  return {
    items: items.map(toSummary),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function listTopCategories(limit = 6): Promise<{ name: string; count: number; image: string | null }[]> {
  await connectDb();
  const categories = await ProductModel.aggregate<{ _id: string; count: number; image: string | null }>([
    { $match: { status: "active" } },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", count: { $sum: 1 }, image: { $first: { $arrayElemAt: ["$images", 0] } } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return categories.map((category) => ({
    name: category._id,
    count: category.count,
    image: category.image ?? null,
  }));
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  await connectDb();
  const product = await ProductModel.findById(id).lean<ProductLean>();
  if (!product) {
    return null;
  }

  return {
    ...toSummary(product),
    description: product.description ?? "",
  };
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<ProductDetail | null> {
  await connectDb();
  let product: ProductLean | null = null;

  if (Types.ObjectId.isValid(idOrSlug)) {
    product = await ProductModel.findById(idOrSlug).lean<ProductLean>();
  }

  if (!product) {
    product = await ProductModel.findOne({ slug: idOrSlug }).lean<ProductLean>();
  }

  if (!product) {
    return null;
  }

  return {
    ...toSummary(product),
    description: product.description ?? "",
  };
}

export async function updateProduct(id: string, input: Partial<ProductDetail>) {
  await connectDb();
  if (input.name) {
    input.slug = toSlug(input.name);
  }
  const product = await ProductModel.findByIdAndUpdate(id, input, {
    new: true,
  }).lean<ProductLean>();
  return product ? toSummary(product) : null;
}

export async function deleteProduct(id: string) {
  await connectDb();
  await ProductModel.findByIdAndDelete(id);
}
