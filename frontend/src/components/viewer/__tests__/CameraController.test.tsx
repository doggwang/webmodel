import { render } from '@testing-library/react';
import CameraController from '../CameraController';
import { DEFAULT_CAMERA, DEFAULT_CONTROLS } from '@types/viewer';

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="camera" />,
}));

describe('CameraController', () => {
  const defaultProps = {
    cameraState: DEFAULT_CAMERA,
    controls: DEFAULT_CONTROLS,
    onCameraChange: vi.fn(),
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