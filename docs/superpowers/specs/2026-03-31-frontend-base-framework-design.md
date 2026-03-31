# SketchUp Web Viewer 前端基础框架设计

## 概述
本设计文档定义了SketchUp Web Viewer v1.0的前端基础架构，作为Phase 1实施计划中Task 4的具体实施方案。前端采用现代React技术栈，专注于3D模型上传、查看和分享的核心功能。

**设计目标：**
- 建立可扩展、可维护的前端架构
- 支持单页面应用流畅导航
- 集成3D可视化能力（Three.js）
- 提供优秀的开发体验和类型安全
- 为后续功能扩展奠定基础

**设计原则：**
- **职责分离**：清晰的代码组织和分层架构
- **类型安全**：完整的TypeScript集成
- **开发友好**：现代化工具链和热重载
- **性能优先**：代码分割、懒加载、合理缓存
- **可测试性**：组件独立，易于单元测试

## 技术栈选择

### 核心框架
- **React 18.2.0**：UI框架，支持并发特性
- **TypeScript 5.3.3**：类型安全，提高代码质量
- **React Router 6.21.1**：单页应用路由管理

### 3D可视化
- **Three.js 0.158.0**：3D渲染引擎
- **@react-three/fiber 8.14.5**：React Three.js绑定
- **@react-three/drei 9.95.1**：Three.js工具集

### 状态管理和数据获取
- **@tanstack/react-query 5.12.2**：API数据管理、缓存、自动重试
- **Zustand 4.4.7**：轻量级全局状态管理
- **Axios 1.6.2**：HTTP客户端

### UI/样式系统
- **Tailwind CSS 3.3.6**：原子化CSS框架
- **Lucide React 0.309.0**：图标库
- **Autoprefixer + PostCSS**：CSS后处理

### 构建和开发工具
- **Vite 5.0.10**：现代构建工具，快速热重载
- **Vitest 1.1.0**：测试框架
- **ESLint + Prettier**：代码质量和格式化
- **@vitejs/plugin-react**：React快速刷新

## 项目结构设计

```
frontend/
├── package.json              # 依赖管理（已存在）
├── tsconfig.json            # TypeScript根配置（待创建）
├── tsconfig.node.json       # Node环境配置（待创建）
├── vite.config.ts           # Vite构建配置（待创建）
├── tailwind.config.js       # Tailwind CSS配置（待创建）
├── postcss.config.js        # PostCSS配置（待创建）
├── index.html               # HTML入口文件（待创建）
├── public/                  # 静态资源目录
│   ├── favicon.ico
│   └── robots.txt
└── src/                     # 源代码目录
    ├── main.tsx            # React应用入口（待创建）
    ├── App.tsx             # 主应用组件（待创建）
    ├── App.css             # 全局样式（待创建）
    ├── index.css           # Tailwind入口样式（待创建）
    ├── types/              # TypeScript类型定义
    │   ├── api.ts          # API接口类型
    │   ├── models.ts       # 数据模型类型（与后端同步）
    │   └── viewer.ts       # 3D查看器类型
    ├── components/         # React组件库
    │   ├── ui/            # 基础UI组件
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   └── Modal.tsx
    │   ├── pages/         # 页面组件
    │   │   ├── UploadPage.tsx
    │   │   ├── ViewerPage.tsx
    │   │   ├── SharePage.tsx
    │   │   ├── ErrorPage.tsx
    │   │   └── NotFoundPage.tsx
    │   ├── viewer/        # 3D查看器专用组件
    │   │   ├── ModelViewer.tsx
    │   │   ├── ViewerControls.tsx
    │   │   └── HotspotMarker.tsx
    │   └── layouts/       # 布局组件
    │       └── MainLayout.tsx
    ├── hooks/             # 自定义React Hooks
    │   ├── useUpload.ts
    │   ├── useViewer.ts
    │   ├── useShare.ts
    │   └── useToast.ts
    ├── services/          # API服务层
    │   ├── api.ts         # Axios配置和基础请求
    │   ├── upload.ts      # 文件上传服务
    │   ├── model.ts       # 模型管理服务
    │   └── share.ts       # 分享链接服务
    ├── stores/            # 状态管理
    │   ├── appStore.ts    # 应用全局状态
    │   └── viewerStore.ts # 查看器专用状态
    └── utils/             # 工具函数
        ├── constants.ts   # 常量定义
        ├── helpers.ts     # 通用工具函数
        ├── validation.ts  # 验证函数
        └── formatters.ts  # 格式化函数
```

## 路由架构设计

### 路由配置
采用React Router 6实现单页面应用路由，支持深度链接和浏览器历史记录。

```typescript
// 路由类型定义
interface RouteConfig {
  path: string;
  element: React.ReactElement;
  children?: RouteConfig[];
}

// 主要路由定义
const routes: RouteConfig[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <UploadPage /> },          // 首页即上传页
      { path: '/model/:modelId', element: <ViewerPage /> }, // 模型查看器
      { path: '/share/:token', element: <SharePage /> },    // 分享链接访问
      { path: '/error', element: <ErrorPage /> },           // 错误页面
      { path: '*', element: <NotFoundPage /> },             // 404页面
    ],
  },
];
```

### 页面组件职责

1. **UploadPage.tsx** - 文件上传界面
   - 拖放上传区域（支持.skp文件）
   - 文件大小和类型验证
   - 上传进度实时显示
   - 成功/错误状态反馈
   - 上传历史记录查看

2. **ViewerPage.tsx** - 3D模型查看器
   - 嵌入`<ModelViewer />`组件
   - 控制面板（缩放、旋转、平移、重置视图）
   - 场景预设选择和切换
   - 热点导航和标记显示
   - 模型信息展示

3. **SharePage.tsx** - 分享链接访问
   - 密码验证（如需要）
   - 模型加载状态显示
   - 链接复制功能
   - 访问次数限制检查

4. **MainLayout.tsx** - 主布局组件
   - 应用导航栏/页眉
   - 主要内容容器
   - 全局错误提示和Toast通知
   - 全局加载状态管理

### 路由守卫策略
- **公开路由**：分享页面(`/share/:token`)无需认证
- **基础路由**：上传和查看器页面为基本功能
- **错误边界**：每个页面组件封装错误边界
- **懒加载**：页面组件使用React.lazy进行代码分割

## API通信层设计

### Axios配置
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 可添加认证token等
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  response => response.data, // 直接返回data字段
  error => {
    const message = error.response?.data?.message || error.message;
    console.error('API请求失败:', message);
    return Promise.reject(new Error(message));
  }
);

export default api;
```

### React Query配置
```typescript
// src/App.tsx中的QueryClient配置
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟数据保鲜
      cacheTime: 10 * 60 * 1000, // 10分钟缓存时间
      retry: 1, // 失败重试1次
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### API服务模块
```typescript
// src/services/model.ts
import api from './api';
import { Model, CreateModelParams } from '../types/models';

export const modelService = {
  // 创建模型（上传文件）
  createModel: async (params: CreateModelParams) => {
    const response = await api.post<Model>('/models', params);
    return response.data;
  },

  // 获取模型详情
  getModel: async (modelId: string) => {
    const response = await api.get<Model>(`/models/${modelId}`);
    return response.data;
  },

  // 获取模型列表
  getModels: async (page = 1, pageSize = 10) => {
    const response = await api.get<PaginatedResponse<Model>>('/models', {
      params: { page, pageSize },
    });
    return response.data;
  },

  // 更新模型状态
  updateModel: async (modelId: string, updates: Partial<Model>) => {
    const response = await api.patch<Model>(`/models/${modelId}`, updates);
    return response.data;
  },
};
```

## 状态管理设计

### Zustand全局状态
```typescript
// src/stores/appStore.ts
import { create } from 'zustand';

interface AppState {
  // 全局状态
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // 当前模型状态
  currentModelId: string | null;

  // 动作
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

### 查看器专用状态
```typescript
// src/stores/viewerStore.ts
import { create } from 'zustand';

interface ViewerState {
  // 查看器状态
  isPlaying: boolean;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  currentScene: string;

  // 动作
  togglePlay: () => void;
  setCamera: (position: [number, number, number], target: [number, number, number]) => void;
  setScene: (sceneId: string) => void;
  resetView: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  isPlaying: false,
  cameraPosition: [0, 0, 5],
  cameraTarget: [0, 0, 0],
  currentScene: 'default',

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCamera: (position, target) => set({ cameraPosition: position, cameraTarget: target }),
  setScene: (sceneId) => set({ currentScene: sceneId }),
  resetView: () => set({
    cameraPosition: [0, 0, 5],
    cameraTarget: [0, 0, 0],
    currentScene: 'default',
  }),
}));
```

## 样式系统设计

### Tailwind CSS配置
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

### PostCSS配置
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 基础UI组件设计原则

1. **可复用性**：组件设计为独立、可复用单元
2. **可组合性**：通过props和children进行灵活组合
3. **样式分离**：使用Tailwind类，避免内联样式
4. **类型安全**：完整的TypeScript Props接口定义
5. **无障碍访问**：支持键盘导航和屏幕阅读器

**示例组件：Button.tsx**
```tsx
// src/components/ui/Button.tsx
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

## 开发环境配置

### TypeScript配置
```json
// tsconfig.json
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

### Vite构建配置
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

### 环境变量管理
```env
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SketchUp Web Viewer
VITE_UPLOAD_MAX_SIZE=524288000
VITE_ALLOWED_FILE_TYPES=.skp
```

```env
# .env.production
VITE_API_URL=https://api.example.com/api
VITE_APP_NAME=SketchUp Web Viewer
VITE_UPLOAD_MAX_SIZE=524288000
VITE_ALLOWED_FILE_TYPES=.skp
```

## 实施步骤概述

### Task 4.1：基础配置文件创建
1. **TypeScript配置**：创建`tsconfig.json`和`tsconfig.node.json`
2. **构建工具配置**：创建`vite.config.ts`
3. **样式配置**：创建`tailwind.config.js`和`postcss.config.js`
4. **HTML入口**：创建`index.html`

### Task 4.2：应用入口和核心文件
1. **React入口**：创建`src/main.tsx`和`src/App.tsx`
2. **全局样式**：创建`src/index.css`（Tailwind入口）
3. **类型定义**：创建基础TypeScript类型文件
4. **环境变量**：创建`.env.development`和`.env.example`

### Task 4.3：基础组件和工具
1. **基础UI组件**：创建Button、Input、Card等组件
2. **页面框架**：创建MainLayout和基础页面组件
3. **API服务层**：创建axios配置和基础服务
4. **状态管理**：创建Zustand store配置

### Task 4.4：开发环境验证
1. **启动开发服务器**：验证Vite配置正确性
2. **代理配置测试**：验证API代理正常工作
3. **热重载验证**：验证代码修改自动刷新
4. **类型检查**：验证TypeScript配置正确

## 设计审查要点

### 一致性检查
- 前端技术栈与Phase 1计划保持一致
- 项目结构与现有后端架构模式对齐
- 类型定义与后端模型定义同步

### 可扩展性考虑
- 预留了用户认证和权限管理的扩展点
- 组件设计支持未来的主题切换
- 状态管理支持复杂业务场景扩展
- 路由结构支持新增功能页面

### 性能优化
- 代码分割配置（vendor、three、ui等chunk）
- 图片和静态资源优化路径
- 开发环境热重载优化
- 生产环境构建优化配置

### 开发体验
- 完整的路径别名配置
- ESLint和Prettier代码质量工具
- 测试环境配置（Vitest + Testing Library）
- 环境变量管理和类型安全

## 风险与缓解

### 技术风险
1. **Three.js集成复杂性**：使用@react-three/fiber简化集成，提供清晰的组件抽象
2. **大文件上传性能**：分块上传、进度显示、错误恢复机制
3. **跨浏览器兼容性**：现代浏览器支持，提供降级方案

### 开发风险
1. **TypeScript学习曲线**：提供完整类型定义，减少any类型使用
2. **状态管理复杂性**：Zustand简化状态管理，React Query处理API状态
3. **构建配置复杂性**：使用Vite简化配置，提供清晰注释

### 维护风险
1. **依赖版本管理**：固定关键依赖版本，定期更新检查
2. **代码质量保证**：ESLint规则配置，Prettier自动格式化
3. **文档完整性**：组件文档、API文档、开发指南

## 后续计划

完成前端基础框架搭建后，按Phase 1计划继续：
- **Task 5**：文件上传服务实现（后端）
- **Task 6**：前端上传页面实现
- **Task 7**：分享链接功能实现
- **Task 8**：基础3D查看器实现

每个任务将遵循相同的设计→实现→验证流程，确保系统质量。

---
*设计文档版本：1.0*
*设计日期：2026-03-31*
*关联计划：Phase 1 Task 4 - 前端基础框架搭建*