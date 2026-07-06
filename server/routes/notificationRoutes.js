import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  sendAnnouncement,
  getSentAnnouncements,
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.use(protect);

router.get('/', getNotifications);
router.post('/announce', admin, sendAnnouncement);
router.get('/sent-announcements', admin, getSentAnnouncements);
router.post('/', createNotification);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
