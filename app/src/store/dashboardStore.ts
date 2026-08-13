import { create } from "zustand";
import type { DashboardSpec } from "@/lib/types";

interface UploadState {
  file: File | null;
  fileId: string | null;
  isUploading: boolean;
  uploadError: string | null;
  uploadedHeaders: string[];
  uploadedRowCount: number;
}

interface FormState {
  domain: string;
  description: string;
  businessGoal: string;
  theme: string;
}

interface GenerationState {
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;
}

interface DashboardState {
  spec: DashboardSpec | null;
  activeTab: string;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  activeFilters: Record<string, unknown>;
}

interface Actions {
  setFile: (file: File | null) => void;
  setFileId: (id: string | null) => void;
  setIsUploading: (v: boolean) => void;
  setUploadError: (e: string | null) => void;
  setUploadedMeta: (headers: string[], rowCount: number) => void;
  setDomain: (v: string) => void;
  setDescription: (v: string) => void;
  setBusinessGoal: (v: string) => void;
  setTheme: (v: string) => void;
  setIsGenerating: (v: boolean) => void;
  setGenerationProgress: (n: number) => void;
  setGenerationError: (e: string | null) => void;
  setSpec: (spec: DashboardSpec | null) => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setFilter: (filterId: string, value: unknown) => void;
  clearFilters: () => void;
  reset: () => void;
}

type Store = UploadState & FormState & GenerationState & DashboardState & Actions;

const initial = {
  file: null,
  fileId: null,
  isUploading: false,
  uploadError: null,
  uploadedHeaders: [],
  uploadedRowCount: 0,
  domain: "",
  description: "",
  businessGoal: "",
  theme: "modern",
  isGenerating: false,
  generationProgress: 0,
  generationError: null,
  spec: null,
  activeTab: "",
  isDarkMode: false,
  sidebarOpen: true,
  activeFilters: {},
};

export const useDashboardStore = create<Store>((set) => ({
  ...initial,

  setFile: (file) => set({ file }),
  setFileId: (fileId) => set({ fileId }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setUploadError: (uploadError) => set({ uploadError }),
  setUploadedMeta: (headers, rowCount) =>
    set({ uploadedHeaders: headers, uploadedRowCount: rowCount }),
  setDomain: (domain) => set({ domain }),
  setDescription: (description) => set({ description }),
  setBusinessGoal: (businessGoal) => set({ businessGoal }),
  setTheme: (theme) => set({ theme }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationProgress: (generationProgress) => set({ generationProgress }),
  setGenerationError: (generationError) => set({ generationError }),
  setSpec: (spec) =>
    set({
      spec,
      activeTab: spec?.tabs?.[0]?.tab_id || "",
    }),
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setFilter: (filterId, value) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, [filterId]: value } })),
  clearFilters: () => set({ activeFilters: {} }),
  reset: () => set(initial),
}));
