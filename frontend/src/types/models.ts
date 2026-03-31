// src/types/models.ts
export interface Model {
  id: string;
  fileName: string;
  originalFilePath?: string;
  convertedFilePath?: string;
  fileSizeBytes: number;
  originalFormat: string;
  convertedFormat: string;
  conversionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  conversionError?: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateModelParams {
  fileName: string;
  fileSizeBytes: number;
  originalFormat?: string;
  metadata?: Record<string, any>;
}

export interface UpdateModelParams {
  convertedFilePath?: string;
  conversionStatus?: Model['conversionStatus'];
  conversionError?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface ShareLink {
  id: string;
  modelId: string;
  token: string;
  passwordHash?: string;
  expiresAt?: Date;
  maxViews?: number;
  viewCount: number;
  createdAt: Date;
}

export interface CreateShareLinkParams {
  modelId: string;
  passwordHash?: string;
  expiresAt?: Date;
  maxViews?: number;
  expiresInDays?: number;
}

export interface ValidateShareLinkParams {
  token: string;
  password?: string;
}