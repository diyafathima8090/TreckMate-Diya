import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Ticket from '../models/Ticket.js';
import Trek from '../models/Trek.js';
import QRCode from 'qrcode';
import sendEmail from '../utils/sendEmail.js';




export const createBooking = async (req, res, next) => {
  try {
    const bookingData = { ...req.body };

    
    if (req.user) {
      bookingData.user = req.user._id;

      
      const trekQuery = [];
      if (bookingData.trip_id) trekQuery.push({ trip_id: bookingData.trip_id });
      if (bookingData.trekId) trekQuery.push({ trekId: bookingData.trekId });

      if (trekQuery.length > 0) {
        const existingBooking = await Booking.findOne({
          user: req.user._id,
          $or: trekQuery,
          booking_status: { $nin: ['cancelled', 'rejected'] }
        });

        if (existingBooking) {
          return res.status(400).json({
            success: false,
            message: 'You have already booked this trip.'
          });
        }
      }
    }

    const booking = await Booking.create(bookingData);

    
    const tripIdStr = booking.trekId ? booking.trekId.substring(0, 3).toUpperCase() : 'TRP';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedTicketCode = booking.ticketId || `TM-${tripIdStr}-${randomNum}`;
    
    
    const qrPayload = JSON.stringify({
      bookingId: booking._id,
      ticketCode: generatedTicketCode,
      tripId: booking.trip_id || booking.trekId,
      userId: booking.user || 'guest'
    });
    
    const qrCodeBase64 = await QRCode.toDataURL(qrPayload);

    
    booking.ticketCode = generatedTicketCode;
    booking.ticketId = generatedTicketCode;
    booking.qrCode = qrCodeBase64;
    await booking.save();

    
    await Ticket.create({
      userId: booking.user || null,
      tripId: booking.trip_id || booking.trekId || 'unknown',
      bookingId: booking._id,
      ticketCode: generatedTicketCode,
      qrCode: qrCodeBase64
    });

    
    try {
      const trekQuery = booking.trip_id ? { _id: booking.trip_id } : { id: booking.trekId };
      const trek = await Trek.findOne(trekQuery);
      if (trek && trek.left) {
        const match = trek.left.match(/(\d+)/);
        if (match) {
          const currentLeft = parseInt(match[1], 10);
          if (currentLeft > 0) {
            trek.left = `${currentLeft - 1} Left`;
            await trek.save();
          }
        }
      }
    } catch (err) {
      console.error("Error decrementing trek availability:", err);
    }

    
    if (bookingData.trekOrganizer) {
      const organizer = await User.findOne({ name: bookingData.trekOrganizer, role: { $in: ['organizer', 'admin'] } });
      if (organizer) {
        
        await Notification.create({
          user_id: organizer._id,
          title: 'New Trip Booking Request',
          message: `${bookingData.fullName || 'Someone'} requested to join ${bookingData.trekTitle || 'your trip'}.`,
          type: 'booking_confirmed', 
          reference_id: booking._id.toString(),
          reference_type: 'booking'
        });

        
        await sendEmail({
          email: organizer.email,
          subject: 'New Booking Request - Trekmate',
          html: `<p>Hello ${organizer.name},</p><p>You have a new booking request from ${bookingData.fullName || 'a user'} for the trip <strong>${bookingData.trekTitle}</strong>.</p><p>Please log in to your Organizer Dashboard to review and approve/reject it.</p>`
        });
      }
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};




export const updateBookingStatus = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    
    if (booking.trekOrganizer && booking.trekOrganizer.toLowerCase() !== req.user.name.toLowerCase() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not your trip' });
    }

    booking.booking_status = status;
    booking.status = status === 'confirmed' ? 'Paid & Confirmed' : (status === 'rejected' ? 'Rejected' : 'Cancelled');
    if (status === 'confirmed') booking.approved_at = new Date();
    await booking.save();

    
    if (status === 'cancelled' || status === 'rejected') {
      try {
        const trekQuery = booking.trip_id ? { _id: booking.trip_id } : { id: booking.trekId };
        const trek = await Trek.findOne(trekQuery);
        if (trek && trek.left) {
          const match = trek.left.match(/(\d+)/);
          if (match) {
            const currentLeft = parseInt(match[1], 10);
            trek.left = `${currentLeft + 1} Left`;
            await trek.save();
          }
        }
      } catch (err) {
        console.error("Error restoring trek availability:", err);
      }
    }

    
    if (booking.email) {
      const subject = status === 'confirmed' ? 'Trip Booking Accepted!' : 'Trip Booking Update';
      const html = status === 'confirmed' 
        ? `<p>Great news! Your booking for <strong>${booking.trekTitle}</strong> has been accepted.</p>`
        : `<p>We're sorry, your booking for <strong>${booking.trekTitle}</strong> was not accepted at this time.</p>`;
        
      await sendEmail({ email: booking.email, subject, html });
    }

    
    if (booking.user) {
      await Notification.create({
        user_id: booking.user,
        title: `Booking ${status === 'confirmed' ? 'Accepted' : 'Rejected'}`,
        message: `Your booking for ${booking.trekTitle} was ${status === 'confirmed' ? 'accepted' : 'rejected'}.`,
        type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
        reference_id: booking._id.toString(),
        reference_type: 'booking'
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};




export const getOrganizerBookings = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view participant records.'
      });
    }

    
    const bookings = await Booking.find({
      trekOrganizer: { $regex: new RegExp('^' + req.user.name + '$', 'i') }
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};




export const getOrganizerRequests = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const bookings = await Booking.find({
      trekOrganizer: { $regex: new RegExp('^' + req.user.name + '$', 'i') },
      booking_status: 'pending'
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};




export const getUserBookings = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.'
      });
    }

    
    const bookings = await Booking.find({
      $or: [
        { user: req.user._id },
        { email: { $regex: new RegExp('^' + req.user.email + '$', 'i') } }
      ]
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};




export const getBookingByTicketId = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ ticketId: req.params.ticketId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};




export const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('user_id', 'name email')
      .populate('trip_id', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedBookings = bookings.map((b) => ({
      _id: b._id,
      user_name: b.fullName || (b.user_id && b.user_id.name) || (b.user && b.user.name) || 'Unknown User',
      trip_name: b.trekTitle || (b.trip_id && b.trip_id.title) || 'Unknown Trip',
      pax: b.seats || 1,
      amount: b.payableAmount || 0,
      booking_date: b.createdAt || b.bookingDate,
      booking_status: b.booking_status || b.status?.toLowerCase() || 'pending',
      ticketCode: b.ticketCode || b.ticketId || null,
      scanned: b.scanned || false,
    }));

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      data: formattedBookings
    });
  } catch (error) {
    next(error);
  }
};
