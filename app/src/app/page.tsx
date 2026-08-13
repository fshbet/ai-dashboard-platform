"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { uploadFile, generateDashboard } from "@/lib/api-client";

const DOMAINS = [
  "Retail & E-commerce", "Finance & Banking", "Healthcare", "Manufacturing",
  "Marketing & Advertising", "Human Resources", "Supply Chain & Logistics",
  "SaaS & Technology", "Education", "Real Estate", "Other",
];

const THEMES = [
  { id: "modern", label: "Modern", desc: "Clean blues and grays" },
  { id: "dark", label: "Dark", desc: "Dark background, vivid accents" },
  { id: "corporate", label: "Corporate", desc: "Professional earth tones" },
  { id: "vibrant", label: "Vibrant", desc: "Bold, colorful palette" },
];

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [theme, setTheme] = useState("modern");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/json": [".json"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "application/vnd.ms-excel": [".xls"] },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    onDropRejected: (files) => setError(files[0]?.errors[0]?.message || "Invalid file"),
  });

  const handleGenerate = async () => {
    if (!file || !domain || !businessGoal.trim()) {
      setError("Please provide a file, domain, and business goal.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      setLoadingMsg("Uploading file...");
      const uploaded = await uploadFile(file);

      setLoadingMsg("Starting AI generation...");
      const { dashboard_id } = await generateDashboard({
        file_id: uploaded.file_id,
        domain,
        description,
        business_goal: businessGoal,
        theme,
      });

      router.push(`/dashboard/${dashboard_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            Powered by 5 AI Agents
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            AI Dashboard Platform
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Upload your data, describe your goal, get a full analytics dashboard in seconds.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Drop zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Data File <span className="text-brand-500">*</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20"
                  : file
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-500"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <p className="text-green-600 dark:text-green-400 font-semibold">{file.name}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-1">
                    {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-slate-400 text-sm">CSV, XLSX, XLS, JSON — up to 50 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Business Domain <span className="text-brand-500">*</span>
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">Select a domain...</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Dataset Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Briefly describe your data, e.g. monthly sales transactions by region..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Business goal */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Business Goal <span className="text-brand-500">*</span>
            </label>
            <textarea
              value={businessGoal}
              onChange={(e) => setBusinessGoal(e.target.value)}
              rows={3}
              placeholder="What insights do you need? e.g. Identify top-performing regions and forecast Q4 revenue..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Dashboard Theme
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    theme === t.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                      : "border-slate-200 dark:border-slate-600 hover:border-brand-300"
                  }`}
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{t.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !file || !domain || !businessGoal.trim()}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {loadingMsg}
              </span>
            ) : (
              "Generate Dashboard"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
