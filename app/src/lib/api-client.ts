import type { DashboardSpec, UploadResponse } from "./types";

const BASE = "";

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export async function generateDashboard(params: {
  file_id: string;
  domain: string;
  description: string;
  business_goal: string;
  theme: string;
}): Promise<{ dashboard_id: string; status: string }> {
  const res = await fetch(`${BASE}/api/dashboard/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error || "Generation failed");
  }
  return res.json();
}

export async function getDashboard(
  id: string
): Promise<{ status: string; spec?: DashboardSpec; error?: string }> {
  const res = await fetch(`${BASE}/api/dashboard/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Not found" }));
    throw new Error(err.error || "Dashboard not found");
  }
  return res.json();
}

export async function pollDashboard(
  id: string,
  onProgress?: (attempt: number) => void
): Promise<DashboardSpec> {
  const MAX = 36;
  const INTERVAL = 5000;

  for (let i = 0; i < MAX; i++) {
    onProgress?.(i);
    const result = await getDashboard(id);

    if (result.status === "ready" && result.spec) return result.spec;
    if (result.status === "error") throw new Error(result.error || "Generation failed");

    await new Promise((r) => setTimeout(r, INTERVAL));
  }

  throw new Error("Dashboard generation timed out after 3 minutes");
}

export function getExportUrl(id: string): string {
  return `${BASE}/api/export/${id}`;
}
