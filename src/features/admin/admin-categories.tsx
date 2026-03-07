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
      push({ title: "Category added" });
    } catch (error) {
      push({ title: "Create failed", description: resolveErrorMessage(error) });
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCategory({ id }).unwrap();
      push({ title: "Category removed" });
    } catch (error) {
      push({ title: "Delete failed", description: resolveErrorMessage(error) });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface-strong p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="Category name"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          />
          <Button type="button" onClick={create} disabled={creating}>
            {creating ? "Adding" : "Add Category"}
          </Button>
        </div>
      </div>
      {isFetching ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-white p-4 text-sm text-muted">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Create categories to organize products."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-white p-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{category.name}</p>
                <p className="text-xs text-muted">{category.slug}</p>
              </div>
              <Button
                variant="ghost"
                type="button"
                onClick={() => remove(category.id)}
                disabled={deleting}
              >
                {deleting ? "Removing" : "Delete"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
