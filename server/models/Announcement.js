import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an announcement title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please add announcement message'],
      trim: true,
    },
    target: {
      type: String,
      enum: ['all', 'organizers', 'trekkers'],
      required: true,
    },
    sentBy: {
      type: String,
      default: 'System Admin',
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
