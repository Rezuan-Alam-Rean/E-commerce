import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { WishlistModel } from "@/models/wishlist";
import type { ProductSummary } from "@/types/product";
import type { WishlistState } from "@/types/wishlist";
import type { SessionOwner } from "@/types/session";

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
};

type WishlistLean = {
  _id: Types.ObjectId;
  products: ProductLean[];
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

async function mapWishlist(wishlist: WishlistLean | null): Promise<WishlistState> {
  if (!wishlist) {
    return { id: "", products: [] };
  }

  return {
    id: wishlist._id.toString(),
    products: wishlist.products.map(toSummary),
  };
}

const ownerFilter = (owner: SessionOwner) =>
  owner.kind === "user" ? { user: owner.userId } : { guestToken: owner.guestToken };

const ownerFields = (owner: SessionOwner) =>
  owner.kind === "user" ? { user: owner.userId } : { guestToken: owner.guestToken };

export async function getWishlistState(owner: SessionOwner) {
  await connectDb();
  const wishlist = await WishlistModel.findOneAndUpdate(
    ownerFilter(owner),
    { $setOnInsert: { ...ownerFields(owner), products: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
    .populate("products")
    .lean<WishlistLean>();

  return mapWishlist(wishlist ?? null);
}

export async function addToWishlist(owner: SessionOwner, productId: string) {
  await connectDb();
  const wishlist = await WishlistModel.findOneAndUpdate(
    ownerFilter(owner),
    {
      $addToSet: { products: productId },
      $setOnInsert: ownerFields(owner),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
    .populate("products")
    .lean<WishlistLean>();
  return mapWishlist(wishlist ?? null);
}

export async function removeFromWishlist(owner: SessionOwner, productId: string) {
  await connectDb();
  const wishlist = await WishlistModel.findOneAndUpdate(
    ownerFilter(owner),
    { $pull: { products: productId } },
    { new: true }
  )
    .populate("products")
    .lean<WishlistLean>();
  return mapWishlist(wishlist ?? null);
}
