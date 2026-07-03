import mongoose from 'mongoose';

const trekSchema = new mongoose.Schema(
  {
    // ── Slug ID (legacy, kept for URL routing) ──────────────────────
    id: {
      type: String,
      unique: true,
      trim: true,
    },

    // ── Core fields from DB design ───────────────────────────────────
    title: {
      type: String,
      required: [true, 'Please add a trek title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a trail location'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    price: {
      type: String, // e.g. "₹4,500" — kept as String for display compat
      required: [true, 'Please add a price'],
    },
    price_num: {
      type: Number, // Optional numeric price for filtering/sorting
      default: null,
    },
    max_members: {
      type: Number,
      default: 15,
      min: [1, 'Must allow at least 1 member'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please add a difficulty level'],
      enum: ['Easy', 'Moderate', 'Intermediate', 'Difficult', 'Expert', 'Hard'],
      default: 'Moderate',
    },
    category: {
      type: String,
      enum: ['Camping', 'Hiking', 'Climbing', 'Wildlife', 'Cultural', 'Snow Trek', 'Adventure'],
      default: 'Hiking',
    },
    images: {
      type: [String], // Array of image URLs
      default: [],
    },
    start_date: {
      type: Date,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    organizer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'upcoming', 'completed', 'cancelled'],
      default: 'active',
    },

    // ── Legacy fields (kept for backward compat with existing UI) ────
    name: { type: String, trim: true },
    rating: { type: String, default: '5.0 (New)' },
    duration: { type: String, trim: true },
    seats: { type: String, default: '15 Persons' },
    left: { type: String, default: '15 Left' },
    reportingTime: { type: String, default: '7:30 AM' },
    pickup: { type: String, trim: true },
    temp: { type: String, default: '18°C Sunny' },
    baseRate: { type: Number, default: 0 },
    guideRate: { type: Number, default: 0 },
    dates: { type: String },
    image: { type: String }, // Single image (legacy)
    organizer: { type: String }, // Organizer name string (legacy)
    timeline: { type: mongoose.Schema.Types.Mixed, default: [] },
    guide: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: current bookings count
trekSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'trip_id',
  count: true,
});

const Trek = mongoose.model('Trek', trekSchema);

export default Trek;
