import express from 'express';
import { verifyTicket } from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.route('/verify').post(protect, verifyTicket);

export default router;
