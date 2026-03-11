import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { CartModel } from "@/models/cart";
import { ProductModel } from "@/models/product";
import type { CartState } from "@/types/cart";
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

const ownerFilter = (owner: SessionOwner) =>
  owner.kind === "user" ? { user: owner.userId } : { guestToken: owner.guestToken };

const ownerFields = (owner: SessionOwner) =>
  owner.kind === "user" ? { user: owner.userId } : { guestToken: owner.guestToken };

export async function getOrCreateCart(owner: SessionOwner) {
  await connectDb();
  const cart = await CartModel.findOneAndUpdate(
    ownerFilter(owner),
    { $setOnInsert: { ...ownerFields(owner), items: [], deliveryOption: "standard" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
    .populate("items.product")
    .lean();
  if (!cart) {
    throw new Error("Cart not found");
  }

  return cart;
}

export async function addCartItem(
  owner: SessionOwner,
  productId: string,
  quantity: number
) {
  await connectDb();
  const product = await ProductModel.findById(productId).lean<ProductLean>();
  if (!product) {
    throw new Error("Product not found");
  }

  const filter = ownerFilter(owner);
  const cart = await CartModel.findOne(filter);
  if (!cart) {
    const created = await CartModel.create({
      ...ownerFields(owner),
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
  owner: SessionOwner,
  productId: string,
  quantity: number
) {
  await connectDb();
  const filter = ownerFilter(owner);
  const cart = await CartModel.findOne(filter);
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

export async function removeCartItem(owner: SessionOwner, productId: string) {
  await connectDb();
  const filter = ownerFilter(owner);
  const cart = await CartModel.findOne(filter);
  if (!cart) {
    throw new Error("Cart not found");
  }

  const nextItems = cart.items.filter(
    (entry: CartItemDoc) => entry.product.toString() !== productId
  );
  cart.items.splice(0, cart.items.length, ...nextItems);
  await cart.save();
  return cart;
}

export async function updateDeliveryOption(owner: SessionOwner, option: string) {
  await connectDb();
  const filter = ownerFilter(owner);
  return CartModel.findOneAndUpdate(filter, { deliveryOption: option }, { new: true });
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

  const items = populated.items
    .filter((item) => Boolean(item.product))
    .map((item) => ({
      product: {
        id: item.product!._id.toString(),
        name: item.product!.name,
        slug: item.product!.slug,
        price: item.product!.price,
        compareAtPrice: item.product!.compareAtPrice,
        images: item.product!.images,
        categories: item.product!.categories,
        tags: item.product!.tags,
        stock: item.product!.stock,
        ratingAverage: item.product!.ratingAverage,
        ratingCount: item.product!.ratingCount,
        isFeatured: item.product!.isFeatured,
        isTrending: item.product!.isTrending,
        isFlashSale: item.product!.isFlashSale,
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
