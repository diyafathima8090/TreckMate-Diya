import express from 'express';
import { getActiveSosAlerts, triggerSos, resolveSos } from '../controllers/sosController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getActiveSosAlerts);
router.post('/trigger', protect, triggerSos);
router.patch('/:id/resolve', protect, resolveSos);

export default router;
