import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import UploadPage from '../UploadPage';
import { useAppStore } from '../../../stores/appStore';

// Mock upload service
vi.mock('../../../services/upload', () => ({
  uploadService: {
    uploadFile: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.getState().clearAll();
  });

  it('should render upload page', () => {
    renderWithProviders(<UploadPage />);
    expect(screen.getByText('上传SketchUp模型')).toBeInTheDocument();
    expect(screen.getByText('拖放文件到此处')).toBeInTheDocument();
    expect(screen.getByText('选择文件')).toBeInTheDocument();
  });
});

