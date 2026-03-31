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