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