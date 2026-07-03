import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyPayments,
  getAllPayments,
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect);

router.get('/mine', getMyPayments);
router.get('/', getAllPayments);
router.post('/', createPayment);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
