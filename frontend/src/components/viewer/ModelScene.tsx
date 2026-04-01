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