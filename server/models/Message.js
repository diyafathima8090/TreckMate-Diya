import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    message_type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
      default: 'text',
    },
    media_url: {
      type: String,
      default: '',
    },

    
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trek',
      default: null,
    },
    trekId: {
      type: String, 
      trim: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ['hiker', 'guide', 'organizer', 'system'],
      default: 'hiker',
    },
    text: {
      type: String, 
      trim: true,
    },
    isReadByOrganizer: {
      type: Boolean,
      default: false,
    },
    isReadByHikers: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
