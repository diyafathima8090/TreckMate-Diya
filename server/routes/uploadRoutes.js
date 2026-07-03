import express from 'express';
import { upload } from '../config/cloudinary.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

// Upload a single image
router.post('/', upload.single('image'), uploadImage);

export default router;
