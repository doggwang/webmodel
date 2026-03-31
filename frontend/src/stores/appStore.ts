// src/stores/appStore.ts
import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  currentModelId: string | null;
  // 添加上传状态
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showToast: (toast: AppState['toast']) => void;
  setCurrentModel: (modelId: string | null) => void;
  // 添加上传方法
  setUploading: (uploading: boolean) => void;
  updateUploadProgress: (progress: number) => void;
  setUploadError: (error: string | null) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  toast: null,
  currentModelId: null,
  // 初始上传状态
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  showToast: (toast) => set({ toast }),
  setCurrentModel: (modelId) => set({ currentModelId: modelId }),
  // 上传方法
  setUploading: (uploading) => set({ isUploading: uploading }),
  updateUploadProgress: (progress) => set({ uploadProgress: progress }),
  setUploadError: (error) => set({ uploadError: error }),
  clearAll: () => set({
    isLoading: false,
    error: null,
    toast: null,
    isUploading: false,
    uploadProgress: 0,
    uploadError: null,
  }),
}));