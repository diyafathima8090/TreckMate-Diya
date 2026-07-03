import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trek',
      required: true,
    },
    organizer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    // Legacy support fields if needed temporarily:
    trekId: { type: String },
    trekName: { type: String },
  },
  {
    timestamps: true,
  }
);

const SosAlert = mongoose.model('SosAlert', sosAlertSchema);

export default SosAlert;
