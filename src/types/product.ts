export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categories: string[];
  tags: string[];
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
};

export type ProductDetail = ProductSummary & {
  description: string;
};
