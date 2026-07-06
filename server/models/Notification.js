import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please link to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please add notification message'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_cancelled',
        'trip_update',
        'message',
        'payment',
        'chat',
        'system',
        'report',
      ],
      default: 'system',
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    reference_id: {
      type: String,
      default: '',
    },
    reference_type: {
      type: String,
      enum: ['trek', 'booking', 'message', 'payment', 'user', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
