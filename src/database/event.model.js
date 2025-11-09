import mongoose from "mongoose";
import { parse } from "next/dist/build/swc/generated-native";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 500 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      maxlength: [500, 'Overview cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    }, 
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be either online, offline, or hybrid',
      },
    }, 
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Agenda must have at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Tags must have at least one item',
      },
    },
  },
  {
    timestamps: true // Auto-generate createdAt and updatedAt
  }
);

// Pre-save book for slug generation and data normalization

eventSchema.pre('save', function (next) {
  const event = this;

  // Generate slug only if title changed or document is new
  if (event.isModified('title') || event.isNew) {
    event.slug = generateSlug(event.title);
  }

  // Normalize date to ISO format if it's not already
  if (event.isModified('date')) {
    event.date = normalizeDate(event.date);
  }

  // Normalize time to HH:MM format if it's not already
  if (event.isModified('time')) {
    event.time = normalizeTime(event.time);
  }

  next();
});

// Helper functions to generate URL-friendly slug
function generateSlug(title) {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

// Helper function to normalize date to ISO format
function normalizeDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date.toISOString().split('T')[0]; // Return only the date part
}

function normalizeTime(timeStr) {
  // Handle various time formats and convert to HH:MM (24-hour format)
  const date = new Date(`1970-01-01T${timeStr}`);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid time format');
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`; // Return in HH:MM format
}

// Create unique index on slug for better performance
eventSchema.index({ slug: 1 }, { unique: true });

// Create compound index for common queries
eventSchema.index({ date: 1, location: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;