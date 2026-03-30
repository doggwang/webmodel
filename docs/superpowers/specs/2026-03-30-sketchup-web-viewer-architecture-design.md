---
name: SketchUp Web Viewer v1.0 系统架构设计
description: 完整的前后端架构设计，包括格式转换策略、用户系统扩展性和技术栈选择
type: project
---

# SketchUp Web Viewer v1.0 系统架构设计

## 项目概述

### 核心业务需求
设计师上传 `.skp` 文件 → 自动转换格式 → 生成分享链接 → 甲方在浏览器中查看3D模型

### 关键约束
- v1.0 为完整闭环产品（上传-转换-分享-viewer）
- 最大支持 500MB .skp 文件
- 移动端适配，目标帧率 ≥ 30 FPS
- 首屏加载 ≤ 5秒（100MB内模型）

## 格式转换策略分析

### 1. 格式选择：glTF/Draco vs OBJ

| 维度 | glTF/Draco | OBJ |
|------|------------|-----|
| **Web原生支持** | ✅ 专门为Web设计，Three.js原生优化 | ⚠️ 需要额外解析，性能较差 |
| **文件大小** | ✅ Draco压缩减少70-90%文件大小 | ❌ 文件较大，无内置压缩 |
| **材质支持** | ✅ 完整PBR材质（金属/粗糙度、镜面光泽度） | ⚠️ 仅基础材质（通过.mtl文件） |
| **单一文件** | ✅ 几何、材质、纹理、动画一体化 | ❌ 需要.obj + .mtl + 纹理文件 |
| **流式传输** | ✅ 支持渐进式加载和LOD | ❌ 不适合流式传输 |
| **现代特性** | ✅ 动画、场景、相机预设、PBR | ❌ 仅基础几何和材质 |

### 2. 材质保留能力对比

**glTF材质保留**：
- PBR材质系统（metallic-roughness工作流）
- 支持贴图：漫反射、法线、金属度、粗糙度、环境光遮蔽
- 从SketchUp转换可保留大部分材质属性

**OBJ材质保留**：
- 通过.mtl文件描述基础材质属性
- 支持：环境光(Ka)、漫反射(Kd)、镜面反射(Ks)、透明度(d)
- 纹理贴图支持有限

### 3. 推荐方案：glTF为主，OBJ为备选

**主要输出格式**：glTF + Draco压缩
- 针对Web查看优化
- 最佳性能和用户体验

**可选输出格式**：OBJ + MTL
- 提供给需要导出到其他工具的用户
- 作为备选格式，非核心查看格式

**转换策略**：
1. 上传.skp → 转换服务 → 生成glTF/Draco（主要）
2. 可选生成OBJ版本（按需）
3. 前端Three.js加载glTF获得最佳体验

## 用户系统扩展性设计

### 1. v1.0 范围 vs 未来扩展

**v1.0（无用户系统）**：
- 匿名上传和分享
- 链接访问控制（密码+有效期）
- 无用户注册/登录

**未来扩展（预留架构）**：
- 用户注册/登录（邮箱+密码、OAuth）
- 模型库管理
- 订阅计划（免费/专业/企业）
- 团队协作功能
- 使用量统计和计费

### 2. 数据库扩展设计

```sql
-- 用户表（v1.0可创建但不使用，v1.1+启用）
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    display_name TEXT,
    subscription_plan TEXT DEFAULT 'free', -- free/pro/enterprise
    subscription_expires_at TIMESTAMP,
    storage_quota BIGINT DEFAULT 1073741824, -- 1GB default
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 模型表扩展用户关联
ALTER TABLE models ADD COLUMN user_id UUID REFERENCES users(id);

-- 使用量统计表
CREATE TABLE usage_stats (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    date DATE,
    upload_count INTEGER DEFAULT 0,
    upload_bytes BIGINT DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0
);
```

### 3. 认证授权架构

**模块化设计**：
```typescript
// 认证模块接口
interface AuthModule {
  // v1.0: 简单token验证
  validateShareToken(token: string): Promise<boolean>;

  // v1.1+: 用户认证
  register(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<Session>;
  logout(sessionId: string): Promise<void>;
}

// 实现：先实现v1.0需求，预留v1.1+扩展点
class AuthService implements AuthModule {
  // v1.0实现
  async validateShareToken(token: string): Promise<boolean> {
    // 验证分享链接有效性和密码
  }

  // v1.1+占位符
  async register(email: string, password: string): Promise<User> {
    throw new Error('User registration not implemented in v1.0');
  }
}
```

## 完整系统架构设计

### 1. 总体架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   API网关       │    │   后端服务       │
│   (React +      │◄──►│   (Express/     │◄──►│   (Node.js +    │
│    Three.js)    │    │    Fastify)     │    │    TypeScript)  │
│                 │    │                 │    │                 │
│   • 上传页面     │    │   • 路由分发    │    │   • 业务逻辑     │
│   • 分享页面     │    │   • 认证中间件  │    │   • 数据访问     │
│   • 查看器页面   │    │   • 限流/日志   │    │   • 文件处理     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/静态资源   │    │   文件存储       │    │   数据库         │
│   (S3 +         │    │   (S3/MinIO)    │    │   (PostgreSQL)  │
│    CloudFront)  │    │                 │    │   + Redis缓存    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                     │
                                     ▼
                          ┌─────────────────┐
                          │   转换服务       │
                          │   (Python +     │
                          │    Docker)      │
                          │                 │
                          │   • .skp解析    │
                          │   • glTF转换    │
                          │   • Draco压缩   │
                          └─────────────────┘
```

### 2. 前端技术栈

**核心框架**：
- React 18 + TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- Tailwind CSS + Headless UI

**状态管理**：
- Zustand（轻量级，适合3D应用）
- React Query（数据获取和缓存）

**路由和导航**：
- React Router v6
- 页面：上传页、分享页、查看器页、错误页

**3D组件架构**：
```
src/components/3d/
├── Viewer/           # 3D查看器主容器
├── Controls/         # 交互控制（旋转、平移、缩放）
├── Hotspots/         # 3D热点标签系统
├── Measurements/     # 测量工具（距离、面积）
├── Scenes/           # 场景切换组件
└── utils/            # 3D工具函数
```

### 3. 后端服务架构

**服务分层**：
```typescript
src/
├── api/              # API路由层
│   ├── upload.ts     # 文件上传API
│   ├── share.ts      # 分享链接API
│   ├── viewer.ts     # 查看器API
│   └── admin.ts      # 管理API（预留）
├── controllers/      # 业务逻辑控制层
├── services/         # 业务服务层
│   ├── FileService.ts
│   ├── ConversionService.ts
│   ├── ShareService.ts
│   └── AuthService.ts
├── models/           # 数据模型层
├── middleware/       # 中间件（认证、验证、日志）
├── utils/            # 工具函数
└── config/           # 配置管理
```

**核心API端点**：
- `POST /api/upload` - 文件上传（分片上传支持）
- `GET /api/upload/:id/progress` - 上传进度查询
- `POST /api/convert` - 触发格式转换
- `GET /api/models/:id` - 获取模型信息
- `POST /api/share` - 创建分享链接
- `GET /api/view/:token` - 验证查看权限
- `GET /api/hotspots/:modelId` - 获取热点数据
- `GET /api/scenes/:modelId` - 获取场景预设

### 4. 数据存储设计

**PostgreSQL主表**：
```sql
-- 模型表（核心）
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    original_file_path TEXT,      -- 原始.skp文件路径
    converted_file_path TEXT,     -- 转换后glTF文件路径
    file_size_bytes BIGINT,
    original_format TEXT DEFAULT 'skp',
    converted_format TEXT DEFAULT 'gltf+dr',
    conversion_status TEXT DEFAULT 'pending', -- pending/processing/completed/failed
    conversion_error TEXT,
    thumbnail_url TEXT,           -- 缩略图URL
    metadata JSONB,               -- 模型元数据
    user_id UUID,                 -- 预留：关联用户
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 分享链接表
CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,   -- 分享token
    password_hash TEXT,           -- 访问密码哈希
    expires_at TIMESTAMPTZ,       -- 过期时间
    max_views INTEGER,            -- 最大查看次数
    view_count INTEGER DEFAULT 0, -- 实际查看次数
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 热点数据表
CREATE TABLE hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position JSONB NOT NULL,      -- {x, y, z}
    rotation JSONB,               -- 旋转角度
    data JSONB NOT NULL,          -- 面积、材质、描述、图片等
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 场景预设表
CREATE TABLE scene_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    camera_position JSONB NOT NULL, -- {x, y, z}
    camera_target JSONB NOT NULL,   -- 注视点
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Redis缓存**：
- 会话存储（未来用户登录）
- 转换任务队列状态
- 高频查询缓存（模型元数据、热点数据）

### 5. 转换服务设计

**技术选择**：
- **主方案**：Python + SketchUp SDK（官方支持）
- **备选方案**：开源转换工具（skp-to-gltf等）

**Docker容器设计**：
```dockerfile
FROM python:3.9-slim

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 安装SketchUp转换工具或开源工具
COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

# 复制转换脚本
COPY convert_skp_to_gltf.py /app/
COPY convert_skp_to_obj.py /app/  # 可选OBJ转换

WORKDIR /app
CMD ["python", "convert_skp_to_gltf.py"]
```

**转换流程**：
1. 接收转换任务（模型ID、文件路径）
2. 下载原始.skp文件
3. 执行格式转换（glTF + Draco压缩）
4. 可选：生成OBJ版本
5. 提取材质和纹理信息
6. 生成缩略图
7. 上传转换结果到对象存储
8. 更新数据库状态

### 6. 文件处理流程

```
前端上传流程：
1. 用户选择.skp文件
2. 前端分片（每片10MB）
3. 上传分片到服务器
4. 服务器合并分片，验证文件
5. 存储到S3/MinIO临时区域
6. 创建转换任务
7. 返回任务ID，前端轮询状态

后台转换流程：
1. 消息队列接收转换任务
2. 转换服务下载原始文件
3. 执行格式转换（5-30分钟，依赖文件大小）
4. 上传转换结果到永久存储
5. 更新数据库：conversion_status = 'completed'
6. 可选：发送通知（WebSocket/Email）

用户访问流程：
1. 点击分享链接
2. 验证token有效性和密码
3. 查询模型信息和转换状态
4. 如果转换完成，返回glTF文件URL
5. 前端Three.js加载和渲染
```

### 7. 性能优化策略

**前端性能**：
- Three.js性能优化：LOD、视锥剔除、实例化渲染
- 虚拟滚动和懒加载
- Web Worker处理复杂计算
- 资源预加载和智能缓存

**后端性能**：
- 文件分片上传（支持断点续传）
- 异步任务处理（RabbitMQ/Redis Queue）
- 数据库查询优化（索引、分页）
- CDN加速静态资源

**转换性能**：
- 并行转换处理（多容器）
- 转换结果缓存（相同文件哈希）
- 失败重试和降级处理
- 进度跟踪和状态通知

### 8. 安全设计

**文件安全**：
- 文件类型验证（白名单：.skp）
- 病毒扫描（ClamAV集成）
- 文件大小限制（500MB）
- 存储隔离（用户文件分离）

**访问安全**：
- 分享链接密码保护（bcrypt哈希）
- 链接有效期控制
- 访问频率限制
- Token随机化和不可预测

**API安全**：
- HTTPS强制
- CORS配置
- 输入验证和清理
- SQL注入防护

### 9. 部署架构

**开发环境**（Docker Compose）：
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]

  backend:
    build: ./backend
    ports: ["3001:3001"]
    depends_on: [postgres, redis, minio]

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: suweb
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"

  converter:
    build: ./converter
    depends_on: [backend, minio]
```

**生产环境**（云原生）：
- **容器化**：所有服务Docker镜像
- **编排**：Kubernetes或AWS ECS
- **服务网格**：可选Istio/Linkerd（未来）
- **监控**：Prometheus + Grafana + Alertmanager
- **日志**：ELK Stack或云日志服务
- **CI/CD**：GitHub Actions/GitLab CI + ArgoCD

## 技术风险与缓解措施

### 高风险：格式转换质量
- **风险**：复杂SketchUp模型转换后材质丢失或几何变形
- **缓解**：使用官方SketchUp SDK + 质量测试套件 + 降级方案

### 中风险：大文件处理性能
- **风险**：500MB文件上传、转换、加载超时
- **缓解**：分片上传、异步处理、进度反馈、LOD优化

### 低风险：移动端兼容性
- **风险**：低端设备3D渲染性能不足
- **缓解**：性能检测、自动降级、清晰提示

## 实施路线图

### Phase 1：核心MVP（4-6周）
1. 基础架构搭建（前后端项目初始化）
2. 文件上传和存储
3. 简单转换服务（占位符）
4. 分享链接生成
5. 基础3D查看器

### Phase 2：完整v1.0（6-8周）
1. 真实格式转换服务
2. 测量工具实现
3. 3D热点系统
4. 场景切换功能
5. 移动端适配优化
6. 错误处理和异常流程

### Phase 3：v1.1扩展（4-6周）
1. 用户系统（注册/登录）
2. 模型库管理
3. 使用量统计
4. 基础订阅功能

## 成功指标

### 技术指标
- 上传成功率 > 95%
- 转换成功率 > 98%
- 首屏加载 ≤ 5秒（100MB内）
- 移动端帧率 ≥ 30 FPS
- API响应时间 < 200ms（P95）

### 业务指标
- 用户上传到分享链接生成时间 < 30秒
- 热点点击准确率 = 100%
- 用户满意度（NPS）> 50
- 移动端使用率 > 40%

---

## 设计决策总结

1. **格式选择**：glTF/Draco为主，OBJ为备选，获得最佳Web性能和材质保留
2. **架构扩展性**：预留用户系统接口，数据库设计支持未来订阅功能
3. **技术栈**：现代全栈TypeScript，统一技术栈降低维护成本
4. **部署策略**：容器化 + 云原生，平衡灵活性和运维成本

此架构设计旨在交付高质量的v1.0产品，同时为未来功能扩展奠定坚实基础。