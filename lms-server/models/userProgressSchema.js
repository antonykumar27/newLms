const mongoose = require("mongoose");
const { Schema } = mongoose;

// Session sub-schema - FIXED: duration field properly defined
const watchSessionSchema = new Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // seconds - ഇത് ഉപയോഗിക്കും
    lastKnownPosition: { type: Number, default: 0 },
    completionStatus: {
      type: String,
      enum: ["incomplete", "completed", "review"],
      default: "incomplete",
    },
  },
  { _id: true },
);

// Watched range sub-schema
const watchedRangeSchema = new Schema(
  {
    start: { type: Number, required: true, min: 0 },
    end: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

// Completion history sub-schema
const completionHistorySchema = new Schema(
  {
    completedAt: { type: Date, required: true },
    percentageAtThatTime: { type: Number, min: 0, max: 100 },
    timeSpentUntilThen: { type: Number, default: 0 }, // seconds
    watchCountAtThatTime: { type: Number, default: 1 },
    type: {
      type: String,
      enum: ["first", "revision"],
      default: "first",
    },
  },
  { _id: true },
);

// Main UserProgress Schema
const userProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "StandardSubject",
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "StandardChapter",
      required: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "StandardPage",
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    watchedRanges: {
      type: [watchedRangeSchema],
      default: [],
    },
    pageSessions: {
      type: [watchSessionSchema],
      default: [],
    },

    // ===== NEW TIME TRACKING FIELDS =====
    firstWatchStartedAt: {
      type: Date,
      default: null,
    },

    firstWatchCompletedAt: {
      type: Date,
      default: null,
    },

    totalTimeToComplete: {
      type: Number,
      default: 0,
      min: 0,
      description:
        "Time taken from first watch start to first completion (seconds)",
    },

    totalWatchTimeOverall: {
      type: Number,
      default: 0,
      min: 0,
      description: "Total time spent including revisions (seconds)",
    },

    watchCount: {
      type: Number,
      default: 0,
      min: 0,
      description:
        "Number of times video was completed (first time + revisions)",
    },

    lastWatchedAt: {
      type: Date,
      default: null,
    },

    // Enhanced watch sessions
    watchSessions: {
      type: [watchSessionSchema],
      default: [],
    },

    completionHistory: {
      type: [completionHistorySchema],
      default: [],
    },

    // ===== ANALYTICS FIELDS =====
    averageWatchEfficiency: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: "(totalWatched / totalTimeSpent) * 100",
    },

    fastestCompletionTime: {
      type: Number,
      default: 0,
      min: 0,
      description: "Fastest time to complete video (seconds)",
    },

    slowestCompletionTime: {
      type: Number,
      default: 0,
      min: 0,
      description: "Slowest time to complete video (seconds)",
    },

    averageCompletionTime: {
      type: Number,
      default: 0,
      min: 0,
      description:
        "Average time to complete video across all watches (seconds)",
    },

    // ===== NEW: ENGAGEMENT SCORE =====
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      description: "totalWatchTimeOverall / duration (how many times watched)",
    },

    // ===== META FIELDS =====
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    deviceInfo: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ===== INDEXES =====
userProgressSchema.index({ userId: 1, pageId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, chapterId: 1 });
userProgressSchema.index({ updatedAt: -1 });
userProgressSchema.index({ isCompleted: 1 });
userProgressSchema.index({ watchCount: -1 });
userProgressSchema.index({ engagementScore: -1 }); // NEW

// ===== VIRTUAL FIELDS =====

// Current session (last active session)
userProgressSchema.virtual("currentSession").get(function () {
  return this.pageSessions[this.pageSessions.length - 1];
});

// Total unique watched time
userProgressSchema.virtual("totalUniqueWatched").get(function () {
  return this.totalWatched || 0;
});

// Watching efficiency
userProgressSchema.virtual("efficiency").get(function () {
  if (this.totalTimeSpent === 0) return 0;
  return ((this.totalWatched / this.totalTimeSpent) * 100).toFixed(1);
});

// Days since last watched
userProgressSchema.virtual("daysSinceLastWatched").get(function () {
  if (!this.lastWatchedAt) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastWatchedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// NEW: Engagement multiplier virtual
userProgressSchema.virtual("engagementMultiplier").get(function () {
  if (!this.duration || this.duration === 0) return 0;
  return (this.totalWatchTimeOverall / this.duration).toFixed(2);
});

// ===== METHODS =====

// Update analytics based on completion history
userProgressSchema.methods.updateAnalytics = function () {
  if (this.completionHistory && this.completionHistory.length > 0) {
    const times = this.completionHistory
      .map((h) => h.timeSpentUntilThen)
      .filter((t) => t > 0);

    if (times.length > 0) {
      this.fastestCompletionTime = Math.min(...times);
      this.slowestCompletionTime = Math.max(...times);
      this.averageCompletionTime =
        times.reduce((a, b) => a + b, 0) / times.length;
    }
  }

  if (this.totalTimeSpent > 0 && this.totalWatched > 0) {
    this.averageWatchEfficiency =
      (this.totalWatched / this.totalTimeSpent) * 100;
  }

  // Update engagement score
  if (this.duration > 0) {
    this.engagementScore = parseFloat(
      (this.totalWatchTimeOverall / this.duration).toFixed(2),
    );
  }

  return this;
};

// Add completion record
userProgressSchema.methods.addCompletionRecord = function (
  percentage,
  timeSpent,
  type = "first",
) {
  if (!this.completionHistory) {
    this.completionHistory = [];
  }

  this.completionHistory.push({
    completedAt: new Date(),
    percentageAtThatTime: percentage,
    timeSpentUntilThen: timeSpent,
    watchCountAtThatTime: this.watchCount + 1,
    type,
  });

  // Update watch count
  this.watchCount += 1;

  // Update analytics
  this.updateAnalytics();

  return this;
};

// ===== STATICS =====

// Find users who completed a video
userProgressSchema.statics.findCompletedByVideo = function (videoId) {
  return this.find({
    videoId,
    isCompleted: true,
  }).populate("userId", "name email");
};

// Get average completion time for a video
userProgressSchema.statics.getAverageCompletionTimeForVideo = async function (
  videoId,
) {
  const result = await this.aggregate([
    {
      $match: {
        videoId: new mongoose.Types.ObjectId(videoId),
        isCompleted: true,
      },
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: "$totalTimeToComplete" },
        minTime: { $min: "$totalTimeToComplete" },
        maxTime: { $max: "$totalTimeToComplete" },
        totalCompletions: { $sum: 1 },
        avgEngagement: { $avg: "$engagementScore" }, // NEW
      },
    },
  ]);

  return (
    result[0] || {
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      totalCompletions: 0,
      avgEngagement: 0,
    }
  );
};

// ===== PRE-SAVE HOOKS =====

// Update analytics before save
userProgressSchema.pre("save", function (next) {
  this.updateAnalytics();
  next();
});

// ===== EXPORT =====
module.exports = mongoose.model("UserProgress", userProgressSchema);
