import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trek',
      default: null,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    booking_status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    approved_at: {
      type: Date,
      default: null,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },

    
    ticketId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    ticketCode: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String, 
    },
    scanned: {
      type: Boolean,
      default: false,
    },
    scannedAt: {
      type: Date,
      default: null,
    },
    trekId: {
      type: String, 
      trim: true,
    },
    seats: {
      type: Number,
      min: [1, 'Must book at least 1 seat'],
      default: 1,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bookingDate: {
      type: String,
    },
    trekTitle: {
      type: String,
      trim: true,
    },
    trekLocation: {
      type: String,
      trim: true,
    },
    trekImage: {
      type: String,
    },
    trekOrganizer: {
      type: String,
      trim: true,
    },
    trekDates: {
      type: String,
    },
    payableAmount: {
      type: Number,
    },
    status: {
      type: String,
      default: 'Pending Approval',
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
