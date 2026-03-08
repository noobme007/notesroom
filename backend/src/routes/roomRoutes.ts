import { Router } from 'express';
import {
  createRoom,
  joinRoom,
  listRooms,
  getRoom,
  listMembers,
  updateMemberRole,
  removeMember,
  deleteRoom,
  downloadRoomAsZip,
} from '../controllers/roomController';
import { authenticate } from '../middleware/auth';
import { requireRoomRole } from '../middleware/roomAccess';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createRoom);
router.post('/join', joinRoom);
router.get('/', listRooms);
router.get('/:id', getRoom);
router.delete('/:id', requireRoomRole('admin'), deleteRoom);
router.get('/:id/members', requireRoomRole('admin', 'editor', 'viewer'), listMembers);
router.get('/:id/download', requireRoomRole('admin', 'editor', 'viewer'), downloadRoomAsZip);
router.put('/:id/members/:userId', requireRoomRole('admin'), updateMemberRole);
router.delete('/:id/members/:userId', requireRoomRole('admin'), removeMember);

export default router;
