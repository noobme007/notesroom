import { Router } from 'express';
import { googleAuth, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/google', authenticate, googleAuth);
router.get('/me', authenticate, getMe);

export default router;
