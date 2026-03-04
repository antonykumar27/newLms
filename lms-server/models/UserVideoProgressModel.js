const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userVideoProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    standardId: {
      type: Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "StandardSubject",
      required: true,
      index: true,
    },

    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "StandardChapter",
      required: true,
      index: true,
    },

    pageId: {
      type: Schema.Types.ObjectId,
      ref: "MathsLesson",
      required: true,
      index: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },

    // ⭐ PLAYBACK STATE
    lastPosition: {
      type: Number, // seconds
      default: 0,
      min: 0,
    },

    // ⭐ WATCHED SEGMENTS (Anti-cheat + accurate progress)
    watchedRanges: [
      {
        start: { type: Number, required: true },
        end: { type: Number, required: true },
        watchedAt: { type: Date, default: Date.now },
      },
    ],

    // ⭐ PROGRESS METRICS
    totalWatched: {
      type: Number, // seconds
      default: 0,
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
    completedAt: Date,

    // ⭐ USER PREFERENCES
    playbackRate: {
      type: Number,
      default: 1,
      min: 0.25,
      max: 4,
    },
    volume: {
      type: Number,
      default: 1,
      min: 0,
      max: 1,
    },
    quality: {
      type: String,
      enum: ["auto", "360p", "480p", "720p", "1080p", "1440p", "2160p"],
      default: "auto",
    },

    // ⭐ ANALYTICS
    playCount: { type: Number, default: 0 },
    pauseCount: { type: Number, default: 0 },
    seekCount: { type: Number, default: 0 },
    lastPlayedAt: Date,

    // ⭐ ANTI-CHEAT FLAGS
    flags: {
      suspiciousSeeks: { type: Number, default: 0 },
      lastFlaggedAt: Date,
      isUnderReview: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

// ⭐ COMPOUND INDEX (CRITICAL FOR PERFORMANCE)
userVideoProgressSchema.index(
  { userId: 1, courseId: 1, videoId: 1 },
  { unique: true, name: "user_video_progress_unique" },
);

userVideoProgressSchema.index({ userId: 1, lastPlayedAt: -1 });
userVideoProgressSchema.index({ videoId: 1, completionPercentage: -1 });
userVideoProgressSchema.index({ courseId: 1, userId: 1, isCompleted: 1 });

// ⭐ INSTANCE METHODS
// ⭐ INSTANCE METHODS
userVideoProgressSchema.methods.updateProgress = function (
  currentTime,
  videoDuration,
) {
  // ✅ VALIDATION - Prevent NaN
  if (typeof currentTime !== "number" || isNaN(currentTime)) {
    currentTime = 0;
  }

  if (
    typeof videoDuration !== "number" ||
    isNaN(videoDuration) ||
    videoDuration <= 0
  ) {
    videoDuration = 1; // Avoid division by zero
  }

  if (currentTime > this.lastPosition) {
    this.watchedRanges.push({
      start: this.lastPosition,
      end: currentTime,
      watchedAt: new Date(),
    });
  } else {
  }

  this.lastPosition = currentTime;
  this.lastPlayedAt = new Date();

  this.totalWatched = this.calculateTotalWatched();

  if (videoDuration > 0) {
    this.completionPercentage = Math.min(
      Math.round((this.totalWatched / videoDuration) * 100),
      100,
    );

    if (!this.isCompleted && this.completionPercentage >= 80) {
      this.isCompleted = true;
      this.completedAt = new Date();
    }
  }

  return this;
};

userVideoProgressSchema.methods.calculateTotalWatched = function () {
  if (this.watchedRanges.length === 0) {
    return 0;
  }

  try {
    // Merge overlapping ranges and calculate total
    const sorted = [...this.watchedRanges].sort((a, b) => a.start - b.start);
    let total = 0;
    let current = { ...sorted[0] };

    // ✅ Validate first range
    if (isNaN(current.start) || isNaN(current.end)) {
      console.error("❌ Invalid range data:", current);
      return 0;
    }

    for (let i = 1; i < sorted.length; i++) {
      const range = sorted[i];

      // ✅ Validate each range
      if (isNaN(range.start) || isNaN(range.end)) {
        console.error("❌ Skipping invalid range:", range);
        continue;
      }

      if (range.start <= current.end) {
        // Overlapping, merge
        current.end = Math.max(current.end, range.end);
      } else {
        // Non-overlapping, add to total
        total += current.end - current.start;
        current = { ...range };
      }
    }

    // Add last range
    total += current.end - current.start;

    return total;
  } catch (error) {
    console.error("❌ Error calculating total watched:", error);
    return 0; // Return 0 instead of NaN
  }
};

userVideoProgressSchema.methods.recordSeek = function (fromTime, toTime) {
  this.seekCount += 1;

  // Anti-cheat: Detect suspicious seeks (skipping large portions)
  const seekAmount = Math.abs(toTime - fromTime);
  if (seekAmount > 300) {
    // Skipped more than 5 minutes
    this.flags.suspiciousSeeks += 1;
    this.flags.lastFlaggedAt = new Date();

    if (this.flags.suspiciousSeeks >= 3) {
      this.flags.isUnderReview = true;
    }
  }

  return this;
};

// ⭐ STATIC METHODS
userVideoProgressSchema.statics.getUserProgress = async function (
  userId,
  courseId,
) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        courseId: mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videoId",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        videoId: 1,
        lastPosition: 1,
        completionPercentage: 1,
        isCompleted: 1,
        totalWatched: 1,
        lastPlayedAt: 1,
        video: {
          title: "$video.title",
          duration: "$video.duration",
          order: "$video.order",
          thumbnail: "$video.thumbnail",
        },
      },
    },
    {
      $sort: { "video.order": 1 },
    },
  ]);
};

module.exports = mongoose.model("UserVideoProgress", userVideoProgressSchema);
