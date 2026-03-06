'use client';

import React from 'react';
import {
  FiFile,
  FiEye,
  FiDownload,
  FiTrash2,
  FiImage,
  FiFileText,
  FiUploadCloud,
  FiLoader,
} from 'react-icons/fi';
import { FileItem, RoomRole } from '@/types';
import toast from 'react-hot-toast';

interface FileListProps {
  files: FileItem[];
  loading: boolean;
  selectedFolderId: string | null;
  folderName: string;
  userRole: RoomRole;
  onPreview: (file: FileItem) => void;
  onDelete: (fileId: string) => void;
  onUpload: () => void;
}

export function FileList({
  files,
  loading,
  selectedFolderId,
  folderName,
  userRole,
  onPreview,
  onDelete,
  onUpload,
}: FileListProps) {
  const canUpload = userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'admin';

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FiImage className="w-5 h-5 text-green-400" />;
    if (fileType === 'application/pdf') return <FiFileText className="w-5 h-5 text-red-400" />;
    return <FiFile className="w-5 h-5 text-primary-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!selectedFolderId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FiFile className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-lg">Select a folder to view files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <div>
          <h3 className="text-lg font-semibold text-white">{folderName}</h3>
          <p className="text-dark-400 text-sm">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        {canUpload && (
          <button onClick={onUpload} className="btn-primary flex items-center gap-2">
            <FiUploadCloud className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <FiUploadCloud className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No files in this folder</p>
            {canUpload && (
              <button onClick={onUpload} className="btn-primary mt-4">
                Upload First File
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file._id}
                className="group bg-dark-800/50 border border-dark-700 rounded-lg p-3 flex items-center gap-3 hover:bg-dark-800 hover:border-dark-600 transition-all"
              >
                <div className="flex-shrink-0">{getFileIcon(file.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.fileName}</p>
                  <p className="text-dark-400 text-xs">
                    {formatSize(file.fileSize)} · {formatDate(file.uploadDate)}
                    {!file.processed && (
                      <span className="text-yellow-400 ml-2">Processing...</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onPreview(file)}
                    className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const { fileService } = await import('@/services/fileService');
                        const data = await fileService.getPreviewUrl(file._id);
                        const a = document.createElement('a');
                        a.href = data.previewUrl;
                        a.target = '_blank';
                        a.download = file.fileName;
                        a.click();
                      } catch (err) {
                        toast.error('Failed to get download link');
                      }
                    }}
                    className="p-2 text-dark-400 hover:text-green-400 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Download"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => onDelete(file._id)}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
