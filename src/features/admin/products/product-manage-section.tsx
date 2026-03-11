"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
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

// Pill toggle for checkboxes
function FlagToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors font-english ${checked
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

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
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">Manage Products</h2>
          <p className="text-sm text-gray-500 font-medium">Edit, remove, or adjust visibility flags for your listed products.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center text-gray-400 font-medium text-sm shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">Manage Products</h2>
          <p className="text-sm text-gray-500 font-medium">Edit, remove, or adjust visibility flags for your listed products.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
          <EmptyState title="No products yet" description="Create your first product to start selling." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">Manage Products</h2>
          <p className="text-sm text-gray-500 font-medium">{products.length} products · Page {page} of {totalPages}</p>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold font-english">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></span>
            Refreshing...
          </div>
        )}
      </div>

      {/* Responsive Product Table */}
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Product", "Price", "Stock", "Featured", "Trending", "Flash Sale", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-5 py-4 first:pl-6 last:pr-6 font-english whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 pl-6 py-4 font-bold text-gray-900 font-english max-w-[180px] truncate" title={product.name}>
                    {product.name}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-800 font-english whitespace-nowrap">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-english ${product.stock === 0
                        ? "bg-rose-100 text-rose-700"
                        : product.stock < 10
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <FlagToggle
                      checked={product.isFeatured}
                      disabled={disableInteractions}
                      onChange={(v) => handleToggle(product.id, "isFeatured", v)}
                      label="Featured"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <FlagToggle
                      checked={product.isTrending}
                      disabled={disableInteractions}
                      onChange={(v) => handleToggle(product.id, "isTrending", v)}
                      label="Trending"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <FlagToggle
                      checked={product.isFlashSale}
                      disabled={disableInteractions}
                      onChange={(v) => handleToggle(product.id, "isFlashSale", v)}
                      label="Flash"
                    />
                  </td>
                  <td className="px-5 pr-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={disableInteractions}
                        onClick={() => setEditProductId(product.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-english"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={disableInteractions}
                        onClick={() => requestDelete(product)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-english"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Busy Overlay */}
        {disableInteractions && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="px-6 py-3 bg-white shadow-xl rounded-full border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Updating...
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <PaginationButtons page={page} totalPages={totalPages} onPageChange={handlePage} disabled={disableInteractions} />

      {/* Edit Product Modal */}
      {editProductId ? (
        <ProductEditModal
          productId={editProductId}
          categories={categories}
          fetchProductDetail={fetchProductDetail}
          onClose={closeEditModal}
          onSave={handleEditSave}
        />
      ) : null}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Product?"
        description={pendingDelete ? `This will permanently remove "${pendingDelete.name}" from your store. This action cannot be undone.` : ""}
        confirmText="Delete Permanently"
        cancelText="Keep Product"
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
