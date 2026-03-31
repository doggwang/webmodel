// src/models/Model.ts
import { z } from 'zod';

export const ModelSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string().min(1),
  originalFilePath: z.string().optional(),
  convertedFilePath: z.string().optional(),
  fileSizeBytes: z.number().int().positive(),
  originalFormat: z.string().default('skp'),
  convertedFormat: z.string().default('gltf+dr'),
  conversionStatus: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  conversionError: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.record(z.any()).default({}),
  userId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Model = z.infer<typeof ModelSchema>;

// 创建模型参数
export const CreateModelParams = ModelSchema.pick({
  fileName: true,
  fileSizeBytes: true,
  originalFormat: true,
  metadata: true,
});

export type CreateModelParams = z.infer<typeof CreateModelParams>;

// 更新模型参数
export const UpdateModelParams = ModelSchema.partial().pick({
  convertedFilePath: true,
  conversionStatus: true,
  conversionError: true,
  thumbnailUrl: true,
  metadata: true,
});

export type UpdateModelParams = z.infer<typeof UpdateModelParams>;

// 数据库行转换
export function rowToModel(row: any): Model {
  return {
    id: row.id,
    fileName: row.file_name,
    originalFilePath: row.original_file_path,
    convertedFilePath: row.converted_file_path,
    fileSizeBytes: Number(row.file_size_bytes),
    originalFormat: row.original_format,
    convertedFormat: row.converted_format,
    conversionStatus: row.conversion_status,
    conversionError: row.conversion_error,
    thumbnailUrl: row.thumbnail_url,
    metadata: row.metadata || {},
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function modelToRow(model: Partial<Model>): Record<string, any> {
  const row: Record<string, any> = {};

  if (model.fileName !== undefined) row.file_name = model.fileName;
  if (model.originalFilePath !== undefined) row.original_file_path = model.originalFilePath;
  if (model.convertedFilePath !== undefined) row.converted_file_path = model.convertedFilePath;
  if (model.fileSizeBytes !== undefined) row.file_size_bytes = model.fileSizeBytes;
  if (model.originalFormat !== undefined) row.original_format = model.originalFormat;
  if (model.convertedFormat !== undefined) row.converted_format = model.convertedFormat;
  if (model.conversionStatus !== undefined) row.conversion_status = model.conversionStatus;
  if (model.conversionError !== undefined) row.conversion_error = model.conversionError;
  if (model.thumbnailUrl !== undefined) row.thumbnail_url = model.thumbnailUrl;
  if (model.metadata !== undefined) row.metadata = model.metadata;
  if (model.userId !== undefined) row.user_id = model.userId;

  return row;
}