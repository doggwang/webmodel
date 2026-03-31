// src/services/model.ts
import api from './api';
import { Model, CreateModelParams, UpdateModelParams } from '../types/models';
import { PaginatedResponse } from '../types/api';

export const modelService = {
  createModel: async (params: CreateModelParams): Promise<Model> => {
    const response = await api.post<Model>('/models', params);
    return response;
  },

  getModel: async (modelId: string): Promise<Model> => {
    const response = await api.get<Model>(`/models/${modelId}`);
    return response;
  },

  getModels: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Model>> => {
    const response = await api.get<PaginatedResponse<Model>>('/models', {
      params: { page, pageSize },
    });
    return response;
  },

  updateModel: async (modelId: string, updates: UpdateModelParams): Promise<Model> => {
    const response = await api.patch<Model>(`/models/${modelId}`, updates);
    return response;
  },

  deleteModel: async (modelId: string): Promise<void> => {
    await api.delete(`/models/${modelId}`);
  },
};