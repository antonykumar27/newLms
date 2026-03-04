const mongoose = require("mongoose");

const dailyUniqueUserSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interactions: {
      type: Number,
      default: 1,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 Prevent duplicate same user per day per video
dailyUniqueUserSchema.index(
  { date: 1, videoId: 1, userId: 1 },
  { unique: true },
);

const DailyUniqueUser = mongoose.model(
  "DailyUniqueUser",
  dailyUniqueUserSchema,
);

module.exports = DailyUniqueUser;
