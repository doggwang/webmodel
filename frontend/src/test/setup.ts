// src/test/setup.ts
import '@testing-library/jest-dom';

// 模拟环境变量
process.env.VITE_API_URL = 'http://localhost:3001/api';
process.env.VITE_APP_NAME = 'Test App';

// 清除console错误和警告
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});