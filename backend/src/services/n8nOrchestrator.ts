import axios, { AxiosError } from "axios";
import { DashboardSpec, GenerationRequest, ParsedDataset } from "../types";
import { buildDatasetContext } from "./fileParser";
import { sanitizeSpec, validateAndClean } from "./validator";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!;
const TIMEOUT_MS = 120_000;

export async function orchestrateDashboardGeneration(
  dashboardId: string,
  request: GenerationRequest,
  parsed: ParsedDataset
): Promise<DashboardSpec> {
  const datasetContext = buildDatasetContext(parsed, request.dataset_description, request.domain);

  const payload = {
    dashboard_id: dashboardId,
    domain: request.domain,
    dataset_description: request.dataset_description,
    business_goal: request.business_goal,
    theme: request.theme,
    dataset_context: datasetContext,
    columns: parsed.headers,
    row_count: parsed.rowCount,
  };

  try {
    const response = await axios.post<unknown>(N8N_WEBHOOK_URL, payload, {
      timeout: TIMEOUT_MS,
      headers: { "Content-Type": "application/json" },
    });

    const rawSpec = extractSpec(response.data);
    const sanitized = sanitizeSpec(rawSpec);
    const validated = validateAndClean(sanitized, parsed.headers);

    validated.dashboard_id = dashboardId;
    validated.created_at = new Date().toISOString();
    validated.domain = request.domain;
    validated.business_goal = request.business_goal;
    validated.theme = request.theme;

    return validated;
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      throw new Error(`n8n webhook error: ${msg}`);
    }
    throw err;
  }
}

function extractSpec(data: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    throw new Error("n8n returned non-object response");
  }
  const obj = data as Record<string, unknown>;
  if (obj.dashboard_spec) return obj.dashboard_spec;
  if (obj.spec) return obj.spec;
  if (obj.result) return obj.result;
  if (obj.kpis || obj.charts || obj.tabs) return obj;
  if (Array.isArray(data) && data.length > 0) return extractSpec(data[0]);
  throw new Error("Could not extract dashboard spec from n8n response");
}
