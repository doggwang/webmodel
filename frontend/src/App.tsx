// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layouts/MainLayout';
import UploadPage from './components/pages/UploadPage';
import ViewerPage from './components/pages/ViewerPage';
import SharePage from './components/pages/SharePage';
import ErrorPage from './components/pages/ErrorPage';
import NotFoundPage from './components/pages/NotFoundPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<UploadPage />} />
              <Route path="model/:modelId" element={<ViewerPage />} />
              <Route path="share/:token" element={<SharePage />} />
              <Route path="error" element={<ErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;