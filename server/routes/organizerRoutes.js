import express from 'express';
import {
  getMyOrganizerProfile,
  createOrganizerProfile,
  updateOrganizerProfile,
  getAllOrganizers,
  updateOrganizerStatus,
  uploadVerificationDoc,
  serveSecureDocument,
  resubmitOrganizerDocuments,
  documentUpload,
} from '../controllers/organizerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/upload-doc', documentUpload.single('document'), uploadVerificationDoc);


router.use(protect);

router.get('/', getAllOrganizers);
router.get('/me', getMyOrganizerProfile);
router.post('/', createOrganizerProfile);
router.put('/me', updateOrganizerProfile);
router.put('/resubmit', resubmitOrganizerDocuments);
router.get('/documents/:filename', serveSecureDocument);
router.put('/:id/status', updateOrganizerStatus);

export default router;
