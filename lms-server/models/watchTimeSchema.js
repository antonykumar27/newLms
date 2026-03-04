// models/WatchTime.js - PROGRESS STATE (with re-watch support)

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const watchTimeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
      ref: "MathsLesson",
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // ⭐ CORE PROGRESS DATA
    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 📊 WATCH TIME METRICS
    totalWatchedSeconds: {
      type: Number, // Total seconds watched across ALL sessions (including repeats)
      default: 0,
      min: 0,
    },
    uniqueWatchedSeconds: {
      type: Number, // Unique seconds watched (first-time only, de-duplicated)
      default: 0,
      min: 0,
    },

    // 🏆 COMPLETION TRACKING
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,

    // 📚 RE-WATCH TRACKING (NEW!)
    completionCount: {
      type: Number, // How many times they've COMPLETED this video (watched >=90%)
      default: 0,
      min: 0,
    },
    watchCount: {
      type: Number, // Total number of watch sessions (including partial)
      default: 0,
      min: 0,
    },
    lastCompletionAt: Date, // When they last completed it

    // Progress percentage
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Timestamps
    firstWatchedAt: {
      type: Date,
      default: Date.now,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },

    // Metadata
    isPreview: {
      type: Boolean,
      default: false,
    },
    videoDuration: {
      type: Number,
      default: 0,
    },

    // Bookmarks & notes
    bookmarks: [
      {
        timestamp: Number,
        note: String,
        createdAt: Date,
      },
    ],

    liked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ⭐ UNIQUE INDEX - ONE PROGRESS PER USER PER VIDEO PER PAGE
watchTimeSchema.index({ userId: 1, videoId: 1, page: 1 }, { unique: true });

// Indexes for fast queries
watchTimeSchema.index({ userId: 1, lastWatchedAt: -1 });
watchTimeSchema.index({ standard: 1, subject: 1, chapter: 1, page: 1 });
watchTimeSchema.index({ completed: 1, completionCount: 1 });

// Virtual for formatted time
watchTimeSchema.virtual("formattedTotalTime").get(function () {
  const hours = Math.floor(this.totalWatchedSeconds / 3600);
  const minutes = Math.floor((this.totalWatchedSeconds % 3600) / 60);
  const seconds = this.totalWatchedSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
});

// Virtual for re-watch count
watchTimeSchema.virtual("revisionCount").get(function () {
  return Math.max(0, (this.completionCount || 0) - 1);
});

module.exports = mongoose.model("WatchTime", watchTimeSchema);
