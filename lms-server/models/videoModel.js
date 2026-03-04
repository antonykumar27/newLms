const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const videoSchema = new Schema(
  {
    // 🔹 Page reference
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "StandardPage",
      required: true,
      index: true,
    },
    title: String,

    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "pdf"],
      default: "video",
    },

    // 🔹 Instructor
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔹 Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    // 🔹 Optional (future-proof)
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ NEW: Analytics Field - നിങ്ങളുടെ code-ന് വേണ്ടത്!
    analytics: {
      totalViews: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 }, // in seconds
      uniqueViewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      lastView: { type: Date, default: null },

      // Optionally, you can add more detailed analytics
      video_play: { type: Number, default: 0 },
      video_pause: { type: Number, default: 0 },
      video_end: { type: Number, default: 0 },
      video_seek: { type: Number, default: 0 },
      video_heartbeat: { type: Number, default: 0 },
      lastActivity: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
);

// 🔹 Indexes
videoSchema.index({ instructor: 1, status: 1 });
videoSchema.index({ pageId: 1 });
videoSchema.index({ "analytics.uniqueViewers": 1 }); // 👈 Index for unique viewers

module.exports = mongoose.model("Video", videoSchema);
