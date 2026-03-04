const mongoose = require("mongoose");

const studentStreakSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActiveDate: {
      type: Date,
      default: null,
    },

    streakFreeze: {
      isActive: { type: Boolean, default: false },
      freezeCount: { type: Number, default: 0 },
      lastFrozenDate: { type: Date },
      expiresAt: { type: Date },
    },

    streakHistory: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        streakLength: { type: Number, required: true },
        isActive: { type: Boolean, default: false },
      },
    ],

    milestones: [
      {
        days: { type: Number, required: true },
        achievedAt: { type: Date, default: Date.now },
        badgeAwarded: { type: Boolean, default: false },
      },
    ],

    reminders: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: "20:00" },
      lastReminderSent: { type: Date },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
studentStreakSchema.index({ studentId: 1, lastActiveDate: 1 });
studentStreakSchema.index({ currentStreak: -1 });
studentStreakSchema.index({ "streakHistory.startDate": 1 });

// Methods
studentStreakSchema.methods.calculateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActiveDate) return 0;

  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffTime = today - lastActive;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return this.currentStreak;
  else if (diffDays === 0) return this.currentStreak;
  else return 0;
};

const StudentStreak = mongoose.model("StudentStreak", studentStreakSchema);

module.exports = StudentStreak;
