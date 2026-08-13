"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { uploadFile, generateDashboard } from "../lib/api";
import { useDashboardStore } from "../store/dashboardStore";
import { Theme } from "../lib/types";

const DOMAINS = [
  "Retail & E-Commerce", "Financial Services", "Healthcare", "Manufacturing",
  "Human Resources", "Supply Chain & Logistics", "SaaS & Technology",
  "Marketing & Advertising", "Real Estate", "Education", "Other",
];

const THEMES: { value: Theme; label: string; desc: string }[] = [
  { value: "executive", label: "Executive", desc: "Clean, boardroom-ready" },
  { value: "modern",    label: "Modern",    desc: "Bold, data-forward" },
  { value: "minimal",   label: "Minimal",   desc: "Light, distraction-free" },
  { value: "dark",      label: "Dark",      desc: "High contrast, night mode" },
];

export default function HomePage() {
  const router = useRouter();
  const store = useDashboardStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadFile(file);
      store.setUploadResult(result.file_id, result.filename, result.headers, result.preview);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [store]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "application/json": [".json"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  async function handleGenerate() {
    if (!store.uploadedFileId || !store.domain || !store.businessGoal) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await generateDashboard({
        file_id: store.uploadedFileId,
        domain: store.domain,
        dataset_description: store.datasetDescription,
        business_goal: store.businessGoal,
        theme: store.theme,
      });
      store.setDashboardId(result.dashboard_id);
      router.push(`/dashboard/${result.dashboard_id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canGenerate = store.uploadedFileId && store.domain && store.businessGoal && !isSubmitting;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <header className="border-b border-gray-200 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">AI Dashboard Platform</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Enterprise BI</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-slide-up">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">AI Dashboard Generator</h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            Upload your dataset and let AI generate an enterprise-grade, audience-segmented dashboard in seconds.
          </p>
        </div>

        {/* Step 1 — Upload */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="font-semibold text-gray-900">Upload Dataset</h2>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-400 hover:bg-gray-50"}
              ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              {isUploading
                ? <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                : <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
              }
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragActive ? "Drop your file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-gray-400 mt-1">CSV, XLSX, JSON — max 50 MB</p>
              </div>
            </div>
          </div>

          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

          {store.uploadedFilename && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-medium text-green-800">{store.uploadedFilename}</span>
                <span className="text-green-600 ml-2">· {store.uploadedHeaders.length} columns detected</span>
              </span>
            </div>
          )}
        </section>

        {/* Step 2 — Configure */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="font-semibold text-gray-900">Configure Dashboard</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Business Domain *</label>
            <select
              value={store.domain}
              onChange={(e) => store.setFormField("domain", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select domain...</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Dataset Description</label>
            <textarea
              value={store.datasetDescription}
              onChange={(e) => store.setFormField("datasetDescription", e.target.value)}
              placeholder="Describe what this data represents and any important context..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Business Goal *</label>
            <textarea
              value={store.businessGoal}
              onChange={(e) => store.setFormField("businessGoal", e.target.value)}
              placeholder="What decision should this dashboard answer? e.g. 'Identify top-performing regions and forecast next quarter revenue'"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Visual Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => store.setFormField("theme", t.value)}
                  className={`p-3 rounded-lg border text-left transition-all
                    ${store.theme === t.value ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all
            ${canGenerate ? "bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/25 active:scale-[0.99]" : "bg-gray-300 cursor-not-allowed"}`}
        >
          {isSubmitting
            ? <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Initializing AI Pipeline...
              </span>
            : "Generate Dashboard →"
          }
        </button>

        {!canGenerate && !isSubmitting && (
          <p className="text-center text-xs text-gray-400">Upload a file and fill in domain + business goal to continue</p>
        )}
      </div>
    </main>
  );
}
