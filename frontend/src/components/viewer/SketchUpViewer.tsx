import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ModelViewerProps, DEFAULT_CAMERA, DEFAULT_CONTROLS, DEFAULT_PRESETS } from '../../types/viewer';
import ModelScene from './ModelScene';
import CameraController from './CameraController';
import SceneLights from './SceneLights';

/**
 * SketchUpViewer - 主3D查看器组件
 *
 * 整合Three.js画布和所有子组件，提供完整的3D模型查看体验
 */
const SketchUpViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  modelId,
  cameraState = DEFAULT_CAMERA,
  controls = DEFAULT_CONTROLS,
  hotspots = [],
  presets = DEFAULT_PRESETS,
  onCameraChange,
  onHotspotClick,
}) => {
  // 合并默认控制和用户提供的控制设置
  const mergedControls = {
    ...DEFAULT_CONTROLS,
    ...controls,
  };

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* 模型ID标签 */}
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          模型ID: <span className="font-semibold">{modelId}</span>
        </span>
      </div>

      {/* Three.js画布 */}
      <Canvas
        className="w-full h-full"
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* 灯光配置 */}
          <SceneLights />

          {/* 相机控制器 */}
          <CameraController
            cameraState={cameraState}
            controls={mergedControls}
            onCameraChange={onCameraChange}
          />

          {/* 模型场景 */}
          <ModelScene
            modelUrl={modelUrl}
            modelId={modelId}
            hotspots={hotspots}
            onHotspotClick={onHotspotClick}
          />
        </Suspense>
      </Canvas>

      {/* 加载状态指示器 */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-700">模型已加载</span>
        </div>
      </div>
    </div>
  );
};

export default SketchUpViewer;