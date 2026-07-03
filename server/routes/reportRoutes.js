import express from 'express';
import {
  createReport,
  getAllReports,
  updateReportStatus,
  getMyReports,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllReports);
router.get('/mine', getMyReports);
router.post('/', createReport);
router.put('/:id/status', updateReportStatus);

export default router;
