import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createBooking, getOrganizerBookings, getUserBookings, updateBookingStatus, getOrganizerRequests, getAllBookingsAdmin, getBookingByTicketId } from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional protect middleware to populate req.user if token is present
const optionalProtect = async (req, res, next) => {
  let token;
  const activeRole = req.headers['x-active-role'];

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Fallback to cookie based on active role
  else if (activeRole && req.cookies && req.cookies[`token_${activeRole}`]) {
    token = req.cookies[`token_${activeRole}`];
  }
  // Legacy fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    next();
  }
};

router.route('/')
  .post(optionalProtect, createBooking);

//  Named routes MUST come before /:id to prevent Express from matching them as IDs

router.route('/admin')
  .get(protect, admin, getAllBookingsAdmin);

router.route('/my-bookings')
  .get(protect, getUserBookings);

router.route('/organizer/requests')
  .get(protect, getOrganizerRequests);

router.route('/organizer')
  .get(protect, getOrganizerBookings);

router.route('/ticket/:ticketId')
  .get(getBookingByTicketId);
  
// Dynamic :id route must come LAST
router.route('/:id/status')
  .put(protect, updateBookingStatus);

export default router;
