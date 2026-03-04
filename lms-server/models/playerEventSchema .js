// ======================================
// SEPARATE COLLECTION: PLAYER EVENTS
// ======================================
// models/PlayerEvent.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerEventSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
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
    type: {
      type: String,
      enum: [
        "play",
        "pause",
        "seek",
        "buffer_start",
        "buffer_end",
        "rate_change",
        "volume_change",
        "fullscreen",
        "exit_fullscreen",
        "pip",
        "ended",
        "mute",
        "unmute",
        "heartbeat",
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    videoTime: {
      type: Number,
      required: true,
      min: 0,
    },
    data: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    expires: 7776000, // 90 days TTL
  },
);

playerEventSchema.index({ sessionId: 1, timestamp: 1 });
playerEventSchema.index({ userId: 1, videoId: 1, timestamp: -1 });
playerEventSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model("PlayerEvent", playerEventSchema);
