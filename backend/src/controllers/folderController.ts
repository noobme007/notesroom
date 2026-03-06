import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Folder, RoomMember } from '../models';

/**
 * POST /api/rooms/:roomId/folders
 * Create a folder in a room.
 */
export const createFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { folderName } = req.body;
    const userId = req.user!._id;

    if (!folderName || folderName.trim().length === 0) {
      res.status(400).json({ error: 'Folder name is required' });
      return;
    }

    // Check for duplicate folder name in the same room
    const existingFolder = await Folder.findOne({
      roomId,
      folderName: folderName.trim(),
    });

    if (existingFolder) {
      res.status(400).json({ error: 'A folder with this name already exists' });
      return;
    }

    const folder = await Folder.create({
      roomId,
      folderName: folderName.trim(),
      createdBy: userId,
    });

    res.status(201).json({ folder });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

/**
 * GET /api/rooms/:roomId/folders
 * List all folders in a room.
 */
export const listFolders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;

    const folders = await Folder.find({ roomId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: 1 });

    res.json({ folders });
  } catch (error) {
    console.error('List folders error:', error);
    res.status(500).json({ error: 'Failed to list folders' });
  }
};

/**
 * DELETE /api/folders/:id
 * Delete a folder (admin only).
 */
export const deleteFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const folder = await Folder.findById(id);
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    // Check if user is admin of the room
    const membership = await RoomMember.findOne({
      userId,
      roomId: folder.roomId,
      role: 'admin',
    });

    if (!membership) {
      res.status(403).json({ error: 'Only admins can delete folders' });
      return;
    }

    await Folder.findByIdAndDelete(id);

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};
