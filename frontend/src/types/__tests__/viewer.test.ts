import { Vector3, CameraState, ScenePreset, Hotspot, ViewerControls } from '../viewer';

describe('Viewer types', () => {
  it('should define Vector3 type', () => {
    const vec: Vector3 = [1, 2, 3];
    expect(vec).toEqual([1, 2, 3]);
  });

  it('should define CameraState interface', () => {
    const camera: CameraState = {
      position: [0, 5, 10],
      target: [0, 0, 0],
      zoom: 1,
    };
    expect(camera.position).toEqual([0, 5, 10]);
  });

  it('should define ScenePreset interface', () => {
    const preset: ScenePreset = {
      id: 'default',
      name: '默认视图',
      cameraPosition: [0, 5, 10],
      cameraTarget: [0, 0, 0],
      isDefault: true,
    };
    expect(preset.name).toBe('默认视图');
  });

  it('should define Hotspot interface', () => {
    const hotspot: Hotspot = {
      id: 'hotspot-1',
      label: '入口',
      position: [1, 2, 3],
      data: { type: 'entry' },
    };
    expect(hotspot.label).toBe('入口');
  });

  it('should define ViewerControls interface', () => {
    const controls: ViewerControls = {
      enableRotation: true,
      enableZoom: true,
      enablePan: true,
      autoRotate: false,
      autoRotateSpeed: 1,
    };
    expect(controls.enableRotation).toBe(true);
  });
});