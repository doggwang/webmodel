import { act } from '@testing-library/react';
import { useAppStore } from '../appStore';

describe('AppStore upload state', () => {
  it('should have initial upload state', () => {
    const state = useAppStore.getState();
    expect(state.isUploading).toBe(false);
    expect(state.uploadProgress).toBe(0);
    expect(state.uploadError).toBeNull();
  });

  it('should update upload state', () => {
    const { setUploading, setUploadProgress, setUploadError } = useAppStore.getState();

    act(() => {
      setUploading(true);
    });
    expect(useAppStore.getState().isUploading).toBe(true);

    act(() => {
      setUploadProgress(50);
    });
    expect(useAppStore.getState().uploadProgress).toBe(50);

    act(() => {
      setUploadError('Upload failed');
    });
    expect(useAppStore.getState().uploadError).toBe('Upload failed');

    act(() => {
      setUploading(false);
      setUploadProgress(0);
      setUploadError(null);
    });
    expect(useAppStore.getState().isUploading).toBe(false);
    expect(useAppStore.getState().uploadProgress).toBe(0);
    expect(useAppStore.getState().uploadError).toBeNull();
  });
});