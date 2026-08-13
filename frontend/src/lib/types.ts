export type AggregationType =
  | "sum" | "avg" | "count" | "count_distinct" | "min" | "max" | "median";

export type ChartType =
  | "line" | "area" | "bar" | "bar_horizontal" | "stacked_bar"
  | "scatter" | "pie" | "donut" | "heatmap" | "treemap"
  | "funnel" | "gauge" | "histogram" | "box_plot" | "table";

export type FilterType = "date_range" | "select" | "multi_select" | "number_range";
export type AudienceTab = "end_users" | "middle_management" | "top_management" | "c_suite";
export type Theme = "executive" | "modern" | "minimal" | "dark";

export interface KPISpec {
  kpi_id: string;
  title: string;
  field: string;
  aggregation: AggregationType;
  format: "number" | "currency" | "percentage" | "duration";
  prefix?: string;
  suffix?: string;
  business_meaning: string;
  target_audiences: AudienceTab[];
}

export interface ChartSpec {
  chart_id: string;
  title: string;
  type: ChartType;
  fields: { x?: string; y?: string; y2?: string; series?: string; value?: string; label?: string };
  aggregation: AggregationType;
  filters?: string[];
  sort?: { field: string; direction: "asc" | "desc" };
  top_n?: number;
  insight_text?: string;
  priority_score: number;
  mobile_friendly: boolean;
  recommended_size: "small" | "medium" | "large" | "full";
  target_audiences: AudienceTab[];
}

export interface InsightSpec {
  insight_id: string;
  title: string;
  business_meaning: string;
  required_fields: string[];
  confidence_score: number;
  target_audience: AudienceTab;
  business_impact_score: number;
}

export interface LayoutItem {
  id: string;
  type: "kpi" | "chart";
  col_span: number;
  row_span: number;
  order: number;
}

export interface TabSpec {
  label: string;
  description: string;
  kpi_ids: string[];
  chart_ids: string[];
  layout: LayoutItem[];
}

export interface GlobalFilter {
  filter_id: string;
  label: string;
  field: string;
  type: FilterType;
  default_value?: unknown;
}

export interface ValidationResult {
  quality_score: number;
  duplicates_removed: number;
  hallucinations_detected: number;
  invalid_charts_removed: number;
  warnings: string[];
}

export interface DashboardSpec {
  dashboard_id: string;
  created_at: string;
  domain: string;
  business_goal: string;
  theme: Theme;
  dataset_meta: {
    dimensions: string[];
    measures: string[];
    time_fields: string[];
    row_count: number;
    analytical_richness_score: number;
    warnings: string[];
  };
  global_filters: GlobalFilter[];
  kpis: KPISpec[];
  charts: ChartSpec[];
  insights: InsightSpec[];
  tabs: Record<AudienceTab, TabSpec>;
  validation: ValidationResult;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  headers: string[];
  row_count: number;
  preview: Record<string, unknown>[];
}

export interface DashboardResponse {
  status: "processing" | "ready" | "error";
  spec?: DashboardSpec;
  error?: string;
}
