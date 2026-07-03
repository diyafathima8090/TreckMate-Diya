import express from 'express';
import {
  getAllUsers,
  suspendUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.route('/')
  .get(getAllUsers);

router.route('/:id/suspend')
  .put(suspendUser);

router.route('/:id')
  .delete(deleteUser);

export default router;
