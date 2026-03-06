import api from './api';
import { Folder } from '@/types';

export const folderService = {
  /**
   * Create a folder in a room.
   */
  async createFolder(roomId: string, folderName: string): Promise<Folder> {
    const { data } = await api.post(`/rooms/${roomId}/folders`, { folderName });
    return data.folder;
  },

  /**
   * List all folders in a room.
   */
  async listFolders(roomId: string): Promise<Folder[]> {
    const { data } = await api.get(`/rooms/${roomId}/folders`);
    return data.folders;
  },

  /**
   * Delete a folder.
   */
  async deleteFolder(folderId: string): Promise<void> {
    await api.delete(`/folders/${folderId}`);
  },
};
