import express from 'express';
import { getOrCreateTripRoom, getUserRooms, getRoomMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); 

router.get('/rooms', getUserRooms);
router.get('/trip/:trekId/room', getOrCreateTripRoom);
router.get('/room/:roomId/messages', getRoomMessages);

export default router;
