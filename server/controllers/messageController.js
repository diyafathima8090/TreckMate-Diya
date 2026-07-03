import Message from '../models/Message.js';
import Trek from '../models/Trek.js';
import Booking from '../models/Booking.js';
//    Get chat messages for a specific trek
//   GET /api/messages/:trekId
//   Private
export const getMessagesByTrek = async (req, res) => {
  try {
    const { trekId } = req.params;
    
    // Authorization Check
    let isAuthorized = false;
    const trek = await Trek.findOne({ id: trekId });
    if (!trek) {
      return res.status(404).json({ message: 'Trek not found' });
    }

    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (req.user.role === 'organizer' && trek.organizer.toLowerCase() === req.user.name.toLowerCase()) {
      isAuthorized = true;
    } else {
      // Check if user has a confirmed booking for this trek
      const booking = await Booking.findOne({ 
        user: req.user._id, 
        trip_id: trek._id, 
        booking_status: { $in: ['confirmed', 'pending'] }
      });
      // Fallback for legacy slug string treks without ObjectId link
      const legacyBooking = await Booking.findOne({ 
        user: req.user._id, 
        trekId: trekId, 
        booking_status: { $in: ['confirmed', 'pending'] }
      });
      
      if (booking || legacyBooking) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this chat. Your request may be pending or rejected.' });
    }

    // Fetch all messages for this trekId, sorted by creation date (oldest first)
    const messages = await Message.find({ trekId }).sort({ createdAt: 1 });
    
    // Map them to the format the frontend expects (from the socket payload format)
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      trekId: msg.trekId,
      sender: msg.senderName,
      role: msg.senderRole === 'organizer' ? 'Guide' : 'Trekker',
      text: msg.text,
      time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      avatar: msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'U',
      isGuide: msg.senderRole === 'organizer' ? false : true, // Organizer renders on right (isGuide=false in UI), Trekker renders on left (isGuide=true in UI)
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};
