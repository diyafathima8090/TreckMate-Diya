import express from 'express';
import { verifyTicket } from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both organizers and admins should be able to verify tickets
router.route('/verify').post(protect, verifyTicket);

export default router;
