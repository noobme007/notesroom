import { Router } from 'express';
import { createFolder, listFolders, deleteFolder } from '../controllers/folderController';
import { authenticate } from '../middleware/auth';
import { requireRoomRole } from '../middleware/roomAccess';

const router = Router();

router.use(authenticate);

// Folder routes within a room
router.post('/rooms/:roomId/folders', requireRoomRole('admin', 'editor'), createFolder);
router.get('/rooms/:roomId/folders', requireRoomRole('admin', 'editor', 'viewer'), listFolders);
router.delete('/folders/:id', authenticate, deleteFolder);

export default router;
