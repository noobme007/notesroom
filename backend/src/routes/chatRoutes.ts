import { Router } from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { requireRoomRole } from '../middleware/roomAccess';

const router = Router();

router.use(authenticate);

router.post('/rooms/:roomId/chat', requireRoomRole('admin', 'editor', 'viewer'), sendMessage);
router.get(
  '/rooms/:roomId/chat/history',
  requireRoomRole('admin', 'editor', 'viewer'),
  getChatHistory
);

export default router;
