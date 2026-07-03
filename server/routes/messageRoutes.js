import express from 'express';
import { getMessagesByTrek } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:trekId', protect, getMessagesByTrek);

export default router;
