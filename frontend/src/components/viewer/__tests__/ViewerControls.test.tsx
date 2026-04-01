import { render, screen, fireEvent } from '@testing-library/react';
import ViewerControls from '../ViewerControls';
import { DEFAULT_CONTROLS, DEFAULT_PRESETS } from '@types/viewer';

describe('ViewerControls', () => {
  const defaultProps = {
    controls: DEFAULT_CONTROLS,
    presets: DEFAULT_PRESETS,
    onControlChange: vi.fn(),
    onPresetSelect: vi.fn(),
  };

  it('should render control panel', () => {
    render(<ViewerControls {...defaultProps} />);
    expect(screen.getByText('控制面板')).toBeInTheDocument();
    expect(screen.getByText('场景预设')).toBeInTheDocument();
    expect(screen.getByText('默认视图')).toBeInTheDocument();
  });

  it('should handle control toggles', () => {
    const onControlChange = vi.fn();
    render(
      <ViewerControls
        {...defaultProps}
        onControlChange={onControlChange}
      />
    );

    const rotationToggle = screen.getByLabelText('启用旋转');
    fireEvent.click(rotationToggle);
    expect(onControlChange).toHaveBeenCalledWith({
      ...DEFAULT_CONTROLS,
      enableRotation: false,
    });
  });

  it('should handle preset selection', () => {
    const onPresetSelect = vi.fn();
    render(
      <ViewerControls
        {...defaultProps}
        onPresetSelect={onPresetSelect}
      />
    );

    const topViewButton = screen.getByText('俯视图');
    fireEvent.click(topViewButton);
    expect(onPresetSelect).toHaveBeenCalledWith('top');
  });
});