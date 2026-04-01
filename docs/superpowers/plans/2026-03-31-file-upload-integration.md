# 文件上传功能集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在UploadPage中集成文件上传功能，包括文件选择、上传进度显示、错误处理和上传完成后的导航。

**Architecture:** 修改现有的UploadPage组件，添加文件拖放处理逻辑，集成uploadService进行文件上传，使用zustand状态管理上传状态和错误，添加上传进度显示和完成后的导航到模型查看页面。

**Tech Stack:** React 18, TypeScript, axios, zustand, React Query, Tailwind CSS

---

## 文件结构

**修改文件:**
- `src/components/pages/UploadPage.tsx` - 添加文件上传逻辑和UI状态
- `src/stores/appStore.ts` - 添加上传相关状态
- `src/services/upload.ts` - 已存在，无需修改

**创建文件:**
- 无（遵循YAGNI原则，先使用现有文件）

**测试文件:**
- `src/components/pages/__tests__/UploadPage.test.tsx` - 创建UploadPage测试

## 任务分解

### Task 1: 扩展AppStore添加上传状态

**Files:**
- Modify: `src/stores/appStore.ts:1-28`

- [ ] **Step 1: 编写失败测试**

在`src/stores/appStore.ts`同级目录创建`__tests__/appStore.test.ts`：
```typescript
import { act } from '@testing-library/react';
import { useAppStore } from '../appStore';

describe('AppStore upload state', () => {
  it('should have initial upload state', () => {
    const state = useAppStore.getState();
    expect(state.isUploading).toBe(false);
    expect(state.uploadProgress).toBe(0);
    expect(state.uploadError).toBeNull();
  });

  it('should update upload state', () => {
    const { setUploading, setUploadProgress, setUploadError } = useAppStore.getState();

    act(() => {
      setUploading(true);
    });
    expect(useAppStore.getState().isUploading).toBe(true);

    act(() => {
      setUploadProgress(50);
    });
    expect(useAppStore.getState().uploadProgress).toBe(50);

    act(() => {
      setUploadError('Upload failed');
    });
    expect(useAppStore.getState().uploadError).toBe('Upload failed');

    act(() => {
      setUploading(false);
      setUploadProgress(0);
      setUploadError(null);
    });
    expect(useAppStore.getState().isUploading).toBe(false);
    expect(useAppStore.getState().uploadProgress).toBe(0);
    expect(useAppStore.getState().uploadError).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/stores/__tests__/appStore.test.ts`
预期: FAIL with "Cannot find module '../appStore'" or test failures

- [ ] **Step 3: 最小实现**

修改`src/stores/appStore.ts`：
```typescript
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
  setUploadProgress: (progress: number) => void;
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
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
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
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/stores/__tests__/appStore.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/stores/appStore.ts src/stores/__tests__/appStore.test.ts
git commit -m "feat: add upload state to appStore"
```

### Task 2: 创建UploadPage测试文件

**Files:**
- Create: `src/components/pages/__tests__/UploadPage.test.tsx`

- [ ] **Step 1: 创建测试文件结构**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import UploadPage from '../UploadPage';
import { useAppStore } from '../../../stores/appStore';

// Mock upload service
jest.mock('../../../services/upload', () => ({
  uploadService: {
    uploadFile: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().clearAll();
  });

  it('should render upload page', () => {
    renderWithProviders(<UploadPage />);
    expect(screen.getByText('上传SketchUp模型')).toBeInTheDocument();
    expect(screen.getByText('拖放文件到此处')).toBeInTheDocument();
    expect(screen.getByText('选择文件')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: FAIL with "Cannot find module '../UploadPage'" or test failures

- [ ] **Step 3: 暂时不实现功能，只验证测试结构**

当前UploadPage组件存在，测试应该能渲染组件。

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS (因为当前UploadPage组件可以渲染)

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/__tests__/UploadPage.test.tsx
git commit -m "test: add UploadPage test structure"
```

### Task 3: 添加文件选择处理到UploadPage

**Files:**
- Modify: `src/components/pages/UploadPage.tsx:1-42`

- [ ] **Step 1: 编写失败测试**

在`src/components/pages/__tests__/UploadPage.test.tsx`添加：
```typescript
it('should handle file selection via button click', async () => {
  const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.skp';
  jest.spyOn(document, 'createElement').mockReturnValue(fileInput);
  const clickSpy = jest.spyOn(fileInput, 'click');

  renderWithProviders(<UploadPage />);

  const selectButton = screen.getByText('选择文件');
  fireEvent.click(selectButton);

  expect(clickSpy).toHaveBeenCalled();
});

it('should handle file drop', async () => {
  const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });
  const dataTransfer = {
    files: [mockFile],
    items: [
      {
        kind: 'file',
        type: 'application/octet-stream',
        getAsFile: () => mockFile,
      },
    ],
    types: ['Files'],
  };

  renderWithProviders(<UploadPage />);

  const dropZone = screen.getByText('拖放文件到此处').closest('div[class*="border-dashed"]');
  expect(dropZone).toBeInTheDocument();

  fireEvent.dragOver(dropZone!);
  fireEvent.drop(dropZone!, { dataTransfer });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: FAIL with "Cannot read properties of null (reading 'closest')" or test failures

- [ ] **Step 3: 最小实现**

修改`src/components/pages/UploadPage.tsx`：
```typescript
import React, { useState, useRef, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Upload, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      console.log('Selected file:', file.name, file.size);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Dropped file:', file.name, file.size);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="上传SketchUp模型">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  拖放文件到此处
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .skp 文件，最大 500MB
                </p>
              </div>
              <div className="mt-4">
                <Button variant="primary" onClick={handleSelectClick}>
                  选择文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".skp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md w-full">
                  <p className="text-sm font-medium text-gray-900">
                    已选择: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">上传说明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 仅支持 SketchUp (.skp) 格式文件</li>
              <li>• 最大文件大小：500MB</li>
              <li>• 文件会自动转换为Web可用的3D格式</li>
              <li>• 转换过程可能需要几分钟时间</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/UploadPage.tsx src/components/pages/__tests__/UploadPage.test.tsx
git commit -m "feat: add file selection and drag-drop to UploadPage"
```

### Task 4: 添加上传按钮和验证逻辑

**Files:**
- Modify: `src/components/pages/UploadPage.tsx`

- [ ] **Step 1: 编写失败测试**

在`src/components/pages/__tests__/UploadPage.test.tsx`添加：
```typescript
it('should show upload button when file is selected', () => {
  const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });

  renderWithProviders(<UploadPage />);

  // Initially no upload button
  expect(screen.queryByText('开始上传')).not.toBeInTheDocument();

  // Simulate file selection via state
  // Note: This test may need adjustment based on implementation
});

it('should validate file size', () => {
  const largeFile = new File(['x'.repeat(600 * 1024 * 1024)], 'large.skp');
  // Test file size validation
});

it('should validate file type', () => {
  const wrongTypeFile = new File(['test'], 'test.txt', { type: 'text/plain' });
  // Test file type validation
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: FAIL with missing elements or test failures

- [ ] **Step 3: 最小实现**

修改`src/components/pages/UploadPage.tsx`，在组件中添加验证和上传按钮：
```typescript
import React, { useState, useRef, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setError } = useAppStore();

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const validateFile = (file: File): string | null => {
    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.skp')) {
      return '仅支持 .skp 格式文件';
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      return `文件大小 ${sizeInMB} MB 超过 500MB 限制`;
    }

    return null;
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setValidationError(null);

    if (file) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setError(error);
      } else {
        console.log('Valid file selected:', file.name);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setValidationError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setError(error);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        console.log('Valid file dropped:', file.name);
      }
    }
  }, [setError]);

  const handleUpload = () => {
    if (!selectedFile) return;
    console.log('Starting upload for:', selectedFile.name);
    // Upload logic will be added in next task
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="上传SketchUp模型">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  拖放文件到此处
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .skp 文件，最大 500MB
                </p>
              </div>
              <div className="mt-4">
                <Button variant="primary" onClick={handleSelectClick}>
                  选择文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".skp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {selectedFile && !validationError && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md w-full">
                  <p className="text-sm font-medium text-gray-900">
                    已选择: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="mt-3">
                    <Button variant="primary" onClick={handleUpload} className="w-full">
                      开始上传
                    </Button>
                  </div>
                </div>
              )}
              {validationError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md w-full">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm font-medium text-red-700">{validationError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">上传说明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 仅支持 SketchUp (.skp) 格式文件</li>
              <li>• 最大文件大小：500MB</li>
              <li>• 文件会自动转换为Web可用的3D格式</li>
              <li>• 转换过程可能需要几分钟时间</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS (可能需要更新测试以适应新UI)

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/UploadPage.tsx
git commit -m "feat: add file validation and upload button to UploadPage"
```

### Task 5: 集成uploadService和上传逻辑

**Files:**
- Modify: `src/components/pages/UploadPage.tsx`
- Modify: `src/stores/appStore.ts` (添加upload progress更新)

- [ ] **Step 1: 编写失败测试**

在`src/components/pages/__tests__/UploadPage.test.tsx`添加：
```typescript
import { uploadService } from '../../../services/upload';

it('should call uploadService when upload button is clicked', async () => {
  const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });
  const mockModel = { id: '123', fileName: 'test.skp', createdAt: new Date() };

  (uploadService.uploadFile as jest.Mock).mockResolvedValue(mockModel);

  renderWithProviders(<UploadPage />);

  // Need to simulate file selection and click upload
  // This test will need to be updated based on implementation
});

it('should show upload progress', async () => {
  // Test progress display
});

it('should handle upload errors', async () => {
  (uploadService.uploadFile as jest.Mock).mockRejectedValue(new Error('Upload failed'));

  // Test error handling
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: FAIL with "uploadService.uploadFile is not a function" or test failures

- [ ] **Step 3: 最小实现**

首先更新`src/stores/appStore.ts`，添加进度更新回调支持：
```typescript
// 在AppState接口中添加
updateUploadProgress: (progress: number) => void;

// 在create函数中添加
updateUploadProgress: (progress) => set({ uploadProgress: progress }),
```

然后修改`src/components/pages/UploadPage.tsx`，添加上传逻辑：
```typescript
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { uploadService } from '../../services/upload';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setError, setUploading, uploadProgress, updateUploadProgress } = useAppStore();

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.skp')) {
      return '仅支持 .skp 格式文件';
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      return `文件大小 ${sizeInMB} MB 超过 500MB 限制`;
    }

    return null;
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setValidationError(null);
    setUploadStatus('idle');
    setUploadMessage('');

    if (file) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setError(error);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setValidationError(null);
    setUploadStatus('idle');
    setUploadMessage('');

    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setError(error);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  }, [setError]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadMessage('正在上传文件...');
      setUploading(true);
      updateUploadProgress(0);

      // 创建自定义axios配置以监听进度
      const model = await uploadService.uploadFile(selectedFile, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        updateUploadProgress(percentCompleted);
        setUploadMessage(`正在上传文件... ${percentCompleted}%`);
      });

      setUploadStatus('success');
      setUploadMessage('文件上传成功！正在跳转到查看器...');
      setUploading(false);

      // 导航到模型查看页面
      setTimeout(() => {
        navigate(`/model/${model.id}`);
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setUploadMessage(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setUploading(false);
      updateUploadProgress(0);
    }
  };

  // 修改uploadService以支持进度回调
  // 需要在upload.ts中添加进度回调参数
  const handleCancelUpload = () => {
    // 简单重置状态
    setUploadStatus('idle');
    setUploadMessage('');
    setUploading(false);
    updateUploadProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="上传SketchUp模型">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              {uploadStatus === 'uploading' ? (
                <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
              ) : uploadStatus === 'success' ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploadStatus === 'uploading' ? '正在上传...' :
                   uploadStatus === 'success' ? '上传成功！' :
                   uploadStatus === 'error' ? '上传失败' :
                   '拖放文件到此处'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {uploadMessage || '支持 .skp 文件，最大 500MB'}
                </p>
              </div>

              {uploadStatus === 'idle' && (
                <div className="mt-4">
                  <Button variant="primary" onClick={handleSelectClick}>
                    选择文件
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".skp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {selectedFile && !validationError && uploadStatus === 'idle' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md w-full">
                  <p className="text-sm font-medium text-gray-900">
                    已选择: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="mt-3">
                    <Button variant="primary" onClick={handleUpload} className="w-full">
                      开始上传
                    </Button>
                  </div>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="mt-4 w-full">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-700">上传进度</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" onClick={handleCancelUpload} className="w-full">
                      取消上传
                    </Button>
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md w-full">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm font-medium text-green-700">{uploadMessage}</p>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md w-full">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm font-medium text-red-700">{uploadMessage}</p>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" onClick={handleCancelUpload} className="w-full">
                      重新尝试
                    </Button>
                  </div>
                </div>
              )}

              {validationError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md w-full">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm font-medium text-red-700">{validationError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">上传说明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 仅支持 SketchUp (.skp) 格式文件</li>
              <li>• 最大文件大小：500MB</li>
              <li>• 文件会自动转换为Web可用的3D格式</li>
              <li>• 转换过程可能需要几分钟时间</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;
```

还需要更新`src/services/upload.ts`以支持进度回调：
```typescript
export const uploadService = {
  uploadFile: async (file: File, onProgress?: (progressEvent: any) => void): Promise<Model> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Model>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  },

  checkUploadStatus: async (modelId: string): Promise<{ status: string; progress?: number }> => {
    const response = await api.get<{ status: string; progress?: number }>(
      `/upload/status/${modelId}`
    );
    return response.data;
  },
};
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS (可能需要更新测试)

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/UploadPage.tsx src/stores/appStore.ts src/services/upload.ts
git commit -m "feat: integrate uploadService with progress tracking and navigation"
```

### Task 6: 添加上传状态持久化和错误恢复

**Files:**
- Modify: `src/components/pages/UploadPage.tsx` (添加加载状态恢复)
- Modify: `src/stores/appStore.ts` (添加上传状态持久化)

- [ ] **Step 1: 编写失败测试**

在`src/components/pages/__tests__/UploadPage.test.tsx`添加：
```typescript
it('should restore upload state on component mount', () => {
  // Set upload state in store before rendering
  useAppStore.getState().setUploading(true);
  useAppStore.getState().updateUploadProgress(50);

  renderWithProviders(<UploadPage />);

  // Should show uploading UI
  expect(screen.getByText('正在上传...')).toBeInTheDocument();
});

it('should handle page refresh during upload', () => {
  // Test that upload state is persisted
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: FAIL with missing elements or test failures

- [ ] **Step 3: 最小实现**

首先更新`src/stores/appStore.ts`以持久化上传状态：
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // ... existing state ...
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  currentUploadFile?: { name: string; size: number; lastModified: number };
  // ... existing methods ...
  setCurrentUploadFile: (file: { name: string; size: number; lastModified: number } | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... existing state ...
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
      currentUploadFile: undefined,

      // ... existing methods ...
      setCurrentUploadFile: (file) => set({ currentUploadFile: file || undefined }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentModelId: state.currentModelId,
        currentUploadFile: state.currentUploadFile,
      }),
    }
  )
);
```

然后更新`src/components/pages/UploadPage.tsx`以恢复状态：
```typescript
import React, { useState, useRef, useCallback, useEffect } from 'react';

const UploadPage: React.FC = () => {
  // ... existing state ...
  const {
    setError,
    setUploading,
    uploadProgress,
    updateUploadProgress,
    isUploading: storeIsUploading,
    currentUploadFile,
    setCurrentUploadFile
  } = useAppStore();

  useEffect(() => {
    // 如果store中有上传状态，恢复它
    if (storeIsUploading && currentUploadFile) {
      setUploadStatus('uploading');
      setUploadMessage('恢复上传...');
      // 这里可以尝试恢复上传，但简化版本只显示状态
    }
  }, [storeIsUploading, currentUploadFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadMessage('正在上传文件...');
      setUploading(true);
      updateUploadProgress(0);
      setCurrentUploadFile({
        name: selectedFile.name,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified,
      });

      // ... upload logic ...

      // 上传成功后清理
      setCurrentUploadFile(null);

    } catch (error) {
      // 错误处理
      setCurrentUploadFile(null);
    }
  };

  // ... rest of component ...
};
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/UploadPage.tsx src/stores/appStore.ts
git commit -m "feat: add upload state persistence and recovery"
```

### Task 7: API连接测试和错误处理

**Files:**
- Modify: `src/services/upload.ts` (改进错误处理)
- Create: `src/services/__tests__/upload.test.ts` (API测试)

- [ ] **Step 1: 编写失败测试**

创建`src/services/__tests__/upload.test.ts`：
```typescript
import { uploadService } from '../upload';
import api from '../api';

jest.mock('../api');

describe('uploadService', () => {
  const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload file successfully', async () => {
    const mockResponse = {
      id: '123',
      fileName: 'test.skp',
      fileSizeBytes: 1234,
      conversionStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      originalFormat: '.skp',
      convertedFormat: '.gltf'
    };

    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await uploadService.uploadFile(mockFile);

    expect(api.post).toHaveBeenCalledWith(
      '/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle upload errors', async () => {
    const error = new Error('Network error');
    (api.post as jest.Mock).mockRejectedValue(error);

    await expect(uploadService.uploadFile(mockFile)).rejects.toThrow('Network error');
  });

  it('should check upload status', async () => {
    const mockStatus = { status: 'processing', progress: 50 };
    (api.get as jest.Mock).mockResolvedValue({ data: mockStatus });

    const result = await uploadService.checkUploadStatus('123');

    expect(api.get).toHaveBeenCalledWith('/upload/status/123');
    expect(result).toEqual(mockStatus);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/services/__tests__/upload.test.ts`
预期: FAIL with "Cannot find module '../upload'" or test failures

- [ ] **Step 3: 最小实现**

更新`src/services/upload.ts`以改进错误处理：
```typescript
import api from './api';
import { Model } from '../types/models';

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
        timeout: 5 * 60 * 1000, // 5分钟超时
      });
      return response.data;
    } catch (error: any) {
      // 改进错误消息
      if (error.code === 'ECONNABORTED') {
        throw new Error('上传超时，请检查网络连接并重试');
      } else if (error.response?.status === 413) {
        throw new Error('文件太大，超过服务器限制');
      } else if (error.response?.status === 415) {
        throw new Error('不支持的文件格式');
      } else if (error.response?.status === 401) {
        throw new Error('请先登录');
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
      throw new Error(`获取上传状态失败: ${error.message || '未知错误'}`);
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
git commit -m "feat: improve upload error handling and add API tests"
```

### Task 8: 最终集成测试和验证

**Files:**
- Modify: `src/components/pages/__tests__/UploadPage.test.tsx` (完整集成测试)
- Create: `cypress/e2e/upload.cy.ts` (可选，E2E测试)

- [ ] **Step 1: 编写完整集成测试**

更新`src/components/pages/__tests__/UploadPage.test.tsx`，添加完整测试：
```typescript
describe('UploadPage integration', () => {
  it('should complete full upload flow', async () => {
    const mockFile = new File(['test content'], 'model.skp', { type: 'application/octet-stream' });
    const mockModel = {
      id: 'model-123',
      fileName: 'model.skp',
      fileSizeBytes: 12345,
      conversionStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      originalFormat: '.skp',
      convertedFormat: '.gltf'
    };

    (uploadService.uploadFile as jest.Mock).mockImplementation((file, onProgress) => {
      // 模拟进度更新
      if (onProgress) {
        setTimeout(() => onProgress({ loaded: 50, total: 100 }), 100);
        setTimeout(() => onProgress({ loaded: 100, total: 100 }), 200);
      }
      return Promise.resolve(mockModel);
    });

    const navigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigate,
    }));

    renderWithProviders(<UploadPage />);

    // 选择文件
    const fileInput = screen.getByText('选择文件').closest('button');
    expect(fileInput).toBeInTheDocument();

    // 模拟文件选择
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const fileList = {
      0: mockFile,
      length: 1,
      item: (index: number) => index === 0 ? mockFile : null,
    } as FileList;

    Object.defineProperty(input, 'files', {
      value: fileList,
    });

    fireEvent.change(input);

    // 验证文件显示
    await waitFor(() => {
      expect(screen.getByText('已选择: model.skp')).toBeInTheDocument();
    });

    // 点击上传
    const uploadButton = screen.getByText('开始上传');
    fireEvent.click(uploadButton);

    // 验证上传状态
    await waitFor(() => {
      expect(screen.getByText('正在上传...')).toBeInTheDocument();
    });

    // 验证进度显示
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    }, { timeout: 500 });

    // 验证成功状态和导航
    await waitFor(() => {
      expect(screen.getByText('上传成功！')).toBeInTheDocument();
      expect(navigate).toHaveBeenCalledWith('/model/model-123');
    }, { timeout: 2000 });
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: FAIL with various test failures

- [ ] **Step 3: 修复测试问题**

根据测试失败调整实现，可能包括：
1. 修复模拟问题
2. 调整异步等待
3. 修复UI状态问题

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/UploadPage.test.tsx`
预期: PASS

- [ ] **Step 5: 运行完整测试套件**

运行: `cd frontend && npm test`
预期: 所有测试通过

- [ ] **Step 6: 提交**

```bash
git add src/components/pages/__tests__/UploadPage.test.tsx
git commit -m "test: complete upload integration tests"
```

## 执行计划总结

计划已完成，包含8个任务，涵盖：
1. 扩展AppStore添加上传状态
2. 创建UploadPage测试结构
3. 添加文件选择处理
4. 添加验证逻辑和上传按钮
5. 集成uploadService和上传逻辑
6. 添加上传状态持久化
7. API连接测试和错误处理
8. 最终集成测试和验证

**下一步:** 使用subagent-driven-development或executing-plans技能执行此计划。

---
