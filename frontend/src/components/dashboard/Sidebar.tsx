"use client";

import Link from "next/link";
import { DashboardSpec, InsightSpec } from "../../lib/types";
import { useDashboardStore } from "../../store/dashboardStore";

export default function Sidebar({ spec }: { spec: DashboardSpec }) {
  const { isDarkMode, toggleDarkMode } = useDashboardStore();
  const topInsights = [...spec.insights].sort((a, b) => b.business_impact_score - a.business_impact_score).slice(0, 6);

  const card = `rounded-xl border p-4 space-y-3 ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`;
  const label = `text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-500" : "text-gray-400"}`;
  const muted = `text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`;

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-4 overflow-y-auto pb-6 scrollbar-thin">
      <nav className={card}>
        <p className={label}>Navigation</p>
        <Link href="/" className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-600"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          New Dashboard
        </Link>
      </nav>

      <div className={card}>
        <p className={label}>Dataset</p>
        <div className="space-y-2 text-sm">
          <div><p className={muted}>Domain</p><p className="font-medium">{spec.domain}</p></div>
          <div><p className={muted}>Rows</p><p className="font-medium">{spec.dataset_meta.row_count?.toLocaleString() || "—"}</p></div>
          <div>
            <p className={muted}>Dimensions</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {spec.dataset_meta.dimensions.slice(0, 4).map((d) => (
                <span key={d} className={`text-xs px-1.5 py-0.5 rounded font-medium ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{d}</span>
              ))}
              {spec.dataset_meta.dimensions.length > 4 && <span className={`text-xs ${muted}`}>+{spec.dataset_meta.dimensions.length - 4} more</span>}
            </div>
          </div>
          <div>
            <p className={muted}>Measures</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {spec.dataset_meta.measures.slice(0, 4).map((m) => (
                <span key={m} className={`text-xs px-1.5 py-0.5 rounded font-medium ${isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-600"}`}>{m}</span>
              ))}
            </div>
          </div>
        </div>
        {spec.validation && (
          <div>
            <p className={muted}>AI Quality Score</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${spec.validation.quality_score}%` }} />
              </div>
              <span className="text-sm font-bold text-brand-500">{spec.validation.quality_score}</span>
            </div>
          </div>
        )}
      </div>

      {topInsights.length > 0 && (
        <div className={card}>
          <p className={label}>Key Insights</p>
          {topInsights.map((insight) => (
            <InsightCard key={insight.insight_id} insight={insight} isDark={isDarkMode} />
          ))}
        </div>
      )}

      <button onClick={toggleDarkMode} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all
        ${isDarkMode ? "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
        {isDarkMode
          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        }
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </aside>
  );
}

function InsightCard({ insight, isDark }: { insight: InsightSpec; isDark: boolean }) {
  const color = insight.business_impact_score >= 8 ? "text-red-500" : insight.business_impact_score >= 5 ? "text-amber-500" : "text-emerald-500";
  return (
    <div className={`p-2.5 rounded-lg border ${isDark ? "border-gray-700/50 bg-gray-700/30" : "border-gray-100 bg-gray-50"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs font-medium leading-snug flex-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>{insight.title}</p>
        <span className={`text-xs font-bold shrink-0 ${color}`}>{insight.business_impact_score}/10</span>
      </div>
      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{insight.business_meaning}</p>
    </div>
  );
}
