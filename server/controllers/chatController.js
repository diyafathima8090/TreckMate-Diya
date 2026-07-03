import ChatRoom from '../models/ChatRoom.js';
import Participant from '../models/Participant.js';
import Message from '../models/Message.js';
import Trek from '../models/Trek.js';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';

// Ensure a chat room exists for a trip
export const getOrCreateTripRoom = async (req, res) => {
  try {
    const { trekId } = req.params;
    
    // Validate trek
    const trek = await Trek.findOne({ id: trekId });
    if (!trek) return res.status(404).json({ success: false, message: 'Trip not found' });

    let room = await ChatRoom.findOne({ trip_id: trek._id });
    
    if (!room) {
      room = await ChatRoom.create({
        trip_id: trek._id,
        name: `${trek.title} Chat`,
        type: 'trip_group'
      });
      
      // Auto-add organizer if exists
      if (trek.organizer_id) {
        await Participant.create({
          room_id: room._id,
          user_id: trek.organizer_id,
          role: 'organizer'
        });
      }
    }
    
    // Check if current user is participant
    let participant = await Participant.findOne({ room_id: room._id, user_id: req.user._id });
    
    if (!participant) {
      // Determine role (organizer check vs member)
      let role = 'member';
      let isAuthorized = false;

      if (req.user.role === 'admin') {
        role = 'admin';
        isAuthorized = true;
      } else if (req.user.role === 'organizer' && (String(trek.organizer_id) === String(req.user._id) || (trek.organizer && trek.organizer.toLowerCase() === req.user.name.toLowerCase()))) {
        role = 'organizer';
        isAuthorized = true;
      } else {
        // For standard users, verify they actually have a booking for this trek
        const booking = await Booking.findOne({ 
          $and: [
            { $or: [{ user_id: req.user._id }, { user: req.user._id }, { email: req.user.email }] },
            { $or: [{ trip_id: trek._id }, { trekId: trek.id }] },
            { $or: [{ booking_status: 'confirmed' }, { status: 'Approved' }, { status: 'Confirmed' }, { status: 'Paid & Confirmed' }] }
          ]
        });
        
        if (booking) {
          isAuthorized = true;
        }
      }
      
      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'You must have a confirmed booking for this trip to access its chat.' });
      }

      participant = await Participant.create({
        room_id: room._id,
        user_id: req.user._id,
        role
      });
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    import('fs').then(fs => fs.writeFileSync('error_log.txt', error.stack || error.toString()));
    console.error('Error in getOrCreateTripRoom:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error', stack: error.stack });
  }
};

// Get all rooms the user is part of
export const getUserRooms = async (req, res) => {
  try {
    // Auto-heal missing participant records for organizers
    if (req.user.role === 'organizer') {
      const myTreks = await Trek.find({
        $or: [
          { organizer_id: req.user._id },
          { organizer: { $regex: new RegExp(`^${req.user.name}$`, 'i') } }
        ]
      });
      const trekIds = myTreks.map(t => t._id);
      const rooms = await ChatRoom.find({ trip_id: { $in: trekIds } });
      for (const room of rooms) {
        const p = await Participant.findOne({ room_id: room._id, user_id: req.user._id });
        if (!p) {
          await Participant.create({ room_id: room._id, user_id: req.user._id, role: 'organizer' });
        }
      }
    }

    const participants = await Participant.find({ user_id: req.user._id }).populate({
      path: 'room_id',
      populate: { path: 'trip_id', select: 'title image organizer status' }
    });
    
    // Format response
    const rooms = await Promise.all(participants.map(async p => {
      const room = p.room_id;
      if (!room) return null;
      
      // Get latest message
      const lastMessage = await Message.findOne({ room_id: room._id }).sort({ createdAt: -1 });
      
      return {
        _id: room._id,
        name: room.name,
        trip: room.trip_id,
        lastMessage: lastMessage ? { text: lastMessage.message, createdAt: lastMessage.createdAt } : null,
        unreadCount: 0 // Will implement later with last_read_message_id logic
      };
    }));

    res.status(200).json({ success: true, data: rooms.filter(Boolean) });
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get messages for a specific room
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Verify participation
    const participant = await Participant.findOne({ room_id: roomId, user_id: req.user._id });
    if (!participant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this room' });
    }
    
    const messages = await Message.find({ room_id: roomId })
      .populate('sender_id', 'name profileImage role')
      .sort({ createdAt: 1 });
      
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
