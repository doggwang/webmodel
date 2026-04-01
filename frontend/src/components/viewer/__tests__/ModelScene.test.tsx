import { render } from '@testing-library/react';
import ModelScene from '../ModelScene';

// Mock Three.js and drei
vi.mock('@react-three/drei', () => {
  const mockUseGLTF = vi.fn(() => ({
    scene: {
      name: 'Test Model',
      clone: () => ({ name: 'Test Model' })
    },
    materials: {},
    animations: [],
  }));
  mockUseGLTF.preload = vi.fn();

  return { useGLTF: mockUseGLTF };
});

vi.mock('three', () => ({
  Mesh: class MockMesh {},
  MeshStandardMaterial: class MockMaterial {},
}));

describe('ModelScene', () => {
  const defaultProps = {
    modelUrl: 'https://example.com/model.gltf',
    modelId: 'model-123',
    hotspots: [],
    onHotspotClick: vi.fn(),
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