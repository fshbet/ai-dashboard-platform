"use client";

import type { GlobalFilter } from "@/lib/types";
import { useDashboardStore } from "@/store/dashboardStore";

export default function GlobalFilters({ filters }: { filters: GlobalFilter[] }) {
  const { activeFilters, setFilter, clearFilters } = useDashboardStore();

  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mr-1">
        Filters
      </span>

      {filters.map((filter) => {
        if (filter.filter_type === "select" && filter.options) {
          return (
            <div key={filter.filter_id} className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400">{filter.label}</label>
              <select
                value={(activeFilters[filter.filter_id] as string) || ""}
                onChange={(e) => setFilter(filter.filter_id, e.target.value || null)}
                className="text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">All</option>
                {filter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          );
        }

        if (filter.filter_type === "date_range") {
          return (
            <div key={filter.filter_id} className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400">{filter.label}</label>
              <input
                type="date"
                className="text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
                onChange={(e) => setFilter(filter.filter_id, e.target.value)}
              />
            </div>
          );
        }

        if (filter.filter_type === "number_range") {
          return (
            <div key={filter.filter_id} className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400">{filter.label}</label>
              <input
                type="number"
                placeholder="Min"
                className="w-20 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
                onChange={(e) => setFilter(`${filter.filter_id}_min`, e.target.value)}
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                className="w-20 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
                onChange={(e) => setFilter(`${filter.filter_id}_max`, e.target.value)}
              />
            </div>
          );
        }

        return null;
      })}

      {Object.keys(activeFilters).length > 0 && (
        <button
          onClick={clearFilters}
          className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
