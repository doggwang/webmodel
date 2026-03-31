// src/components/pages/ErrorPage.tsx
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">发生错误</h3>
            <p className="text-gray-600 mt-1">
              抱歉，处理您的请求时发生了错误
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

export default ErrorPage;