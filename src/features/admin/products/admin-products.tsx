"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductSummary } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useLazyGetProductQuery,
  useLazyGetProductsQuery,
  useUpdateProductMutation,
  type ProductMutationPayload,
} from "@/lib/store/api";
import { ProductCreateSection } from "./product-create-section";
import { ProductManageSection } from "./product-manage-section";
import { resolveErrorMessage } from "./utils";

const PAGE_SIZE = 8;

type AdminProductsMode = "all" | "create" | "manage";

type AdminProductsProps = {
  mode?: AdminProductsMode;
};

export function AdminProducts({ mode = "all" }: AdminProductsProps) {
  const { push } = useToast();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { data: categories = [], isFetching: categoriesFetching } = useGetCategoriesQuery();
  const [fetchProducts, { isFetching: productsFetching }] = useLazyGetProductsQuery();
  const [fetchProductDetail] = useLazyGetProductQuery();
  const [createProductMutation] = useCreateProductMutation();
  const [updateProductMutation] = useUpdateProductMutation();
  const [deleteProductMutation] = useDeleteProductMutation();

  const fetchProductPage = useCallback(
    async (pageToLoad: number) => {
      try {
        const data = await fetchProducts({ page: pageToLoad, limit: PAGE_SIZE }, true).unwrap();
        setProducts(data.items);
        setTotalPages(Math.max(1, data.pages));
        setPage(data.page);
        return true;
      } catch (error) {
        push({ title: "Load failed", description: resolveErrorMessage(error) });
        setProducts([]);
        setTotalPages(1);
        return false;
      }
    },
    [fetchProducts, push],
  );

  const refreshCurrentPage = useCallback(
    async (fallbackPage?: number) => {
      const target = fallbackPage ?? page;
      const success = await fetchProductPage(target);
      if (!success && target > 1) {
        await fetchProductPage(Math.max(1, target - 1));
      }
    },
    [fetchProductPage, page],
  );

  const handlePageChange = useCallback(
    async (nextPage: number) => {
      await fetchProductPage(nextPage);
    },
    [fetchProductPage],
  );

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      void fetchProductPage(1).finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProductPage]);

  const createProduct = useCallback(
    async (payload: ProductMutationPayload) => {
      await createProductMutation(payload).unwrap();
      await refreshCurrentPage(1);
    },
    [createProductMutation, refreshCurrentPage],
  );

  const updateProduct = useCallback(
    async (id: string, payload: ProductMutationPayload) => {
      await updateProductMutation({ id, ...payload }).unwrap();
      await refreshCurrentPage();
    },
    [refreshCurrentPage, updateProductMutation],
  );

  const toggleProductFlag = useCallback(
    async (
      id: string,
      field: "isFeatured" | "isTrending" | "isFlashSale",
      value: boolean,
    ) => {
      await updateProductMutation({ id, [field]: value }).unwrap();
      await refreshCurrentPage();
    },
    [refreshCurrentPage, updateProductMutation],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteProductMutation({ id }).unwrap();
      await refreshCurrentPage();
    },
    [deleteProductMutation, refreshCurrentPage],
  );

  const loadProductDetail = useCallback(
    async (id: string) => {
      const result = await fetchProductDetail({ id }, true).unwrap();
      return result;
    },
    [fetchProductDetail],
  );

  return (
    <div className="flex flex-col gap-8">
      {mode !== "manage" ? (
        <ProductCreateSection
          categories={categories}
          categoriesLoading={categoriesFetching}
          onCreate={createProduct}
        />
      ) : null}
      {mode !== "create" ? (
        <ProductManageSection
          products={products}
          loading={loading}
          isRefreshing={productsFetching}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          categories={categories}
          fetchProductDetail={loadProductDetail}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onToggleFlag={toggleProductFlag}
        />
      ) : null}
    </div>
  );
}
