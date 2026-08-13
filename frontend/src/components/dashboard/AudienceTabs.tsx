"use client";

import { AudienceTab, DashboardSpec } from "../../lib/types";
import { useDashboardStore } from "../../store/dashboardStore";

const TAB_CONFIG: { key: AudienceTab; icon: string; shortLabel: string }[] = [
  { key: "c_suite",           icon: "🏛️", shortLabel: "C-Suite"   },
  { key: "top_management",    icon: "📊", shortLabel: "Top Mgmt"  },
  { key: "middle_management", icon: "📈", shortLabel: "Mid Mgmt"  },
  { key: "end_users",         icon: "🔍", shortLabel: "End Users" },
];

export default function AudienceTabs({ spec }: { spec: DashboardSpec }) {
  const { activeTab, setActiveTab, isDarkMode } = useDashboardStore();

  return (
    <div className={`flex gap-1 p-1 rounded-xl border
      ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-gray-100 border-gray-200"}`}>
      {TAB_CONFIG.map(({ key, icon, shortLabel }) => {
        const tab = spec.tabs[key];
        const isActive = activeTab === key;
        const count = (tab?.kpi_ids?.length || 0) + (tab?.chart_ids?.length || 0);
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                : isDarkMode
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
              }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{tab?.label || shortLabel}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal
              ${isActive ? "bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
