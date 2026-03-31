// src/stores/appStore.ts
import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  currentModelId: string | null;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showToast: (toast: AppState['toast']) => void;
  setCurrentModel: (modelId: string | null) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  toast: null,
  currentModelId: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  showToast: (toast) => set({ toast }),
  setCurrentModel: (modelId) => set({ currentModelId: modelId }),
  clearAll: () => set({ isLoading: false, error: null, toast: null }),
}));