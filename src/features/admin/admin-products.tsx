"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationButtons } from "@/components/ui/pagination-buttons";
import type { ProductDetail, ProductSummary } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/format";

const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categories: [] as string[],
  tags: [] as string[],
  featured: false,
  trending: false,
  flashSale: false,
};

type Category = { id: string; name: string; slug: string };

type AdminProductsMode = "all" | "create" | "manage";

type ProductFormState = typeof emptyForm;

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categories: string[];
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
};

export function AdminProducts({ mode = "all" }: { mode?: AdminProductsMode }) {
  const { push } = useToast();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tableBusy, setTableBusy] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editModal, setEditModal] = useState<{
    id: string;
    form: ProductFormState;
    images: string[];
  } | null>(null);
  const [editTagInput, setEditTagInput] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    action: null as null | (() => Promise<void> | void),
  });
  const [confirmBusy, setConfirmBusy] = useState(false);
  const createFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setForm(emptyForm);
    setFormImages([]);
    setTagInput("");
  };

  const closeConfirm = () => {
    if (confirmBusy) {
      return;
    }
    setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  };

  const requestConfirm = (
    config: Partial<typeof confirmState> & {
      title: string;
      action: () => Promise<void> | void;
    },
  ) => {
    setConfirmState({
      open: true,
      title: config.title,
      description: config.description ?? "",
      confirmText: config.confirmText ?? "Confirm",
      cancelText: config.cancelText ?? "Cancel",
      action: config.action,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState.action) {
      closeConfirm();
      return;
    }
    setConfirmBusy(true);
    try {
      await confirmState.action();
    } finally {
      setConfirmBusy(false);
      setConfirmState((prev) => ({ ...prev, open: false, action: null }));
    }
  };

  const triggerCreateFileDialog = () => {
    createFileInputRef.current?.click();
  };

  const triggerEditFileDialog = () => {
    editFileInputRef.current?.click();
  };

  const fetchProductPage = useCallback(
    async (pageToLoad: number) => {
      try {
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: String(PAGE_SIZE),
        });
        const productRes = await fetch(`/api/products?${params.toString()}`);
        const data = await productRes.json();
        if (!data.success) {
          throw new Error(data.error ?? "Unable to fetch products");
        }
        setProducts(data.data.items);
        setTotalPages(Math.max(1, data.data.pages));
        setPage(data.data.page);
        return true;
      } catch (error) {
        console.error(error);
        push({ title: "Load failed", description: "Unable to fetch products." });
        setProducts([]);
        setTotalPages(1);
        return false;
      }
    },
    [push],
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
    (nextPage: number) => {
      if (nextPage === page) {
        return;
      }
      setTableBusy(true);
      void fetchProductPage(nextPage).finally(() => setTableBusy(false));
    },
    [fetchProductPage, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const categoryRes = await fetch("/api/categories");
      const catData = await categoryRes.json();
      setCategories(catData.success ? catData.data : []);
      await fetchProductPage(1);
    } catch (error) {
      console.error(error);
      push({ title: "Load failed", description: "Unable to fetch products." });
    } finally {
      setLoading(false);
      setTableBusy(false);
    }
  }, [fetchProductPage, push]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const updateField = (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const updateCategories = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, categories: value ? [value] : [] }));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || form.tags.includes(value)) {
      setTagInput("");
      return;
    }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, value] }));
    setTagInput("");
  };

  const removeTag = (value: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== value) }));
  };

  const handleEditField = (field: keyof ProductFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setEditModal((prev) => (prev ? { ...prev, form: { ...prev.form, [field]: value } } : prev));
    };

  const updateEditCategories = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setEditModal((prev) =>
      prev ? { ...prev, form: { ...prev.form, categories: value ? [value] : [] } } : prev,
    );
  };

  const addEditTag = () => {
    const value = editTagInput.trim();
    setEditTagInput("");
    if (!value) {
      return;
    }
    setEditModal((prev) => {
      if (!prev || prev.form.tags.includes(value)) {
        return prev;
      }
      return { ...prev, form: { ...prev.form, tags: [...prev.form.tags, value] } };
    });
  };

  const removeEditTag = (value: string) => {
    setEditModal((prev) =>
      prev ? { ...prev, form: { ...prev.form, tags: prev.form.tags.filter((tag) => tag !== value) } } : prev,
    );
  };

  const buildProductPayload = (
    draft: ProductFormState,
    images: string[],
  ): ProductPayload | null => {
    const categories = draft.categories;
    const tags = draft.tags;
    const description = draft.description.trim();

    if (!draft.name.trim()) {
      push({ title: "Name required", description: "Enter a product name." });
      return null;
    }
    if (!draft.price || Number.isNaN(Number(draft.price))) {
      push({ title: "Price required", description: "Enter a valid price." });
      return null;
    }
    if (!draft.stock || Number.isNaN(Number(draft.stock))) {
      push({ title: "Stock required", description: "Enter a valid stock count." });
      return null;
    }
    if (categories.length === 0) {
      push({ title: "Category required", description: "Select a category." });
      return null;
    }
    if (images.length === 0) {
      push({ title: "Image required", description: "Add at least one image." });
      return null;
    }
    if (description.length < 10) {
      push({ title: "Description too short", description: "Use at least 10 characters." });
      return null;
    }

    return {
      name: draft.name.trim(),
      description,
      price: Number(draft.price),
      stock: Number(draft.stock),
      images,
      categories,
      tags,
      isFeatured: draft.featured,
      isTrending: draft.trending,
      isFlashSale: draft.flashSale,
    };
  };

  const persistProduct = async (payload: ProductPayload, productId: string | null) => {
    const res = await fetch(productId ? `/api/products/${productId}` : "/api/products", {
      method: productId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      push({ title: "Save failed", description: data?.error ?? "Check product fields." });
      return false;
    }

    push({ title: productId ? "Product updated" : "Product created" });
    await refreshCurrentPage(productId ? undefined : 1);
    return true;
  };

  const handleCreateSave = async () => {
    const payload = buildProductPayload(form, formImages);
    if (!payload) {
      return;
    }
    setSubmitting(true);
    try {
      const success = await persistProduct(payload, null);
      if (success) {
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = async (productId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        push({ title: "Load failed", description: data?.error ?? "Could not load product." });
        return;
      }
      const product = data.data as ProductDetail;
      setEditModal({
        id: product.id,
        form: {
          name: product.name,
          description: product.description ?? "",
          price: product.price.toFixed(2),
          stock: product.stock.toString(),
          categories: product.categories ?? [],
          tags: product.tags ?? [],
          featured: product.isFeatured,
          trending: product.isTrending,
          flashSale: product.isFlashSale,
        },
        images: product.images ?? [],
      });
      setEditTagInput("");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) {
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setFormImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeImage = (value: string) => {
    setFormImages((prev) => prev.filter((image) => image !== value));
  };

  const handleEditUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) {
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setEditModal((prev) => (prev ? { ...prev, images: [...prev.images, result] } : prev));
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeEditImage = (value: string) => {
    setEditModal((prev) =>
      prev ? { ...prev, images: prev.images.filter((image) => image !== value) } : prev,
    );
  };

  const removeProduct = async (productId: string) => {
    setTableBusy(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        push({ title: "Delete failed" });
        return;
      }
      push({ title: "Product deleted" });
      await refreshCurrentPage();
    } finally {
      setTableBusy(false);
    }
  };

  const closeEditModal = () => {
    if (editBusy) {
      return;
    }
    setEditModal(null);
    setEditTagInput("");
  };

  const handleEditSave = () => {
    if (!editModal) {
      return;
    }
    const currentEdit = editModal;
    const payload = buildProductPayload(currentEdit.form, currentEdit.images);
    if (!payload) {
      return;
    }
    requestConfirm({
      title: "Update product?",
      description: "All product fields will be updated with these values.",
      confirmText: "Update",
      action: async () => {
        setEditBusy(true);
        try {
          const success = await persistProduct(payload, currentEdit.id);
          if (success) {
            setEditModal(null);
            setEditTagInput("");
          }
        } finally {
          setEditBusy(false);
        }
      },
    });
  };

  const toggleFlag = async (
    productId: string,
    field: "isFeatured" | "isTrending" | "isFlashSale",
    value: boolean
  ) => {
    setTableBusy(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        push({ title: "Update failed" });
        return;
      }
      await refreshCurrentPage();
    } finally {
      setTableBusy(false);
    }
  };

  const editForm = editModal?.form;

  return (
    <div className="flex flex-col gap-8">
      {mode !== "manage" ? (
        <section
          id="create"
          className="space-y-6 rounded-[var(--radius-lg)] border border-border bg-surface-strong p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Create new product
              </p>
              <h3 className="text-xl font-semibold text-foreground">Add product</h3>
            </div>
            {detailLoading ? (
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs text-muted">
                Preparing editor...
              </span>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Product name
              <Input
                placeholder="Enter product name"
                value={form.name}
                onChange={updateField("name")}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Price
              <Input
                placeholder="Enter price"
                inputMode="decimal"
                value={form.price}
                onChange={updateField("price")}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Stock
              <Input
                placeholder="Enter stock quantity"
                inputMode="numeric"
                value={form.stock}
                onChange={updateField("stock")}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Primary category
              <select
                value={form.categories[0] ?? ""}
                onChange={updateCategories}
                className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-3 text-sm text-foreground"
              >
                <option value="" disabled hidden>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Description
              <textarea
                placeholder="Describe the product"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="mt-3 min-h-[120px] w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-3 text-sm text-foreground"
              />
            </label>
            <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.tags.length === 0 ? (
                  <span className="text-xs text-muted">No tags added yet</span>
                ) : null}
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Flags</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, featured: event.target.checked }))
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.trending}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, trending: event.target.checked }))
                    }
                  />
                  Trending
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.flashSale}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, flashSale: event.target.checked }))
                    }
                  />
                  Flash sale
                </label>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Upload images
              </p>
              <input
                ref={createFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="sr-only"
                tabIndex={-1}
              />
              <button
                type="button"
                onClick={triggerCreateFileDialog}
                className="mt-3 flex h-16 w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border bg-surface-strong text-sm font-medium text-muted transition hover:border-foreground hover:text-foreground"
              >
                Tap to upload or drag files
              </button>
              <p className="mt-2 text-center text-xs text-muted">PNG or JPG, up to 5MB</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Image gallery</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {formImages.length === 0 ? (
                <div className="rounded-[var(--radius-md)] border border-border bg-white p-4 text-sm text-muted">
                  No images selected yet
                </div>
              ) : (
                formImages.map((image) => (
                  <div
                    key={image}
                    className="relative h-40 overflow-hidden rounded-[var(--radius-md)] border border-border"
                  >
                    <Image
                      src={image}
                      alt="Product preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                      onClick={() => removeImage(image)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleCreateSave} disabled={submitting}>
              {submitting ? "Saving..." : "Add Product"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={resetForm}
              disabled={submitting}
            >
              Clear
            </Button>
          </div>
        </section>
      ) : null}
      {mode !== "create" ? (
        <>
          {loading ? (
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface-strong p-6 text-sm text-muted">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Create your first product to start selling."
            />
          ) : (
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
                      disabled={tableBusy}
                      onChange={(event) =>
                        toggleFlag(product.id, "isFeatured", event.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={product.isTrending}
                      disabled={tableBusy}
                      onChange={(event) =>
                        toggleFlag(product.id, "isTrending", event.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={product.isFlashSale}
                      disabled={tableBusy}
                      onChange={(event) =>
                        toggleFlag(product.id, "isFlashSale", event.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={tableBusy}
                        onClick={() =>
                          requestConfirm({
                            title: "Delete product?",
                            description: `This will permanently remove ${product.name}.`,
                            confirmText: "Delete",
                            action: () => removeProduct(product.id),
                          })
                        }
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={detailLoading}
                        onClick={() => startEdit(product.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))}
              </Table>
              {tableBusy ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-white/70 text-sm font-medium">
                  Updating...
                </div>
              ) : null}
            </div>
          )}
          <PaginationButtons
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={tableBusy}
          />
        </>
      ) : null}
      {editModal && editForm ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-border bg-white p-6 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Edit product
                </p>
                <h3 className="text-xl font-semibold text-foreground">{editForm.name}</h3>
              </div>
              <Button type="button" variant="ghost" onClick={closeEditModal} disabled={editBusy}>
                Close
              </Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Product name
                <Input value={editForm.name} onChange={handleEditField("name")} />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Price
                <Input value={editForm.price} inputMode="decimal" onChange={handleEditField("price")} />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Stock
                <Input value={editForm.stock} inputMode="numeric" onChange={handleEditField("stock")} />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Primary category
                <select
                  value={editForm.categories[0] ?? ""}
                  onChange={updateEditCategories}
                  className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-3 text-sm text-foreground"
                >
                  <option value="" disabled hidden>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Description
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditModal((prev) =>
                      prev ? { ...prev, form: { ...prev.form, description: event.target.value } } : prev,
                    )
                  }
                  className="mt-3 min-h-[120px] w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-3 text-sm text-foreground"
                />
              </label>
              <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {editForm.tags.length === 0 ? (
                    <span className="text-xs text-muted">No tags added yet</span>
                  ) : null}
                  {editForm.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-xs"
                      onClick={() => removeEditTag(tag)}
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={editTagInput}
                    onChange={(event) => setEditTagInput(event.target.value)}
                  />
                  <Button type="button" onClick={addEditTag}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Flags</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.featured}
                      onChange={(event) =>
                        setEditModal((prev) =>
                          prev ? { ...prev, form: { ...prev.form, featured: event.target.checked } } : prev,
                        )
                      }
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.trending}
                      onChange={(event) =>
                        setEditModal((prev) =>
                          prev ? { ...prev, form: { ...prev.form, trending: event.target.checked } } : prev,
                        )
                      }
                    />
                    Trending
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.flashSale}
                      onChange={(event) =>
                        setEditModal((prev) =>
                          prev ? { ...prev, form: { ...prev.form, flashSale: event.target.checked } } : prev,
                        )
                      }
                    />
                    Flash sale
                  </label>
                </div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Upload images
                </p>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditUpload}
                  className="sr-only"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  onClick={triggerEditFileDialog}
                  className="mt-3 flex h-16 w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border bg-surface-strong text-sm font-medium text-muted transition hover:border-foreground hover:text-foreground"
                >
                  Tap to upload or drag files
                </button>
                <p className="mt-2 text-center text-xs text-muted">PNG or JPG, up to 5MB</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Image gallery</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {editModal.images.length === 0 ? (
                  <div className="rounded-[var(--radius-md)] border border-border bg-white p-4 text-sm text-muted">
                    No images selected yet
                  </div>
                ) : (
                  editModal.images.map((image) => (
                    <div
                      key={image}
                      className="relative h-40 overflow-hidden rounded-[var(--radius-md)] border border-border"
                    >
                      <Image
                        src={image}
                        alt="Product preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                        onClick={() => removeEditImage(image)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeEditModal} disabled={editBusy}>
                Cancel
              </Button>
              <Button type="button" onClick={handleEditSave} disabled={editBusy}>
                {editBusy ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
