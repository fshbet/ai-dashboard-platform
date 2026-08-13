import axios from "axios";
import { UploadResponse, DashboardResponse, Theme } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  timeout: 30_000,
});

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadResponse>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function generateDashboard(params: {
  file_id: string;
  domain: string;
  dataset_description: string;
  business_goal: string;
  theme: Theme;
}): Promise<{ dashboard_id: string; status: string }> {
  const { data } = await api.post("/dashboard/generate", params);
  return data;
}

export async function getDashboard(id: string): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>(`/dashboard/${id}`);
  return data;
}

export function getExportUrl(id: string): string {
  return `${api.defaults.baseURL}/export/${id}`;
}

export async function pollDashboard(
  id: string,
  onProgress?: (attempt: number) => void
): Promise<DashboardResponse> {
  const MAX_ATTEMPTS = 36;
  const INTERVAL_MS = 5_000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    onProgress?.(attempt);
    const result = await getDashboard(id);
    if (result.status === "ready" || result.status === "error") return result;
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  throw new Error("Dashboard generation timed out after 3 minutes");
}
