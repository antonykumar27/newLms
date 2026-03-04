const mongoose = require("mongoose");
const { Schema } = mongoose;

const watchedRangeSchema = new Schema(
  {
    start: { type: Number, min: 0, required: true },
    end: { type: Number, min: 0, required: true },
  },
  { _id: false },
);

const videoProgressSchema = new Schema(
  {
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

    duration: { type: Number, required: true },

    totalWatched: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },

    lastPosition: { type: Number, default: 0 },
    watchedRanges: { type: [watchedRangeSchema], default: [] },

    playCount: { type: Number, default: 0 },
    pauseCount: { type: Number, default: 0 },
    seekCount: { type: Number, default: 0 },

    isCompleted: { type: Boolean, default: false },

    firstPlayedAt: Date,
    lastPlayedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

videoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model("VideoProgress", videoProgressSchema);
