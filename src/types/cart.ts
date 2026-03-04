import type { DeliveryOption } from "@/lib/constants";
import type { ProductSummary } from "@/types/product";

export type CartItem = {
  product: ProductSummary;
  quantity: number;
  unitPrice: number;
};

export type CartState = {
  id: string;
  items: CartItem[];
  deliveryOption: DeliveryOption;
  subtotal: number;
  total: number;
};
