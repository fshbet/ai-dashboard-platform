export interface ParsedDataset {
  filename: string;
  file_type: string;
  columns: string[];
  row_count: number;
  sample_rows: Record<string, unknown>[];
  numeric_columns: string[];
  categorical_columns: string[];
  date_columns: string[];
}

export interface KPISpec {
  kpi_id: string;
  title: string;
  field: string;
  aggregation: "sum" | "avg" | "count" | "min" | "max" | "latest";
  format: "number" | "currency" | "percentage" | "duration";
  prefix?: string;
  suffix?: string;
  comparison_period?: string;
  target_value?: number;
  priority_score: number;
}

export interface ChartSpec {
  chart_id: string;
  title: string;
  chart_type:
    | "bar" | "line" | "area" | "pie" | "donut" | "scatter"
    | "heatmap" | "treemap" | "funnel" | "gauge" | "radar"
    | "waterfall" | "histogram";
  x_field?: string;
  y_field?: string;
  group_by?: string;
  series_fields?: string[];
  category_field?: string;
  value_field?: string;
  filters?: Record<string, unknown>;
  aggregation?: string;
  sort_order?: "asc" | "desc" | "none";
  recommended_size: "small" | "medium" | "large" | "full";
  priority_score: number;
  insight_summary?: string;
}

export interface InsightSpec {
  insight_id: string;
  title: string;
  description: string;
  insight_type: "trend" | "anomaly" | "comparison" | "forecast" | "correlation";
  related_charts: string[];
  business_impact_score: number;
  recommended_action?: string;
}

export interface GlobalFilter {
  filter_id: string;
  label: string;
  field: string;
  filter_type: "date_range" | "select" | "number_range" | "search";
  default_value?: unknown;
  options?: string[];
}

export interface TabLayoutItem {
  chart_id: string;
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface TabSpec {
  tab_id: string;
  label: string;
  audience: "c_suite" | "top_management" | "middle_management" | "end_users";
  description: string;
  kpi_ids: string[];
  chart_ids: string[];
  insight_ids: string[];
  layout: TabLayoutItem[];
}

export interface ValidationResult {
  is_valid: boolean;
  warnings: string[];
  errors: string[];
  quality_score: number;
}

export interface DashboardSpec {
  dashboard_id: string;
  title: string;
  description: string;
  domain: string;
  business_goal: string;
  theme: string;
  created_at: string;
  dataset_summary: {
    filename: string;
    row_count: number;
    columns: string[];
    dimensions: string[];
    measures: string[];
  };
  kpis: KPISpec[];
  charts: ChartSpec[];
  insights: InsightSpec[];
  global_filters: GlobalFilter[];
  tabs: TabSpec[];
  validation: ValidationResult;
}

export interface GenerationRequest {
  file_id: string;
  domain: string;
  description: string;
  business_goal: string;
  theme: string;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  headers: string[];
  row_count: number;
  preview: Record<string, unknown>[];
}
