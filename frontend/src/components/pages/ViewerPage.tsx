// src/components/pages/ViewerPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ViewerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型查看器</h1>
          <p className="text-gray-600 mt-1">加载中...</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">重置视图</Button>
          <Button variant="primary">分享</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <div className="h-full flex items-center justify-center bg-gray-100 rounded">
              <p className="text-gray-500">3D查看器区域</p>
            </div>
          </Card>
        </div>

        <div>
          <Card title="控制面板">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">场景预设</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">默认视图</Button>
                  <Button variant="ghost" className="w-full justify-start">俯视图</Button>
                  <Button variant="ghost" className="w-full justify-start">侧视图</Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">模型信息</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>文件名: example.skp</p>
                  <p>文件大小: 15.2 MB</p>
                  <p>状态: 转换完成</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;