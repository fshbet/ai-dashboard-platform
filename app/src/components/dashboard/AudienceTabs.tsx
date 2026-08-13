"use client";

import type { TabSpec } from "@/lib/types";
import { useDashboardStore } from "@/store/dashboardStore";

const AUDIENCE_ICONS: Record<string, string> = {
  c_suite: "C",
  top_management: "TM",
  middle_management: "MM",
  end_users: "EU",
};

const AUDIENCE_COLORS: Record<string, string> = {
  c_suite: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  top_management: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  middle_management: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  end_users: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function AudienceTabs({ tabs }: { tabs: TabSpec[] }) {
  const { activeTab, setActiveTab } = useDashboardStore();

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.tab_id;
        return (
          <button
            key={tab.tab_id}
            onClick={() => setActiveTab(tab.tab_id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isActive
                ? "bg-brand-500 text-white shadow-md shadow-brand-200 dark:shadow-brand-900"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                isActive ? "bg-white/20 text-white" : AUDIENCE_COLORS[tab.audience]
              }`}
            >
              {AUDIENCE_ICONS[tab.audience] || "?"}
            </span>
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.chart_ids.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
