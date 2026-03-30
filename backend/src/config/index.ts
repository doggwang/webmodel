// src/config/index.ts
import { z } from 'zod';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const configSchema = z.object({
  // 服务器配置
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.string().default('3001'),

  // 数据库配置
  databaseUrl: z.string().url(),

  // Redis配置
  redisUrl: z.string().url().default('redis://localhost:6379'),

  // 文件存储配置
  minioEndpoint: z.string().default('localhost:9000'),
  minioAccessKey: z.string(),
  minioSecretKey: z.string(),
  minioBucket: z.string().default('suweb-models'),

  // JWT配置
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('7d'),

  // 文件上传限制
  maxFileSize: z.number().default(500 * 1024 * 1024), // 500MB
  allowedFileTypes: z.array(z.string()).default(['.skp']),

  // 安全配置
  corsOrigin: z.string().default('http://localhost:3000'),
  rateLimitWindow: z.number().default(15 * 60 * 1000), // 15分钟
  rateLimitMax: z.number().default(100), // 每个IP每窗口最大请求数
});

const rawConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  minioEndpoint: process.env.MINIO_ENDPOINT,
  minioAccessKey: process.env.MINIO_ACCESS_KEY,
  minioSecretKey: process.env.MINIO_SECRET_KEY,
  minioBucket: process.env.MINIO_BUCKET,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : undefined,
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(','),
  corsOrigin: process.env.CORS_ORIGIN,
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW ? parseInt(process.env.RATE_LIMIT_WINDOW) : undefined,
  rateLimitMax: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : undefined,
};

const config = configSchema.parse(rawConfig);

export default config;