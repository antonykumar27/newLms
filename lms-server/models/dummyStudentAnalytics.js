// models/StudentAnalytics.js
import mongoose from "mongoose";

const dailyActivitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  watchTime: { type: Number, default: 0 }, // in seconds
  videosCompleted: { type: Number, default: 0 },
  videosStarted: { type: Number, default: 0 },
  hourlyBreakdown: [Number], // 24 hours array
});

const badgeSchema = new mongoose.Schema({
  badgeId: { type: String },
  category: {
    type: String,
    enum: ["streak", "completion", "excellence", "special"],
  },
  level: { type: Number },
  name: { type: String },
  description: { type: String },
  earnedAt: { type: Date, default: Date.now },
});

const subjectPerformanceSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  totalWatchTime: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  lastAccessed: { type: Date },
});

const weeklySummarySchema = new mongoose.Schema({
  weekStart: { type: Date },
  weekEnd: { type: Date },
  totalWatchTime: { type: Number },
  videosCompleted: { type: Number },
  averageDailyTime: { type: Number },
});

const studentAnalyticsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Streak Tracking
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
      freezeDays: { type: Number, default: 0 },
    },

    // Daily Activity (for heatmap)
    dailyActivity: [dailyActivitySchema],

    // Badges Earned
    badges: [badgeSchema],

    // Subject Performance
    subjectPerformance: [subjectPerformanceSchema],

    // Weekly Summaries
    weeklySummaries: [weeklySummarySchema],

    // Smart Insights
    insights: {
      preferredStudyTime: {
        type: String,
        enum: ["Morning 🌅", "Afternoon ☀️", "Evening 🌆", "Night 🌙"],
        default: "Evening 🌆",
      },
      strongestSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      weakestSubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      averageDailyWatchTime: { type: Number, default: 0 }, // in minutes
      consistencyScore: { type: Number, min: 0, max: 100, default: 0 },
    },

    // Metadata
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
studentAnalyticsSchema.index({ studentId: 1 });
studentAnalyticsSchema.index({ "dailyActivity.date": 1 });

const StudentAnalytics = mongoose.model(
  "StudentAnalytics",
  studentAnalyticsSchema,
);
export default StudentAnalytics;
