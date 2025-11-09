import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // Simple email regex for validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
  },
  {
    timestamps: true,
  }
);


// Pre-save hook to validate event exists before creating booking

bookingSchema.pre('save', async function (next) {
  const booking = this;
  
  // Only validate eventId if it's new or modified
  if (booking.isModified('eventId') || booking.isNew) {
    try {
      const eventExists = await Event.findById(booking.eventId).select('_id');

      if (!eventExists) {
        const error = new Error('Event does not exist');
        error.name = 'ValidationError';
        return next(error);
      }
    } catch (error) {
      const ValidationError = new Error('Invalid event ID format or database error');
      ValidationError.name = 'ValidationError';
      return next(ValidationError);
    }
  }
  
  next();
});

// Create index on eventId for faster queries
bookingSchema.index({ eventId: 1 });  

// Create compound index for common queries (event bookings by date)
bookingSchema.index({ eventId: 1, createdAt: -1 });

// Create index on email for user booking lookups
bookingSchema.index({ email: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;