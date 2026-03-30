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