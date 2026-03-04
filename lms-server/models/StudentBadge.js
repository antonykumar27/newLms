const mongoose = require("mongoose");

// =======================
// Badge Definition Schema
// =======================
const badgeDefinitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },

  category: {
    type: String,
    enum: ["streak", "completion", "excellence", "special", "subject_mastery"],
    required: true,
  },

  // ✅ Criteria for checking
  criteria: {
    type: {
      type: String,
      enum: ["streak", "first_video", "videos_count", "watch_time"],
      required: true,
    },
    threshold: { type: Number },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  },

  // Assets
  assets: {
    icon: { type: String, required: true },
    iconType: {
      type: String,
      enum: ["emoji", "svg", "image"],
      default: "emoji",
    },
    color: { type: String, default: "#FFD700" },
    background: { type: String },
  },

  tier: {
    type: String,
    enum: ["bronze", "silver", "gold", "platinum", "diamond", "legendary"],
    default: "bronze",
  },

  points: { type: Number, default: 10 },

  // ✅ FIX 1: Added isActive field
  isActive: { type: Boolean, default: true },

  isHidden: { type: Boolean, default: false },
  isLimited: { type: Boolean, default: false },
  expiresIn: { type: Number },
});

// =======================
// Student Earned Badge
// =======================
const studentBadgeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BadgeDefinition",
      required: true,
    },

    earnedAt: { type: Date, default: Date.now },

    context: {
      streakAtTime: { type: Number },
      videosCompletedAtTime: { type: Number },
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    },

    // ✅ FIX 2: Added metadata field
    metadata: {
      source: { type: String }, // video_end, video_complete, etc.
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      watchTimeAtEarn: { type: Number },
    },

    isFavorite: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },

    sharedCount: { type: Number, default: 0 },
    lastSharedAt: { type: Date },
  },
  { timestamps: true },
);

// =======================
// Badge Progress Schema
// =======================
const badgeProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BadgeDefinition",
    required: true,
  },

  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  currentValue: { type: Number, default: 0 },

  targetValue: { type: Number, default: 0 },

  lastUpdated: { type: Date, default: Date.now },

  milestones: [
    {
      value: { type: Number },
      achievedAt: { type: Date },
    },
  ],
});

// =======================
// Indexes
// =======================
studentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true });
badgeProgressSchema.index({ studentId: 1, badgeId: 1 });

// =======================
// Models
// =======================
const BadgeDefinition = mongoose.model(
  "BadgeDefinition",
  badgeDefinitionSchema,
);
const StudentBadge = mongoose.model("StudentBadge", studentBadgeSchema);
const BadgeProgress = mongoose.model("BadgeProgress", badgeProgressSchema);

module.exports = {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
};
