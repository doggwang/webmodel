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