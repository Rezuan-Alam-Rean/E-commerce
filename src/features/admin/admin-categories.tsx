"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/lib/store/api";

type Category = { id: string; name: string; slug: string };

export function AdminCategories() {
  const { push } = useToast();
  const [name, setName] = useState("");
  const { data: categories = [], isFetching } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const resolveErrorMessage = (error: unknown) => {
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
    return "Try again.";
  };

  const create = async () => {
    const value = name.trim();
    if (!value) {
      push({ title: "Name required", description: "Enter a category name." });
      return;
    }
    try {
      await createCategory({ name: value }).unwrap();
      setName("");
      push({ title: "Category added successfully" });
    } catch (error) {
      push({ title: "Create failed", description: resolveErrorMessage(error) });
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCategory({ id }).unwrap();
      push({ title: "Category removed successfully" });
    } catch (error) {
      push({ title: "Delete failed", description: resolveErrorMessage(error) });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header & Create Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 font-english mb-1">Categories</h2>
          <p className="text-sm text-gray-500 font-medium">Manage product categories to organize your store.</p>
        </div>

        <div className="flex-1 max-w-md bg-white p-2 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-200 transition-all">
          <div className="flex gap-2">
            <Input
              placeholder="New category name..."
              value={name}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 placeholder:text-gray-400 font-english"
              onKeyDown={(e) => {
                if (e.key === 'Enter') create();
              }}
            />
            <button
              type="button"
              onClick={create}
              disabled={creating}
              className="flex-shrink-0 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-english"
            >
              {creating ? "Adding..." : "Add Category"}
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden">
        {isFetching ? (
          <div className="p-12 flex items-center justify-center text-gray-400 font-medium text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
              Loading categories...
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No categories found"
              description="Create your first category above to start organizing products."
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-gray-100 p-[1px]">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex flex-col justify-between bg-white p-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="mb-4">
                  <p className="text-lg font-bold text-gray-900 font-english mb-1">{category.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 inline-block px-2 py-0.5 rounded-md font-english truncate max-w-full">
                    /{category.slug}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                  <p className="text-xs text-gray-400 font-medium">ID: {category.id.slice(-6)}</p>
                  <button
                    type="button"
                    onClick={() => remove(category.id)}
                    disabled={deleting}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-english"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
