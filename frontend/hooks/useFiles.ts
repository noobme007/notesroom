'use client';

import { useState, useEffect, useCallback } from 'react';
import { fileService } from '@/services/fileService';
import { FileItem } from '@/types';

export function useFiles(folderId: string | null) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (showLoading = true) => {
    if (!folderId) {
      setFiles([]);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      const data = await fileService.listFiles(folderId);
      setFiles(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch files');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchFiles(true);
  }, [fetchFiles]);

  // Handle auto-polling for files that are currently processing
  useEffect(() => {
    const hasProcessingFiles = files.some((f) => !f.processed);
    if (!hasProcessingFiles) return;

    const intervalId = setInterval(() => {
      fetchFiles(false); // poll silently without loading spinner
    }, 3000);

    return () => clearInterval(intervalId);
  }, [files, fetchFiles]);

  const uploadFile = async (file: File) => {
    if (!folderId) throw new Error('No folder selected');
    const uploaded = await fileService.uploadFile(folderId, file);
    setFiles((prev) => [uploaded, ...prev]);
    return uploaded;
  };

  const deleteFile = async (fileId: string) => {
    await fileService.deleteFile(fileId);
    setFiles((prev) => prev.filter((f) => f._id !== fileId));
  };

  return { files, loading, error, uploadFile, deleteFile, refetch: fetchFiles };
}
