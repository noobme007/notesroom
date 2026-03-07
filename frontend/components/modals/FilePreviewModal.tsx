'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiDownload, FiExternalLink, FiLoader } from 'react-icons/fi';
import { fileService } from '@/services/fileService';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

export function FilePreviewModal({ isOpen, onClose, fileId, fileName }: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && fileId) {
      loadPreview();
    }
    return () => {
      setPreviewUrl(null);
      setLoading(true);
      setError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fileId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const data = await fileService.getPreviewUrl(fileId);
      setPreviewUrl(data.previewUrl);
      setFileType(data.fileType);
    } catch {
      setError('Failed to load file preview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-5xl h-[85vh] mx-4 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-white truncate">{fileName}</h3>
          <div className="flex items-center gap-2">
            {previewUrl && (
              <>
                <a
                  href={previewUrl}
                  download={fileName}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </a>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Open
                </a>
              </>
            )}
            <button onClick={onClose} className="btn-ghost p-2">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <FiLoader className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400">
              {error}
            </div>
          ) : previewUrl ? (
            <div className="h-full w-full">
              {isPdf ? (
                <iframe
                  src={`${previewUrl}#toolbar=1`}
                  className="w-full h-full rounded-lg border border-dark-700"
                  title={fileName}
                />
              ) : isImage ? (
                <div className="flex items-center justify-center h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-dark-300">
                  <p className="text-lg mb-4">Preview not available for this file type</p>
                  <a
                    href={previewUrl}
                    download={fileName}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
