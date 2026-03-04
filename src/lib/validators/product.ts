import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  images: z.array(z.string().min(1)).default([]),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  stock: z.number().min(0),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  featured: z.string().optional(),
  trending: z.string().optional(),
  flash: z.string().optional(),
});
