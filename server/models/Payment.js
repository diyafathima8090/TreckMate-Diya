import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please link to a user'],
    },
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trek',
      required: [true, 'Please link to a trip'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add the payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    payment_method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'other', 'razorpay'],
      default: 'other',
    },
    transaction_id: {
      type: String,
      trim: true,
      default: '',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'success',
    },
    // Extra metadata
    currency: {
      type: String,
      default: 'INR',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
