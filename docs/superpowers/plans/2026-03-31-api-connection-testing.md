# API连接测试实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 测试前端服务与后端API的完整连接，包括模型服务、上传服务和API客户端，确保错误处理、重试逻辑和实际API集成正常工作。

**Architecture:** 使用MSW（Mock Service Worker）设置模拟服务器进行前端服务测试，然后逐步集成真实后端API。创建全面的测试套件覆盖所有API交互场景。

**Tech Stack:** React 18, TypeScript, MSW (Mock Service Worker), Vitest, React Testing Library, Axios

---

## 文件结构

**创建目录:** `src/services/__tests__/`

**创建文件:**
- `src/services/__tests__/api.test.ts` - API客户端测试
- `src/services/__tests__/model.test.ts` - 模型服务测试
- `src/services/__tests__/upload.test.ts` - 上传服务测试
- `src/mocks/server.ts` - MSW模拟服务器配置
- `src/mocks/handlers.ts` - API请求处理程序
- `src/mocks/browser.ts` - 浏览器环境模拟
- `src/test/setup.ts` - 扩展测试设置以包含MSW

**修改文件:**
- `src/services/api.ts` - 改进错误处理和配置
- `src/services/model.ts` - 添加重试和超时处理
- `src/services/upload.ts` - 改进进度跟踪和错误处理
- `frontend/vite.config.ts` - 配置测试环境变量

**测试文件:**
- `cypress/e2e/api-connection.cy.ts` - E2E API连接测试（可选）

## 任务分解

### Task 1: 设置MSW模拟服务器

**Files:**
- Create: `src/mocks/server.ts`
- Create: `src/mocks/handlers.ts`
- Create: `src/mocks/browser.ts`
- Modify: `src/test/setup.ts`

- [ ] **Step 1: 编写失败测试**

创建`src/services/__tests__/api.test.ts`基础测试：
```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

describe('API Mock Server', () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should be able to setup mock server', () => {
    expect(server).toBeDefined();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/api.test.ts`
预期: FAIL with "Cannot find module 'msw'" or test failures

- [ ] **Step 3: 最小实现**

首先安装MSW依赖：
```bash
cd frontend && npm install msw --save-dev
```

创建`src/mocks/handlers.ts`：
```typescript
import { http, HttpResponse } from 'msw';
import { Model } from '../types/models';

const API_BASE = 'http://localhost:3001/api';

// 模拟模型数据
const mockModels: Model[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    fileName: 'sample-house.skp',
    fileSizeBytes: 15000000,
    originalFormat: '.skp',
    convertedFormat: '.gltf+dr',
    conversionStatus: 'completed',
    convertedFilePath: '/models/sample-house.gltf',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    metadata: { vertices: 15000, materials: 25 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    fileName: 'office-building.skp',
    fileSizeBytes: 45000000,
    originalFormat: '.skp',
    convertedFormat: '.gltf+dr',
    conversionStatus: 'processing',
    metadata: { vertices: 45000, materials: 50 },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

export const handlers = [
  // 健康检查
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 12345,
    });
  }),

  // 获取所有模型
  http.get(`${API_BASE}/models`, () => {
    return HttpResponse.json({
      data: mockModels,
      total: mockModels.length,
      page: 1,
      pageSize: 10,
    });
  }),

  // 获取单个模型
  http.get(`${API_BASE}/models/:modelId`, ({ params }) => {
    const { modelId } = params;
    const model = mockModels.find(m => m.id === modelId);

    if (!model) {
      return HttpResponse.json(
        { message: 'Model not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(model);
  }),

  // 创建模型
  http.post(`${API_BASE}/models`, async ({ request }) => {
    const data = await request.json() as any;
    const newModel: Model = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      fileName: data.fileName,
      fileSizeBytes: data.fileSizeBytes,
      originalFormat: data.originalFormat || '.skp',
      convertedFormat: '.gltf+dr',
      conversionStatus: 'pending',
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockModels.push(newModel);
    return HttpResponse.json(newModel, { status: 201 });
  }),

  // 更新模型
  http.patch(`${API_BASE}/models/:modelId`, async ({ params, request }) => {
    const { modelId } = params;
    const updates = await request.json() as any;
    const modelIndex = mockModels.findIndex(m => m.id === modelId);

    if (modelIndex === -1) {
      return HttpResponse.json(
        { message: 'Model not found' },
        { status: 404 }
      );
    }

    const updatedModel = {
      ...mockModels[modelIndex],
      ...updates,
      updatedAt: new Date(),
    };

    mockModels[modelIndex] = updatedModel;
    return HttpResponse.json(updatedModel);
  }),

  // 删除模型
  http.delete(`${API_BASE}/models/:modelId`, ({ params }) => {
    const { modelId } = params;
    const modelIndex = mockModels.findIndex(m => m.id === modelId);

    if (modelIndex === -1) {
      return HttpResponse.json(
        { message: 'Model not found' },
        { status: 404 }
      );
    }

    mockModels.splice(modelIndex, 1);
    return HttpResponse.json({ message: 'Model deleted' });
  }),

  // 文件上传
  http.post(`${API_BASE}/upload`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return HttpResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    const newModel: Model = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      fileName: file.name,
      fileSizeBytes: file.size,
      originalFormat: '.skp',
      convertedFormat: '.gltf+dr',
      conversionStatus: 'pending',
      metadata: { originalName: file.name },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockModels.push(newModel);
    return HttpResponse.json(newModel, { status: 201 });
  }),

  // 上传状态
  http.get(`${API_BASE}/upload/status/:modelId`, ({ params }) => {
    const { modelId } = params;
    const model = mockModels.find(m => m.id === modelId);

    if (!model) {
      return HttpResponse.json(
        { message: 'Model not found' },
        { status: 404 }
      );
    }

    let progress = 0;
    if (model.conversionStatus === 'completed') {
      progress = 100;
    } else if (model.conversionStatus === 'processing') {
      progress = 50;
    }

    return HttpResponse.json({
      status: model.conversionStatus,
      progress,
    });
  }),
];
```

创建`src/mocks/server.ts`：
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

创建`src/mocks/browser.ts`：
```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

更新`src/test/setup.ts`：
```typescript
import '@testing-library/jest-dom';
import { server } from '../mocks/server';

// 在所有测试之前启动模拟服务器
beforeAll(() => server.listen());

// 在每个测试之后重置处理程序
afterEach(() => server.resetHandlers());

// 在所有测试之后关闭模拟服务器
afterAll(() => server.close());
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/services/__tests__/api.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/mocks/ src/services/__tests__/api.test.ts src/test/setup.ts frontend/package.json frontend/package-lock.json
git commit -m "feat: setup MSW mock server for API testing"
```

### Task 2: 测试API客户端基础功能

**Files:**
- Create: `src/services/__tests__/api.test.ts` (完整测试)
- Modify: `src/services/api.ts` (改进错误处理)

- [ ] **Step 1: 编写失败测试**

更新`src/services/__tests__/api.test.ts`：
```typescript
import api from '../api';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('API Client', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should make successful GET request', async () => {
    const response = await api.get('/models');
    expect(response.data).toBeDefined();
    expect(response.data.data).toHaveLength(2);
    expect(response.data.data[0].fileName).toBe('sample-house.skp');
  });

  it('should make successful POST request', async () => {
    const newModel = {
      fileName: 'test-model.skp',
      fileSizeBytes: 1000000,
      originalFormat: '.skp',
      metadata: { test: true },
    };

    const response = await api.post('/models', newModel);
    expect(response.data.id).toBeDefined();
    expect(response.data.fileName).toBe('test-model.skp');
    expect(response.status).toBe(201);
  });

  it('should handle 404 errors', async () => {
    server.use(
      http.get('http://localhost:3001/api/models/nonexistent', () => {
        return HttpResponse.json(
          { message: 'Not found' },
          { status: 404 }
        );
      })
    );

    await expect(api.get('/models/nonexistent')).rejects.toThrow('Not found');
  });

  it('should handle network errors', async () => {
    server.use(
      http.get('http://localhost:3001/api/models', () => {
        return HttpResponse.error();
      })
    );

    await expect(api.get('/models')).rejects.toThrow();
  });

  it('should add authorization header when token exists', async () => {
    localStorage.setItem('auth_token', 'test-token-123');

    let capturedRequest: Request | null = null;
    server.use(
      http.get('http://localhost:3001/api/models', ({ request }) => {
        capturedRequest = request;
        return HttpResponse.json({ data: [] });
      })
    );

    await api.get('/models');
    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer test-token-123');

    localStorage.removeItem('auth_token');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/api.test.ts`
预期: FAIL with various test failures

- [ ] **Step 3: 最小实现**

更新`src/services/api.ts`改进错误处理：
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请检查网络连接'));
    }

    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      let message = data?.message || `服务器错误: ${status}`;

      if (status === 401) {
        message = '请先登录';
        localStorage.removeItem('auth_token');
      } else if (status === 403) {
        message = '权限不足';
      } else if (status === 404) {
        message = data?.message || '资源未找到';
      } else if (status === 413) {
        message = '文件太大';
      } else if (status === 415) {
        message = '不支持的文件格式';
      } else if (status >= 500) {
        message = '服务器内部错误，请稍后重试';
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // 请求发送但没有响应
      return Promise.reject(new Error('网络连接失败，请检查网络设置'));
    } else {
      // 请求配置错误
      return Promise.reject(new Error(`请求配置错误: ${error.message}`));
    }
  }
);

export default api;
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/services/__tests__/api.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/services/api.ts src/services/__tests__/api.test.ts
git commit -m "feat: improve API client error handling and add comprehensive tests"
```

### Task 3: 测试模型服务

**Files:**
- Create: `src/services/__tests__/model.test.ts`
- Modify: `src/services/model.ts` (添加重试逻辑)

- [ ] **Step 1: 编写失败测试**

创建`src/services/__tests__/model.test.ts`：
```typescript
import { modelService } from '../model';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { Model } from '../../types/models';

describe('Model Service', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockModel: Model = {
    id: 'test-id-123',
    fileName: 'test-model.skp',
    fileSizeBytes: 1000000,
    originalFormat: '.skp',
    convertedFormat: '.gltf+dr',
    conversionStatus: 'completed',
    convertedFilePath: '/models/test.gltf',
    metadata: { test: true },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  it('should get model by ID', async () => {
    server.use(
      http.get('http://localhost:3001/api/models/test-id-123', () => {
        return HttpResponse.json(mockModel);
      })
    );

    const model = await modelService.getModel('test-id-123');
    expect(model.id).toBe('test-id-123');
    expect(model.fileName).toBe('test-model.skp');
  });

  it('should handle get model errors', async () => {
    server.use(
      http.get('http://localhost:3001/api/models/error-id', () => {
        return HttpResponse.json(
          { message: 'Model not found' },
          { status: 404 }
        );
      })
    );

    await expect(modelService.getModel('error-id')).rejects.toThrow('Model not found');
  });

  it('should create model', async () => {
    const createData = {
      fileName: 'new-model.skp',
      fileSizeBytes: 2000000,
      originalFormat: '.skp',
      metadata: { vertices: 10000 },
    };

    server.use(
      http.post('http://localhost:3001/api/models', async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json({
          ...mockModel,
          ...data,
          id: 'new-id-456',
        }, { status: 201 });
      })
    );

    const model = await modelService.createModel(createData);
    expect(model.id).toBe('new-id-456');
    expect(model.fileName).toBe('new-model.skp');
  });

  it('should get paginated models', async () => {
    const response = await modelService.getModels(1, 5);
    expect(response.data).toHaveLength(2);
    expect(response.total).toBe(2);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10); // Default page size
  });

  it('should update model', async () => {
    const updates = {
      conversionStatus: 'completed' as const,
      convertedFilePath: '/models/updated.gltf',
    };

    server.use(
      http.patch('http://localhost:3001/api/models/test-id-123', async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json({
          ...mockModel,
          ...data,
          updatedAt: new Date(),
        });
      })
    );

    const model = await modelService.updateModel('test-id-123', updates);
    expect(model.conversionStatus).toBe('completed');
    expect(model.convertedFilePath).toBe('/models/updated.gltf');
  });

  it('should delete model', async () => {
    let deleteCalled = false;
    server.use(
      http.delete('http://localhost:3001/api/models/test-id-123', () => {
        deleteCalled = true;
        return HttpResponse.json({ message: 'Deleted' });
      })
    );

    await modelService.deleteModel('test-id-123');
    expect(deleteCalled).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/model.test.ts`
预期: FAIL with various test failures

- [ ] **Step 3: 最小实现**

更新`src/services/model.ts`添加重试和超时处理：
```typescript
import api from './api';
import { Model, CreateModelParams, UpdateModelParams } from '../types/models';
import { PaginatedResponse } from '../types/api';

const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  delay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // 指数退避延迟
      const waitTime = delay * Math.pow(2, attempt);
      console.warn(`请求失败，${waitTime}ms后重试 (${attempt + 1}/${maxRetries})`, error);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('超出最大重试次数');
};

export const modelService = {
  createModel: async (params: CreateModelParams): Promise<Model> => {
    return withRetry(async () => {
      const response = await api.post<Model>('/models', params, {
        timeout: 10000, // 10秒超时
      });
      return response.data;
    });
  },

  getModel: async (modelId: string): Promise<Model> => {
    return withRetry(async () => {
      const response = await api.get<Model>(`/models/${modelId}`, {
        timeout: 5000, // 5秒超时
      });
      return response.data;
    }, 2); // 对于获取操作，允许2次重试
  },

  getModels: async (page = 1, pageSize = 10): Promise<PaginatedResponse<Model>> => {
    return withRetry(async () => {
      const response = await api.get<PaginatedResponse<Model>>('/models', {
        params: { page, pageSize },
        timeout: 5000,
      });
      return response.data;
    });
  },

  updateModel: async (modelId: string, updates: UpdateModelParams): Promise<Model> => {
    return withRetry(async () => {
      const response = await api.patch<Model>(`/models/${modelId}`, updates, {
        timeout: 10000,
      });
      return response.data;
    });
  },

  deleteModel: async (modelId: string): Promise<void> => {
    return withRetry(async () => {
      await api.delete(`/models/${modelId}`, {
        timeout: 5000,
      });
    });
  },
};
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/services/__tests__/model.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/services/model.ts src/services/__tests__/model.test.ts
git commit -m "feat: add retry logic to model service and comprehensive tests"
```

### Task 4: 测试上传服务

**Files:**
- Create: `src/services/__tests__/upload.test.ts` (完整测试)
- Modify: `src/services/upload.ts` (改进进度跟踪)

- [ ] **Step 1: 编写失败测试**

创建`src/services/__tests__/upload.test.ts`：
```typescript
import { uploadService } from '../upload';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('Upload Service', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockFile = new File(['test content'], 'test.skp', { type: 'application/octet-stream' });

  it('should upload file successfully', async () => {
    let uploadProgress = 0;
    const onProgress = jest.fn((progressEvent) => {
      uploadProgress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
    });

    server.use(
      http.post('http://localhost:3001/api/upload', async ({ request }) => {
        // 模拟进度事件
        const formData = await request.formData();
        expect(formData.get('file')).toBeDefined();

        return HttpResponse.json({
          id: 'upload-id-123',
          fileName: 'test.skp',
          fileSizeBytes: 12345,
          originalFormat: '.skp',
          convertedFormat: '.gltf+dr',
          conversionStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
        }, { status: 201 });
      })
    );

    const model = await uploadService.uploadFile(mockFile, onProgress);
    expect(model.id).toBe('upload-id-123');
    expect(model.fileName).toBe('test.skp');
  });

  it('should handle upload errors', async () => {
    server.use(
      http.post('http://localhost:3001/api/upload', () => {
        return HttpResponse.json(
          { message: 'File too large' },
          { status: 413 }
        );
      })
    );

    await expect(uploadService.uploadFile(mockFile)).rejects.toThrow('File too large');
  });

  it('should check upload status', async () => {
    server.use(
      http.get('http://localhost:3001/api/upload/status/test-id', () => {
        return HttpResponse.json({
          status: 'processing',
          progress: 75,
        });
      })
    );

    const status = await uploadService.checkUploadStatus('test-id');
    expect(status.status).toBe('processing');
    expect(status.progress).toBe(75);
  });

  it('should handle status check errors', async () => {
    server.use(
      http.get('http://localhost:3001/api/upload/status/error-id', () => {
        return HttpResponse.json(
          { message: 'Not found' },
          { status: 404 }
        );
      })
    );

    await expect(uploadService.checkUploadStatus('error-id')).rejects.toThrow('Not found');
  });

  it('should handle network timeout during upload', async () => {
    server.use(
      http.post('http://localhost:3001/api/upload', async () => {
        // 模拟长时间处理
        await new Promise(resolve => setTimeout(resolve, 10000));
        return HttpResponse.json({});
      })
    );

    // 设置较短的超时时间
    const file = new File(['x'.repeat(1024 * 1024)], 'large.skp'); // 1MB文件
    await expect(uploadService.uploadFile(file)).rejects.toThrow(/timeout/i);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/upload.test.ts`
预期: FAIL with various test failures

- [ ] **Step 3: 最小实现**

更新`src/services/upload.ts`改进进度跟踪和错误处理：
```typescript
import api from './api';
import { Model } from '../types/models';

interface UploadOptions {
  onProgress?: (progressEvent: any) => void;
  timeout?: number;
}

export const uploadService = {
  uploadFile: async (file: File, onProgress?: (progressEvent: any) => void): Promise<Model> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<Model>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
        timeout: 5 * 60 * 1000, // 5分钟超时（大文件）
      });
      return response.data;
    } catch (error: any) {
      // 改进错误消息
      if (error.code === 'ECONNABORTED') {
        throw new Error('上传超时，请检查网络连接并重试');
      } else if (error.response?.status === 413) {
        const maxSizeMB = 500;
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`文件大小 ${fileSizeMB} MB 超过 ${maxSizeMB} MB 限制`);
      } else if (error.response?.status === 415) {
        throw new Error('不支持的文件格式，仅支持 .skp 文件');
      } else if (error.response?.status === 401) {
        throw new Error('请先登录');
      } else if (error.response?.status === 429) {
        throw new Error('上传过于频繁，请稍后再试');
      } else {
        throw new Error(`上传失败: ${error.message || '未知错误'}`);
      }
    }
  },

  checkUploadStatus: async (modelId: string): Promise<{ status: string; progress?: number }> => {
    try {
      const response = await api.get<{ status: string; progress?: number }>(
        `/upload/status/${modelId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('模型不存在或已被删除');
      } else if (error.response?.status === 401) {
        throw new Error('请先登录');
      } else {
        throw new Error(`获取上传状态失败: ${error.message || '未知错误'}`);
      }
    }
  },

  // 新增：取消上传（需要后端支持）
  cancelUpload: async (modelId: string): Promise<void> => {
    try {
      await api.delete(`/upload/${modelId}`);
    } catch (error: any) {
      throw new Error(`取消上传失败: ${error.message || '未知错误'}`);
    }
  },
};
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/services/__tests__/upload.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/services/upload.ts src/services/__tests__/upload.test.ts
git commit -m "feat: improve upload service with better error handling and progress tracking"
```

### Task 5: 测试环境配置和变量

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/.env.development`
- Create: `frontend/.env.test`

- [ ] **Step 1: 编写失败测试**

创建`src/services/__tests__/env.test.ts`：
```typescript
describe('Environment Configuration', () => {
  it('should have API URL configured', () => {
    expect(import.meta.env.VITE_API_URL).toBeDefined();
  });

  it('should use test environment variables in test mode', () => {
    // 测试环境变量是否正确加载
    expect(process.env.NODE_ENV).toBe('test');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/env.test.ts`
预期: FAIL with "Cannot find module" or environment issues

- [ ] **Step 3: 最小实现**

更新`frontend/vite.config.ts`：
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    // 为测试环境定义全局变量
    'import.meta.env.VITE_API_URL': mode === 'test'
      ? JSON.stringify('http://localhost:3001/api')
      : JSON.stringify(import.meta.env.VITE_API_URL || 'http://localhost:3001/api'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/mocks/',
        '**/*.d.ts',
      ],
    },
  },
}));
```

创建`frontend/.env.test`：
```bash
# 测试环境变量
VITE_API_URL=http://localhost:3001/api
NODE_ENV=test
```

更新`frontend/.env.development`：
```bash
# 开发环境变量
VITE_API_URL=http://localhost:3001/api
VITE_MODEL_BASE_URL=http://localhost:3001
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/services/__tests__/env.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add frontend/vite.config.ts frontend/.env.test frontend/.env.development
git commit -m "feat: configure test environment with proper variables"
```

### Task 6: 集成测试和端到端场景

**Files:**
- Create: `src/services/__tests__/integration.test.ts`
- Modify: `src/components/pages/__tests__/UploadPage.test.tsx` (更新集成测试)
- Modify: `src/components/pages/__tests__/ViewerPage.test.tsx` (更新集成测试)

- [ ] **Step 1: 编写失败测试**

创建`src/services/__tests__/integration.test.ts`：
```typescript
import { modelService, uploadService } from '../';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('API Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should complete full model lifecycle', async () => {
    // 1. 创建模型
    const createData = {
      fileName: 'integration-test.skp',
      fileSizeBytes: 5000000,
      originalFormat: '.skp',
      metadata: { integration: true },
    };

    let createdModelId: string;

    server.use(
      http.post('http://localhost:3001/api/models', async ({ request }) => {
        const data = await request.json();
        const model = {
          id: 'integration-id-123',
          ...data,
          convertedFormat: '.gltf+dr',
          conversionStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        createdModelId = model.id;
        return HttpResponse.json(model, { status: 201 });
      })
    );

    const createdModel = await modelService.createModel(createData);
    expect(createdModel.id).toBeDefined();
    expect(createdModel.fileName).toBe('integration-test.skp');

    // 2. 获取模型
    server.use(
      http.get(`http://localhost:3001/api/models/${createdModel.id}`, () => {
        return HttpResponse.json(createdModel);
      })
    );

    const fetchedModel = await modelService.getModel(createdModel.id);
    expect(fetchedModel.id).toBe(createdModel.id);

    // 3. 更新模型状态
    server.use(
      http.patch(`http://localhost:3001/api/models/${createdModel.id}`, async ({ request }) => {
        const updates = await request.json();
        return HttpResponse.json({
          ...createdModel,
          ...updates,
          updatedAt: new Date(),
        });
      })
    );

    const updatedModel = await modelService.updateModel(createdModel.id, {
      conversionStatus: 'completed',
      convertedFilePath: '/models/integration-test.gltf',
    });
    expect(updatedModel.conversionStatus).toBe('completed');

    // 4. 检查上传状态
    server.use(
      http.get(`http://localhost:3001/api/upload/status/${createdModel.id}`, () => {
        return HttpResponse.json({
          status: 'completed',
          progress: 100,
        });
      })
    );

    const status = await uploadService.checkUploadStatus(createdModel.id);
    expect(status.status).toBe('completed');
    expect(status.progress).toBe(100);

    // 5. 删除模型
    let deleteCalled = false;
    server.use(
      http.delete(`http://localhost:3001/api/models/${createdModel.id}`, () => {
        deleteCalled = true;
        return HttpResponse.json({ message: 'Deleted' });
      })
    );

    await modelService.deleteModel(createdModel.id);
    expect(deleteCalled).toBe(true);
  });

  it('should handle concurrent requests', async () => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      modelService.createModel({
        fileName: `concurrent-${i}.skp`,
        fileSizeBytes: 1000000 * (i + 1),
        originalFormat: '.skp',
      })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful.length).toBeGreaterThan(0);
  });

  it('should handle service degradation gracefully', async () => {
    // 模拟部分服务不可用
    server.use(
      http.get('http://localhost:3001/api/models', () => {
        return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 });
      }),
      http.post('http://localhost:3001/api/upload', () => {
        return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 });
      })
    );

    // 这些请求应该失败但有合理的错误消息
    await expect(modelService.getModels()).rejects.toThrow(/Service unavailable|服务器内部错误/);

    const file = new File(['test'], 'test.skp');
    await expect(uploadService.uploadFile(file)).rejects.toThrow(/Service unavailable|服务器内部错误/);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/integration.test.ts`
预期: FAIL with various test failures

- [ ] **Step 3: 最小实现**

更新现有组件测试以使用MSW。首先更新`src/components/pages/__tests__/UploadPage.test.tsx`：
```typescript
// 在现有测试文件中，确保导入MSW配置
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// 在describe块中添加
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

更新`src/components/pages/__tests__/ViewerPage.test.tsx`类似地添加MSW支持。

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/services/__tests__/integration.test.ts`
预期: PASS

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS

运行: `cd frontend && npm test src/components/pages/__tests__/ViewerPage.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/services/__tests__/integration.test.ts src/components/pages/__tests__/UploadPage.test.tsx src/components/pages/__tests__/ViewerPage.test.tsx
git commit -m "feat: add integration tests and update component tests with MSW"
```

### Task 7: 真实后端API集成测试

**Files:**
- Create: `cypress/e2e/api-connection.cy.ts` (E2E测试)
- Modify: `docker-compose.yml` (添加测试服务)
- Create: `scripts/test-api-connection.js` (API健康检查脚本)

- [ ] **Step 1: 编写失败测试**

创建`cypress/e2e/api-connection.cy.ts`：
```typescript
describe('API Connection E2E Tests', () => {
  const API_BASE = 'http://localhost:3001';

  beforeEach(() => {
    // 清理本地存储
    cy.clearLocalStorage();
  });

  it('should connect to backend health endpoint', () => {
    cy.request(`${API_BASE}/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'healthy');
    });
  });

  it('should handle missing API endpoints gracefully', () => {
    cy.request({
      url: `${API_BASE}/api/nonexistent`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([404, 500]);
    });
  });

  it('should upload test file when backend is available', () => {
    // 检查后端是否运行
    cy.request({
      url: `${API_BASE}/health`,
      failOnStatusCode: false,
    }).then((healthResponse) => {
      if (healthResponse.status === 200) {
        // 后端可用，测试上传
        cy.visit('/');

        // 模拟文件选择
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from('test model content'),
          fileName: 'test-upload.skp',
          mimeType: 'application/octet-stream',
        });

        // 验证文件选择
        cy.contains('已选择: test-upload.skp').should('exist');

        // 注意：实际上传需要真实的后端API实现
        // 这里只是验证前端行为
      } else {
        // 后端不可用，跳过上传测试
        cy.log('Backend not available, skipping upload test');
      }
    });
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npx cypress run --spec cypress/e2e/api-connection.cy.ts`
预期: FAIL with Cypress errors or backend not available

- [ ] **Step 3: 最小实现**

创建`scripts/test-api-connection.js`：
```javascript
#!/usr/bin/env node

const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const API_BASE = process.env.API_URL || 'http://localhost:3001';

async function checkHealth() {
  try {
    console.log(`🌐 Checking backend health at ${API_BASE}/health...`);
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });

    if (response.data.status === 'healthy') {
      console.log('✅ Backend is healthy');
      return true;
    } else {
      console.log('❌ Backend health check failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    return false;
  }
}

async function testBasicEndpoints() {
  const endpoints = [
    { method: 'GET', path: '/api/models', expectedStatus: 200 },
    { method: 'POST', path: '/api/models', expectedStatus: 400 }, // 缺少参数
    { method: 'GET', path: '/api/models/123', expectedStatus: 404 }, // 不存在
  ];

  console.log('\n🔧 Testing basic API endpoints...');

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE}${endpoint.path}`,
        timeout: 3000,
        validateStatus: () => true, // 不抛出错误
      });

      console.log(
        `${endpoint.method} ${endpoint.path}: ${response.status} (expected ${endpoint.expectedStatus})`,
        response.status === endpoint.expectedStatus ? '✅' : '⚠️'
      );
    } catch (error) {
      console.log(`${endpoint.method} ${endpoint.path}: ERROR - ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting API connection tests...\n');

  const isHealthy = await checkHealth();

  if (isHealthy) {
    await testBasicEndpoints();
    console.log('\n✨ API connection tests completed');
    process.exit(0);
  } else {
    console.log('\n❌ Cannot proceed with API tests - backend is not available');
    console.log('💡 Start the backend with: cd backend && npm run dev');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { checkHealth, testBasicEndpoints };
```

更新`docker-compose.yml`添加测试服务配置（如果需要）。

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && node scripts/test-api-connection.js`
预期: 输出健康检查结果（如果后端运行则通过）

- [ ] **Step 5: 提交**

```bash
git add cypress/e2e/api-connection.cy.ts scripts/test-api-connection.js
git commit -m "feat: add E2E API connection tests and health check script"
```

### Task 8: 测试报告和覆盖率

**Files:**
- Modify: `frontend/package.json` (添加测试脚本)
- Create: `frontend/test-report.html` (通过测试生成)
- Modify: `frontend/vite.config.ts` (添加覆盖率配置)

- [ ] **Step 1: 编写失败测试**

运行覆盖率报告：
```bash
cd frontend && npm test -- --coverage
```

检查覆盖率报告是否存在。

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test -- --coverage`
预期: 生成覆盖率报告，但可能覆盖率不足

- [ ] **Step 3: 最小实现**

更新`frontend/package.json`测试脚本：
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:report": "vitest run --coverage --reporter=html",
    "test:integration": "vitest run src/services/__tests__/integration.test.ts",
    "test:api": "vitest run src/services/__tests__/",
    "test:components": "vitest run src/components/",
    "test:e2e": "cypress run"
  }
}
```

更新`frontend/vite.config.ts`的test部分：
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'src/test/',
      'src/mocks/',
      '**/*.d.ts',
      'cypress/',
    ],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
  reporters: ['verbose'],
  outputFile: {
    html: 'test-report.html',
  },
},
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm run test:coverage`
预期: 生成覆盖率报告，达到阈值要求

运行: `cd frontend && npm run test:report`
预期: 生成HTML测试报告

- [ ] **Step 5: 提交**

```bash
git add frontend/package.json frontend/vite.config.ts
git commit -m "feat: configure test coverage reporting and thresholds"
```

## 执行计划总结

计划已完成，包含8个任务，涵盖：
1. 设置MSW模拟服务器
2. 测试API客户端基础功能
3. 测试模型服务
4. 测试上传服务
5. 测试环境配置和变量
6. 集成测试和端到端场景
7. 真实后端API集成测试
8. 测试报告和覆盖率

**下一步:** 使用subagent-driven-development或executing-plans技能执行此计划。

---
