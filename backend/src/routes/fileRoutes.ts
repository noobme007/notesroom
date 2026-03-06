import { Router } from 'express';
import multer from 'multer';
import { uploadFile, listFiles, deleteFile, getFilePreview } from '../controllers/fileController';
import { authenticate } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.use(authenticate);

router.post('/folders/:folderId/files', upload.single('file'), uploadFile);
router.get('/folders/:folderId/files', listFiles);
router.delete('/files/:id', deleteFile);
router.get('/files/:id/preview', getFilePreview);

export default router;
