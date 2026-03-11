"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { CategorySummary } from "@/types/category";
import type { ProductMutationPayload } from "@/lib/store/api";
import { buildProductPayload, emptyDraft, resolveErrorMessage, type ProductFormDraft } from "./utils";

export type ProductCreateSectionProps = {
  categories: CategorySummary[];
  categoriesLoading: boolean;
  onCreate: (payload: ProductMutationPayload) => Promise<void>;
};

const fieldClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition font-english";
const labelClass = "flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english";

export function ProductCreateSection({ categories, categoriesLoading, onCreate }: ProductCreateSectionProps) {
  const { push } = useToast();
  const [draft, setDraft] = useState<ProductFormDraft>(emptyDraft);
  const [images, setImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = (field: keyof ProductFormDraft) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setDraft((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const updateCategories = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setDraft((prev) => ({ ...prev, categories: value ? [value] : [] }));
  };

  const addTag = () => {
    const value = tagInput.trim();
    setTagInput("");
    if (!value || draft.tags.includes(value)) {
      return;
    }
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, value] }));
  };

  const removeTag = (tag: string) => {
    setDraft((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
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

  const resetForm = () => {
    setDraft(emptyDraft);
    setImages([]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    const result = buildProductPayload(draft, images);
    if (!result.success) {
      push(result.error);
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(result.payload);
      push({ title: "Product created", description: `${result.payload.name} is now live.` });
      resetForm();
    } catch (error) {
      push({ title: "Save failed", description: resolveErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="create" className="flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">Add New Product</h2>
          <p className="text-sm text-gray-500 font-medium">Fill in the details below to list a new product in your store.</p>
        </div>
        {categoriesLoading && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 text-xs text-gray-400 font-semibold font-english">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></span>
            Loading categories...
          </div>
        )}
      </div>

      {/* Core Info Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6 md:p-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900 font-english mb-6 border-b border-gray-100 pb-4">
          Product Information
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Product Name
            <Input placeholder="e.g. Casual Linen Shirt" value={draft.name} onChange={updateField("name")} required className={fieldClass} />
          </label>
          <label className={labelClass}>
            Price (BDT)
            <Input placeholder="e.g. 1299.00" inputMode="decimal" value={draft.price} onChange={updateField("price")} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Stock Quantity
            <Input placeholder="e.g. 50" inputMode="numeric" value={draft.stock} onChange={updateField("stock")} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Primary Category
            <select
              value={draft.categories[0] ?? ""}
              onChange={updateCategories}
              className={fieldClass}
            >
              <option value="" disabled hidden>
                Select a category...
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 font-english md:col-span-2">
            Description
            <textarea
              placeholder="Describe the product — materials, sizing, use-cases..."
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              className={`${fieldClass} min-h-[120px] resize-y`}
            />
          </label>
        </div>
      </div>

      {/* Tags & Flags Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900 font-english mb-5 border-b border-gray-100 pb-3">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
            {draft.tags.length === 0 ? (
              <span className="text-xs text-gray-400">No tags added yet.</span>
            ) : null}
            {draft.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors font-english"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <span className="text-base leading-none">×</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type a tag..."
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors font-english whitespace-nowrap"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900 font-english mb-5 border-b border-gray-100 pb-3">
            Visibility Flags
          </h3>
          <div className="flex flex-col gap-4">
            {([
              { key: "featured", label: "Featured Product", desc: "Appears in the featured section on homepage" },
              { key: "trending", label: "Trending", desc: "Shows in trending / hot items grid" },
              { key: "flashSale", label: "Flash Sale", desc: "Highlights as a time-limited offer" },
            ] as const).map((flag) => (
              <label key={flag.key} className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-0.5">
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
                <div>
                  <p className="text-sm font-bold text-gray-900 font-english">{flag.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{flag.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-6 md:p-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900 font-english mb-6 border-b border-gray-100 pb-4">
          Product Images
        </h3>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="sr-only" tabIndex={-1} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 h-36 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 font-english">Click to upload images</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG or JPG, up to 5MB each</p>
          </div>
        </button>

        {images.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image} className="relative group rounded-2xl overflow-hidden h-48 border border-gray-100 shadow-sm">
                <Image src={image} alt="Product preview" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  onClick={() => removeImage(image)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-english"
        >
          {submitting ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></span>
              Saving Product...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              Publish Product
            </>
          )}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={submitting}
          className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-english"
        >
          Clear & Reset
        </button>
      </div>
    </section>
  );
}
