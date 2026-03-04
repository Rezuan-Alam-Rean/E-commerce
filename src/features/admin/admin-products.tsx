"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductSummary } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

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

export function AdminProducts({ mode = "all" }: { mode?: AdminProductsMode }) {
  const { push } = useToast();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUploads, setImageUploads] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");

  const load = async () => {
    const [productRes, categoryRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ]);
    const data = await productRes.json();
    const catData = await categoryRes.json();
    setProducts(data.success ? data.data.items : []);
    setCategories(catData.success ? catData.data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, page]);

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

  const saveProduct = async () => {
    const categories = form.categories;
    const tags = form.tags;
    const images = [...imageUploads];
    const description = form.description.trim();

    if (!form.name.trim()) {
      push({ title: "Name required", description: "Enter a product name." });
      return;
    }
    if (!form.price || Number.isNaN(Number(form.price))) {
      push({ title: "Price required", description: "Enter a valid price." });
      return;
    }
    if (!form.stock || Number.isNaN(Number(form.stock))) {
      push({ title: "Stock required", description: "Enter a valid stock count." });
      return;
    }
    if (categories.length === 0) {
      push({ title: "Category required", description: "Select a category." });
      return;
    }
    if (images.length === 0 && !editingId) {
      push({ title: "Image required", description: "Upload at least one image." });
      return;
    }

    if (!editingId && description.length < 10) {
      push({ title: "Description too short", description: "Use at least 10 characters." });
      return;
    }

    const payload = {
      name: form.name,
      ...(description ? { description } : {}),
      price: Number(form.price),
      stock: Number(form.stock),
      images,
      categories,
      tags,
      isFeatured: form.featured,
      isTrending: form.trending,
      isFlashSale: form.flashSale,
    };

    const res = await fetch(
      editingId ? `/api/products/${editingId}` : "/api/products",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      push({ title: "Create failed", description: data?.error ?? "Check product fields." });
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setImageUploads([]);
    setTagInput("");
    push({ title: editingId ? "Product updated" : "Product created" });
    load();
  };

  const startEdit = (product: ProductSummary) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      categories: product.categories,
      tags: product.tags,
      featured: product.isFeatured,
      trending: product.isTrending,
      flashSale: product.isFlashSale,
    });
    setImageUploads([]);
    setTagInput("");
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
          setImageUploads((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProduct = async (productId: string) => {
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      push({ title: "Delete failed" });
      return;
    }
    push({ title: "Product deleted" });
    load();
  };

  const toggleFlag = async (
    productId: string,
    field: "isFeatured" | "isTrending" | "isFlashSale",
    value: boolean
  ) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      push({ title: "Update failed" });
      return;
    }
    load();
  };

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      {mode !== "manage" ? (
        <div id="create" className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface-strong p-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Product name
            <Input placeholder="Name" value={form.name} onChange={updateField("name")} required />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Price
            <Input
              placeholder="Price"
              value={form.price}
              onChange={updateField("price")}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Stock
            <Input
              placeholder="Stock"
              value={form.stock}
              onChange={updateField("stock")}
            />
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="h-12 rounded-full border border-border bg-surface-strong px-4 text-sm"
          />
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Categories
            </p>
            <select
              value={form.categories[0] ?? ""}
              onChange={updateCategories}
              className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-surface-strong px-3 py-3 text-sm"
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
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Tags
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
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
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-strong p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Flags
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, featured: event.target.checked }))
                  }
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.trending}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, trending: event.target.checked }))
                  }
                />
                Trending
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.flashSale}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, flashSale: event.target.checked }))
                  }
                />
                Flash Sale
              </label>
            </div>
          </div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Description
            <Input
              placeholder="Description"
              value={form.description}
              onChange={updateField("description")}
              required
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={saveProduct}>
              {editingId ? "Update Product" : "Add Product"}
            </Button>
            {editingId ? (
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
          {imageUploads.length > 0 ? (
            <div className="rounded-[var(--radius-md)] border border-border bg-white p-3 text-xs text-muted">
              {imageUploads.length} image(s) queued for upload
            </div>
          ) : null}
        </div>
      ) : null}
      {mode !== "create" ? (
        <>
          {products.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Create your first product to start selling."
            />
          ) : (
            <Table headers={["Product", "Price", "Stock", "Featured", "Trending", "Flash", "Actions"]}>
              {paged.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={product.isFeatured}
                      onChange={(event) =>
                        toggleFlag(product.id, "isFeatured", event.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={product.isTrending}
                      onChange={(event) =>
                        toggleFlag(product.id, "isTrending", event.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={product.isFlashSale}
                      onChange={(event) =>
                        toggleFlag(product.id, "isFlashSale", event.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" type="button" onClick={() => removeProduct(product.id)}>
                      Delete
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => startEdit(product)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
          {products.length > PAGE_SIZE ? (
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1"
                  disabled={page === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="rounded-full border border-border px-3 py-1"
                  disabled={page === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
