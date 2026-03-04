import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { CartModel } from "@/models/cart";
import { ProductModel } from "@/models/product";
import type { CartState } from "@/types/cart";

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

type CartItemLean = {
  product: ProductLean;
  quantity: number;
  unitPrice: number;
};

type CartLean = {
  _id: Types.ObjectId;
  items: CartItemLean[];
  deliveryOption: string;
};

type CartItemDoc = {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
};

function calcTotals(items: { quantity: number; unitPrice: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const total = subtotal;
  return { subtotal, total };
}

export async function getOrCreateCart(userId: string) {
  await connectDb();
  const cart = await CartModel.findOne({ user: userId })
    .populate("items.product")
    .lean();
  if (cart) {
    return cart;
  }

  return CartModel.create({ user: userId, items: [] });
}

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number
) {
  await connectDb();
  const product = await ProductModel.findById(productId).lean<ProductLean>();
  if (!product) {
    throw new Error("Product not found");
  }

  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {
    const created = await CartModel.create({
      user: userId,
      items: [{ product: product._id, quantity, unitPrice: product.price }],
    });
    return created;
  }

  const existing = cart.items.find(
    (item: CartItemDoc) => item.product.toString() === productId
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      unitPrice: product.price,
    });
  }

  await cart.save();
  return cart;
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
) {
  await connectDb();
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (entry: CartItemDoc) => entry.product.toString() === productId
  );
  if (!item) {
    throw new Error("Item not found");
  }

  item.quantity = quantity;
  await cart.save();
  return cart;
}

export async function removeCartItem(userId: string, productId: string) {
  await connectDb();
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (entry: CartItemDoc) => entry.product.toString() !== productId
  );
  await cart.save();
  return cart;
}

export async function updateDeliveryOption(userId: string, option: string) {
  await connectDb();
  return CartModel.findOneAndUpdate(
    { user: userId },
    { deliveryOption: option },
    { new: true }
  );
}

export async function mapCartState(cart: { _id: Types.ObjectId }): Promise<CartState> {
  const populated = await CartModel.findById(cart._id)
    .populate("items.product")
    .lean<CartLean>();
  if (!populated) {
    return {
      id: cart._id.toString(),
      items: [],
      deliveryOption: "standard",
      subtotal: 0,
      total: 0,
    };
  }

  const items = populated.items.map((item) => ({
    product: {
      id: item.product._id.toString(),
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      compareAtPrice: item.product.compareAtPrice,
      images: item.product.images,
      categories: item.product.categories,
      tags: item.product.tags,
      stock: item.product.stock,
      ratingAverage: item.product.ratingAverage,
      ratingCount: item.product.ratingCount,
      isFeatured: item.product.isFeatured,
      isTrending: item.product.isTrending,
      isFlashSale: item.product.isFlashSale,
    },
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  const totals = calcTotals(items);
  return {
    id: populated._id.toString(),
    items,
    deliveryOption: populated.deliveryOption as CartState["deliveryOption"],
    subtotal: totals.subtotal,
    total: totals.total,
  };
}
