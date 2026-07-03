import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';

// Protect routes - Verify JWT cookie or Bearer token
export const protect = async (req, res, next) => {
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
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Get user from the token, excluding the password
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    next();
  } catch (error) {
    console.error(`Auth Middleware Error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed',
    });
  }
};

// Admin route protection
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
  }
};
// Verified Organizer route protection
export const verifiedOrganizer = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return next(); // Admins can bypass
    }

    if (req.user && req.user.role === 'organizer') {
      const organizer = await Organizer.findOne({ user_id: req.user._id });
      if (organizer && organizer.status === 'approved') {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Organizer account not verified. Please wait for admin approval.',
        status: organizer ? organizer.status : 'pending',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Only approved organizers or admins can perform this action.',
    });
  } catch (error) {
    console.error(`Verified Organizer Middleware Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check',
      error: error.message,
    });
  }
};

