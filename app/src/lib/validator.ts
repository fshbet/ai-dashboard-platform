import type { DashboardSpec, ChartSpec, KPISpec, ValidationResult } from "./types";

const TAB_LIMITS: Record<string, number> = {
  c_suite: 6,
  top_management: 8,
  middle_management: 10,
  end_users: 12,
};

export function validateAndClean(
  spec: DashboardSpec,
  columnSet: Set<string>
): DashboardSpec {
  const warnings: string[] = [];
  const errors: string[] = [];

  spec.kpis = deduplicateKPIs(spec.kpis, warnings);
  spec.kpis = spec.kpis.filter((kpi) => {
    if (kpi.field && !columnSet.has(kpi.field)) {
      warnings.push(`KPI "${kpi.title}" references unknown field "${kpi.field}" — removed`);
      return false;
    }
    return true;
  });

  spec.charts = spec.charts.filter((chart) => {
    const bad = getHallucinatedFields(chart, columnSet);
    if (bad.length > 0) {
      warnings.push(`Chart "${chart.title}" has unknown fields [${bad.join(", ")}] — removed`);
      return false;
    }
    return true;
  });

  spec.charts = spec.charts.map((chart) => {
    if (
      (chart.chart_type === "pie" || chart.chart_type === "donut") &&
      chart.series_fields &&
      chart.series_fields.length > 5
    ) {
      warnings.push(`Chart "${chart.title}" pie limited to 5 categories`);
      return { ...chart, series_fields: chart.series_fields.slice(0, 5) };
    }
    return chart;
  });

  spec.tabs = spec.tabs.map((tab) => {
    const limit = TAB_LIMITS[tab.audience] || 10;
    if (tab.chart_ids.length > limit) {
      warnings.push(
        `Tab "${tab.label}" (${tab.audience}) capped from ${tab.chart_ids.length} to ${limit} charts`
      );
      const kept = new Set(tab.chart_ids.slice(0, limit));
      return {
        ...tab,
        chart_ids: tab.chart_ids.slice(0, limit),
        layout: tab.layout.filter((item) => kept.has(item.chart_id)),
      };
    }
    return tab;
  });

  const quality_score = computeQuality(spec, warnings, errors);

  spec.validation = { is_valid: errors.length === 0, warnings, errors, quality_score };
  return spec;
}

export function sanitizeSpec(spec: Partial<DashboardSpec>): DashboardSpec {
  return {
    dashboard_id: spec.dashboard_id || "unknown",
    title: spec.title || "Dashboard",
    description: spec.description || "",
    domain: spec.domain || "General",
    business_goal: spec.business_goal || "",
    theme: spec.theme || "modern",
    created_at: spec.created_at || new Date().toISOString(),
    dataset_summary: spec.dataset_summary || {
      filename: "",
      row_count: 0,
      columns: [],
      dimensions: [],
      measures: [],
    },
    kpis: spec.kpis || [],
    charts: spec.charts || [],
    insights: spec.insights || [],
    global_filters: spec.global_filters || [],
    tabs: spec.tabs || [],
    validation: spec.validation || {
      is_valid: true,
      warnings: [],
      errors: [],
      quality_score: 50,
    },
  };
}

function deduplicateKPIs(kpis: KPISpec[], warnings: string[]): KPISpec[] {
  const seen = new Map<string, KPISpec>();
  for (const kpi of kpis) {
    const key = kpi.title.toLowerCase().trim();
    if (seen.has(key)) {
      warnings.push(`Duplicate KPI "${kpi.title}" removed`);
    } else {
      seen.set(key, kpi);
    }
  }
  return Array.from(seen.values());
}

function getHallucinatedFields(chart: ChartSpec, columnSet: Set<string>): string[] {
  const fields = [
    chart.x_field,
    chart.y_field,
    chart.group_by,
    chart.category_field,
    chart.value_field,
    ...(chart.series_fields || []),
  ].filter(Boolean) as string[];

  return fields.filter((f) => f && !columnSet.has(f));
}

function computeQuality(
  spec: DashboardSpec,
  warnings: string[],
  errors: string[]
): number {
  let score = 100;
  score -= errors.length * 15;
  score -= warnings.length * 5;
  if (spec.kpis.length < 2) score -= 10;
  if (spec.charts.length < 3) score -= 10;
  if (spec.insights.length < 1) score -= 5;
  if (spec.tabs.length < 4) score -= 5;
  return Math.max(0, Math.min(100, score));
}
