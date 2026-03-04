const mongoose = require("mongoose");

// =======================
// Leaderboard Entry Schema
// =======================
const leaderboardEntrySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  rank: { type: Number, required: true },
  previousRank: { type: Number },

  score: {
    type: Number,
    required: true,
    min: 0,
  },

  breakdown: {
    videosCompleted: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: { type: Number, default: 0 },
    consistency: { type: Number, default: 0 },
  },

  metrics: {
    totalVideos: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    badgeCount: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },

  trend: {
    type: String,
    enum: ["up", "down", "stable"],
    default: "stable",
  },
});

// =======================
// Leaderboard Schema
// =======================
const leaderboardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["global", "class", "subject", "weekly", "monthly"],
    },

    context: {
      standardId: { type: mongoose.Schema.Types.ObjectId, ref: "Standard" },
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      period: {
        startDate: { type: Date },
        endDate: { type: Date },
        weekNumber: { type: Number },
        month: { type: Number },
        year: { type: Number },
      },
    },

    entries: [leaderboardEntrySchema],

    totalParticipants: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },

    rewards: [
      {
        rank: { type: Number },
        badgeId: { type: String },
        points: { type: Number },
        description: { type: String },
      },
    ],
  },
  { timestamps: true },
);

// =======================
// Student Leaderboard Stats
// =======================
const studentLeaderboardStatsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    overall: {
      rank: { type: Number },
      percentile: { type: Number },
      totalPoints: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
    },

    subjectRanks: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        rank: { type: Number },
        totalParticipants: { type: Number },
        percentile: { type: Number },
      },
    ],

    classRank: {
      rank: { type: Number },
      totalStudents: { type: Number },
      percentile: { type: Number },
    },

    rankHistory: [
      {
        date: { type: Date, required: true },
        rank: { type: Number },
        type: { type: String },
        contextId: { type: mongoose.Schema.Types.ObjectId },
      },
    ],

    bestRank: {
      rank: { type: Number },
      achievedAt: { type: Date },
      type: { type: String },
    },
  },
  { timestamps: true },
);

// =======================
// Indexes
// =======================
leaderboardSchema.index({
  type: 1,
  "context.standardId": 1,
  "context.period.endDate": -1,
});

leaderboardSchema.index({ "entries.studentId": 1 });

studentLeaderboardStatsSchema.index({ studentId: 1 });
studentLeaderboardStatsSchema.index({ "overall.rank": 1 });

// =======================
// Models
// =======================
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
const StudentLeaderboardStats = mongoose.model(
  "StudentLeaderboardStats",
  studentLeaderboardStatsSchema,
);

// =======================
// Export (CommonJS)
// =======================
module.exports = {
  Leaderboard,
  StudentLeaderboardStats,
};
