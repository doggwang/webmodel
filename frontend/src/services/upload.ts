// src/services/upload.ts
import api from './api';
import { Model } from '../types/models';

export const uploadService = {
  uploadFile: async (file: File): Promise<Model> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Model>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`上传进度: ${percentCompleted}%`);
      },
    });
    return response;
  },

  checkUploadStatus: async (modelId: string): Promise<{ status: string; progress?: number }> => {
    const response = await api.get<{ status: string; progress?: number }>(
      `/upload/status/${modelId}`
    );
    return response;
  },
};