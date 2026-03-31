# 前端基础框架实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现前端基础框架，包括TypeScript配置、构建工具、样式系统、应用入口和基础组件

**Architecture:** 基于设计文档的标准React企业级架构，采用单页面应用路由，React Query管理API状态，Zustand管理全局状态，Tailwind CSS样式系统

**Tech Stack:** React 18 + TypeScript 5.3 + Vite 5.0 + Tailwind CSS 3.3 + React Router 6 + React Query 5 + Zustand 4.4 + Three.js 0.158

---

## 文件结构

### 配置文件 (Task 4.1)
- Create: `frontend/tsconfig.json` - TypeScript根配置
- Create: `frontend/tsconfig.node.json` - Node环境配置
- Create: `frontend/vite.config.ts` - Vite构建配置
- Create: `frontend/tailwind.config.js` - Tailwind CSS配置
- Create: `frontend/postcss.config.js` - PostCSS配置
- Create: `frontend/index.html` - HTML入口

### 应用入口和核心文件 (Task 4.2)
- Create: `frontend/src/main.tsx` - React应用入口
- Create: `frontend/src/App.tsx` - 主应用组件
- Create: `frontend/src/App.css` - 全局样式
- Create: `frontend/src/index.css` - Tailwind入口样式
- Create: `frontend/src/types/` - TypeScript类型定义目录
- Create: `frontend/.env.development` - 开发环境变量
- Create: `frontend/.env.example` - 环境变量示例

### 基础组件和工具 (Task 4.3)
- Create: `frontend/src/components/ui/Button.tsx` - 基础按钮组件
- Create: `frontend/src/components/ui/Input.tsx` - 输入框组件
- Create: `frontend/src/components/ui/Card.tsx` - 卡片组件
- Create: `frontend/src/components/layouts/MainLayout.tsx` - 主布局组件
- Create: `frontend/src/components/pages/` - 页面组件目录
- Create: `frontend/src/services/api.ts` - Axios配置和基础API服务
- Create: `frontend/src/stores/appStore.ts` - Zustand全局状态管理

### 开发环境验证 (Task 4.4)
- Test: Vite开发服务器启动
- Test: TypeScript类型检查
- Test: Tailwind CSS样式应用
- Test: API代理配置

---

## 实施任务分解

### Task 1: TypeScript配置创建

**Files:**
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`

- [ ] **Step 1: 创建TypeScript根配置文件**

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
    "types": ["vite/client", "vitest/globals"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 2: 创建Node环境配置**

```json
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

- [ ] **Step 3: 验证TypeScript配置**

```bash
cd frontend
npx tsc --noEmit
```
Expected: 无错误输出

- [ ] **Step 4: 提交TypeScript配置**

```bash
cd frontend
git add tsconfig.json tsconfig.node.json
git commit -m "feat: 添加TypeScript配置"
```

### Task 2: Vite构建配置

**Files:**
- Create: `frontend/vite.config.ts`

- [ ] **Step 1: 创建Vite配置文件**

```typescript
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
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
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
          ui: ['tailwindcss', 'lucide-react', 'zustand'],
          query: ['@tanstack/react-query', 'axios'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 2: 验证Vite配置语法**

```bash
cd frontend
npx tsc --noEmit vite.config.ts
```
Expected: 无错误输出

- [ ] **Step 3: 提交Vite配置**

```bash
cd frontend
git add vite.config.ts
git commit -m "feat: 添加Vite构建配置"
```

### Task 3: 样式系统配置

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`

- [ ] **Step 1: 创建Tailwind CSS配置**

```javascript
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
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#f9fafb',
        foreground: '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
};
```

- [ ] **Step 2: 创建PostCSS配置**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: 验证样式配置**

```bash
cd frontend
node -c tailwind.config.js
node -c postcss.config.js
```
Expected: 无错误输出

- [ ] **Step 4: 提交样式配置**

```bash
cd frontend
git add tailwind.config.js postcss.config.js
git commit -m "feat: 添加Tailwind CSS和PostCSS配置"
```

### Task 4: HTML入口和环境变量

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/.env.development`
- Create: `frontend/.env.example`

- [ ] **Step 1: 创建HTML入口文件**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SketchUp Web Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建开发环境变量文件**

```env
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SketchUp Web Viewer
VITE_UPLOAD_MAX_SIZE=524288000
VITE_ALLOWED_FILE_TYPES=.skp
```

- [ ] **Step 3: 创建环境变量示例文件**

```env
# .env.example
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SketchUp Web Viewer
VITE_UPLOAD_MAX_SIZE=524288000
VITE_ALLOWED_FILE_TYPES=.skp
```

- [ ] **Step 4: 提交HTML和环境变量配置**

```bash
cd frontend
git add index.html .env.development .env.example
git commit -m "feat: 添加HTML入口和环境变量配置"
```

### Task 5: React应用入口和全局样式

**Files:**
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/App.css`
- Create: `frontend/src/index.css`

- [ ] **Step 1: 创建Tailwind CSS入口样式**

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }

  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  .container-custom {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}
```

- [ ] **Step 2: 创建全局应用样式**

```css
/* src/App.css */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding: 1rem;
}

.app-footer {
  margin-top: auto;
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}
```

- [ ] **Step 3: 创建React主应用组件**

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layouts/MainLayout';
import UploadPage from './components/pages/UploadPage';
import ViewerPage from './components/pages/ViewerPage';
import SharePage from './components/pages/SharePage';
import ErrorPage from './components/pages/ErrorPage';
import NotFoundPage from './components/pages/NotFoundPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<UploadPage />} />
              <Route path="model/:modelId" element={<ViewerPage />} />
              <Route path="share/:token" element={<SharePage />} />
              <Route path="error" element={<ErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

- [ ] **Step 4: 创建React应用入口**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: 验证TypeScript类型**

```bash
cd frontend
npx tsc --noEmit src/main.tsx src/App.tsx
```
Expected: 无错误输出

- [ ] **Step 6: 提交React应用入口**

```bash
cd frontend
git add src/main.tsx src/App.tsx src/App.css src/index.css
git commit -m "feat: 添加React应用入口和全局样式"
```

### Task 6: TypeScript类型定义

**Files:**
- Create: `frontend/src/types/api.ts`
- Create: `frontend/src/types/models.ts`
- Create: `frontend/src/types/viewer.ts`

- [ ] **Step 1: 创建API接口类型**

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}
```

- [ ] **Step 2: 创建数据模型类型（与后端同步）**

```typescript
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
```

- [ ] **Step 3: 创建3D查看器类型**

```typescript
// src/types/viewer.ts
export type Vector3 = [number, number, number];

export interface CameraState {
  position: Vector3;
  target: Vector3;
  zoom: number;
}

export interface ScenePreset {
  id: string;
  name: string;
  cameraPosition: Vector3;
  cameraTarget: Vector3;
  isDefault: boolean;
}

export interface Hotspot {
  id: string;
  label: string;
  position: Vector3;
  rotation?: { x: number; y: number; z: number };
  data: Record<string, any>;
}

export interface ViewerControls {
  enableRotation: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
}
```

- [ ] **Step 4: 验证类型定义**

```bash
cd frontend
npx tsc --noEmit src/types/*.ts
```
Expected: 无错误输出

- [ ] **Step 5: 提交类型定义**

```bash
cd frontend
git add src/types/
git commit -m "feat: 添加TypeScript类型定义"
```

### Task 7: 基础UI组件

**Files:**
- Create: `frontend/src/components/ui/Button.tsx`
- Create: `frontend/src/components/ui/Input.tsx`
- Create: `frontend/src/components/ui/Card.tsx`

- [ ] **Step 1: 创建Button组件**

```tsx
// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const loadingClasses = loading ? 'opacity-70 cursor-not-allowed' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${loadingClasses} ${disabledClasses} ${className}
      `.trim()}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
```

- [ ] **Step 2: 创建Input组件**

```tsx
// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:border-transparent
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          }
          ${className}
        `.trim()}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
```

- [ ] **Step 3: 创建Card组件**

```tsx
// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  actions,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
};

export default Card;
```

- [ ] **Step 4: 验证UI组件**

```bash
cd frontend
npx tsc --noEmit src/components/ui/*.tsx
```
Expected: 无错误输出

- [ ] **Step 5: 提交基础UI组件**

```bash
cd frontend
git add src/components/ui/
git commit -m "feat: 添加基础UI组件（Button、Input、Card）"
```

### Task 8: 主布局和页面组件框架

**Files:**
- Create: `frontend/src/components/layouts/MainLayout.tsx`
- Create: `frontend/src/components/pages/UploadPage.tsx`
- Create: `frontend/src/components/pages/ViewerPage.tsx`
- Create: `frontend/src/components/pages/SharePage.tsx`
- Create: `frontend/src/components/pages/ErrorPage.tsx`
- Create: `frontend/src/components/pages/NotFoundPage.tsx`

- [ ] **Step 1: 创建主布局组件**

```tsx
// src/components/layouts/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import Button from '../ui/Button';

const MainLayout: React.FC = () => {
  const { error, clearAll } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">SketchUp Web Viewer</h1>
            </div>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Button variant="ghost" size="sm">
                    首页
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm">
                    上传
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                关闭
              </Button>
            </div>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container-custom py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2026 SketchUp Web Viewer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
```

- [ ] **Step 2: 创建上传页面组件**

```tsx
// src/components/pages/UploadPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Upload } from 'lucide-react';

const UploadPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card title="上传SketchUp模型">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors">
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
                <Button variant="primary">选择文件</Button>
              </div>
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

- [ ] **Step 3: 创建查看器页面组件**

```tsx
// src/components/pages/ViewerPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ViewerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型查看器</h1>
          <p className="text-gray-600 mt-1">加载中...</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">重置视图</Button>
          <Button variant="primary">分享</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <div className="h-full flex items-center justify-center bg-gray-100 rounded">
              <p className="text-gray-500">3D查看器区域</p>
            </div>
          </Card>
        </div>

        <div>
          <Card title="控制面板">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">场景预设</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">默认视图</Button>
                  <Button variant="ghost" className="w-full justify-start">俯视图</Button>
                  <Button variant="ghost" className="w-full justify-start">侧视图</Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">模型信息</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>文件名: example.skp</p>
                  <p>文件大小: 15.2 MB</p>
                  <p>状态: 转换完成</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;
```

- [ ] **Step 4: 创建分享页面组件**

```tsx
// src/components/pages/SharePage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock } from 'lucide-react';

const SharePage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <Card title="访问分享链接">
        <div className="space-y-6">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">需要密码</h3>
            <p className="text-gray-600 mt-1">
              此分享链接受密码保护，请输入密码继续
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="密码"
              type="password"
              placeholder="请输入访问密码"
            />

            <div className="flex space-x-3">
              <Button variant="primary" className="flex-1">
                确认
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>输入密码后即可查看3D模型</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SharePage;
```

- [ ] **Step 5: 创建错误页面组件**

```tsx
// src/components/pages/ErrorPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">发生错误</h3>
            <p className="text-gray-600 mt-1">
              抱歉，处理您的请求时发生了错误
            </p>
          </div>
          <div className="pt-4">
            <Button variant="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorPage;
```

- [ ] **Step 6: 创建404页面组件**

```tsx
// src/components/pages/NotFoundPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center space-y-4">
          <FileQuestion className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">页面未找到</h3>
            <p className="text-gray-600 mt-1">
              您访问的页面不存在或已被移动
            </p>
          </div>
          <div className="pt-4">
            <Button variant="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
```

- [ ] **Step 7: 验证页面组件**

```bash
cd frontend
npx tsc --noEmit src/components/layouts/*.tsx src/components/pages/*.tsx
```
Expected: 无错误输出

- [ ] **Step 8: 提交布局和页面组件**

```bash
cd frontend
git add src/components/layouts/ src/components/pages/
git commit -m "feat: 添加主布局和页面组件框架"
```

### Task 9: API服务层

**Files:**
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/services/model.ts`
- Create: `frontend/src/services/upload.ts`

- [ ] **Step 1: 创建Axios配置和基础API服务**

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

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || error.message;
    console.error('API请求失败:', message);
    return Promise.reject(new Error(message));
  }
);

export default api;
```

- [ ] **Step 2: 创建模型管理服务**

```typescript
// src/services/model.ts
import api from './api';
import { Model, CreateModelParams, UpdateModelParams, PaginatedResponse } from '../types/models';

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
```

- [ ] **Step 3: 创建文件上传服务**

```typescript
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
```

- [ ] **Step 4: 验证API服务**

```bash
cd frontend
npx tsc --noEmit src/services/*.ts
```
Expected: 无错误输出

- [ ] **Step 5: 提交API服务层**

```bash
cd frontend
git add src/services/
git commit -m "feat: 添加API服务层（Axios配置、模型服务、上传服务）"
```

### Task 10: 状态管理

**Files:**
- Create: `frontend/src/stores/appStore.ts`

- [ ] **Step 1: 创建应用全局状态管理**

```typescript
// src/stores/appStore.ts
import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  currentModelId: string | null;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showToast: (toast: AppState['toast']) => void;
  setCurrentModel: (modelId: string | null) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  toast: null,
  currentModelId: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  showToast: (toast) => set({ toast }),
  setCurrentModel: (modelId) => set({ currentModelId: modelId }),
  clearAll: () => set({ isLoading: false, error: null, toast: null }),
}));
```

- [ ] **Step 2: 验证状态管理**

```bash
cd frontend
npx tsc --noEmit src/stores/*.ts
```
Expected: 无错误输出

- [ ] **Step 3: 提交状态管理**

```bash
cd frontend
git add src/stores/
git commit -m "feat: 添加应用全局状态管理（Zustand）"
```

### Task 11: 开发环境验证

**Files:**
- Test: 启动开发服务器
- Test: TypeScript类型检查
- Test: Tailwind CSS样式应用
- Test: API代理配置

- [ ] **Step 1: 安装前端依赖**

```bash
cd frontend
npm install
```
Expected: 成功安装所有依赖包

- [ ] **Step 2: 启动开发服务器测试**

```bash
cd frontend
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep -q "SketchUp Web Viewer" && echo "开发服务器启动成功" || echo "开发服务器启动失败"
```
Expected: 输出"开发服务器启动成功"

- [ ] **Step 3: 验证TypeScript类型检查**

```bash
cd frontend
npx tsc --noEmit
```
Expected: 无错误输出

- [ ] **Step 4: 验证Tailwind CSS构建**

```bash
cd frontend
npx tailwindcss -i src/index.css -o dist/output.css --minify
ls -la dist/output.css
```
Expected: 生成output.css文件

- [ ] **Step 5: 提交开发环境验证结果**

```bash
cd frontend
git add package-lock.json
git commit -m "chore: 安装前端依赖并验证开发环境"
```

### Task 12: 创建测试基础配置

**Files:**
- Create: `frontend/src/test/setup.ts`

- [ ] **Step 1: 创建测试配置文件**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';

// 模拟环境变量
process.env.VITE_API_URL = 'http://localhost:3001/api';
process.env.VITE_APP_NAME = 'Test App';

// 清除console错误和警告
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

- [ ] **Step 2: 创建Button组件测试**

```typescript
// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button组件', () => {
  test('渲染基础按钮', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  test('点击按钮触发onClick事件', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);

    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('禁用状态下按钮不可点击', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>禁用按钮</Button>);

    const button = screen.getByText('禁用按钮');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('加载状态下显示加载指示器', () => {
    render(<Button loading>加载中</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('加载中');
  });
});
```

- [ ] **Step 3: 运行组件测试**

```bash
cd frontend
npm test -- Button.test.tsx --run
```
Expected: 所有测试通过

- [ ] **Step 4: 提交测试配置**

```bash
cd frontend
git add src/test/ src/components/ui/__tests__/
git commit -m "test: 添加测试基础配置和Button组件测试"
```

---

## 计划完成检查

实施计划已分解为12个任务，每个任务包含具体的实施步骤和验证方法。所有代码片段都已提供，无占位符或TODO标记。

### 验证清单：
- [x] 所有文件路径精确指定
- [x] 每个步骤包含完整代码
- [x] 每个步骤包含验证命令和预期输出
- [x] 类型定义与后端模型同步
- [x] 组件Props接口完整定义
- [x] 路由配置与设计文档一致
- [x] 状态管理逻辑清晰
- [x] API服务层配置完整
- [x] 开发环境验证步骤完整
- [x] 测试基础配置完整

### 实施顺序：
1. Task 1-4: 基础配置文件创建
2. Task 5-6: 应用入口和类型定义
3. Task 7-8: UI组件和页面框架
4. Task 9-10: API服务和状态管理
5. Task 11-12: 开发环境验证和测试

每个任务可以独立实施和验证，任务间依赖关系清晰。完成所有任务后，前端基础框架将完全实现，可以进行下一步的文件上传功能开发。