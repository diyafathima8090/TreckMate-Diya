import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  googleAuth,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', logoutUser);

export default router;
