"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { pollDashboard } from "../../../lib/api";
import { useDashboardStore } from "../../../store/dashboardStore";
import AudienceTabs from "../../../components/dashboard/AudienceTabs";
import KPIGrid from "../../../components/dashboard/KPIGrid";
import ChartRenderer from "../../../components/dashboard/ChartRenderer";
import GlobalFilters from "../../../components/dashboard/GlobalFilters";
import Sidebar from "../../../components/dashboard/Sidebar";
import ExportButton from "../../../components/ui/ExportButton";

const AI_STEPS = [
  "Understanding dataset structure...",
  "Generating KPIs and insights...",
  "Planning visualizations...",
  "Mapping audience segments...",
  "Composing layout...",
];

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    spec, isGenerating, generationProgress, generationError,
    activeTab, isDarkMode, sidebarOpen,
    setSpec, setGenerating, setGenerationError, setGenerationProgress,
    setDashboardId, toggleSidebar,
  } = useDashboardStore();

  const polled = useRef(false);

  useEffect(() => {
    if (!id || spec?.dashboard_id === id || polled.current) return;
    polled.current = true;
    setDashboardId(id);
    setGenerating(true);

    pollDashboard(id, (attempt) => setGenerationProgress(Math.min(attempt * 5, 90)))
      .then((result) => {
        if (result.status === "ready" && result.spec) setSpec(result.spec);
        else setGenerationError(result.error || "Generation failed");
      })
      .catch((err) => setGenerationError(err.message));
  }, [id]);

  const dc = isDarkMode ? "dark" : "";

  if (generationError) return (
    <div className={`${dc} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950`}>
      <div className="text-center space-y-3 max-w-md p-8">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generation Failed</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{generationError}</p>
        <a href="/" className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium">Try Again</a>
      </div>
    </div>
  );

  if (isGenerating || !spec) return (
    <div className={`${dc} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950`}>
      <div className="text-center space-y-6 max-w-sm w-full px-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-brand-200 dark:border-brand-900 rounded-full" />
          <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Pipeline Running</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyzing dataset and generating insights...</p>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${generationProgress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400">{/* */}<span>Processing</span><span>{generationProgress}%</span></div>
        </div>
        <div className="text-xs space-y-0.5">
          {AI_STEPS.map((step, i) => (
            <p key={step} className={generationProgress > i * 18 ? "text-brand-500" : "text-gray-400 dark:text-gray-600"}>
              {generationProgress > i * 18 ? "✓" : "○"} {step}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  const currentTab = spec.tabs[activeTab];
  const tabKPIs = spec.kpis.filter((k) => currentTab.kpi_ids.includes(k.kpi_id));
  const tabCharts = spec.charts.filter((c) => currentTab.chart_ids.includes(c.chart_id));

  return (
    <div className={`${dc} min-h-screen bg-gray-50 dark:bg-gray-950`}>
      {/* Header */}
      <header className={`h-14 border-b sticky top-0 z-20 flex items-center px-4 gap-3
        ${isDarkMode ? "bg-gray-900/90 border-gray-800 backdrop-blur-sm" : "bg-white/90 border-gray-200 backdrop-blur-sm"}`}>
        <button onClick={toggleSidebar} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{spec.domain}</h1>
            <p className={`text-xs truncate hidden sm:block ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{spec.business_goal}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {spec.validation && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:flex
              ${spec.validation.quality_score >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
              QA: {spec.validation.quality_score}/100
            </span>
          )}
          <ExportButton />
        </div>
      </header>

      {/* Body */}
      <div className="flex h-[calc(100vh-57px)]">
        {sidebarOpen && (
          <div className="px-4 py-4 overflow-y-auto hidden md:block">
            <Sidebar spec={spec} />
          </div>
        )}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          <AudienceTabs spec={spec} />
          <GlobalFilters filters={spec.global_filters} />
          <div>
            <h2 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentTab.label}</h2>
            {currentTab.description && <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{currentTab.description}</p>}
          </div>
          <KPIGrid kpis={tabKPIs} isDark={isDarkMode} />
          {tabCharts.length > 0
            ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-min">
                {[...tabCharts].sort((a, b) => b.priority_score - a.priority_score).map((chart) => (
                  <ChartRenderer key={chart.chart_id} chart={chart} isDark={isDarkMode} />
                ))}
              </div>
            : <div className={`text-center py-12 rounded-xl border ${isDarkMode ? "border-gray-700/50 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                <p className="text-sm">No charts assigned to this view.</p>
              </div>
          }
        </main>
      </div>
    </div>
  );
}
