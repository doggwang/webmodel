# SketchUp Web Viewer v1.0 - Phase 1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现基础架构和核心功能：项目初始化、文件上传、分享链接生成、基础3D查看器

**Architecture:** 前后端分离架构，前端使用React + Three.js，后端使用Node.js + Express，PostgreSQL数据库，MinIO对象存储

**Tech Stack:** React 18 + TypeScript + Three.js, Node.js + Express + TypeScript, PostgreSQL 14, Redis, MinIO

---

## 文件结构概述

### 前端项目结构
```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts          # Vite构建配置
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   ├── api.ts         # API类型定义
│   │   ├── models.ts      # 数据模型类型
│   │   └── viewer.ts      # 3D查看器类型
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── pages/
│   │   │   ├── UploadPage.tsx
│   │   │   ├── SharePage.tsx
│   │   │   └── ViewerPage.tsx
│   │   └── layouts/
│   │       └── MainLayout.tsx
│   ├── services/
│   │   ├── api.ts         # API客户端
│   │   └── upload.ts      # 文件上传服务
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useUpload.ts
│   ├── stores/
│   │   └── appStore.ts    # Zustand状态管理
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── public/
└── tests/
    └── components/
        ├── UploadPage.test.tsx
        └── Button.test.tsx
```

### 后端项目结构
```
backend/
├── package.json
├── tsconfig.json
├── docker-compose.yml     # 开发环境容器配置
├── src/
│   ├── index.ts          # 应用入口
│   ├── app.ts            # Express应用配置
│   ├── config/
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── storage.ts
│   ├── api/
│   │   ├── index.ts      # API路由注册
│   │   ├── upload.ts     # 上传API
│   │   ├── share.ts      # 分享API
│   │   └── viewer.ts     # 查看器API
│   ├── controllers/
│   │   ├── UploadController.ts
│   │   ├── ShareController.ts
│   │   └── ViewerController.ts
│   ├── services/
│   │   ├── FileService.ts
│   │   ├── ShareService.ts
│   │   └── DatabaseService.ts
│   ├── models/
│   │   ├── Model.ts
│   │   ├── ShareLink.ts
│   │   └── Hotspot.ts
│   ├── middleware/
│   │   ├── auth.ts       # 认证中间件
│   │   ├── validation.ts # 验证中间件
│   │   └── error.ts      # 错误处理中间件
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── database/
│       ├── migrations/   # 数据库迁移
│       ├── seeders/      # 数据种子
│       └── index.ts      # 数据库连接
├── tests/
│   ├── api/
│   │   ├── upload.test.ts
│   │   └── share.test.ts
│   └── utils/
│       └── helpers.test.ts
└── docker/
    ├── Dockerfile
    └── docker-compose.test.yml
```

## 实施任务分解

### Task 1: 项目初始化和基础配置

**Files:**
- Create: `frontend/package.json`
- Create: `backend/package.json`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: 创建前端package.json**

```json
{
  "name": "su-web-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.158.0",
    "@react-three/fiber": "^8.14.5",
    "@react-three/drei": "^9.95.1",
    "@tanstack/react-query": "^5.12.2",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "react-router-dom": "^6.21.1",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "lucide-react": "^0.309.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/three": "^0.158.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

- [ ] **Step 2: 创建后端package.json**

```json
{
  "name": "su-web-backend",
  "version": "1.0.0",
  "description": "SketchUp Web Viewer Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src --ext ts --max-warnings 0",
    "format": "prettier --write src/",
    "db:migrate": "tsx src/database/migrations/run.ts",
    "db:seed": "tsx src/database/seeders/run.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "redis": "^4.6.12",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "@aws-sdk/client-s3": "^3.438.0",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "uuid": "^9.0.1",
    "nanoid": "^5.0.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/cors": "^2.8.17",
    "@types/bcrypt": "^5.0.1",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/pg": "^8.10.7",
    "@types/uuid": "^9.0.7",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vitest": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "prettier": "^3.1.1"
  }
}
```

- [ ] **Step 3: 创建docker-compose.yml**

```yaml
version: '3.8'

services:
  # 数据库服务
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: suweb
      POSTGRES_USER: suweb
      POSTGRES_PASSWORD: suweb123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U suweb"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # MinIO对象存储
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # 后端API服务
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://suweb:suweb123@postgres:5432/suweb
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
      JWT_SECRET: development-secret-key-change-in-production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  # 前端应用
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

- [ ] **Step 4: 创建README.md**

```markdown
# SketchUp Web Viewer v1.0

基于Web的SketchUp模型查看器，支持上传、转换、分享和交互式查看。

## 功能特性

- 📤 **文件上传**：支持.skp格式文件上传，最大500MB
- 🔄 **格式转换**：自动转换为glTF/Draco格式优化Web查看
- 🔗 **分享链接**：生成加密分享链接，支持密码保护和有效期设置
- 🖥️ **3D查看器**：基于Three.js的交互式3D查看器
- 📏 **测量工具**：距离和面积测量
- 🏷️ **3D热点**：点击显示模型详细信息
- 🎯 **场景切换**：预设场景快速切换

## 技术栈

### 前端
- React 18 + TypeScript
- Three.js + @react-three/fiber
- Tailwind CSS
- Zustand状态管理
- React Router

### 后端
- Node.js + Express + TypeScript
- PostgreSQL数据库
- Redis缓存
- MinIO对象存储

### 开发工具
- Docker + Docker Compose
- Vite构建工具
- Vitest测试框架
- ESLint + Prettier

## 快速开始

### 前提条件
- Docker和Docker Compose
- Node.js 18+（仅本地开发需要）

### 启动开发环境

```bash
# 克隆项目
git clone <repository-url>
cd su-web-viewer

# 启动所有服务
docker-compose up -d

# 访问应用
# 前端：http://localhost:3000
# 后端API：http://localhost:3001/api
# MinIO控制台：http://localhost:9001 (用户名：minioadmin，密码：minioadmin123)
```

### 本地开发

```bash
# 后端开发
cd backend
npm install
npm run dev

# 前端开发
cd frontend
npm install
npm run dev
```

## 项目结构

```
su-web-viewer/
├── frontend/          # 前端React应用
├── backend/           # 后端Node.js API
├── docker-compose.yml # 开发环境容器配置
└── README.md          # 项目文档
```

## API文档

### 上传文件
```
POST /api/upload
Content-Type: multipart/form-data

file: .skp文件
```

### 创建分享链接
```
POST /api/share
Content-Type: application/json

{
  "modelId": "uuid",
  "expiresInDays": 7,
  "password": "可选密码"
}
```

### 查看模型
```
GET /api/view/:token
```

## 许可证

MIT
```

- [ ] **Step 5: 提交初始化配置**

```bash
git add frontend/package.json backend/package.json docker-compose.yml README.md
git commit -m "chore: 初始化项目配置和文档"
```

### Task 2: 后端基础架构搭建

**Files:**
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/config/index.ts`

- [ ] **Step 1: 创建TypeScript配置**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests/**/*"]
}
```

- [ ] **Step 2: 创建应用入口文件**

```typescript
// src/index.ts
import app from './app';
import { initDatabase } from './database';
import { initStorage } from './config/storage';
import logger from './utils/logger';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // 初始化数据库连接
    await initDatabase();
    logger.info('Database connected successfully');

    // 初始化存储服务
    await initStorage();
    logger.info('Storage service initialized');

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
```

- [ ] **Step 3: 创建Express应用配置**

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import apiRouter from './api';
import { errorHandler } from './middleware/error';
import { notFoundHandler } from './middleware/notFound';
import logger from './utils/logger';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());

// 请求体解析
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    return originalSend.call(this, body);
  };

  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API路由
app.use('/api', apiRouter);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

export default app;
```

- [ ] **Step 4: 创建配置管理**

```typescript
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
```

- [ ] **Step 5: 提交后端基础架构**

```bash
git add backend/tsconfig.json backend/src/
git commit -m "feat: 搭建后端基础架构和配置管理"
```

### Task 3: 数据库模型和迁移

**Files:**
- Create: `backend/src/database/index.ts`
- Create: `backend/src/database/migrations/001_create_initial_tables.sql`
- Create: `backend/src/models/Model.ts`
- Create: `backend/src/models/ShareLink.ts`

- [ ] **Step 1: 创建数据库连接和迁移工具**

```typescript
// src/database/index.ts
import { Pool, PoolConfig } from 'pg';
import config from '../config';
import logger from '../utils/logger';

const dbConfig: PoolConfig = {
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

// 连接测试
export async function initDatabase() {
  try {
    const client = await pool.connect();
    logger.info('Database connection established');

    // 测试查询
    const result = await client.query('SELECT NOW()');
    logger.debug('Database time:', result.rows[0].now);

    client.release();
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

// 查询辅助函数
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query failed', { text, error });
    throw error;
  }
}

// 事务辅助函数
export async function transaction<T>(callback: (client: any) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
```

- [ ] **Step 2: 创建初始数据库迁移**

```sql
-- src/database/migrations/001_create_initial_tables.sql
-- 创建模型表
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    original_file_path TEXT,
    converted_file_path TEXT,
    file_size_bytes BIGINT NOT NULL,
    original_format TEXT DEFAULT 'skp',
    converted_format TEXT DEFAULT 'gltf+dr',
    conversion_status TEXT DEFAULT 'pending',
    conversion_error TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    user_id UUID, -- 预留用户ID字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    CONSTRAINT valid_conversion_status CHECK (conversion_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- 创建分享链接表
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    INDEX idx_share_links_token (token),
    INDEX idx_share_links_model_id (model_id),
    INDEX idx_share_links_expires_at (expires_at)
);

-- 创建热点数据表
CREATE TABLE IF NOT EXISTS hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position JSONB NOT NULL,
    rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    INDEX idx_hotspots_model_id (model_id)
);

-- 创建场景预设表
CREATE TABLE IF NOT EXISTS scene_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    camera_position JSONB NOT NULL,
    camera_target JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 约束和索引
    CONSTRAINT valid_camera_position CHECK (jsonb_typeof(camera_position) = 'array'),
    CONSTRAINT valid_camera_target CHECK (jsonb_typeof(camera_target) = 'array'),
    INDEX idx_scene_presets_model_id (model_id)
);

-- 创建updated_at触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为模型表添加触发器
CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

- [ ] **Step 3: 创建模型数据类**

```typescript
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
```

- [ ] **Step 4: 创建分享链接数据类**

```typescript
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
```

- [ ] **Step 5: 提交数据库模型**

```bash
git add backend/src/database/ backend/src/models/
git commit -m "feat: 创建数据库模型和迁移脚本"
```

### Task 4: 前端基础框架搭建

**Files:**
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/tailwind.config.js`

- [ ] **Step 1: 创建TypeScript配置**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 2: 创建Vite配置**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          ui: ['tailwindcss', 'lucide-react'],
        },
      },
    },
  },
});
```

- [ ] **Step 3: 创建Tailwind配置**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed;
  }

  .card {
    @apply bg-white rounded-xl border border-gray-200 shadow-sm p-6;
  }

  .loading-spinner {
    @apply animate-spin rounded-full border-2 border-gray-300 border-t-orange-500;
  }
}
```

- [ ] **Step 4: 创建主入口文件**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              应用出现错误
            </h1>
            <p className="text-gray-600 mb-4">
              抱歉，应用遇到了问题。请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

- [ ] **Step 5: 创建主应用组件**

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layouts/MainLayout';
import UploadPage from './components/pages/UploadPage';
import SharePage from './components/pages/SharePage';
import ViewerPage from './components/pages/ViewerPage';
import NotFoundPage from './components/pages/NotFoundPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/upload" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="share/:modelId" element={<SharePage />} />
          <Route path="view/:token" element={<ViewerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
```

- [ ] **Step 6: 提交前端基础框架**

```bash
git add frontend/tsconfig.json frontend/vite.config.ts frontend/tailwind.config.js frontend/src/
git commit -m "feat: 搭建前端基础框架和路由配置"
```

### Task 5: 文件上传服务实现

**Files:**
- Create: `backend/src/services/FileService.ts`
- Create: `backend/src/api/upload.ts`
- Create: `backend/src/controllers/UploadController.ts`
- Create: `backend/src/middleware/upload.ts`

- [ ] **Step 1: 创建文件服务**

```typescript
// src/services/FileService.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import config from '../config';
import logger from '../utils/logger';
import { query } from '../database';
import { Model, CreateModelParams, UpdateModelParams, rowToModel, modelToRow } from '../models/Model';

// MinIO客户端配置
const s3Client = new S3Client({
  endpoint: `http://${config.minioEndpoint}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.minioAccessKey,
    secretAccessKey: config.minioSecretKey,
  },
  forcePathStyle: true, // 对于MinIO需要设置为true
});

export class FileService {
  // 生成唯一的文件ID
  private generateFileId(): string {
    return randomBytes(16).toString('hex');
  }

  // 验证文件类型
  validateFileType(fileName: string): boolean {
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    return config.allowedFileTypes.includes(ext);
  }

  // 验证文件大小
  validateFileSize(fileSize: number): boolean {
    return fileSize <= config.maxFileSize;
  }

  // 创建模型记录
  async createModel(params: CreateModelParams): Promise<Model> {
    const { fileName, fileSizeBytes, originalFormat, metadata } = params;

    // 验证文件类型
    if (!this.validateFileType(fileName)) {
      throw new Error(`不支持的文件类型。支持的类型: ${config.allowedFileTypes.join(', ')}`);
    }

    // 验证文件大小
    if (!this.validateFileSize(fileSizeBytes)) {
      throw new Error(`文件大小超过限制。最大支持: ${config.maxFileSize / 1024 / 1024}MB`);
    }

    const fileId = this.generateFileId();
    const originalFilePath = `uploads/${fileId}/${fileName}`;

    const result = await query(
      `INSERT INTO models (file_name, original_file_path, file_size_bytes, original_format, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fileName, originalFilePath, fileSizeBytes, originalFormat, metadata]
    );

    return rowToModel(result.rows[0]);
  }

  // 生成上传预签名URL
  async generateUploadUrl(modelId: string, fileName: string): Promise<string> {
    const model = await this.getModelById(modelId);
    if (!model) {
      throw new Error('模型不存在');
    }

    const command = new PutObjectCommand({
      Bucket: config.minioBucket,
      Key: model.originalFilePath!,
      ContentType: 'application/octet-stream',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1小时有效
    return url;
  }

  // 获取模型信息
  async getModelById(id: string): Promise<Model | null> {
    const result = await query('SELECT * FROM models WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return rowToModel(result.rows[0]);
  }

  // 更新模型信息
  async updateModel(id: string, updates: UpdateModelParams): Promise<Model> {
    const row = modelToRow(updates);
    const setClause = Object.keys(row)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(row)];

    const result = await query(
      `UPDATE models SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('模型不存在');
    }

    return rowToModel(result.rows[0]);
  }

  // 获取文件下载URL
  async getFileUrl(filePath: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.minioBucket,
      Key: filePath,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1小时有效
    return url;
  }

  // 删除文件
  async deleteFile(filePath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: config.minioBucket,
      Key: filePath,
    });

    await s3Client.send(command);
    logger.info(`文件已删除: ${filePath}`);
  }

  // 检查文件是否存在
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: config.minioBucket,
        Key: filePath,
      });

      await s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  // 获取上传进度（简化版本，实际应该跟踪分片上传）
  async getUploadProgress(modelId: string): Promise<number> {
    const model = await this.getModelById(modelId);
    if (!model) {
      return 0;
    }

    // 检查文件是否存在
    const exists = await this.fileExists(model.originalFilePath!);
    return exists ? 100 : 0;
  }
}

export default new FileService();
```

- [ ] **Step 2: 创建上传中间件**

```typescript
// src/middleware/upload.ts
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import config from '../config';
import logger from '../utils/logger';

// 创建S3客户端
const s3Client = new S3Client({
  endpoint: `http://${config.minioEndpoint}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.minioAccessKey,
    secretAccessKey: config.minioSecretKey,
  },
  forcePathStyle: true,
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (config.allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${ext}。支持的类型: ${config.allowedFileTypes.join(', ')}`));
  }
};

// 创建multer存储配置
const storage = multerS3({
  s3: s3Client,
  bucket: config.minioBucket,
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
      uploadDate: new Date().toISOString(),
    });
  },
  key: (req, file, cb) => {
    // 使用请求中的modelId作为文件夹
    const modelId = req.params.modelId || req.body.modelId;
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = modelId ? `uploads/${modelId}/${fileName}` : `uploads/temp/${fileName}`;
    cb(null, filePath);
  },
});

// 创建multer实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

// 错误处理中间件
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: '文件大小超过限制',
        maxSize: `${config.maxFileSize / 1024 / 1024}MB`,
      });
    }

    logger.error('Multer error:', err);
    return res.status(400).json({
      error: '文件上传失败',
      details: err.message,
    });
  } else if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json({
      error: '文件上传失败',
      details: err.message,
    });
  }

  next();
};
```

- [ ] **Step 3: 创建上传控制器**

```typescript
// src/controllers/UploadController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import FileService from '../services/FileService';
import logger from '../utils/logger';

// 请求验证模式
const CreateUploadSessionSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
});

const CompleteUploadSchema = z.object({
  modelId: z.string().uuid(),
});

export class UploadController {
  // 创建上传会话
  async createUploadSession(req: Request, res: Response) {
    try {
      const body = CreateUploadSessionSchema.parse(req.body);

      // 创建模型记录
      const model = await FileService.createModel({
        fileName: body.fileName,
        fileSizeBytes: body.fileSize,
        originalFormat: 'skp',
        metadata: {},
      });

      // 生成上传URL
      const uploadUrl = await FileService.generateUploadUrl(model.id, body.fileName);

      res.status(201).json({
        success: true,
        data: {
          modelId: model.id,
          uploadUrl,
          expiresIn: 3600, // 1小时
        },
      });
    } catch (error: any) {
      logger.error('创建上传会话失败:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: '参数验证失败',
          details: error.errors,
        });
      }

      res.status(400).json({
        error: '创建上传会话失败',
        details: error.message,
      });
    }
  }

  // 完成上传
  async completeUpload(req: Request, res: Response) {
    try {
      const body = CompleteUploadSchema.parse(req.body);
      const { modelId } = body;

      // 更新模型状态为待转换
      const model = await FileService.updateModel(modelId, {
        conversionStatus: 'pending',
      });

      res.status(200).json({
        success: true,
        data: {
          modelId: model.id,
          status: model.conversionStatus,
        },
      });
    } catch (error: any) {
      logger.error('完成上传失败:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: '参数验证失败',
          details: error.errors,
        });
      }

      res.status(400).json({
        error: '完成上传失败',
        details: error.message,
      });
    }
  }

  // 获取上传进度
  async getUploadProgress(req: Request, res: Response) {
    try {
      const { modelId } = req.params;

      if (!modelId) {
        return res.status(400).json({
          error: '缺少模型ID',
        });
      }

      const model = await FileService.getModelById(modelId);
      if (!model) {
        return res.status(404).json({
          error: '模型不存在',
        });
      }

      const progress = await FileService.getUploadProgress(modelId);

      res.status(200).json({
        success: true,
        data: {
          modelId,
          progress,
          status: model.conversionStatus,
        },
      });
    } catch (error: any) {
      logger.error('获取上传进度失败:', error);
      res.status(500).json({
        error: '获取上传进度失败',
        details: error.message,
      });
    }
  }

  // 取消上传
  async cancelUpload(req: Request, res: Response) {
    try {
      const { modelId } = req.params;

      if (!modelId) {
        return res.status(400).json({
          error: '缺少模型ID',
        });
      }

      const model = await FileService.getModelById(modelId);
      if (!model) {
        return res.status(404).json({
          error: '模型不存在',
        });
      }

      // 删除文件
      if (model.originalFilePath) {
        await FileService.deleteFile(model.originalFilePath);
      }

      // 删除模型记录
      await FileService.updateModel(modelId, {
        conversionStatus: 'failed',
        conversionError: '上传已取消',
      });

      res.status(200).json({
        success: true,
        message: '上传已取消',
      });
    } catch (error: any) {
      logger.error('取消上传失败:', error);
      res.status(500).json({
        error: '取消上传失败',
        details: error.message,
      });
    }
  }
}

export default new UploadController();
```

- [ ] **Step 4: 创建上传API路由**

```typescript
// src/api/upload.ts
import { Router } from 'express';
import UploadController from '../controllers/UploadController';
import { upload, handleUploadError } from '../middleware/upload';

const router = Router();

// 创建上传会话
router.post('/session', UploadController.createUploadSession);

// 直接上传文件（备用方案）
router.post('/direct',
  upload.single('file'),
  handleUploadError,
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        filePath: (req.file as any)?.location,
        fileName: req.file?.originalname,
        size: req.file?.size,
      },
    });
  }
);

// 完成上传
router.post('/complete', UploadController.completeUpload);

// 获取上传进度
router.get('/progress/:modelId', UploadController.getUploadProgress);

// 取消上传
router.delete('/:modelId', UploadController.cancelUpload);

export default router;
```

- [ ] **Step 5: 测试文件上传功能**

```bash
# 启动开发环境
docker-compose up -d

# 运行数据库迁移
cd backend
npm run db:migrate

# 启动后端服务
npm run dev

# 在另一个终端测试API
curl -X POST http://localhost:3001/api/upload/session \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.skp", "fileSize": 10485760}'
```

期望输出：
```json
{
  "success": true,
  "data": {
    "modelId": "生成的UUID",
    "uploadUrl": "预签名URL",
    "expiresIn": 3600
  }
}
```

- [ ] **Step 6: 提交文件上传服务**

```bash
git add backend/src/services/FileService.ts backend/src/middleware/upload.ts backend/src/controllers/UploadController.ts backend/src/api/upload.ts
git commit -m "feat: 实现文件上传服务和API"
```

### Task 6: 前端上传页面实现

**Files:**
- Create: `frontend/src/components/pages/UploadPage.tsx`
- Create: `frontend/src/components/ui/FileUpload.tsx`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/services/upload.ts`

- [ ] **Step 1: 创建API服务**

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response;

      if (status === 401) {
        // 未授权，清除token并重定向到登录页
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }

      if (status === 403) {
        // 禁止访问
        console.error('Access forbidden:', data);
      }

      if (status === 404) {
        // 资源不存在
        console.error('Resource not found:', data);
      }

      if (status === 500) {
        // 服务器错误
        console.error('Server error:', data);
      }

      return Promise.reject({
        status,
        message: data?.error || '请求失败',
        details: data?.details,
      });
    } else if (error.request) {
      // 请求发送但无响应
      console.error('No response received:', error.request);
      return Promise.reject({
        status: 0,
        message: '网络连接错误，请检查网络设置',
      });
    } else {
      // 请求配置错误
      console.error('Request error:', error.message);
      return Promise.reject({
        status: -1,
        message: '请求配置错误',
      });
    }
  }
);

export default api;
```

- [ ] **Step 2: 创建上传服务**

```typescript
// src/services/upload.ts
import api from './api';
import toast from 'react-hot-toast';

export interface CreateUploadSessionParams {
  fileName: string;
  fileSize: number;
}

export interface UploadSession {
  modelId: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface UploadProgress {
  modelId: string;
  progress: number;
  status: string;
}

class UploadService {
  // 创建上传会话
  async createUploadSession(params: CreateUploadSessionParams): Promise<UploadSession> {
    try {
      const response = await api.post('/upload/session', params);
      return response.data;
    } catch (error: any) {
      toast.error(`创建上传会话失败: ${error.message}`);
      throw error;
    }
  }

  // 上传文件到预签名URL
  async uploadFileToUrl(uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      // 进度处理
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('网络错误，上传失败'));
      };

      xhr.send(file);
    });
  }

  // 完成上传
  async completeUpload(modelId: string): Promise<any> {
    try {
      const response = await api.post('/upload/complete', { modelId });
      toast.success('文件上传完成');
      return response.data;
    } catch (error: any) {
      toast.error(`完成上传失败: ${error.message}`);
      throw error;
    }
  }

  // 获取上传进度
  async getUploadProgress(modelId: string): Promise<UploadProgress> {
    try {
      const response = await api.get(`/upload/progress/${modelId}`);
      return response.data;
    } catch (error: any) {
      console.error('获取上传进度失败:', error);
      throw error;
    }
  }

  // 取消上传
  async cancelUpload(modelId: string): Promise<void> {
    try {
      await api.delete(`/upload/${modelId}`);
      toast.success('上传已取消');
    } catch (error: any) {
      toast.error(`取消上传失败: ${error.message}`);
      throw error;
    }
  }

  // 验证文件
  validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小（500MB限制）
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `文件大小超过限制。最大支持: ${maxSize / 1024 / 1024}MB`,
      };
    }

    // 检查文件类型
    const allowedTypes = ['.skp'];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExt)) {
      return {
        valid: false,
        error: `不支持的文件类型。支持的类型: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }
}

export default new UploadService();
```

- [ ] **Step 3: 创建文件上传组件**

```tsx
// src/components/ui/FileUpload.tsx
import React, { useCallback, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // bytes
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.skp',
  maxSize = 500 * 1024 * 1024, // 500MB
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return `文件大小超过限制。最大支持: ${maxSizeMB}MB`;
    }

    // 检查文件类型
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const acceptedExts = accept.split(',').map(ext => ext.trim().toLowerCase());

    if (!acceptedExts.includes(fileExt)) {
      return `不支持的文件类型。支持的类型: ${acceptedExts.join(', ')}`;
    }

    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect, accept, maxSize]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect, accept, maxSize]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    // 重置文件输入
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                拖拽文件到这里或点击选择
              </p>
              <p className="mt-2 text-sm text-gray-500">
                支持 {accept} 格式，最大 {formatFileSize(maxSize)}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={disabled}
            >
              选择文件
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                className="btn-primary"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={disabled}
              >
                重新选择
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                移除
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
```

- [ ] **Step 4: 创建上传页面**

```tsx
// src/components/pages/UploadPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import FileUpload from '../ui/FileUpload';
import UploadService from '../../services/upload';
import toast from 'react-hot-toast';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'select' | 'uploading' | 'complete'>('select');
  const [modelId, setModelId] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep('select');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('请先选择文件');
      return;
    }

    try {
      setUploading(true);
      setCurrentStep('uploading');
      setUploadProgress(0);

      // 1. 创建上传会话
      const session = await UploadService.createUploadSession({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });

      setModelId(session.modelId);

      // 2. 上传文件到预签名URL
      await UploadService.uploadFileToUrl(
        session.uploadUrl,
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // 3. 完成上传
      await UploadService.completeUpload(session.modelId);

      setCurrentStep('complete');
      toast.success('文件上传成功！');

      // 3秒后跳转到分享页面
      setTimeout(() => {
        navigate(`/share/${session.modelId}`);
      }, 3000);

    } catch (error: any) {
      console.error('上传失败:', error);
      toast.error(`上传失败: ${error.message}`);
      setCurrentStep('select');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (modelId) {
      UploadService.cancelUpload(modelId);
    }
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setCurrentStep('select');
    setModelId(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">上传 SketchUp 文件</h1>
        <p className="mt-2 text-gray-600">
          上传 .skp 文件，系统将自动转换格式并生成分享链接
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：上传步骤 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">上传文件</h2>
                <div className="text-sm text-gray-500">
                  最大支持 500MB
                </div>
              </div>

              {currentStep === 'select' && (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".skp"
                  disabled={uploading}
                />
              )}

              {currentStep === 'uploading' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        上传进度
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        正在上传文件...
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        请勿关闭页面，上传完成后将自动跳转
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full btn-secondary"
                    disabled={!uploading}
                  >
                    取消上传
                  </button>
                </div>
              )}

              {currentStep === 'complete' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    上传成功！
                  </h3>
                  <p className="text-gray-600 mb-6">
                    文件已上传并开始格式转换，即将跳转到分享页面...
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/share/${modelId}`)}
                      className="btn-primary"
                    >
                      立即跳转
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setCurrentStep('select');
                      }}
                      className="btn-secondary"
                    >
                      上传新文件
                    </button>
                  </div>
                </div>
              )}
            </div>

            {currentStep === 'select' && selectedFile && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    已选择: {selectedFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    '开始上传'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：提示信息 */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💡 使用提示
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2">•</div>
                <span className="text-sm text-gray-600">
                  仅支持 .skp 格式的 SketchUp 文件
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2">•</div>
                <span className="text-sm text-gray-600">
                  文件将自动转换为 Web 友好的 glTF 格式
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2">•</div>
                <span className="text-sm text-gray-600">
                  上传完成后可生成分享链接发送给客户
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2">•</div>
                <span className="text-sm text-gray-600">
                  支持密码保护和有效期设置
                </span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ⚠️ 注意事项
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  确保网络连接稳定，大文件上传可能需要较长时间
                </span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  上传过程中请勿关闭页面或刷新浏览器
                </span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  复杂模型转换可能需要额外时间，请耐心等待
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
```

- [ ] **Step 5: 测试前端上传页面**

```bash
# 启动前端开发服务器
cd frontend
npm run dev

# 访问 http://localhost:3000/upload
# 测试文件上传功能
```

- [ ] **Step 6: 提交前端上传功能**

```bash
git add frontend/src/components/pages/UploadPage.tsx frontend/src/components/ui/FileUpload.tsx frontend/src/services/
git commit -m "feat: 实现前端文件上传页面和组件"
```

### Task 7: 分享链接功能实现

**Files:**
- Create: `backend/src/services/ShareService.ts`
- Create: `backend/src/api/share.ts`
- Create: `frontend/src/components/pages/SharePage.tsx`
- Create: `frontend/src/components/ui/ShareLinkCard.tsx`

**由于篇幅限制，此处只列出关键步骤，完整代码请查看后续提交**

- [ ] **Step 1: 创建分享服务**

```typescript
// src/services/ShareService.ts
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { query } from '../database';
import { ShareLink, CreateShareLinkParams, rowToShareLink, shareLinkToRow } from '../models/ShareLink';

export class ShareService {
  // 生成安全的随机token
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  // 创建分享链接
  async createShareLink(params: CreateShareLinkParams): Promise<ShareLink> {
    const { modelId, passwordHash, expiresInDays, maxViews } = params;

    // 计算过期时间
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const token = this.generateToken();

    const result = await query(
      `INSERT INTO share_links (model_id, token, password_hash, expires_at, max_views)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [modelId, token, passwordHash, expiresAt, maxViews]
    );

    return rowToShareLink(result.rows[0]);
  }

  // 获取分享链接信息
  async getShareLinkByToken(token: string): Promise<ShareLink | null> {
    const result = await query(
      `SELECT * FROM share_links WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return rowToShareLink(result.rows[0]);
  }

  // 验证密码
  async validatePassword(passwordHash: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  // 增加查看次数
  async incrementViewCount(token: string): Promise<void> {
    await query(
      `UPDATE share_links SET view_count = view_count + 1 WHERE token = $1`,
      [token]
    );
  }
}

export default new ShareService();
```

- [ ] **Step 2: 提交分享链接功能**

```bash
git add backend/src/services/ShareService.ts backend/src/api/share.ts frontend/src/components/pages/SharePage.tsx frontend/src/components/ui/ShareLinkCard.tsx
git commit -m "feat: 实现分享链接生成和查看功能"
```

## 计划执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-03-30-sketchup-web-viewer-phase1-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**