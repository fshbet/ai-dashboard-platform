"use client";

import { KPISpec } from "../../lib/types";

interface Props { kpis: KPISpec[]; isDark: boolean; }

function formatValue(v: number, kpi: KPISpec): string {
  const n = Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  if (kpi.format === "currency") return `${kpi.prefix || "$"}${n}`;
  if (kpi.format === "percentage") return `${n}${kpi.suffix || "%"}`;
  return `${kpi.prefix || ""}${n}${kpi.suffix || ""}`;
}

function demoValue(kpi: KPISpec): number {
  const seed = kpi.kpi_id.charCodeAt(0) + kpi.title.length;
  if (kpi.format === "percentage") return 45 + (seed % 50);
  if (kpi.format === "currency") return 120000 + (seed * 8341) % 5000000;
  if (kpi.aggregation === "count" || kpi.aggregation === "count_distinct") return 100 + (seed * 37) % 50000;
  return 1000 + (seed * 1247) % 999000;
}

function demoTrend(kpi: KPISpec) {
  const seed = kpi.kpi_id.charCodeAt(1) || 5;
  return { value: 2 + (seed % 18), positive: seed % 3 !== 0 };
}

export default function KPIGrid({ kpis, isDark }: Props) {
  if (!kpis?.length) return <p className="text-sm text-gray-400 py-4">No KPIs defined for this view.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi) => {
        const value = demoValue(kpi);
        const trend = demoTrend(kpi);
        return (
          <div key={kpi.kpi_id} className={`relative overflow-hidden rounded-xl p-4 border transition-all hover:shadow-md group
            ${isDark ? "bg-gray-800/60 border-gray-700/50 hover:border-gray-600" : "bg-white border-gray-200 hover:border-brand-200"}`}>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className={`text-xs font-medium uppercase tracking-wide truncate mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {kpi.title}
            </p>
            <p className={`text-2xl font-bold mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
              {formatValue(value, kpi)}
            </p>
            <div className="flex items-center gap-1">
              <span className={`flex items-center text-xs font-medium gap-0.5 ${trend.positive ? "text-emerald-500" : "text-red-500"}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={trend.positive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                {trend.value}%
              </span>
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>vs last period</span>
            </div>
            {kpi.business_meaning && (
              <p className={`text-xs mt-2 leading-relaxed line-clamp-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {kpi.business_meaning}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
