"use client";

import { getExportUrl } from "../../lib/api";
import { useDashboardStore } from "../../store/dashboardStore";

export default function ExportButton() {
  const { dashboardId, isDarkMode } = useDashboardStore();
  if (!dashboardId) return null;

  function handleExport() {
    const a = document.createElement("a");
    a.href = getExportUrl(dashboardId!);
    a.download = `dashboard_${dashboardId!.slice(0, 8)}.json`;
    a.click();
  }

  return (
    <button onClick={handleExport} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
      ${isDarkMode ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export JSON
    </button>
  );
}
