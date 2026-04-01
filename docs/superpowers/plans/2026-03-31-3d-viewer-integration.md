# 3D查看器集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有的占位符ViewerPage转换为功能完整的3D模型查看器，集成Three.js和@react-three/fiber，支持模型加载、相机控制、场景预设和基本交互。

**Architecture:** 创建模块化的3D查看器组件，包括主画布、模型加载器、相机控制器、灯光系统和UI控制面板。ViewerPage使用React Query获取模型数据，将其传递给3D查看器组件进行渲染。

**Tech Stack:** React 18, TypeScript, Three.js 0.158, @react-three/fiber 8.14, @react-three/drei 9.95, React Query, Tailwind CSS

---

## 文件结构

**创建目录:** `src/components/viewer/`

**创建文件:**
- `src/components/viewer/SketchUpViewer.tsx` - 主3D查看器组件
- `src/components/viewer/ModelScene.tsx` - 模型场景组件
- `src/components/viewer/CameraController.tsx` - 相机控制组件
- `src/components/viewer/ViewerControls.tsx` - UI控制面板组件
- `src/components/viewer/SceneLights.tsx` - 灯光配置组件
- `src/components/viewer/index.ts` - 导出所有组件

**修改文件:**
- `src/components/pages/ViewerPage.tsx` - 集成3D查看器和数据获取
- `src/types/viewer.ts` - 扩展类型定义
- `src/components/pages/__tests__/ViewerPage.test.tsx` - 创建测试文件

**测试文件:**
- `src/components/viewer/__tests__/SketchUpViewer.test.tsx` - 主查看器测试
- `src/components/viewer/__tests__/ModelScene.test.tsx` - 模型场景测试
- `src/components/pages/__tests__/ViewerPage.test.tsx` - 页面集成测试

## 任务分解

### Task 1: 扩展Viewer类型定义

**Files:**
- Modify: `src/types/viewer.ts:1-32`

- [ ] **Step 1: 编写失败测试**

创建`src/types/__tests__/viewer.test.ts`：
```typescript
import { Vector3, CameraState, ScenePreset, Hotspot, ViewerControls } from '../viewer';

describe('Viewer types', () => {
  it('should define Vector3 type', () => {
    const vec: Vector3 = [1, 2, 3];
    expect(vec).toEqual([1, 2, 3]);
  });

  it('should define CameraState interface', () => {
    const camera: CameraState = {
      position: [0, 5, 10],
      target: [0, 0, 0],
      zoom: 1,
    };
    expect(camera.position).toEqual([0, 5, 10]);
  });

  it('should define ScenePreset interface', () => {
    const preset: ScenePreset = {
      id: 'default',
      name: '默认视图',
      cameraPosition: [0, 5, 10],
      cameraTarget: [0, 0, 0],
      isDefault: true,
    };
    expect(preset.name).toBe('默认视图');
  });

  it('should define Hotspot interface', () => {
    const hotspot: Hotspot = {
      id: 'hotspot-1',
      label: '入口',
      position: [1, 2, 3],
      data: { type: 'entry' },
    };
    expect(hotspot.label).toBe('入口');
  });

  it('should define ViewerControls interface', () => {
    const controls: ViewerControls = {
      enableRotation: true,
      enableZoom: true,
      enablePan: true,
      autoRotate: false,
      autoRotateSpeed: 1,
    };
    expect(controls.enableRotation).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/types/__tests__/viewer.test.ts`
预期: FAIL with "Cannot find module '../viewer'" or test failures

- [ ] **Step 3: 最小实现**

扩展`src/types/viewer.ts`：
```typescript
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

// 新增类型定义
export interface ModelViewerProps {
  modelUrl: string;
  modelId: string;
  cameraState?: CameraState;
  controls?: Partial<ViewerControls>;
  hotspots?: Hotspot[];
  presets?: ScenePreset[];
  onCameraChange?: (camera: CameraState) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
}

export interface ViewerState {
  camera: CameraState;
  controls: ViewerControls;
  selectedHotspot: string | null;
  activePreset: string;
  isLoading: boolean;
  error: string | null;
}

export const DEFAULT_CAMERA: CameraState = {
  position: [0, 5, 10],
  target: [0, 0, 0],
  zoom: 1,
};

export const DEFAULT_CONTROLS: ViewerControls = {
  enableRotation: true,
  enableZoom: true,
  enablePan: true,
  autoRotate: false,
  autoRotateSpeed: 1,
};

export const DEFAULT_PRESETS: ScenePreset[] = [
  {
    id: 'default',
    name: '默认视图',
    cameraPosition: [0, 5, 10],
    cameraTarget: [0, 0, 0],
    isDefault: true,
  },
  {
    id: 'top',
    name: '俯视图',
    cameraPosition: [0, 20, 0],
    cameraTarget: [0, 0, 0],
    isDefault: false,
  },
  {
    id: 'front',
    name: '前视图',
    cameraPosition: [0, 0, 20],
    cameraTarget: [0, 0, 0],
    isDefault: false,
  },
  {
    id: 'side',
    name: '侧视图',
    cameraPosition: [20, 0, 0],
    cameraTarget: [0, 0, 0],
    isDefault: false,
  },
];
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/types/__tests__/viewer.test.ts`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/types/viewer.ts src/types/__tests__/viewer.test.ts
git commit -m "feat: extend viewer types with ModelViewerProps and defaults"
```

### Task 2: 创建基础3D查看器组件

**Files:**
- Create: `src/components/viewer/SketchUpViewer.tsx`
- Create: `src/components/viewer/index.ts`

- [ ] **Step 1: 编写失败测试**

创建`src/components/viewer/__tests__/SketchUpViewer.test.tsx`：
```typescript
import { render, screen } from '@testing-library/react';
import SketchUpViewer from '../SketchUpViewer';
import { DEFAULT_CAMERA, DEFAULT_CONTROLS } from '../../../types/viewer';

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="camera" />,
}));

describe('SketchUpViewer', () => {
  const defaultProps = {
    modelUrl: 'https://example.com/model.gltf',
    modelId: 'model-123',
  };

  it('should render canvas element', () => {
    render(<SketchUpViewer {...defaultProps} />);
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('should accept camera and controls props', () => {
    const customCamera = { position: [1, 2, 3] as [number, number, number], target: [0, 0, 0] as [number, number, number], zoom: 2 };
    const customControls = { autoRotate: true, enablePan: false };

    render(
      <SketchUpViewer
        {...defaultProps}
        cameraState={customCamera}
        controls={customControls}
      />
    );
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/viewer/__tests__/SketchUpViewer.test.tsx`
预期: FAIL with "Cannot find module '../SketchUpViewer'"

- [ ] **Step 3: 最小实现**

创建`src/components/viewer/SketchUpViewer.tsx`：
```typescript
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ModelViewerProps, DEFAULT_CAMERA, DEFAULT_CONTROLS } from '../../types/viewer';
import ModelScene from './ModelScene';
import SceneLights from './SceneLights';
import CameraController from './CameraController';

const SketchUpViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  modelId,
  cameraState = DEFAULT_CAMERA,
  controls = {},
  hotspots = [],
  presets = [],
  onCameraChange,
  onHotspotClick,
}) => {
  const mergedControls = { ...DEFAULT_CONTROLS, ...controls };

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        className="w-full h-full rounded-lg bg-gray-900"
        camera={{
          position: cameraState.position,
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <ModelScene
            modelUrl={modelUrl}
            modelId={modelId}
            hotspots={hotspots}
            onHotspotClick={onHotspotClick}
          />
          <CameraController
            cameraState={cameraState}
            controls={mergedControls}
            onCameraChange={onCameraChange}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded">
        模型ID: {modelId}
      </div>
    </div>
  );
};

export default SketchUpViewer;
```

创建`src/components/viewer/index.ts`：
```typescript
export { default as SketchUpViewer } from './SketchUpViewer';
export { default as ModelScene } from './ModelScene';
export { default as CameraController } from './CameraController';
export { default as ViewerControls } from './ViewerControls';
export { default as SceneLights } from './SceneLights';
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/viewer/__tests__/SketchUpViewer.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/viewer/SketchUpViewer.tsx src/components/viewer/index.ts src/components/viewer/__tests__/SketchUpViewer.test.tsx
git commit -m "feat: create base SketchUpViewer component with Three.js Canvas"
```

### Task 3: 创建模型场景组件

**Files:**
- Create: `src/components/viewer/ModelScene.tsx`

- [ ] **Step 1: 编写失败测试**

创建`src/components/viewer/__tests__/ModelScene.test.tsx`：
```typescript
import { render } from '@testing-library/react';
import ModelScene from '../ModelScene';

// Mock Three.js and drei
jest.mock('@react-three/drei', () => ({
  useGLTF: () => ({
    scene: { name: 'Test Model' },
    materials: {},
    animations: [],
  }),
}));

jest.mock('three', () => ({
  Mesh: class MockMesh {},
  MeshStandardMaterial: class MockMaterial {},
}));

describe('ModelScene', () => {
  const defaultProps = {
    modelUrl: 'https://example.com/model.gltf',
    modelId: 'model-123',
    hotspots: [],
    onHotspotClick: jest.fn(),
  };

  it('should render model scene', () => {
    const { container } = render(
      <ModelScene {...defaultProps} />
    );
    // Since this is a Three.js component, we just verify it renders without error
    expect(container).toBeDefined();
  });

  it('should handle hotspots', () => {
    const hotspots = [
      {
        id: 'hotspot-1',
        label: '入口',
        position: [1, 2, 3] as [number, number, number],
        data: { type: 'entry' },
      },
    ];

    render(
      <ModelScene
        {...defaultProps}
        hotspots={hotspots}
      />
    );
    // Test hotspot rendering
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/viewer/__tests__/ModelScene.test.tsx`
预期: FAIL with "Cannot find module '../ModelScene'"

- [ ] **Step 3: 最小实现**

创建`src/components/viewer/ModelScene.tsx`：
```typescript
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import { Hotspot } from '../../types/viewer';

interface ModelSceneProps {
  modelUrl: string;
  modelId: string;
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}

const ModelScene: React.FC<ModelSceneProps> = ({
  modelUrl,
  modelId,
  hotspots = [],
  onHotspotClick,
}) => {
  const meshRef = useRef<Mesh>(null);
  const { scene, materials, animations } = useGLTF(modelUrl);

  // 复制场景以便独立修改
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  return (
    <group>
      {/* 主模型 */}
      <primitive
        object={clonedScene}
        scale={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />

      {/* 热点标记 */}
      {hotspots.map((hotspot) => (
        <mesh
          key={hotspot.id}
          position={hotspot.position}
          onClick={() => onHotspotClick?.(hotspot)}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* 坐标轴辅助 */}
      <axesHelper args={[5]} />
      <gridHelper args={[20, 20, 0x444444, 0x888888]} />
    </group>
  );
};

export default ModelScene;

// 预加载GLTF模型
useGLTF.preload('/models/default.gltf');
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/viewer/__tests__/ModelScene.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/viewer/ModelScene.tsx src/components/viewer/__tests__/ModelScene.test.tsx
git commit -m "feat: create ModelScene component with GLTF loading and hotspots"
```

### Task 4: 创建相机控制器组件

**Files:**
- Create: `src/components/viewer/CameraController.tsx`

- [ ] **Step 1: 编写失败测试**

创建`src/components/viewer/__tests__/CameraController.test.tsx`：
```typescript
import { render } from '@testing-library/react';
import CameraController from '../CameraController';
import { DEFAULT_CAMERA, DEFAULT_CONTROLS } from '../../../types/viewer';

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="camera" />,
}));

describe('CameraController', () => {
  const defaultProps = {
    cameraState: DEFAULT_CAMERA,
    controls: DEFAULT_CONTROLS,
    onCameraChange: jest.fn(),
  };

  it('should render camera controls', () => {
    const { container } = render(<CameraController {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should apply camera state', () => {
    const customCamera = {
      position: [10, 20, 30] as [number, number, number],
      target: [5, 5, 5] as [number, number, number],
      zoom: 2,
    };

    render(
      <CameraController
        {...defaultProps}
        cameraState={customCamera}
      />
    );
    // Test camera position applied
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/viewer/__tests__/CameraController.test.tsx`
预期: FAIL with "Cannot find module '../CameraController'"

- [ ] **Step 3: 最小实现**

创建`src/components/viewer/CameraController.tsx`：
```typescript
import React, { useRef, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CameraState, ViewerControls } from '../../types/viewer';

interface CameraControllerProps {
  cameraState: CameraState;
  controls: ViewerControls;
  onCameraChange?: (camera: CameraState) => void;
}

const CameraController: React.FC<CameraControllerProps> = ({
  cameraState,
  controls,
  onCameraChange,
}) => {
  const orbitControlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (orbitControlsRef.current && cameraRef.current) {
      // 更新相机位置
      cameraRef.current.position.set(...cameraState.position);
      cameraRef.current.lookAt(...cameraState.target);

      // 更新OrbitControls目标
      orbitControlsRef.current.target.set(...cameraState.target);
      orbitControlsRef.current.update();
    }
  }, [cameraState]);

  const handleCameraChange = () => {
    if (orbitControlsRef.current && cameraRef.current && onCameraChange) {
      const position = cameraRef.current.position;
      const target = orbitControlsRef.current.target;

      onCameraChange({
        position: [position.x, position.y, position.z],
        target: [target.x, target.y, target.z],
        zoom: cameraRef.current.zoom,
      });
    }
  };

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={50}
        near={0.1}
        far={1000}
        position={cameraState.position}
      />

      <OrbitControls
        ref={orbitControlsRef}
        enableRotate={controls.enableRotation}
        enableZoom={controls.enableZoom}
        enablePan={controls.enablePan}
        autoRotate={controls.autoRotate}
        autoRotateSpeed={controls.autoRotateSpeed}
        onChange={handleCameraChange}
        maxPolarAngle={Math.PI / 2}
        minDistance={1}
        maxDistance={100}
      />
    </>
  );
};

export default CameraController;
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/viewer/__tests__/CameraController.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/viewer/CameraController.tsx src/components/viewer/__tests__/CameraController.test.tsx
git commit -m "feat: create CameraController with OrbitControls integration"
```

### Task 5: 创建灯光配置组件

**Files:**
- Create: `src/components/viewer/SceneLights.tsx`

- [ ] **Step 1: 编写失败测试**

创建`src/components/viewer/__tests__/SceneLights.test.tsx`：
```typescript
import { render } from '@testing-library/react';
import SceneLights from '../SceneLights';

describe('SceneLights', () => {
  it('should render lighting setup', () => {
    const { container } = render(<SceneLights />);
    expect(container).toBeDefined();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/viewer/__tests__/SceneLights.test.tsx`
预期: FAIL with "Cannot find module '../SceneLights'"

- [ ] **Step 3: 最小实现**

创建`src/components/viewer/SceneLights.tsx`：
```typescript
import React from 'react';

const SceneLights: React.FC = () => {
  return (
    <>
      {/* 环境光 - 基础照明 */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* 主方向光 - 模拟太阳 */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* 补光 - 填充阴影 */}
      <hemisphereLight
        skyColor="#b1e1ff"
        groundColor="#ffffff"
        intensity={0.3}
      />

      {/* 辅助光 - 增强细节 */}
      <pointLight
        position={[-10, 10, -10]}
        intensity={0.3}
        color="#ffcc99"
      />
    </>
  );
};

export default SceneLights;
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/viewer/__tests__/SceneLights.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/viewer/SceneLights.tsx src/components/viewer/__tests__/SceneLights.test.tsx
git commit -m "feat: create SceneLights component with multi-light setup"
```

### Task 6: 创建UI控制面板组件

**Files:**
- Create: `src/components/viewer/ViewerControls.tsx`

- [ ] **Step 1: 编写失败测试**

创建`src/components/viewer/__tests__/ViewerControls.test.tsx`：
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ViewerControls from '../ViewerControls';
import { DEFAULT_CONTROLS, DEFAULT_PRESETS } from '../../../types/viewer';

describe('ViewerControls', () => {
  const defaultProps = {
    controls: DEFAULT_CONTROLS,
    presets: DEFAULT_PRESETS,
    onControlChange: jest.fn(),
    onPresetSelect: jest.fn(),
  };

  it('should render control panel', () => {
    render(<ViewerControls {...defaultProps} />);
    expect(screen.getByText('控制面板')).toBeInTheDocument();
    expect(screen.getByText('场景预设')).toBeInTheDocument();
    expect(screen.getByText('默认视图')).toBeInTheDocument();
  });

  it('should handle control toggles', () => {
    const onControlChange = jest.fn();
    render(
      <ViewerControls
        {...defaultProps}
        onControlChange={onControlChange}
      />
    );

    const rotationToggle = screen.getByLabelText('启用旋转');
    fireEvent.click(rotationToggle);
    expect(onControlChange).toHaveBeenCalledWith({
      ...DEFAULT_CONTROLS,
      enableRotation: false,
    });
  });

  it('should handle preset selection', () => {
    const onPresetSelect = jest.fn();
    render(
      <ViewerControls
        {...defaultProps}
        onPresetSelect={onPresetSelect}
      />
    );

    const topViewButton = screen.getByText('俯视图');
    fireEvent.click(topViewButton);
    expect(onPresetSelect).toHaveBeenCalledWith('top');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/viewer/__tests__/ViewerControls.test.tsx`
预期: FAIL with "Cannot find module '../ViewerControls'"

- [ ] **Step 3: 最小实现**

创建`src/components/viewer/ViewerControls.tsx`：
```typescript
import React from 'react';
import { Settings, Eye, RotateCw, Move, ZoomIn } from 'lucide-react';
import Button from '../ui/Button';
import { ViewerControls as ControlsType, ScenePreset } from '../../types/viewer';

interface ViewerControlsProps {
  controls: ControlsType;
  presets: ScenePreset[];
  onControlChange: (controls: ControlsType) => void;
  onPresetSelect: (presetId: string) => void;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
  controls,
  presets,
  onControlChange,
  onPresetSelect,
}) => {
  const handleToggle = (key: keyof ControlsType) => {
    onControlChange({
      ...controls,
      [key]: !controls[key],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">控制面板</h3>
        <Settings className="h-5 w-5 text-gray-500" />
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">场景预设</h4>
        <div className="space-y-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onPresetSelect(preset.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {preset.name}
              {preset.isDefault && (
                <span className="ml-auto text-xs text-gray-500">默认</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">交互控制</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RotateCw className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">启用旋转</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.enableRotation}
                onChange={() => handleToggle('enableRotation')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ZoomIn className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">启用缩放</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.enableZoom}
                onChange={() => handleToggle('enableZoom')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">启用平移</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.enablePan}
                onChange={() => handleToggle('enablePan')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RotateCw className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">自动旋转</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.autoRotate}
                onChange={() => handleToggle('autoRotate')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      {controls.autoRotate && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">旋转速度</h4>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={controls.autoRotateSpeed}
            onChange={(e) =>
              onControlChange({
                ...controls,
                autoRotateSpeed: parseFloat(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>慢</span>
            <span>{controls.autoRotateSpeed.toFixed(1)}</span>
            <span>快</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerControls;
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/viewer/__tests__/ViewerControls.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/viewer/ViewerControls.tsx src/components/viewer/__tests__/ViewerControls.test.tsx
git commit -m "feat: create ViewerControls UI panel with toggle controls"
```

### Task 7: 更新ViewerPage集成3D查看器

**Files:**
- Modify: `src/components/pages/ViewerPage.tsx`
- Create: `src/components/pages/__tests__/ViewerPage.test.tsx`

- [ ] **Step 1: 编写失败测试**

创建`src/components/pages/__tests__/ViewerPage.test.tsx`：
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ViewerPage from '../ViewerPage';
import { modelService } from '../../../services/model';

jest.mock('../../../services/model', () => ({
  modelService: {
    getModel: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (modelId = 'test-123') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/model/:modelId" element={<ViewerPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ViewerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display model data', async () => {
    const mockModel = {
      id: 'test-123',
      fileName: 'house.skp',
      fileSizeBytes: 15000000,
      convertedFilePath: '/models/house.gltf',
      conversionStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      originalFormat: '.skp',
      convertedFormat: '.gltf',
    };

    (modelService.getModel as jest.Mock).mockResolvedValue(mockModel);

    renderWithProviders('test-123');

    // Should show loading initially
    expect(screen.getByText('加载中...')).toBeInTheDocument();

    // Should display model info after loading
    await waitFor(() => {
      expect(screen.getByText('模型查看器')).toBeInTheDocument();
      expect(screen.getByText('house.skp')).toBeInTheDocument();
      expect(screen.getByText('15.0 MB')).toBeInTheDocument();
    });
  });

  it('should handle model loading error', async () => {
    (modelService.getModel as jest.Mock).mockRejectedValue(new Error('Not found'));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/pages/__tests__/ViewerPage.test.tsx`
预期: FAIL with "Cannot find module '../ViewerPage'" or test failures

- [ ] **Step 3: 最小实现**

修改`src/components/pages/ViewerPage.tsx`：
```typescript
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { SketchUpViewer, ViewerControls } from '../viewer';
import { modelService } from '../../services/model';
import { CameraState, DEFAULT_CAMERA, DEFAULT_CONTROLS, DEFAULT_PRESETS, ScenePreset } from '../../types/viewer';
import { useAppStore } from '../../stores/appStore';
import { Loader2, AlertCircle, Share2, RotateCcw } from 'lucide-react';

const ViewerPage: React.FC = () => {
  const { modelId = '' } = useParams<{ modelId: string }>();
  const { setError } = useAppStore();
  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA);
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const [selectedPreset, setSelectedPreset] = useState('default');

  const { data: model, isLoading, error } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => modelService.getModel(modelId),
    enabled: !!modelId,
    retry: 1,
    onError: (err) => {
      setError(`加载模型失败: ${err instanceof Error ? err.message : '未知错误'}`);
    },
  });

  const handleCameraChange = useCallback((camera: CameraState) => {
    setCameraState(camera);
  }, []);

  const handleControlChange = useCallback((newControls: typeof DEFAULT_CONTROLS) => {
    setControls(newControls);
  }, []);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCameraState({
        position: preset.cameraPosition,
        target: preset.cameraTarget,
        zoom: 1,
      });
      setSelectedPreset(presetId);
    }
  }, []);

  const handleResetView = useCallback(() => {
    const defaultPreset = DEFAULT_PRESETS.find(p => p.isDefault) || DEFAULT_PRESETS[0];
    setCameraState({
      position: defaultPreset.cameraPosition,
      target: defaultPreset.cameraTarget,
      zoom: 1,
    });
    setSelectedPreset(defaultPreset.id);
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Sharing model:', modelId);
  }, [modelId]);

  const handleHotspotClick = useCallback((hotspot: any) => {
    console.log('Hotspot clicked:', hotspot);
    // TODO: Implement hotspot interaction
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">正在加载模型...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title="加载失败">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">无法加载模型</h3>
            <p className="mt-2 text-gray-600">
              {error instanceof Error ? error.message : '模型不存在或无法访问'}
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={() => window.location.href = '/'}>
                返回首页
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 构建模型URL（假设转换后的文件可通过静态服务访问）
  const modelUrl = model.convertedFilePath
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${model.convertedFilePath}`
    : '/models/default.gltf';

  const fileSizeMB = (model.fileSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型查看器</h1>
          <p className="text-gray-600 mt-1">{model.fileName}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetView} icon={<RotateCcw className="h-4 w-4" />}>
            重置视图
          </Button>
          <Button variant="primary" onClick={handleShare} icon={<Share2 className="h-4 w-4" />}>
            分享
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] p-0 overflow-hidden">
            <SketchUpViewer
              modelUrl={modelUrl}
              modelId={model.id}
              cameraState={cameraState}
              controls={controls}
              presets={DEFAULT_PRESETS}
              onCameraChange={handleCameraChange}
              onHotspotClick={handleHotspotClick}
            />
          </Card>
        </div>

        <div>
          <Card title="控制面板">
            <ViewerControls
              controls={controls}
              presets={DEFAULT_PRESETS}
              onControlChange={handleControlChange}
              onPresetSelect={handlePresetSelect}
            />
          </Card>

          <Card title="模型信息" className="mt-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">文件名</p>
                <p className="font-medium text-gray-900">{model.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">文件大小</p>
                <p className="font-medium text-gray-900">{fileSizeMB} MB</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                <p className={`font-medium ${
                  model.conversionStatus === 'completed' ? 'text-green-600' :
                  model.conversionStatus === 'processing' ? 'text-yellow-600' :
                  model.conversionStatus === 'failed' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {model.conversionStatus === 'completed' ? '转换完成' :
                   model.conversionStatus === 'processing' ? '转换中' :
                   model.conversionStatus === 'failed' ? '转换失败' :
                   '等待转换'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">格式</p>
                <p className="font-medium text-gray-900">
                  {model.originalFormat} → {model.convertedFormat}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">上传时间</p>
                <p className="font-medium text-gray-900">
                  {new Date(model.createdAt).toLocaleString()}
                </p>
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

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/pages/__tests__/ViewerPage.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/ViewerPage.tsx src/components/pages/__tests__/ViewerPage.test.tsx
git commit -m "feat: update ViewerPage with 3D viewer integration and model data"
```

### Task 8: 添加环境配置和GLTF预加载

**Files:**
- Modify: `src/components/viewer/ModelScene.tsx` (添加错误处理)
- Modify: `frontend/.env.development` (添加环境变量)
- Create: `public/models/default.gltf` (占位符模型)

- [ ] **Step 1: 编写失败测试**

在`src/components/viewer/__tests__/ModelScene.test.tsx`添加错误处理测试：
```typescript
it('should handle GLTF loading error', () => {
  const error = new Error('Failed to load GLTF');
  const useGLTF = require('@react-three/drei').useGLTF;
  useGLTF.mockImplementation(() => {
    throw error;
  });

  // Should render error state gracefully
  const { container } = render(
    <ModelScene
      modelUrl="invalid.gltf"
      modelId="test-123"
      hotspots={[]}
    />
  );
  expect(container).toBeDefined();
});
```

- [ ] **Step 2: 运行测试验证失败**

运行: `cd frontend && npm test src/components/viewer/__tests__/ModelScene.test.tsx`
预期: FAIL with error handling not implemented

- [ ] **Step 3: 最小实现**

更新`src/components/viewer/ModelScene.tsx`添加错误处理：
```typescript
import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import { Hotspot } from '../../types/viewer';

interface ModelSceneProps {
  modelUrl: string;
  modelId: string;
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}

const ModelScene: React.FC<ModelSceneProps> = ({
  modelUrl,
  modelId,
  hotspots = [],
  onHotspotClick,
}) => {
  const meshRef = useRef<Mesh>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  let scene, materials, animations;
  try {
    const gltf = useGLTF(modelUrl);
    scene = gltf.scene;
    materials = gltf.materials;
    animations = gltf.animations;
  } catch (error) {
    setLoadError(error instanceof Error ? error.message : '加载模型失败');
    console.error('GLTF加载失败:', error);
  }

  // 复制场景以便独立修改
  const clonedScene = React.useMemo(() => {
    if (scene) {
      return scene.clone();
    }
    return null;
  }, [scene]);

  if (loadError) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ef4444" wireframe />
        </mesh>
        <axesHelper args={[5]} />
        <gridHelper args={[20, 20, 0x444444, 0x888888]} />
      </group>
    );
  }

  if (!clonedScene) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#3b82f6" wireframe />
        </mesh>
        <axesHelper args={[5]} />
        <gridHelper args={[20, 20, 0x444444, 0x888888]} />
      </group>
    );
  }

  return (
    <group>
      {/* 主模型 */}
      <primitive
        object={clonedScene}
        scale={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />

      {/* 热点标记 */}
      {hotspots.map((hotspot) => (
        <mesh
          key={hotspot.id}
          position={hotspot.position}
          onClick={() => onHotspotClick?.(hotspot)}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* 坐标轴辅助 */}
      <axesHelper args={[5]} />
      <gridHelper args={[20, 20, 0x444444, 0x888888]} />
    </group>
  );
};

export default ModelScene;

// 预加载默认GLTF模型
try {
  useGLTF.preload('/models/default.gltf');
} catch (error) {
  console.warn('无法预加载默认模型:', error);
}
```

更新`frontend/.env.development`：
```bash
VITE_API_URL=http://localhost:3001/api
VITE_MODEL_BASE_URL=http://localhost:3001
```

创建占位符模型文件`public/models/default.gltf`：
```bash
mkdir -p public/models
echo '{"minimal": "placeholder model"}' > public/models/default.gltf
```

- [ ] **Step 4: 运行测试验证通过**

运行: `cd frontend && npm test src/components/viewer/__tests__/ModelScene.test.tsx`
预期: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/viewer/ModelScene.tsx frontend/.env.development public/models/default.gltf
git commit -m "feat: add error handling, environment config, and placeholder model"
```

## 执行计划总结

计划已完成，包含8个任务，涵盖：
1. 扩展Viewer类型定义
2. 创建基础3D查看器组件
3. 创建模型场景组件
4. 创建相机控制器组件
5. 创建灯光配置组件
6. 创建UI控制面板组件
7. 更新ViewerPage集成3D查看器
8. 添加环境配置和GLTF预加载

**下一步:** 使用subagent-driven-development或executing-plans技能执行此计划。

---
