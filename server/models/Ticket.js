import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, 
    },
    tripId: {
      type: String, 
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    qrCode: {
      type: String, 
      required: true,
    },
    scanned: {
      type: Boolean,
      default: false,
    },
    scannedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['valid', 'used', 'cancelled'],
      default: 'valid',
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
