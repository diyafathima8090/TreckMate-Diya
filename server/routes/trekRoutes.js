import express from 'express';
import { getTreks, getTrekById, createTrek, updateTrek } from '../controllers/trekController.js';
import { protect, verifiedOrganizer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getTreks)
  .post(protect, verifiedOrganizer, createTrek);

router.route('/:id')
  .get(getTrekById)
  .put(protect, verifiedOrganizer, updateTrek);

export default router;
