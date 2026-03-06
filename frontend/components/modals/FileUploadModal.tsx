'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  folderName: string;
}

export function FileUploadModal({ isOpen, onClose, onUpload, folderName }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
  });

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card max-w-lg w-full mx-4 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FiUploadCloud className="text-primary-400" />
          Upload File
        </h2>
        <p className="text-dark-400 text-sm mb-4">
          Upload to: <span className="text-dark-200">{folderName}</span>
        </p>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 hover:border-dark-400'
            }`}
          >
            <input {...getInputProps()} />
            <FiUploadCloud className="w-12 h-12 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-200 font-medium">
              {isDragActive ? 'Drop file here...' : 'Drag & drop a file here'}
            </p>
            <p className="text-dark-400 text-sm mt-1">
              or click to browse
            </p>
            <p className="text-dark-500 text-xs mt-3">
              Supported: PDF, Images, DOC, PPT (max 50MB)
            </p>
          </div>
        ) : (
          <div className="bg-dark-700/50 rounded-xl p-4 flex items-center gap-3">
            <FiFile className="w-10 h-10 text-primary-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{selectedFile.name}</p>
              <p className="text-dark-400 text-sm">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-dark-400 hover:text-red-400 p-1"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
