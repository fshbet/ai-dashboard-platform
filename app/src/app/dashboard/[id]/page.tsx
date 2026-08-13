"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/dashboardStore";
import { pollDashboard } from "@/lib/api-client";
import AudienceTabs from "@/components/dashboard/AudienceTabs";
import KPIGrid from "@/components/dashboard/KPIGrid";
import ChartRenderer from "@/components/dashboard/ChartRenderer";
import GlobalFilters from "@/components/dashboard/GlobalFilters";
import Sidebar from "@/components/dashboard/Sidebar";
import type { TabSpec } from "@/lib/types";

const STEPS = [
  "Understanding your data...",
  "Generating insights...",
  "Planning visualizations...",
  "Mapping audiences...",
  "Building layout...",
];

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    spec, setSpec,
    isGenerating, setIsGenerating,
    generationProgress, setGenerationProgress,
    generationError, setGenerationError,
    activeTab, isDarkMode,
  } = useDashboardStore();

  const pollingRef = useRef(false);

  useEffect(() => {
    if (spec?.dashboard_id === id) return;
    if (pollingRef.current) return;
    pollingRef.current = true;

    setIsGenerating(true);
    setGenerationError(null);

    pollDashboard(id, (attempt) => {
      setGenerationProgress(Math.min(attempt, STEPS.length - 1));
    })
      .then((result) => {
        setSpec(result);
        setIsGenerating(false);
      })
      .catch((err) => {
        setGenerationError(err.message || "Generation failed");
        setIsGenerating(false);
      });
  }, [id]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (isGenerating) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Building Your Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            5 AI agents are analyzing your data. This takes 30–90 seconds.
          </p>
          <div className="space-y-3 text-left">
            {STEPS.map((step, i) => {
              const done = i < generationProgress;
              const active = i === generationProgress;
              return (
                <div key={step} className={`flex items-center gap-3 transition-opacity ${i > generationProgress + 1 ? "opacity-30" : "opacity-100"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500" : active ? "bg-brand-500 animate-pulse" : "bg-slate-200 dark:bg-slate-700"}`}>
                    {done ? (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className={`text-xs font-bold ${active ? "text-white" : "text-slate-400"}`}>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${done ? "text-green-600 dark:text-green-400" : active ? "text-slate-800 dark:text-white font-medium" : "text-slate-400"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  if (generationError) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✗</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Generation Failed</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{generationError}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!spec) return null;

  const currentTab: TabSpec | undefined = spec.tabs.find((t) => t.tab_id === activeTab) ?? spec.tabs[0];
  const tabCharts = spec.charts.filter((c) => currentTab?.chart_ids.includes(c.chart_id));
  const tabKpis = spec.kpis.filter((k) => currentTab?.kpi_ids.includes(k.kpi_id));

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${isDarkMode ? "dark" : ""}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{spec.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{spec.description}</p>
        </div>
        <AudienceTabs tabs={spec.tabs} />
      </header>

      <div className="flex gap-6 p-6 max-w-screen-2xl mx-auto">
        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-5">
          {spec.global_filters?.length > 0 && (
            <GlobalFilters filters={spec.global_filters} />
          )}
          {tabKpis.length > 0 && <KPIGrid kpis={tabKpis} />}
          <div className="grid grid-cols-4 gap-4">
            {tabCharts.map((chart) => (
              <ChartRenderer key={chart.chart_id} chart={chart} />
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <Sidebar spec={spec} />
      </div>
    </div>
  );
}
