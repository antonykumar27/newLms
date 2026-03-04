// models/WatchSession.js - ANALYTICS & SESSIONS (with sessionId fix)

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ======================================
// WATCHED RANGE SCHEMA
// ======================================
const watchedRangeSchema = new Schema(
  {
    start: { type: Number, min: 0, required: true },
    end: { type: Number, min: 0, required: true },
    _id: false,
  },
  { _id: false },
);

// ======================================
// WATCH SESSION SCHEMA
// ======================================
const watchSessionSchema = new Schema(
  {
    // 🔑 SESSION IDENTIFIER
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },

    // === LOCATION (LMS Structure) ===
    standard: {
      type: Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "StandardSubject",
      required: true,
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "StandardChapter",
      required: true,
    },
    page: {
      type: Schema.Types.ObjectId,
      ref: "StandardPage",
      required: true,
    },

    // === SESSION TIMELINE ===
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },

    // === VIDEO POSITION ===
    startPosition: {
      type: Number,
      required: true,
      min: 0,
    },
    endPosition: {
      type: Number,
      required: true,
      min: 0,
    },
    videoDuration: {
      type: Number,
      required: true,
      min: 0,
    },

    // === WATCH TIME ===
    watchTimeMs: {
      type: Number,
      required: true,
      min: 0,
    },
    watchedSeconds: {
      type: Number,
      required: true,
      min: 0,
    },

    // 📊 **NEW FIELD: Cumulative watched seconds across all sessions**
    cumulativeWatchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
      description:
        "Total cumulative seconds watched across all sessions for this video",
    },

    watchedRanges: {
      type: [watchedRangeSchema],
      default: [],
    },
    uniqueWatchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    // === SESSION TYPE ===
    isPreview: {
      type: Boolean,
      default: false,
    },
    isUnique: {
      // First time watching this video?
      type: Boolean,
      default: true,
    },

    // 📚 RE-WATCH TRACKING
    watchNumber: {
      type: Number, // Which watch is this? (1st, 2nd, 3rd...)
      default: 1,
    },

    // === PROGRESS ===
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },

    // === INTERACTION COUNTERS ===
    totalPlays: { type: Number, default: 0, min: 0 },
    totalPauses: { type: Number, default: 0, min: 0 },
    totalSeeks: { type: Number, default: 0, min: 0 },

    // === PLAYER EVENTS ===
    playerEvents: {
      type: Array,
      default: [],
    },

    // === DEVICE INFO ===
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String,
      isMobile: { type: Boolean, default: false },
      screenResolution: String,
      language: String,
      timezone: String,
    },

    // === ENGAGEMENT SCORE ===
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  {
    timestamps: true,
  },
);

// ======================================
// INDEXES
// ======================================
watchSessionSchema.index({ userId: 1, videoId: 1, createdAt: -1 });
watchSessionSchema.index({ userId: 1, createdAt: -1 });
watchSessionSchema.index({ videoId: 1, createdAt: -1 });
watchSessionSchema.index({ standard: 1, subject: 1, chapter: 1, page: 1 });
watchSessionSchema.index({ createdAt: -1 });

// Optional: Add index for the new field if you'll query by it
watchSessionSchema.index({ cumulativeWatchedSeconds: 1 });

module.exports = mongoose.model("WatchSession", watchSessionSchema);
