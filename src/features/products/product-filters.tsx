"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string };

type ProductFiltersProps = {
  search?: string;
  category?: string;
  categories: Category[];
};

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function ProductFilters({ search, category, categories }: ProductFiltersProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search ?? "");
  const [categoryValue, setCategoryValue] = useState(category ?? "");

  const query = useMemo(
    () => buildQuery({ search: searchValue.trim() || undefined, category: categoryValue || undefined, page: "1" }),
    [searchValue, categoryValue]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/products${query}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, router]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Search
        <Input
          name="search"
          placeholder="Search products"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Category
        <select
          name="category"
          value={categoryValue}
          onChange={(event) => setCategoryValue(event.target.value)}
          className="rounded-full border border-border bg-surface-strong px-4 py-3 text-sm text-foreground"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="rounded-full border border-border bg-surface-strong px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em]"
        onClick={() => {
          setSearchValue("");
          setCategoryValue("");
        }}
      >
        Clear
      </button>
    </div>
  );
}
