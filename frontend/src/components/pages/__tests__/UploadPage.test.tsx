import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should handle file selection via button click', async () => {
    const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.skp';
    vi.spyOn(document, 'createElement').mockReturnValue(fileInput);
    const clickSpy = vi.spyOn(fileInput, 'click');

    renderWithProviders(<UploadPage />);

    const selectButton = screen.getByText('选择文件');
    fireEvent.click(selectButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should handle file drop', async () => {
    const mockFile = new File(['test'], 'test.skp', { type: 'application/octet-stream' });
    const dataTransfer = {
      files: [mockFile],
      items: [
        {
          kind: 'file',
          type: 'application/octet-stream',
          getAsFile: () => mockFile,
        },
      ],
      types: ['Files'],
    };

    renderWithProviders(<UploadPage />);

    const dropZone = screen.getByText('拖放文件到此处').closest('div[class*="border-dashed"]');
    expect(dropZone).toBeInTheDocument();

    fireEvent.dragOver(dropZone!);
    fireEvent.drop(dropZone!, { dataTransfer });
  });
});

