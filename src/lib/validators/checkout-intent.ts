import { z } from "zod";

export const checkoutIntentSchema = z.object({
  shippingName: z.string().trim().min(2, "Name must be at least 2 characters"),
  shippingPhone: z.string().trim().min(7, "Phone number must be at least 7 digits"),
  shippingAddress: z.string().trim().min(6, "Address must be at least 6 characters"),
  promoEmail: z.string().trim().email("Provide a valid email address").optional(),
});
