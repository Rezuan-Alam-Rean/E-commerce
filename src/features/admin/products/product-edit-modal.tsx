"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
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

const fieldClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition font-english";
const labelClass = "flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english";

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

  useEffect(() => { fetchDetailRef.current = fetchProductDetail; }, [fetchProductDetail]);
  useEffect(() => { pushRef.current = push; }, [push]);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

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
        if (!active) return;
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
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  if (!productId) return null;

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
    if (!value || draft.tags.includes(value)) return;
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, value] }));
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") setImages((prev) => [...prev, result]);
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
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 py-0 sm:py-8">
      <div className="flex flex-col w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] border border-gray-100 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english">
              Editing Product
            </p>
            <h3 className="text-xl font-black text-gray-900 font-english mt-0.5 truncate max-w-[250px] sm:max-w-sm">
              {loading ? "Loading..." : (draft.name || "Untitled")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-16 text-gray-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                Loading product details...
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Core Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>
                  Product Name
                  <Input value={draft.name} onChange={updateField("name")} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Price (BDT)
                  <Input value={draft.price} inputMode="decimal" onChange={updateField("price")} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Stock Quantity
                  <Input value={draft.stock} inputMode="numeric" onChange={updateField("stock")} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Primary Category
                  <select value={draft.categories[0] ?? ""} onChange={updateCategories} className={fieldClass}>
                    <option value="" disabled hidden>Select a category...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english md:col-span-2">
                  Description
                  <textarea
                    value={draft.description}
                    onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                    className={`${fieldClass} min-h-[120px] resize-y`}
                  />
                </label>
              </div>

              {/* Tags + Flags */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                    {draft.tags.length === 0 && <span className="text-xs text-gray-400">No tags yet.</span>}
                    {draft.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 transition-colors font-english"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} <span>×</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 font-english"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors font-english"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english mb-4">Visibility Flags</p>
                  <div className="flex flex-col gap-3">
                    {([
                      { key: "featured", label: "Featured" },
                      { key: "trending", label: "Trending" },
                      { key: "flashSale", label: "Flash Sale" },
                    ] as const).map((flag) => (
                      <label key={flag.key} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={draft[flag.key]}
                            onChange={(event) => setDraft((prev) => ({ ...prev, [flag.key]: event.target.checked }))}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 rounded-md border-2 border-gray-200 bg-white group-hover:border-gray-400 peer-checked:bg-gray-900 peer-checked:border-gray-900 transition-all flex items-center justify-center">
                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-800 font-english">{flag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english mb-3">Product Images</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="sr-only" tabIndex={-1} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  <span className="font-bold text-gray-600 font-english">Click to upload images</span>
                </button>
                {images.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {images.map((image) => (
                      <div key={image} className="relative group rounded-2xl overflow-hidden h-40 border border-gray-100 shadow-sm">
                        <Image src={image} alt="Product image" fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          onClick={() => removeImage(image)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && (
          <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 font-english"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-english"
            >
              {saving ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
