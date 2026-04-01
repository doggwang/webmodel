import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { SketchUpViewer, ViewerControls } from '../viewer';
import { modelService } from '../../services/model';
import { CameraState, DEFAULT_CAMERA, DEFAULT_CONTROLS, DEFAULT_PRESETS, ScenePreset } from '../../types/viewer';
import { useAppStore } from '../../stores/appStore';
import { Loader2, AlertCircle, Share2, RotateCcw } from 'lucide-react';

const ViewerPage: React.FC = () => {
  const { modelId = '' } = useParams<{ modelId: string }>();
  const { setError } = useAppStore();
  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA);
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const [selectedPreset, setSelectedPreset] = useState('default');

  const { data: model, isLoading, error } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => modelService.getModel(modelId),
    enabled: !!modelId,
    retry: 1,
    onError: (err) => {
      setError(`加载模型失败: ${err instanceof Error ? err.message : '未知错误'}`);
    },
  });

  const handleCameraChange = useCallback((camera: CameraState) => {
    setCameraState(camera);
  }, []);

  const handleControlChange = useCallback((newControls: typeof DEFAULT_CONTROLS) => {
    setControls(newControls);
  }, []);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCameraState({
        position: preset.cameraPosition,
        target: preset.cameraTarget,
        zoom: 1,
      });
      setSelectedPreset(presetId);
    }
  }, []);

  const handleResetView = useCallback(() => {
    const defaultPreset = DEFAULT_PRESETS.find(p => p.isDefault) || DEFAULT_PRESETS[0];
    setCameraState({
      position: defaultPreset.cameraPosition,
      target: defaultPreset.cameraTarget,
      zoom: 1,
    });
    setSelectedPreset(defaultPreset.id);
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Sharing model:', modelId);
  }, [modelId]);

  const handleHotspotClick = useCallback((hotspot: any) => {
    console.log('Hotspot clicked:', hotspot);
    // TODO: Implement hotspot interaction
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">正在加载模型...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title="加载失败">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">无法加载模型</h3>
            <p className="mt-2 text-gray-600">
              {error instanceof Error ? error.message : '模型不存在或无法访问'}
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={() => window.location.href = '/'}>
                返回首页
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 构建模型URL（假设转换后的文件可通过静态服务访问）
  const modelUrl = model.convertedFilePath
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${model.convertedFilePath}`
    : '/models/default.gltf';

  const fileSizeMB = (model.fileSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型查看器</h1>
          <p className="text-gray-600 mt-1">{model.fileName}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetView} icon={<RotateCcw className="h-4 w-4" />}>
            重置视图
          </Button>
          <Button variant="primary" onClick={handleShare} icon={<Share2 className="h-4 w-4" />}>
            分享
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] p-0 overflow-hidden">
            <SketchUpViewer
              modelUrl={modelUrl}
              modelId={model.id}
              cameraState={cameraState}
              controls={controls}
              presets={DEFAULT_PRESETS}
              onCameraChange={handleCameraChange}
              onHotspotClick={handleHotspotClick}
            />
          </Card>
        </div>

        <div>
          <Card title="控制面板">
            <ViewerControls
              controls={controls}
              presets={DEFAULT_PRESETS}
              onControlChange={handleControlChange}
              onPresetSelect={handlePresetSelect}
            />
          </Card>

          <Card title="模型信息" className="mt-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">文件名</p>
                <p className="font-medium text-gray-900">{model.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">文件大小</p>
                <p className="font-medium text-gray-900">{fileSizeMB} MB</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">状态</p>
                <p className={`font-medium ${
                  model.conversionStatus === 'completed' ? 'text-green-600' :
                  model.conversionStatus === 'processing' ? 'text-yellow-600' :
                  model.conversionStatus === 'failed' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {model.conversionStatus === 'completed' ? '转换完成' :
                   model.conversionStatus === 'processing' ? '转换中' :
                   model.conversionStatus === 'failed' ? '转换失败' :
                   '等待转换'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">格式</p>
                <p className="font-medium text-gray-900">
                  {model.originalFormat} → {model.convertedFormat}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">上传时间</p>
                <p className="font-medium text-gray-900">
                  {new Date(model.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;