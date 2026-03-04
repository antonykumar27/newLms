// models/DailyActivityEnhanced.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },

  startTime: {
    type: Date,
    required: true,
  },

  endTime: {
    type: Date,
  },

  duration: {
    type: Number, // in seconds
    default: 0,
  },

  // Videos watched in this session
  videos: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      title: { type: String },
      watchTime: { type: Number }, // seconds watched
      progress: { type: Number }, // percentage
      completed: { type: Boolean, default: false },
      watchedAt: { type: Date },
    },
  ],

  // Session metrics
  metrics: {
    averageWatchTime: { type: Number },
    videosCompleted: { type: Number },
    videosStarted: { type: Number },
    breaks: { type: Number, default: 0 },
  },

  // Device info
  device: {
    type: { type: String, enum: ["mobile", "tablet", "desktop"] },
    browser: { type: String },
    os: { type: String },
  },

  location: {
    ip: { type: String },
    city: { type: String },
    country: { type: String },
  },
});

const dailyActivityEnhancedSchema = new mongoose.Schema(
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

    // Sessions
    sessions: [sessionSchema],

    // Aggregated daily stats
    stats: {
      totalSessions: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 }, // seconds
      averageSessionDuration: { type: Number, default: 0 },

      videosStarted: { type: Number, default: 0 },
      videosCompleted: { type: Number, default: 0 },
      uniqueVideos: { type: Number, default: 0 },

      // Time-based stats
      firstActivity: { type: Date },
      lastActivity: { type: Date },
      peakHour: { type: Number }, // 0-23

      // Engagement
      engagementScore: { type: Number, min: 0, max: 100 },
      consistencyBonus: { type: Boolean, default: false },
    },

    // Subject-wise breakdown
    subjects: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        subjectName: { type: String },
        watchTime: { type: Number, default: 0 },
        videosWatched: { type: Number, default: 0 },
        videosCompleted: { type: Number, default: 0 },
        progress: { type: Number }, // average progress percentage
      },
    ],

    // Chapter-wise breakdown
    chapters: [
      {
        chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
        chapterName: { type: String },
        subjectId: { type: mongoose.Schema.Types.ObjectId },
        watchTime: { type: Number, default: 0 },
        videosWatched: { type: Number, default: 0 },
      },
    ],

    // Hourly heatmap (24 hours)
    hourlyActivity: [
      {
        hour: { type: Number, min: 0, max: 23 },
        watchTime: { type: Number, default: 0 },
        sessionCount: { type: Number, default: 0 },
        videosWatched: { type: Number, default: 0 },
      },
    ],

    // Achievements for the day
    achievements: {
      completedDailyGoal: { type: Boolean, default: false },
      perfectDay: { type: Boolean, default: false }, // studied all subjects
      powerHour: { type: Boolean, default: false }, // 60+ mins in one hour
      badgesEarned: [{ type: String }],
    },

    // Notes
    notes: { type: String },

    // Metadata
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Compound indexes
dailyActivityEnhancedSchema.index({ studentId: 1, date: -1 }, { unique: true });
dailyActivityEnhancedSchema.index({ studentId: 1, "subjects.subjectId": 1 });
dailyActivityEnhancedSchema.index({ "sessions.startTime": 1 });

// Virtual for formatted date
dailyActivityEnhancedSchema.virtual("formattedDate").get(function () {
  return this.date.toISOString().split("T")[0];
});

// Methods
dailyActivityEnhancedSchema.methods.calculateEngagementScore = function () {
  let score = 0;

  // Factor 1: Watch time (max 40 points)
  const watchTimeScore = Math.min(40, (this.stats.totalWatchTime / 3600) * 10); // 4 hours = 40 points

  // Factor 2: Videos completed (max 30 points)
  const completionScore = Math.min(30, this.stats.videosCompleted * 3); // 10 videos = 30 points

  // Factor 3: Subject variety (max 20 points)
  const varietyScore = Math.min(20, this.subjects.length * 5); // 4 subjects = 20 points

  // Factor 4: Consistency (max 10 points)
  const consistencyScore = this.sessions.length >= 2 ? 10 : 5;

  score = watchTimeScore + completionScore + varietyScore + consistencyScore;

  this.stats.engagementScore = Math.min(100, Math.round(score));
  return this.stats.engagementScore;
};

const DailyActivityEnhanced = mongoose.model(
  "DailyActivityEnhanced",
  dailyActivityEnhancedSchema,
);
export default DailyActivityEnhanced;
