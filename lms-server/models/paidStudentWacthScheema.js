// models/WatchTime.js - PROGRESS STATE
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paidStudentswatchTimeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureId: {
      // Renamed from videoId for consistency
      type: Schema.Types.ObjectId,
      required: true,
    },

    // ⭐ ONLY TIME DATA - NO PROGRESS, NO COMPLETION
    totalWatchTimeMs: {
      // Changed from totalWatchedSeconds
      type: Number, // in milliseconds
      default: 0,
      min: 0,
    },

    // ⭐ TIMESTAMPS
    firstWatchedAt: {
      type: Date,
      default: Date.now,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },

    // ⭐ METADATA (optional)
    replayCount: {
      // How many times watched
      type: Number,
      default: 0,
    },
    avgSessionTime: Number, // Average watch session in ms
  },
  { timestamps: true },
);

// Indexes
paidStudentswatchTimeSchema.index(
  { userId: 1, courseId: 1, lectureId: 1 },
  { unique: true },
);
paidStudentswatchTimeSchema.index({ userId: 1, lastWatchedAt: -1 });
paidStudentswatchTimeSchema.index({ courseId: 1 });

module.exports = mongoose.model(
  "PaidStudentsWatchTime",
  paidStudentswatchTimeSchema,
);
