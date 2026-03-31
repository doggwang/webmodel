// src/components/pages/NotFoundPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center space-y-4">
          <FileQuestion className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">页面未找到</h3>
            <p className="text-gray-600 mt-1">
              您访问的页面不存在或已被移动
            </p>
          </div>
          <div className="pt-4">
            <Button variant="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;