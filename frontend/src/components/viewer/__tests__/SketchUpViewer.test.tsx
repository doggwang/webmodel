import { render, screen } from '@testing-library/react';
import SketchUpViewer from '../SketchUpViewer';
import { DEFAULT_CAMERA, DEFAULT_CONTROLS } from '../../../types/viewer';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => {
  const mockUseGLTF = vi.fn(() => ({
    scene: {
      clone: vi.fn(() => ({})),
    },
    materials: {},
    animations: [],
  }));
  mockUseGLTF.preload = vi.fn();

  return {
    OrbitControls: () => <div data-testid="orbit-controls" />,
    PerspectiveCamera: () => <div data-testid="camera" />,
    useGLTF: mockUseGLTF,
  };
});

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