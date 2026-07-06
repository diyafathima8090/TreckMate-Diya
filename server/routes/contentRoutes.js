import express from 'express';
import { getBanners, toggleBanner, createBanner, deleteBanner } from '../controllers/contentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.route('/banners')
  .get(getBanners)
  .post(protect, admin, createBanner);

router.route('/banners/:id')
  .delete(protect, admin, deleteBanner);

router.route('/banners/:id/toggle')
  .put(protect, admin, toggleBanner);

export default router;
