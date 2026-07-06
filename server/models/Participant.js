import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['organizer', 'member', 'admin'],
      default: 'member',
    },
    last_read_message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


participantSchema.index({ room_id: 1, user_id: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;
