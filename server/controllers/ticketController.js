import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';

// Verify Ticket Scan
// POST /api/tickets/verify
// Private (Organizer/Admin)
export const verifyTicket = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({ success: false, message: 'Ticket code is required' });
    }

    // 1. Find ticket
    const ticket = await Ticket.findOne({ ticketCode });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid Ticket' });
    }

    // 2. Find booking
    const booking = await Booking.findById(ticket.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated booking not found' });
    }

    // 3. Verify booking status
    if (booking.booking_status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot verify. Booking status is ${booking.booking_status}` 
      });
    }

    // 4. Check if already scanned
    if (ticket.scanned) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket Already Used',
        data: {
          scannedAt: ticket.scannedAt
        }
      });
    }

    // 5. Mark as scanned
    ticket.scanned = true;
    ticket.scannedAt = new Date();
    await ticket.save();

    // Update Booking as well
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
