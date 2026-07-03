import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please link to a user account'],
      unique: true, // One organizer profile per user
    },
    organization_name: {
      type: String,
      required: [true, 'Please add the organization name'],
      trim: true,
    },
    license_number: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: Number,
      default: 0, // Years of experience
      min: [0, 'Experience cannot be negative'],
    },
    documents: {
      type: String, // URL or path to uploaded documents
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    // Extra useful fields
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    additional_notes: {
      type: String,
      trim: true,
      default: '',
    },
    submitted_documents: [
      {
        document_type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          default: '',
        },
        submitted_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    submission_date: {
      type: Date,
      default: Date.now,
    },
    admin_review_date: {
      type: Date,
    },
    admin_notes: {
      type: String,
      trim: true,
      default: '',
    },
    rejection_reason: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    total_treks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to populate user details
organizerSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

const Organizer = mongoose.model('Organizer', organizerSchema);

export default Organizer;
