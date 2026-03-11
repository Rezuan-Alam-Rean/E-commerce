"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    [searchValue, categoryValue],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/products${query}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, router]);

  const hasFilters = !!searchValue || !!categoryValue;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          {/* Search Icon */}
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            name="search"
            type="text"
            placeholder="Type product or ingredient..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.02)] font-english"
          />
          {/* Clear search button */}
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute inset-y-0 right-3 flex items-center p-1 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="relative sm:w-52">
          {/* Category Icon */}
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
            </svg>
          </div>
          <select
            name="category"
            value={categoryValue}
            onChange={(event) => setCategoryValue(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-[0_2px_8px_rgb(0,0,0,0.02)] cursor-pointer font-english"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            setSearchValue("");
            setCategoryValue("");
          }}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all font-english whitespace-nowrap ${hasFilters
              ? "border-gray-300 bg-gray-900 text-white hover:bg-black shadow-sm"
              : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50 cursor-not-allowed"
            }`}
          disabled={!hasFilters}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>

      {/* Active Filter Pills */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-english">Active:</span>
          {searchValue && (
            <span className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full font-english">
              &ldquo;{searchValue}&rdquo;
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </span>
          )}
          {categoryValue && (
            <span className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full font-english">
              {categoryValue}
              <button
                type="button"
                onClick={() => setCategoryValue("")}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
