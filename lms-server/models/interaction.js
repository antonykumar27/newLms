const mongoose = require("mongoose");
const { Schema } = mongoose;

const interactionSchema = new Schema(
  {
    /* =========================
       CORE REFERENCES
    ========================== */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    standardId: {
      type: Schema.Types.ObjectId,
      ref: "Standard",
      required: false,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "StandardSubject",
      required: false,
      index: true,
    },

    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "StandardChapter",
      required: false,
      index: true,
    },

    pageId: {
      type: Schema.Types.ObjectId,
      ref: "MathsLesson",
      required: false,
      index: true,
    },

    /* =========================
       CONTENT IDENTIFIER
       (subdocument _id from Course.media)
    ========================== */
    videoId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    /* =========================
       EVENT TYPE
    ========================== */
    type: {
      type: String,
      required: true,
      index: true,
    },

    /* =========================
       EVENT TIME (CLIENT)
    ========================== */
    // Session tracking - പുതിയ സെഷൻ തിരിച്ചറിയാൻ
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    // Overall statistics for this page/video

    eventTime: {
      type: Date,
      required: true,
      index: true,
    },

    /* =========================
       INTERACTION DATA
    ========================== */
    data: {
      currentTime: Number,
      duration: Number,
      playbackRate: Number,
      volume: Number,
      isMuted: Boolean,

      fromTime: Number,
      toTime: Number,
      seekAmount: Number,
      seekDirection: {
        type: String,
        enum: ["forward", "backward"],
      },
    },

    /* =========================
       DEVICE INFO
    ========================== */
    deviceInfo: {
      userAgent: String,
      platform: String,
      screenResolution: String,
      deviceType: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "unknown"],
        default: "unknown",
      },
      timezone: String,
      language: String,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "interactions",
    strict: true,
  },
);
/* TTL INDEX (90 days) */
interactionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 }, // 90 days
);
/* =========================
   INDEXES
========================== */
interactionSchema.index({ userId: 1, pageId: 1, createdAt: -1 });
interactionSchema.index({ videoId: 1, createdAt: -1 });
interactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model("Interaction", interactionSchema);
