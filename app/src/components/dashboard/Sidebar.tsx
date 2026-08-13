"use client";

import Link from "next/link";
import type { DashboardSpec } from "@/lib/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { getExportUrl } from "@/lib/api-client";

export default function Sidebar({ spec }: { spec: DashboardSpec }) {
  const { isDarkMode, toggleDarkMode } = useDashboardStore();

  const topInsights = [...(spec.insights || [])]
    .sort((a, b) => b.business_impact_score - a.business_impact_score)
    .slice(0, 6);

  const quality = spec.validation?.quality_score ?? 0;
  const qualityColor =
    quality >= 80 ? "bg-green-500" : quality >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
      {/* Dataset card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wide mb-3">
          Dataset
        </h3>
        <div className="space-y-1.5 text-sm">
          <Row label="File" value={spec.dataset_summary.filename || "—"} />
          <Row label="Domain" value={spec.domain} />
          <Row label="Rows" value={spec.dataset_summary.row_count?.toLocaleString()} />
          <Row label="Dimensions" value={String(spec.dataset_summary.dimensions?.length || 0)} />
          <Row label="Measures" value={String(spec.dataset_summary.measures?.length || 0)} />
        </div>
      </div>

      {/* Quality score */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wide">
            AI Quality Score
          </h3>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{quality}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${qualityColor}`}
            style={{ width: `${quality}%` }}
          />
        </div>
        {spec.validation?.warnings?.length > 0 && (
          <p className="text-xs text-amber-500 mt-1">{spec.validation.warnings.length} warning(s)</p>
        )}
      </div>

      {/* Insights */}
      {topInsights.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wide mb-3">
            Top Insights
          </h3>
          <div className="space-y-3">
            {topInsights.map((ins) => (
              <div key={ins.insight_id} className="text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-300">{ins.title}</p>
                <p className="text-slate-400 mt-0.5 line-clamp-2">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
        <button
          onClick={toggleDarkMode}
          className="w-full text-sm text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <a
          href={getExportUrl(spec.dashboard_id)}
          download
          className="w-full text-sm text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
        >
          Export JSON
        </a>
        <Link
          href="/"
          className="w-full text-sm text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
        >
          New Dashboard
        </Link>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]" title={value}>{value || "—"}</span>
    </div>
  );
}
