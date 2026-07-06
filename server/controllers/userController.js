import User from '../models/User.js';




export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import SosAlert from '../models/SosAlert.js';
import Trek from '../models/Trek.js';




export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    await Booking.deleteMany({ user: user._id });
    await Payment.deleteMany({ user_id: user._id });
    await Notification.deleteMany({ user_id: user._id });
    await Message.deleteMany({ sender_id: user._id });
    await SosAlert.deleteMany({ user_id: user._id });
    
    
    if (user.role === 'organizer') {
      const treks = await Trek.find({ organizer_id: user._id });
      for (const trek of treks) {
        
        await Booking.deleteMany({ trekId: trek.id });
        await Trek.findByIdAndDelete(trek._id);
      }
    }

    
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVerifications = async (req, res) => {
  try {
    const users = await User.find({ role: 'organizer' }).select('-password').sort({ verification_submitted_at: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Organizer not found' });
    user.verification_status = 'approved';
    user.verification_reviewed_at = new Date();
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectVerification = async (req, res) => {
  try {
    const { admin_notes } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Organizer not found' });
    user.verification_status = 'rejected';
    user.admin_notes = admin_notes || 'Verification rejected. Please submit valid documents.';
    user.verification_reviewed_at = new Date();
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resubmitVerification = async (req, res) => {
  try {
    const { verification_document_type, verification_document_url, verification_notes } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'organizer') return res.status(403).json({ success: false, message: 'Not an organizer' });
    
    user.verification_status = 'pending';
    if (verification_document_type) user.verification_document_type = verification_document_type;
    if (verification_document_url) user.verification_document_url = verification_document_url;
    if (verification_notes) user.verification_notes = verification_notes;
    user.verification_submitted_at = new Date();
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
