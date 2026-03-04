import type { DeliveryOption, OrderStatus } from "@/lib/constants";
import type { CartItem } from "@/types/cart";

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  deliveryOption: DeliveryOption;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  subtotal: number;
  total: number;
  createdAt: string;
};
