"use client";

import { GlobalFilter } from "../../lib/types";
import { useDashboardStore } from "../../store/dashboardStore";

export default function GlobalFilters({ filters }: { filters: GlobalFilter[] }) {
  const { activeFilters, setFilter, resetFilters, isDarkMode } = useDashboardStore();
  if (!filters?.length) return null;

  const baseClass = `text-sm px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500
    ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`;

  return (
    <div className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border
      ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
      <span className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        Filters
      </span>
      {filters.map((f) => (
        <div key={f.filter_id} className="flex items-center gap-1.5">
          <label className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{f.label}</label>
          {f.type === "date_range" && (
            <>
              <input type="date" className={baseClass} onChange={(e) => setFilter(f.filter_id, e.target.value)} />
              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>to</span>
              <input type="date" className={baseClass} onChange={(e) => setFilter(f.filter_id + "_end", e.target.value)} />
            </>
          )}
          {f.type === "select" && (
            <select className={baseClass} value={(activeFilters[f.filter_id] as string) || ""} onChange={(e) => setFilter(f.filter_id, e.target.value || undefined)}>
              <option value="">All</option>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
            </select>
          )}
          {f.type === "number_range" && (
            <>
              <input type="number" placeholder="Min" className={`${baseClass} w-20`} onChange={(e) => setFilter(f.filter_id + "_min", e.target.value)} />
              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>–</span>
              <input type="number" placeholder="Max" className={`${baseClass} w-20`} onChange={(e) => setFilter(f.filter_id + "_max", e.target.value)} />
            </>
          )}
        </div>
      ))}
      {Object.keys(activeFilters).length > 0 && (
        <button onClick={resetFilters} className="text-xs text-brand-500 hover:text-brand-600 font-medium ml-auto">Clear all</button>
      )}
    </div>
  );
}
