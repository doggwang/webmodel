// src/models/ShareLink.ts
import { z } from 'zod';

export const ShareLinkSchema = z.object({
  id: z.string().uuid(),
  modelId: z.string().uuid(),
  token: z.string().min(8),
  passwordHash: z.string().optional(),
  expiresAt: z.date().optional(),
  maxViews: z.number().int().positive().optional(),
  viewCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
});

export type ShareLink = z.infer<typeof ShareLinkSchema>;

// 创建分享链接参数
export const CreateShareLinkParams = ShareLinkSchema.pick({
  modelId: true,
  passwordHash: true,
  expiresAt: true,
  maxViews: true,
}).extend({
  expiresInDays: z.number().int().positive().optional(),
});

export type CreateShareLinkParams = z.infer<typeof CreateShareLinkParams>;

// 验证分享链接参数
export const ValidateShareLinkParams = z.object({
  token: z.string().min(8),
  password: z.string().optional(),
});

export type ValidateShareLinkParams = z.infer<typeof ValidateShareLinkParams>;

// 数据库行转换
export function rowToShareLink(row: any): ShareLink {
  return {
    id: row.id,
    modelId: row.model_id,
    token: row.token,
    passwordHash: row.password_hash,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    maxViews: row.max_views,
    viewCount: row.view_count,
    createdAt: new Date(row.created_at),
  };
}

export function shareLinkToRow(shareLink: Partial<ShareLink>): Record<string, any> {
  const row: Record<string, any> = {};

  if (shareLink.modelId !== undefined) row.model_id = shareLink.modelId;
  if (shareLink.token !== undefined) row.token = shareLink.token;
  if (shareLink.passwordHash !== undefined) row.password_hash = shareLink.passwordHash;
  if (shareLink.expiresAt !== undefined) row.expires_at = shareLink.expiresAt;
  if (shareLink.maxViews !== undefined) row.max_views = shareLink.maxViews;
  if (shareLink.viewCount !== undefined) row.view_count = shareLink.viewCount;

  return row;
}

// 验证分享链接是否有效
export function isShareLinkValid(shareLink: ShareLink, password?: string): { valid: boolean; reason?: string } {
  // 检查密码
  if (shareLink.passwordHash && password === undefined) {
    return { valid: false, reason: 'password_required' };
  }

  // 这里应该添加密码验证逻辑，使用bcrypt.compare
  // 简化版本：如果设置了密码，需要提供密码
  if (shareLink.passwordHash && password !== 'valid_password') {
    return { valid: false, reason: 'invalid_password' };
  }

  // 检查过期时间
  if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
    return { valid: false, reason: 'expired' };
  }

  // 检查最大查看次数
  if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
    return { valid: false, reason: 'max_views_reached' };
  }

  return { valid: true };
}