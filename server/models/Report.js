import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reported_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify the user being reported'],
    },
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify who is making the report'],
    },
    reason: {
      type: String,
      required: [true, 'Please add a reason for the report'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    
    description: {
      type: String,
      trim: true,
      default: '',
    },
    evidence_urls: {
      type: [String],
      default: [],
    },
    admin_notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
