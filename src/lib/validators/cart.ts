import { z } from "zod";
import { DELIVERY_OPTIONS } from "@/lib/constants";

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export const cartRemoveSchema = z.object({
  productId: z.string(),
});

export const cartDeliverySchema = z.object({
  deliveryOption: z.enum(DELIVERY_OPTIONS),
});
