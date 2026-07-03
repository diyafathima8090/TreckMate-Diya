import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trek',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: ['trip_group', 'direct'],
      default: 'trip_group',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;
