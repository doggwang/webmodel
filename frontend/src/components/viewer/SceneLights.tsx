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