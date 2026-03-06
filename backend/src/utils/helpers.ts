/**
 * Allowed file MIME types for upload.
 */
export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Check if a MIME type is allowed.
 */
export const isAllowedFileType = (mimeType: string): boolean => {
  return Object.keys(ALLOWED_FILE_TYPES).includes(mimeType);
};

/**
 * Get file extension from MIME type.
 */
export const getExtensionFromMime = (mimeType: string): string => {
  const extensions = ALLOWED_FILE_TYPES[mimeType];
  return extensions ? extensions[0] : '';
};

/**
 * Format file size for display.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
