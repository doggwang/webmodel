// src/components/pages/SharePage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock } from 'lucide-react';

const SharePage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <Card title="访问分享链接">
        <div className="space-y-6">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">需要密码</h3>
            <p className="text-gray-600 mt-1">
              此分享链接受密码保护，请输入密码继续
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="密码"
              type="password"
              placeholder="请输入访问密码"
            />

            <div className="flex space-x-3">
              <Button variant="primary" className="flex-1">
                确认
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>输入密码后即可查看3D模型</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SharePage;