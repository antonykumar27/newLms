const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    metrics: {
      totalWatchTime: { type: Number, default: 0, min: 0 },
      videosWatched: { type: Number, default: 0, min: 0 },
      videosCompleted: { type: Number, default: 0, min: 0 },
      pagesVisited: { type: Number, default: 0, min: 0 },
      quizzesTaken: { type: Number, default: 0, min: 0 },
      quizzesPassed: { type: Number, default: 0, min: 0 },
      averageQuizScore: { type: Number, default: 0, min: 0, max: 100 },
      totalInteractions: { type: Number, default: 0, min: 0 },
      meaningfulInteractions: { type: Number, default: 0, min: 0 },

      interactionCounts: {
        video_play: { type: Number, default: 0 },
        video_pause: { type: Number, default: 0 },
        video_seek: { type: Number, default: 0 },
        video_end: { type: Number, default: 0 },
        video_complete: { type: Number, default: 0 },
        video_heartbeat: { type: Number, default: 0 },
        timeupdate: { type: Number, default: 0 },
        page_view: { type: Number, default: 0 },
        page_exit: { type: Number, default: 0 },
        quiz_start: { type: Number, default: 0 },
        quiz_answer: { type: Number, default: 0 },
        quiz_submit: { type: Number, default: 0 },
      },

      engagementScore: { type: Number, default: 0, min: 0, max: 100 },
      isValidLearningDay: { type: Boolean, default: false },
      learningMinutes: { type: Number, default: 0 },
      firstActivityAt: Date,
      lastActivityAt: Date,
    },

    subjectsStudied: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        timeSpent: { type: Number, default: 0 },
        videosCompleted: { type: Number, default: 0 },
      },
    ],

    chaptersCovered: [
      {
        chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
        timeSpent: { type: Number, default: 0 },
      },
    ],

    achievements: [
      {
        achievementId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Achievement",
        },
        earnedAt: Date,
        type: String,
      },
    ],

    realtime: {
      currentStreak: { type: Number, default: 0 },
      todayGoal: {
        target: { type: Number, default: 30 },
        achieved: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
      lastUpdated: Date,
    },

    flags: {
      isActive: { type: Boolean, default: true },
      needsReview: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: "dailyactivities",
  },
);

dailyActivitySchema.index({ userId: 1, date: -1 }, { unique: true });
dailyActivitySchema.index({ date: 1, "metrics.engagementScore": -1 });

module.exports = mongoose.model("DailyActivity", dailyActivitySchema);
