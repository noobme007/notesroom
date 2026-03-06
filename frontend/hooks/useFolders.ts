'use client';

import { useState, useEffect, useCallback } from 'react';
import { folderService } from '@/services/folderService';
import { Folder } from '@/types';

export function useFolders(roomId: string) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const data = await folderService.listFolders(roomId);
      setFolders(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (folderName: string) => {
    const folder = await folderService.createFolder(roomId, folderName);
    setFolders((prev) => [...prev, folder]);
    return folder;
  };

  const deleteFolder = async (folderId: string) => {
    await folderService.deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f._id !== folderId));
  };

  return { folders, loading, error, createFolder, deleteFolder, refetch: fetchFolders };
}
