"use client";

import { useEffect, useState } from "react";
import type { ChartSpec } from "@/lib/types";
import { buildEChartsOption } from "@/lib/chartAdapters";
import { useDashboardStore } from "@/store/dashboardStore";

const SIZE_CLASS: Record<string, string> = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-3",
  full: "col-span-4",
};

const HEIGHT_CLASS: Record<string, string> = {
  small: "h-52",
  medium: "h-72",
  large: "h-80",
  full: "h-96",
};

export default function ChartRenderer({ chart }: { chart: ChartSpec }) {
  const { isDarkMode } = useDashboardStore();
  const [ReactECharts, setReactECharts] = useState<React.ComponentType<{
    option: object;
    style?: React.CSSProperties;
    theme?: string;
    opts?: object;
  }> | null>(null);

  useEffect(() => {
    import("echarts-for-react").then((mod) => setReactECharts(() => mod.default));
  }, []);

  const option = buildEChartsOption(chart, isDarkMode);
  const sizeClass = SIZE_CLASS[chart.recommended_size] || "col-span-2";
  const heightClass = HEIGHT_CLASS[chart.recommended_size] || "h-72";

  return (
    <div className={`${sizeClass} bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
            {chart.title}
          </h3>
          {chart.insight_summary && (
            <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{chart.insight_summary}</p>
          )}
        </div>
        {chart.priority_score >= 8 && (
          <span className="shrink-0 ml-2 text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-medium">
            Key
          </span>
        )}
      </div>

      {ReactECharts ? (
        <ReactECharts
          option={option}
          style={{ height: { small: "208px", medium: "288px", large: "320px", full: "384px" }[chart.recommended_size] || "288px", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      ) : (
        <div className={`${heightClass} rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse`} />
      )}
    </div>
  );
}
