// models/StudentActivity.js
const mongoose = require("mongoose");

const hourlyBreakdownSchema = new mongoose.Schema({
  hour: { type: Number, required: true, min: 0, max: 23 },
  watchTime: { type: Number, default: 0 }, // seconds
  videosWatched: { type: Number, default: 0 },
});

const dailyActivitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    // Daily metrics
    totalWatchTime: {
      type: Number,
      default: 0, // in seconds
    },

    videosStarted: {
      type: Number,
      default: 0,
    },

    videosCompleted: {
      type: Number,
      default: 0,
    },

    // Time-based breakdown
    hourlyBreakdown: [hourlyBreakdownSchema],

    // Subject breakdown
    subjectBreakdown: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        watchTime: { type: Number, default: 0 },
        videosWatched: { type: Number, default: 0 },
      },
    ],

    // Session details
    sessions: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        duration: { type: Number }, // seconds
        videosWatched: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
      },
    ],

    // Achievements for the day
    achievements: {
      completedDailyGoal: { type: Boolean, default: false },
      achievedStreak: { type: Boolean, default: false },
      badgesEarned: [{ type: String }],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
dailyActivitySchema.index({ studentId: 1, date: -1 });
dailyActivitySchema.index({ studentId: 1, "subjectBreakdown.subjectId": 1 });

const DailyActivity = mongoose.model("DailyActivitys", dailyActivitySchema);
module.exports = DailyActivity;
