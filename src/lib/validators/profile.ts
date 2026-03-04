import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
});
