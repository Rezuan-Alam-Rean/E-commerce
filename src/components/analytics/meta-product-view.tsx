"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/analytics/meta-client";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    __metaViewedProducts?: Set<string>;
  }
}

type MetaProductViewProps = {
  product: {
    id: string;
    name: string;
    price: number;
    categories?: string[];
  };
};

export function MetaProductView({ product }: MetaProductViewProps) {
  useEffect(() => {
    if (!product?.id) {
      return;
    }

    if (typeof window !== "undefined") {
      if (!window.__metaViewedProducts) {
        window.__metaViewedProducts = new Set();
      }
      if (window.__metaViewedProducts.has(product.id)) {
        return;
      }
      window.__metaViewedProducts.add(product.id);
    }

    const contents = [
      {
        id: product.id,
        quantity: 1,
        item_price: product.price,
      },
    ];
    // item_name is unsupported and has been removed

    trackMetaEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.categories?.join(", ") ?? undefined,
      contents,
      content_type: "product",
      currency: "BDT",
      value: product.price,
    });
  }, [product?.id, product?.name, product?.price, product?.categories?.join("|")]);

  return null;
}
