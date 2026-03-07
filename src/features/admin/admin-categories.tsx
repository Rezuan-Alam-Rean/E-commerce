"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";

type Category = { id: string; name: string; slug: string };

export function AdminCategories() {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.success ? data.data : []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const create = async () => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      push({ title: "Create failed", description: data?.error ?? "Try again." });
      return;
    }

    setName("");
    push({ title: "Category added" });
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      push({ title: "Delete failed" });
      return;
    }
    push({ title: "Category removed" });
    load();
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
          <Button type="button" onClick={create}>
            Add Category
          </Button>
        </div>
      </div>
      {categories.length === 0 ? (
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
              <Button variant="ghost" type="button" onClick={() => remove(category.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
