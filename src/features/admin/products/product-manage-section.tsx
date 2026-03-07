"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { CategorySummary } from "@/types/category";
import type { ProductDetail, ProductSummary } from "@/types/product";
import type { ProductMutationPayload } from "@/lib/store/api";
import { formatCurrency } from "@/utils/format";
import { ProductEditModal } from "./product-edit-modal";
import { resolveErrorMessage } from "./utils";

type ProductManageSectionProps = {
  products: ProductSummary[];
  loading: boolean;
  isRefreshing: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => Promise<void>;
  categories: CategorySummary[];
  fetchProductDetail: (id: string) => Promise<ProductDetail>;
  onUpdate: (id: string, payload: ProductMutationPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFlag: (
    id: string,
    field: "isFeatured" | "isTrending" | "isFlashSale",
    value: boolean,
  ) => Promise<void>;
};

export function ProductManageSection({
  products,
  loading,
  isRefreshing,
  page,
  totalPages,
  onPageChange,
  categories,
  fetchProductDetail,
  onUpdate,
  onDelete,
  onToggleFlag,
}: ProductManageSectionProps) {
  const { push } = useToast();
  const [tableBusy, setTableBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  const disableInteractions = tableBusy || isRefreshing;

  const requestDelete = (product: ProductSummary) => {
    setPendingDelete({ id: product.id, name: product.name });
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    setConfirmBusy(true);
    setTableBusy(true);
    try {
      await onDelete(pendingDelete.id);
      push({ title: "Product deleted", description: `${pendingDelete.name} was removed.` });
    } catch (error) {
      push({ title: "Delete failed", description: resolveErrorMessage(error) });
    } finally {
      setConfirmBusy(false);
      setConfirmOpen(false);
      setPendingDelete(null);
      setTableBusy(false);
    }
  };

  const handleToggle = async (
    productId: string,
    field: "isFeatured" | "isTrending" | "isFlashSale",
    value: boolean,
  ) => {
    setTableBusy(true);
    try {
      await onToggleFlag(productId, field, value);
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    } finally {
      setTableBusy(false);
    }
  };

  const handlePage = async (nextPage: number) => {
    if (nextPage === page) {
      return;
    }
    setTableBusy(true);
    try {
      await onPageChange(nextPage);
    } finally {
      setTableBusy(false);
    }
  };

  const closeEditModal = () => {
    if (tableBusy) {
      return;
    }
    setEditProductId(null);
  };

  const handleEditSave = async (id: string, payload: ProductMutationPayload) => {
    setTableBusy(true);
    try {
      await onUpdate(id, payload);
    } finally {
      setTableBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface-strong p-6 text-sm text-muted">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState title="No products yet" description="Create your first product to start selling." />
    );
  }

  return (
    <div className="relative">
      <Table headers={["Product", "Price", "Stock", "Featured", "Trending", "Flash", "Actions"]}>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{formatCurrency(product.price)}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              <input
                type="checkbox"
                checked={product.isFeatured}
                disabled={disableInteractions}
                onChange={(event) => handleToggle(product.id, "isFeatured", event.target.checked)}
              />
            </TableCell>
            <TableCell>
              <input
                type="checkbox"
                checked={product.isTrending}
                disabled={disableInteractions}
                onChange={(event) => handleToggle(product.id, "isTrending", event.target.checked)}
              />
            </TableCell>
            <TableCell>
              <input
                type="checkbox"
                checked={product.isFlashSale}
                disabled={disableInteractions}
                onChange={(event) => handleToggle(product.id, "isFlashSale", event.target.checked)}
              />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  disabled={disableInteractions}
                  onClick={() => requestDelete(product)}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  disabled={disableInteractions}
                  onClick={() => setEditProductId(product.id)}
                >
                  Edit
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>
      {disableInteractions ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-white/70 text-sm font-medium">
          Updating...
        </div>
      ) : null}
      <PaginationButtons page={page} totalPages={totalPages} onPageChange={handlePage} disabled={disableInteractions} />
      {editProductId ? (
        <ProductEditModal
          productId={editProductId}
          categories={categories}
          fetchProductDetail={fetchProductDetail}
          onClose={closeEditModal}
          onSave={handleEditSave}
        />
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete product?"
        description={pendingDelete ? `This will permanently remove ${pendingDelete.name}.` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        busy={confirmBusy}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!confirmBusy) {
            setConfirmOpen(false);
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
