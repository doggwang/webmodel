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