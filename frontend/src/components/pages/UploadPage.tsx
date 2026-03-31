// src/components/pages/UploadPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Upload } from 'lucide-react';

const UploadPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card title="上传SketchUp模型">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  拖放文件到此处
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  支持 .skp 文件，最大 500MB
                </p>
              </div>
              <div className="mt-4">
                <Button variant="primary">选择文件</Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">上传说明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 仅支持 SketchUp (.skp) 格式文件</li>
              <li>• 最大文件大小：500MB</li>
              <li>• 文件会自动转换为Web可用的3D格式</li>
              <li>• 转换过程可能需要几分钟时间</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadPage;