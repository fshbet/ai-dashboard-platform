import type { DashboardSpec } from "./types";
import { sanitizeSpec, validateAndClean } from "./validator";

export async function orchestrateDashboardGeneration(params: {
  dashboard_id: string;
  domain: string;
  business_goal: string;
  dataset_description: string;
  dataset_context: string;
  columns: string[];
  row_count: number;
  theme: string;
}): Promise<DashboardSpec> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("N8N_WEBHOOK_URL not configured");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`n8n webhook error ${response.status}: ${text}`);
  }

  const raw = await response.json();

  const extracted = extractSpec(raw);
  const sanitized = sanitizeSpec(extracted);

  sanitized.dashboard_id = params.dashboard_id;
  sanitized.domain = params.domain;
  sanitized.business_goal = params.business_goal;
  sanitized.theme = params.theme;
  sanitized.created_at = new Date().toISOString();

  const columnSet = new Set(params.columns);
  return validateAndClean(sanitized, columnSet);
}

function extractSpec(raw: unknown): Partial<DashboardSpec> {
  if (!raw || typeof raw !== "object") {
    throw new Error("n8n returned empty response");
  }

  const obj = raw as Record<string, unknown>;

  if (obj.dashboard_spec) return obj.dashboard_spec as Partial<DashboardSpec>;
  if (obj.spec) return obj.spec as Partial<DashboardSpec>;
  if (obj.output) {
    const parsed = tryParseJson(obj.output as string);
    if (parsed) return parsed as Partial<DashboardSpec>;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const item = (raw as Record<string, unknown>[])[0];
    if (item.dashboard_spec) return item.dashboard_spec as Partial<DashboardSpec>;
    if (item.output) {
      const parsed = tryParseJson(item.output as string);
      if (parsed) return parsed as Partial<DashboardSpec>;
    }
  }
  if (obj.kpis || obj.charts || obj.tabs) return obj as Partial<DashboardSpec>;

  throw new Error(`Cannot extract dashboard spec from n8n response: ${JSON.stringify(raw).slice(0, 200)}`);
}

function tryParseJson(text: string): unknown {
  try {
    const cleaned = text.replace(/```json?\n?/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
