import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';




export const verifyTicket = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({ success: false, message: 'Ticket code is required' });
    }

    
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid Ticket' });
    }

    
    const booking = await Booking.findById(ticket.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated booking not found' });
    }

    
    if (booking.booking_status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot verify. Booking status is ${booking.booking_status}` 
      });
    }

    
    if (ticket.scanned) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket Already Used',
        data: {
          scannedAt: ticket.scannedAt
        }
      });
    }

    
    ticket.scanned = true;
    ticket.scannedAt = new Date();
    await ticket.save();

    
    booking.scanned = true;
    booking.scannedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Valid Ticket',
      data: {
        ticketCode: ticket.ticketCode,
        scannedAt: ticket.scannedAt,
        tripId: ticket.tripId,
        bookingDetails: {
          fullName: booking.fullName,
          seats: booking.seats,
          trekTitle: booking.trekTitle
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
