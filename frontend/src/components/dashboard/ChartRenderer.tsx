"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { ChartSpec } from "../../lib/types";
import { buildEChartsOption } from "../../lib/chartAdapters";

const ReactECharts = lazy(() => import("echarts-for-react"));

interface Props { chart: ChartSpec; isDark: boolean; height?: number; }

export default function ChartRenderer({ chart, isDark, height = 280 }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const option = buildEChartsOption(chart, isDark);

  const sizeClass = { small: "col-span-1", medium: "col-span-2", large: "col-span-2 md:col-span-3", full: "col-span-full" }[chart.recommended_size] || "col-span-2";

  return (
    <div className={`${sizeClass} relative overflow-hidden rounded-xl border transition-all
      ${isDark ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200"}`}>
      <div className={`px-4 pt-4 pb-2 border-b ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
        <h3 className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-800"}`}>{chart.title}</h3>
        {chart.insight_text && (
          <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{chart.insight_text}</p>
        )}
      </div>
      <div className="px-2 py-2">
        {mounted
          ? <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg" style={{ height }} />}>
              <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate theme={isDark ? "dark" : undefined} />
            </Suspense>
          : <div className="animate-pulse bg-gray-100 dark:bg-gray-700/50 rounded-lg" style={{ height }} />
        }
      </div>
      {chart.priority_score >= 8 && (
        <div className="absolute top-3 right-3">
          <span className="text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-medium">Key</span>
        </div>
      )}
    </div>
  );
}
