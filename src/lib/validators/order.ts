import { z } from "zod";
import { DELIVERY_OPTIONS, ORDER_STATUS } from "@/lib/constants";

export const createOrderSchema = z.object({
  shippingName: z.string().min(2),
  shippingPhone: z.string().min(7),
  shippingAddress: z.string().min(6),
  deliveryOption: z.enum(DELIVERY_OPTIONS),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS),
});

export const updateDeliverySchema = z.object({
  deliveryOption: z.enum(DELIVERY_OPTIONS),
});
