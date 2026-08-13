"use client";

import type { KPISpec } from "@/lib/types";

function demoValue(kpi: KPISpec): number {
  let h = 0;
  for (let i = 0; i < kpi.kpi_id.length; i++)
    h = (Math.imul(31, h) + kpi.kpi_id.charCodeAt(i)) | 0;
  const r = (h >>> 0) / 0xffffffff;
  if (kpi.format === "percentage") return Math.round(r * 80 + 10);
  if (kpi.format === "currency") return Math.round(r * 900_000 + 50_000);
  return Math.round(r * 9_000 + 500);
}

function formatValue(value: number, kpi: KPISpec): string {
  if (kpi.format === "currency") {
    if (value >= 1_000_000) return `${kpi.prefix || "$"}${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${kpi.prefix || "$"}${(value / 1_000).toFixed(1)}K`;
    return `${kpi.prefix || "$"}${value.toLocaleString()}`;
  }
  if (kpi.format === "percentage") return `${value}%`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function demoTrend(kpiId: string): { pct: number; up: boolean } {
  let h = 0;
  for (let i = 0; i < kpiId.length; i++)
    h = (Math.imul(37, h) + kpiId.charCodeAt(i)) | 0;
  const r = (h >>> 0) / 0xffffffff;
  const pct = Math.round(r * 30 - 10);
  return { pct: Math.abs(pct), up: pct >= 0 };
}

export default function KPIGrid({ kpis }: { kpis: KPISpec[] }) {
  const sorted = [...kpis].sort((a, b) => b.priority_score - a.priority_score);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {sorted.map((kpi) => {
        const value = demoValue(kpi);
        const { pct, up } = demoTrend(kpi.kpi_id);

        return (
          <div
            key={kpi.kpi_id}
            className="group bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 truncate" title={kpi.title}>
              {kpi.title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">
              {formatValue(value, kpi)}
              {kpi.suffix && <span className="text-sm font-normal ml-0.5">{kpi.suffix}</span>}
            </p>
            {kpi.comparison_period && (
              <p className={`text-xs font-medium ${up ? "text-green-500" : "text-red-500"}`}>
                {up ? "+" : "-"}{pct}% vs {kpi.comparison_period}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
