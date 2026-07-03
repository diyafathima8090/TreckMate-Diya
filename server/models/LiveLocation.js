import mongoose from 'mongoose';

const liveLocationSchema = new mongoose.Schema(
  {
    trekId: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    elevation: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const LiveLocation = mongoose.model('LiveLocation', liveLocationSchema);

export default LiveLocation;
