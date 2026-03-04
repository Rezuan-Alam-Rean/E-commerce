import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { CartModel } from "@/models/cart";
import type { OrderSummary } from "@/types/order";

type OrderItemLean = {
  product: Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
};

type OrderLean = {
  _id: Types.ObjectId;
  status: string;
  items: OrderItemLean[];
  deliveryOption: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  subtotal: number;
  total: number;
  createdAt: Date;
};

type CartProductLean = {
  _id: Types.ObjectId;
  name: string;
  images?: string[];
};

type CartItemLean = {
  product: CartProductLean;
  quantity: number;
  unitPrice: number;
};

type CartLean = {
  _id: Types.ObjectId;
  items: CartItemLean[];
};

const toSummary = (order: OrderLean): OrderSummary => ({
  id: order._id.toString(),
  status: order.status as OrderSummary["status"],
  items: order.items.map((item) => ({
    product: {
      id: item.product.toString(),
      name: item.name,
      slug: "",
      price: item.unitPrice,
      compareAtPrice: undefined,
      images: item.image ? [item.image] : [],
      categories: [],
      tags: [],
      stock: 0,
      ratingAverage: 0,
      ratingCount: 0,
      isFeatured: false,
      isTrending: false,
      isFlashSale: false,
    },
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
  deliveryOption: order.deliveryOption as OrderSummary["deliveryOption"],
  shippingName: order.shippingName,
  shippingPhone: order.shippingPhone,
  shippingAddress: order.shippingAddress,
  subtotal: order.subtotal,
  total: order.total,
  createdAt: order.createdAt.toISOString(),
});

export async function createOrderFromCart(
  userId: string,
  input: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    deliveryOption: string;
  }
) {
  await connectDb();
  const cart = await CartModel.findOne({ user: userId })
    .populate("items.product")
    .lean<CartLean>();
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const order = await OrderModel.create({
    user: userId,
    items: cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    status: "pending",
    deliveryOption: input.deliveryOption,
    subtotal,
    total: subtotal,
    paymentMethod: "cod",
    shippingName: input.shippingName,
    shippingPhone: input.shippingPhone,
    shippingAddress: input.shippingAddress,
  });

  await CartModel.findByIdAndUpdate(cart._id, { items: [] });

  return toSummary(order);
}

export async function listOrders(userId: string, role: string) {
  await connectDb();
  const query = role === "admin" ? {} : { user: userId };
  const orders = await OrderModel.find(query)
    .sort({ createdAt: -1 })
    .lean<OrderLean[]>();
  return orders.map(toSummary);
}

export async function updateOrderStatus(orderId: string, status: string) {
  await connectDb();
  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).lean<OrderLean>();
  return order ? toSummary(order) : null;
}

export async function updateOrderDeliveryOption(
  orderId: string,
  userId: string,
  deliveryOption: string
) {
  await connectDb();
  const order = await OrderModel.findOne({ _id: orderId, user: userId });
  if (!order) {
    return null;
  }

  if (["shipped", "delivered", "cancelled"].includes(order.status)) {
    throw new Error("Order can no longer be updated");
  }

  order.deliveryOption = deliveryOption;
  await order.save();
  const leanOrder = order.toObject() as OrderLean;
  return toSummary(leanOrder);
}

export async function cancelOrder(orderId: string, userId: string) {
  await connectDb();
  const order = await OrderModel.findOne({ _id: orderId, user: userId });
  if (!order) {
    return null;
  }
  if (order.status !== "pending") {
    throw new Error("Only pending orders can be cancelled");
  }
  order.status = "cancelled";
  await order.save();
  return toSummary(order);
}
