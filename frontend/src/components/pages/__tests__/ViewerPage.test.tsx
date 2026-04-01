import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import ViewerPage from '../ViewerPage';
import { modelService } from '../../../services/model';

vi.mock('../../../services/model', () => ({
  modelService: {
    getModel: vi.fn(),
  },
}));

vi.mock('../viewer', () => ({
  SketchUpViewer: () => <div data-testid="sketchup-viewer" />,
  ViewerControls: () => <div data-testid="viewer-controls" />,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (modelId = 'test-123') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/model/${modelId}`]}>
        <Routes>
          <Route path="/model/:modelId" element={<ViewerPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ViewerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display model data', async () => {
    const mockModel = {
      id: 'test-123',
      fileName: 'house.skp',
      fileSizeBytes: 15000000,
      convertedFilePath: '/models/house.gltf',
      conversionStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      originalFormat: '.skp',
      convertedFormat: '.gltf',
    };

    (modelService.getModel as vi.Mock).mockResolvedValue(mockModel);

    renderWithProviders('test-123');

    // Should show loading initially
    expect(screen.getByText('正在加载模型...')).toBeInTheDocument();

    // Should display model info after loading
    await waitFor(() => {
      expect(screen.getByText('模型查看器')).toBeInTheDocument();
      expect(screen.getByText('house.skp')).toBeInTheDocument();
      expect(screen.getByText('14.3 MB')).toBeInTheDocument();
    });
  });

  it('should handle model loading error', async () => {
    (modelService.getModel as vi.Mock).mockRejectedValue(new Error('Not found'));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('无法加载模型')).toBeInTheDocument();
    });
  });
});