// src/components/layouts/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import Button from '../ui/Button';

const MainLayout: React.FC = () => {
  const { error, clearAll } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">SketchUp Web Viewer</h1>
            </div>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Button variant="ghost" size="sm">
                    首页
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm">
                    上传
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                关闭
              </Button>
            </div>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container-custom py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2026 SketchUp Web Viewer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;