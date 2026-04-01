import React from 'react';
import { Settings, Eye, RotateCw, Move, ZoomIn } from 'lucide-react';
import Button from '../ui/Button';
import { ViewerControls as ControlsType, ScenePreset } from '../../types/viewer';

interface ViewerControlsProps {
  controls: ControlsType;
  presets: ScenePreset[];
  onControlChange: (controls: ControlsType) => void;
  onPresetSelect: (presetId: string) => void;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
  controls,
  presets,
  onControlChange,
  onPresetSelect,
}) => {
  const handleToggle = (key: keyof ControlsType) => {
    onControlChange({
      ...controls,
      [key]: !controls[key],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">控制面板</h3>
        <Settings className="h-5 w-5 text-gray-500" />
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">场景预设</h4>
        <div className="space-y-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onPresetSelect(preset.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {preset.name}
              {preset.isDefault && (
                <span className="ml-auto text-xs text-gray-500">默认</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">交互控制</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RotateCw className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">启用旋转</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.enableRotation}
                onChange={() => handleToggle('enableRotation')}
                className="sr-only peer"
                aria-label="启用旋转"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ZoomIn className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">启用缩放</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.enableZoom}
                onChange={() => handleToggle('enableZoom')}
                className="sr-only peer"
                aria-label="启用缩放"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">启用平移</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.enablePan}
                onChange={() => handleToggle('enablePan')}
                className="sr-only peer"
                aria-label="启用平移"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RotateCw className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm text-gray-700">自动旋转</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={controls.autoRotate}
                onChange={() => handleToggle('autoRotate')}
                className="sr-only peer"
                aria-label="自动旋转"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      {controls.autoRotate && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">旋转速度</h4>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={controls.autoRotateSpeed}
            onChange={(e) =>
              onControlChange({
                ...controls,
                autoRotateSpeed: parseFloat(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>慢</span>
            <span>{controls.autoRotateSpeed.toFixed(1)}</span>
            <span>快</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerControls;