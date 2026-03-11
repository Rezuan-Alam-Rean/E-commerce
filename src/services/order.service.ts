import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { CartModel } from "@/models/cart";
import { ProductModel } from "@/models/product";
import { clearCheckoutIntent } from "@/services/checkout-intent.service";
import type { SessionOwner } from "@/types/session";
import type { OrderSummary } from "@/types/order";
import type { DeliveryOption } from "@/lib/constants";

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

type DirectItemInput = {
  productId: string;
  quantity: number;
};

type ProductLean = {
  _id: Types.ObjectId;
  name: string;
  images?: string[];
  price: number;
  stock: number;
  status: string;
};

const ownerFilter = (owner: SessionOwner) =>
  owner.kind === "user" ? { user: owner.userId } : { guestToken: owner.guestToken };

export async function createOrder(
  owner: SessionOwner,
  input: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    deliveryOption: DeliveryOption;
    items?: DirectItemInput[];
  }
) {
  await connectDb();

  const normalizedDirectItems = (input.items ?? []).map((item) => ({
    productId: item.productId,
    quantity: Math.max(1, Math.floor(item.quantity)),
  }));

  if (normalizedDirectItems.some((item) => !Types.ObjectId.isValid(item.productId))) {
    throw new Error("Selected product is unavailable");
  }

  let orderItems: OrderItemLean[] = [];
  let subtotal = 0;
  let cartIdToClear: Types.ObjectId | null = null;

  if (normalizedDirectItems.length > 0) {
    const productIds = normalizedDirectItems.map((item) => new Types.ObjectId(item.productId));
    const products = await ProductModel.find({ _id: { $in: productIds }, status: "active" })
      .lean<ProductLean[]>();

    if (products.length === 0) {
      throw new Error("Selected product is unavailable");
    }

    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    orderItems = normalizedDirectItems.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Selected product is unavailable");
      }
      if (product.stock < item.quantity) {
        throw new Error(`${product.name} is out of stock`);
      }
      return {
        product: product._id,
        name: product.name,
        image: product.images?.[0] ?? "",
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    subtotal = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  } else {
    const cart = await CartModel.findOne(ownerFilter(owner))
      .populate("items.product")
      .lean<CartLean>();
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));
    cartIdToClear = cart._id;
  }

  const baseOwnerFields =
    owner.kind === "user"
      ? { user: owner.userId }
      : { guestToken: owner.guestToken };

  const order = await OrderModel.create({
    ...baseOwnerFields,
    items: orderItems,
    status: "pending",
    deliveryOption: input.deliveryOption,
    subtotal,
    total: subtotal,
    paymentMethod: "cod",
    shippingName: input.shippingName,
    shippingPhone: input.shippingPhone,
    shippingAddress: input.shippingAddress,
  });

  if (cartIdToClear) {
    await CartModel.findByIdAndUpdate(cartIdToClear, { items: [] });
  }

  await clearCheckoutIntent(owner);

  const leanOrder = order.toObject() as OrderLean;
  return toSummary(leanOrder);
}

export async function listOrders(userId: string, role: string) {
  await connectDb();
  const query = role === "admin" ? {} : { user: userId };
  const orders = await OrderModel.find(query)
    .sort({ createdAt: -1 })
    .lean<OrderLean[]>();
  return orders.map(toSummary);
}

export async function listOrdersPaginated(
  userId: string,
  role: string,
  options?: { page?: number; limit?: number },
) {
  await connectDb();
  const query = role === "admin" ? {} : { user: userId };
  const page = Math.max(options?.page ?? 1, 1);
  const limit = Math.min(options?.limit ?? 8, 50);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<OrderLean[]>(),
    OrderModel.countDocuments(query),
  ]);

  return {
    items: orders.map(toSummary),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
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
  deliveryOption: DeliveryOption
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
  const leanOrder = order.toObject() as OrderLean;
  return toSummary(leanOrder);
}
