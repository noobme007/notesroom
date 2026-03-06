import api from './api';
import { FileItem } from '@/types';

export const fileService = {
  /**
   * Upload a file to a folder.
   */
  async uploadFile(folderId: string, file: File): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post(`/folders/${folderId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.file;
  },

  /**
   * List all files in a folder.
   */
  async listFiles(folderId: string): Promise<FileItem[]> {
    const { data } = await api.get(`/folders/${folderId}/files`);
    return data.files;
  },

  /**
   * Delete a file.
   */
  async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/files/${fileId}`);
  },

  /**
   * Get file preview URL.
   */
  async getPreviewUrl(
    fileId: string
  ): Promise<{ previewUrl: string; fileName: string; fileType: string }> {
    const { data } = await api.get(`/files/${fileId}/preview`);
    return data;
  },
};
