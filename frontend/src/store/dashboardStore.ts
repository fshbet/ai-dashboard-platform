import { create } from "zustand";
import { DashboardSpec, AudienceTab, Theme } from "../lib/types";

interface DashboardState {
  uploadedFileId: string | null;
  uploadedFilename: string | null;
  uploadedHeaders: string[];
  uploadedPreview: Record<string, unknown>[];
  domain: string;
  datasetDescription: string;
  businessGoal: string;
  theme: Theme;
  dashboardId: string | null;
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;
  spec: DashboardSpec | null;
  activeTab: AudienceTab;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  activeFilters: Record<string, unknown>;

  setUploadResult: (fileId: string, filename: string, headers: string[], preview: Record<string, unknown>[]) => void;
  setFormField: <K extends keyof DashboardState>(key: K, value: DashboardState[K]) => void;
  setGenerating: (v: boolean) => void;
  setGenerationProgress: (v: number) => void;
  setGenerationError: (v: string | null) => void;
  setDashboardId: (id: string) => void;
  setSpec: (spec: DashboardSpec) => void;
  setActiveTab: (tab: AudienceTab) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setFilter: (id: string, value: unknown) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initial = {
  uploadedFileId: null, uploadedFilename: null, uploadedHeaders: [], uploadedPreview: [],
  domain: "", datasetDescription: "", businessGoal: "", theme: "modern" as Theme,
  dashboardId: null, isGenerating: false, generationProgress: 0, generationError: null,
  spec: null, activeTab: "c_suite" as AudienceTab, isDarkMode: false, sidebarOpen: true, activeFilters: {},
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initial,
  setUploadResult: (fileId, filename, headers, preview) =>
    set({ uploadedFileId: fileId, uploadedFilename: filename, uploadedHeaders: headers, uploadedPreview: preview }),
  setFormField: (key, value) => set({ [key]: value } as Partial<DashboardState>),
  setGenerating: (v) => set({ isGenerating: v, generationError: null }),
  setGenerationProgress: (v) => set({ generationProgress: v }),
  setGenerationError: (v) => set({ generationError: v, isGenerating: false }),
  setDashboardId: (id) => set({ dashboardId: id }),
  setSpec: (spec) => set({ spec, isGenerating: false, generationProgress: 100, activeTab: "c_suite" }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setFilter: (id, value) => set((s) => ({ activeFilters: { ...s.activeFilters, [id]: value } })),
  resetFilters: () => set({ activeFilters: {} }),
  reset: () => set(initial),
}));
