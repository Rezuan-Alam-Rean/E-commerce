import type { ProductMutationPayload } from "@/lib/store/api";

export type ProductFormDraft = {
  name: string;
  description: string;
  price: string;
  stock: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  trending: boolean;
  flashSale: boolean;
};

export const emptyDraft: ProductFormDraft = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categories: [],
  tags: [],
  featured: false,
  trending: false,
  flashSale: false,
};

export type ValidationError = {
  title: string;
  description: string;
};

type ValidationResult =
  | { success: true; payload: ProductMutationPayload }
  | { success: false; error: ValidationError };

export const buildProductPayload = (
  draft: ProductFormDraft,
  images: string[],
): ValidationResult => {
  if (!draft.name.trim()) {
    return { success: false, error: { title: "Name required", description: "Enter a product name." } };
  }

  const priceValue = Number(draft.price);
  if (!draft.price || Number.isNaN(priceValue)) {
    return { success: false, error: { title: "Price required", description: "Enter a valid price." } };
  }

  const stockValue = Number(draft.stock);
  if (!draft.stock || Number.isNaN(stockValue)) {
    return { success: false, error: { title: "Stock required", description: "Enter a valid stock count." } };
  }

  if (draft.categories.length === 0) {
    return { success: false, error: { title: "Category required", description: "Select a category." } };
  }

  if (images.length === 0) {
    return { success: false, error: { title: "Image required", description: "Add at least one image." } };
  }

  const description = draft.description.trim();
  if (description.length < 10) {
    return {
      success: false,
      error: { title: "Description too short", description: "Use at least 10 characters." },
    };
  }

  return {
    success: true,
    payload: {
      name: draft.name.trim(),
      description,
      price: priceValue,
      stock: stockValue,
      images,
      categories: draft.categories,
      tags: draft.tags,
      isFeatured: draft.featured,
      isTrending: draft.trending,
      isFlashSale: draft.flashSale,
    },
  };
};

export const resolveErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { error?: string } }).data;
    if (data && typeof data === "object" && "error" in data) {
      const message = (data as { error?: string }).error;
      if (typeof message === "string") {
        return message;
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to complete request.";
};
