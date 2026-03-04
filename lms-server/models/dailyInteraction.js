const mongoose = require("mongoose");
const { Schema } = mongoose;

// ============================================
// DAILY ANALYTICS COLLECTION (Permanent)
// ============================================
const dailyInteractionSchema = new Schema(
  {
    date: { type: String, required: true },
    standardId: {
      type: Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "StandardSubject",
      required: true,
    },
    chapterId: { type: Schema.Types.ObjectId, ref: "StandardChapter" },
    pageId: { type: Schema.Types.ObjectId, ref: "MathsLesson" },
    videoId: { type: Schema.Types.ObjectId },

    // ============= AGGREGATED METRICS =============
    metrics: {
      // View counts
      totalViews: { type: Number, default: 0 },
      uniqueUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      uniqueUserCount: { type: Number, default: 0 },

      // Watch time
      totalWatchTime: { type: Number, default: 0 }, // seconds
      averageWatchTime: { type: Number, default: 0 },

      // Engagement
      completions: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },

      // Interaction counts (per type)
      interactions: {
        video_play: { type: Number, default: 0 },
        video_pause: { type: Number, default: 0 },
        video_end: { type: Number, default: 0 },
        video_seek: { type: Number, default: 0 },
        video_complete: { type: Number, default: 0 },
        video_heartbeat: { type: Number, default: 0 },
        video_quality_change: { type: Number, default: 0 },
        video_speed_change: { type: Number, default: 0 },
        // Add more as needed
      },

      // Heatmap (per 10-second segments)
      watchSegments: [
        {
          segment: Number, // 0, 1, 2... (each = 10 seconds)
          watchCount: Number,
          totalTime: Number,
        },
      ],
    },

    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "daily_analytics",
  },
);

// Compound index for fast queries
dailyInteractionSchema.index(
  { date: 1, pageId: 1, videoId: 1 },
  { unique: true, sparse: true },
);

dailyInteractionSchema.index({ date: 1, standardId: 1, subjectId: 1 });
dailyInteractionSchema.index({ "metrics.uniqueUsers": 1 });

module.exports = mongoose.model("DailyInteraction", dailyInteractionSchema);
