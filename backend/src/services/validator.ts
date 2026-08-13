import { DashboardSpec, AudienceTab } from "../types";

const MAX_PIE_CATEGORIES = 5;

const TAB_CHART_LIMITS: Record<AudienceTab, number> = {
  end_users: 12,
  middle_management: 10,
  top_management: 8,
  c_suite: 6,
};

export function validateAndClean(spec: DashboardSpec, availableColumns: string[]): DashboardSpec {
  const warnings: string[] = [];
  let duplicatesRemoved = 0;
  let hallucinationsDetected = 0;
  let invalidChartsRemoved = 0;

  const columnSet = new Set(availableColumns.map((c) => c.toLowerCase()));

  // Deduplicate KPIs by title
  const seenKpiTitles = new Set<string>();
  spec.kpis = spec.kpis.filter((kpi) => {
    const key = kpi.title.toLowerCase().trim();
    if (seenKpiTitles.has(key)) { duplicatesRemoved++; return false; }
    seenKpiTitles.add(key);
    return true;
  });

  // Validate KPI field exists in dataset
  spec.kpis = spec.kpis.filter((kpi) => {
    if (!columnSet.has(kpi.field.toLowerCase())) {
      hallucinationsDetected++;
      warnings.push(`KPI "${kpi.title}" removed — field "${kpi.field}" not in dataset`);
      return false;
    }
    return true;
  });

  // Deduplicate charts by title
  const seenChartTitles = new Set<string>();
  spec.charts = spec.charts.filter((chart) => {
    const key = chart.title.toLowerCase().trim();
    if (seenChartTitles.has(key)) { duplicatesRemoved++; return false; }
    seenChartTitles.add(key);
    return true;
  });

  // Validate chart field references
  spec.charts = spec.charts.filter((chart) => {
    const refFields = Object.values(chart.fields).filter(Boolean) as string[];
    const invalid = refFields.filter((f) => !columnSet.has(f.toLowerCase()));
    if (invalid.length > 0) {
      hallucinationsDetected++;
      invalidChartsRemoved++;
      warnings.push(`Chart "${chart.title}" removed — invalid fields: [${invalid.join(", ")}]`);
      return false;
    }
    return true;
  });

  // Cap pie charts
  spec.charts = spec.charts.map((chart) => {
    if ((chart.type === "pie" || chart.type === "donut") && !chart.top_n) {
      chart.top_n = MAX_PIE_CATEGORIES;
      warnings.push(`Pie chart "${chart.title}" capped at ${MAX_PIE_CATEGORIES} categories`);
    }
    return chart;
  });

  // Validate insights
  spec.insights = spec.insights.filter((insight) => {
    const invalid = insight.required_fields.filter((f) => !columnSet.has(f.toLowerCase()));
    if (invalid.length > 0) {
      hallucinationsDetected++;
      return false;
    }
    return true;
  });

  // Enforce tab limits and clean orphaned refs
  const validKpiIds = new Set(spec.kpis.map((k) => k.kpi_id));
  const validChartIds = new Set(spec.charts.map((c) => c.chart_id));

  for (const tabKey of Object.keys(spec.tabs) as AudienceTab[]) {
    const tab = spec.tabs[tabKey];
    const limit = TAB_CHART_LIMITS[tabKey];
    tab.kpi_ids = tab.kpi_ids.filter((id) => validKpiIds.has(id));
    tab.chart_ids = tab.chart_ids.filter((id) => validChartIds.has(id));
    if (tab.chart_ids.length > limit) tab.chart_ids = tab.chart_ids.slice(0, limit);
    const allValid = new Set([...tab.kpi_ids, ...tab.chart_ids]);
    tab.layout = tab.layout.filter((item) => allValid.has(item.id));
  }

  // Quality score
  const totalIssues = duplicatesRemoved + hallucinationsDetected + invalidChartsRemoved;
  const quality_score = Math.min(
    100 - totalIssues * 5 + Math.min(spec.kpis.length * 2, 20) + Math.min(spec.charts.length, 20),
    100
  );

  spec.validation = {
    quality_score,
    duplicates_removed: duplicatesRemoved,
    hallucinations_detected: hallucinationsDetected,
    invalid_charts_removed: invalidChartsRemoved,
    warnings,
  };

  return spec;
}

export function sanitizeSpec(raw: unknown): DashboardSpec {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid dashboard spec: not an object");
  }
  const spec = raw as DashboardSpec;
  if (!Array.isArray(spec.kpis)) spec.kpis = [];
  if (!Array.isArray(spec.charts)) spec.charts = [];
  if (!Array.isArray(spec.insights)) spec.insights = [];
  if (!Array.isArray(spec.global_filters)) spec.global_filters = [];
  if (!spec.tabs) {
    const emptyTab = (label: string) => ({ label, description: "", kpi_ids: [], chart_ids: [], layout: [] });
    spec.tabs = {
      end_users: emptyTab("End Users"),
      middle_management: emptyTab("Middle Management"),
      top_management: emptyTab("Top Management"),
      c_suite: emptyTab("C-Suite / Leaders"),
    };
  }
  return spec;
}
