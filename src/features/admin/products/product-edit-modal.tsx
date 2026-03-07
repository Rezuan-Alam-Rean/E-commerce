"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategorySummary } from "@/types/category";
import type { ProductDetail } from "@/types/product";
import type { ProductMutationPayload } from "@/lib/store/api";
import { useToast } from "@/hooks/use-toast";
import { buildProductPayload, emptyDraft, resolveErrorMessage, type ProductFormDraft } from "./utils";

export type ProductEditModalProps = {
  productId: string | null;
  categories: CategorySummary[];
  onClose: () => void;
  fetchProductDetail: (id: string) => Promise<ProductDetail>;
  onSave: (id: string, payload: ProductMutationPayload) => Promise<void>;
};

export function ProductEditModal({ productId, categories, onClose, fetchProductDetail, onSave }: ProductEditModalProps) {
  const { push } = useToast();
  const [draft, setDraft] = useState<ProductFormDraft>(emptyDraft);
  const [images, setImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fetchDetailRef = useRef(fetchProductDetail);
  const pushRef = useRef(push);
  const closeRef = useRef(onClose);

  useEffect(() => {
    fetchDetailRef.current = fetchProductDetail;
  }, [fetchProductDetail]);

  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!productId) {
      setDraft(emptyDraft);
      setImages([]);
      setTagInput("");
      return;
    }

    let active = true;
    setLoading(true);
    fetchDetailRef.current(productId)
      .then((product) => {
        if (!active) {
          return;
        }
        setDraft({
          name: product.name,
          description: product.description ?? "",
          price: product.price.toFixed(2),
          stock: product.stock.toString(),
          categories: product.categories ?? [],
          tags: product.tags ?? [],
          featured: product.isFeatured,
          trending: product.isTrending,
          flashSale: product.isFlashSale,
        });
        setImages(product.images ?? []);
        setTagInput("");
      })
      .catch((error) => {
        if (active) {
          pushRef.current({ title: "Load failed", description: resolveErrorMessage(error) });
          closeRef.current();
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [productId]);

  if (!productId) {
    return null;
  }

  const updateField = (field: keyof ProductFormDraft) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setDraft((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const updateCategories = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setDraft((prev) => ({ ...prev, categories: value ? [value] : [] }));
  };

  const removeTag = (tag: string) => {
    setDraft((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
  };

  const addTag = () => {
    const value = tagInput.trim();
    setTagInput("");
    if (!value || draft.tags.includes(value)) {
      return;
    }
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, value] }));
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
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  const removeImage = (value: string) => {
    setImages((prev) => prev.filter((image) => image !== value));
  };

  const handleSave = async () => {
    const result = buildProductPayload(draft, images);
    if (!result.success) {
      push(result.error);
      return;
    }
    setSaving(true);
    try {
      await onSave(productId, result.payload);
      push({ title: "Product updated", description: `${result.payload.name} has been updated.` });
      onClose();
    } catch (error) {
      push({ title: "Update failed", description: resolveErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-border bg-white p-6 shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Edit product</p>
            <h3 className="text-xl font-semibold text-foreground">{draft.name || "Loading"}</h3>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Close
          </Button>
        </div>
        {loading ? (
          <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-white p-4 text-sm text-muted">
            Loading product details...
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Product name
                <Input value={draft.name} onChange={updateField("name")} />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Price
                <Input value={draft.price} inputMode="decimal" onChange={updateField("price")} />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Stock
                <Input value={draft.stock} inputMode="numeric" onChange={updateField("stock")} />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Primary category
                <select
                  value={draft.categories[0] ?? ""}
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
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Description
                <textarea
                  value={draft.description}
                  onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-3 min-h-[120px] w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-3 text-sm text-foreground"
                />
              </label>
              <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {draft.tags.length === 0 ? <span className="text-xs text-muted">No tags added yet</span> : null}
                  {draft.tags.map((tag) => (
                    <button key={tag} type="button" className="rounded-full border border-border px-3 py-1 text-xs" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input placeholder="Add tag" value={tagInput} onChange={(event) => setTagInput(event.target.value)} />
                  <Button type="button" onClick={addTag}>
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
                      checked={draft.featured}
                      onChange={(event) => setDraft((prev) => ({ ...prev, featured: event.target.checked }))}
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.trending}
                      onChange={(event) => setDraft((prev) => ({ ...prev, trending: event.target.checked }))}
                    />
                    Trending
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.flashSale}
                      onChange={(event) => setDraft((prev) => ({ ...prev, flashSale: event.target.checked }))}
                    />
                    Flash sale
                  </label>
                </div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Upload images</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="sr-only" tabIndex={-1} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
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
                {images.length === 0 ? (
                  <div className="rounded-[var(--radius-md)] border border-border bg-white p-4 text-sm text-muted">No images selected yet</div>
                ) : (
                  images.map((image) => (
                    <div key={image} className="relative h-40 overflow-hidden rounded-[var(--radius-md)] border border-border">
                      <Image src={image} alt="Product preview" fill className="object-cover" unoptimized />
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
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
