import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { File, Folder, RoomMember, TextChunk } from '../models';
import { uploadToFirebase, deleteFromFirebase, getSignedUrl } from '../services/storageService';
import { processDocument } from '../services/documentProcessor';
import { isAllowedFileType } from '../utils/helpers';

/**
 * POST /api/folders/:folderId/files
 * Upload a file to a folder.
 */
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { folderId } = req.params;
    const userId = req.user!._id;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    // Check permissions (admin or editor)
    const membership = await RoomMember.findOne({
      userId,
      roomId: folder.roomId,
    });

    if (!membership || !['admin', 'editor'].includes(membership.role)) {
      res.status(403).json({ error: 'Only admins and editors can upload files' });
      return;
    }

    const uploadedFile = req.file;
    if (!uploadedFile) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    if (!isAllowedFileType(uploadedFile.mimetype)) {
      res.status(400).json({ error: 'File type not allowed. Supported: PDF, Images, DOC, PPT' });
      return;
    }

    // Upload to Firebase Storage
    const { fileUrl, storagePath } = await uploadToFirebase(
      uploadedFile.buffer,
      uploadedFile.originalname,
      uploadedFile.mimetype,
      folder.roomId.toString(),
      folderId
    );

    // Save file metadata
    const file = await File.create({
      fileName: uploadedFile.originalname,
      fileUrl,
      fileType: uploadedFile.mimetype,
      fileSize: uploadedFile.size,
      storagePath,
      folderId,
      roomId: folder.roomId,
      uploadedBy: userId,
    });

    // Process document in background (extract text, create chunks)
    processDocument(
      uploadedFile.buffer,
      uploadedFile.mimetype,
      file._id.toString(),
      folder.roomId.toString(),
      uploadedFile.originalname
    ).then(() => {
      File.findByIdAndUpdate(file._id, { processed: true }).exec();
    }).catch((err) => {
      console.error('Background document processing error:', err);
    });

    res.status(201).json({ file });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * GET /api/folders/:folderId/files
 * List all files in a folder.
 */
export const listFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { folderId } = req.params;

    const files = await File.find({ folderId })
      .populate('uploadedBy', 'name email')
      .sort({ uploadDate: -1 });

    res.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
};

/**
 * DELETE /api/files/:id
 * Delete a file (admin only).
 */
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const file = await File.findById(id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Check admin permission
    const membership = await RoomMember.findOne({
      userId,
      roomId: file.roomId,
      role: 'admin',
    });

    if (!membership) {
      res.status(403).json({ error: 'Only admins can delete files' });
      return;
    }

    // Delete from Firebase Storage
    await deleteFromFirebase(file.storagePath);

    // Delete text chunks
    await TextChunk.deleteMany({ fileId: file._id });

    // Delete file record
    await File.findByIdAndDelete(id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

/**
 * GET /api/files/:id/preview
 * Get a signed URL for file preview.
 */
export const getFilePreview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const file = await File.findById(id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Check room membership
    const membership = await RoomMember.findOne({
      userId,
      roomId: file.roomId,
    });

    if (!membership) {
      res.status(403).json({ error: 'You do not have access to this file' });
      return;
    }

    const previewUrl = await getSignedUrl(file.storagePath);

    res.json({
      previewUrl,
      fileName: file.fileName,
      fileType: file.fileType,
    });
  } catch (error) {
    console.error('File preview error:', error);
    res.status(500).json({ error: 'Failed to get file preview' });
  }
};
