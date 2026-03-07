import type { DeliveryOption, OrderStatus } from "@/lib/constants";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = LoginPayload & { name: string };
export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
};

export type ProductFilters = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  trending?: boolean;
  flash?: boolean;
};

export type ProductMutationPayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categories: string[];
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
};

export type OrdersQuery = {
  page?: number;
  limit?: number;
};

export type OrdersMutationPayload = {
  status?: OrderStatus;
  deliveryOption?: DeliveryOption;
};

export type CheckoutPayload = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  deliveryOption: DeliveryOption;
};

export type CartItemPayload = { productId: string; quantity: number };
export type CartDeliveryPayload = { deliveryOption: DeliveryOption };
export type WishlistPayload = { productId: string };
export type CategoryPayload = { name: string };
export type CategoryDeletePayload = { id: string };
export type ProductIdPayload = { id: string };
