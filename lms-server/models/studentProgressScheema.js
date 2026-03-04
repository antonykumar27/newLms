// models/StudentProgress.js
const mongoose = require("mongoose");

const studentProgressSchema = new mongoose.Schema(
  {
    // ========== 📍 CONTEXT ==========
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: ["PAGE", "CHAPTER", "SUBJECT"],
      required: true,
    },

    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "categoryModel",
    },

    // Dynamic ref based on category
    categoryModel: {
      type: String,
      enum: ["Page", "Chapter", "Subject"],
      required: true,
    },

    // ========== 📊 PROGRESS METRICS ==========
    totalAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    bestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    bestAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
    },

    latestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    latestAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
    },

    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    lowestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ========== ⏱ TIME METRICS ==========
    totalTimeSpent: {
      type: Number,
      default: 0, // in seconds
    },

    averageTimePerAttempt: {
      type: Number,
      default: 0,
    },

    // ========== 🏆 ACHIEVEMENTS ==========
    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,

    passCount: {
      type: Number,
      default: 0,
    },

    failCount: {
      type: Number,
      default: 0,
    },

    // ========== 📅 DATES ==========
    firstAttemptAt: Date,
    lastAttemptAt: Date,

    // Streak info (optional)
    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    // ========== 📈 TRENDING ==========
    recentScores: [
      {
        score: Number,
        date: Date,
        attemptNumber: Number,
        timeTaken: Number,
      },
    ],

    // Improvement rate
    improvementRate: {
      type: Number,
      default: 0, // percentage of improvement from first to last
    },

    // ========== 🎯 MASTERY LEVEL ==========
    masteryLevel: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      default: "BEGINNER",
    },

    // Next recommended action
    nextAction: {
      type: String,
      enum: ["REVIEW", "PRACTICE", "MOVE_FORWARD", "MASTERED"],
      default: "PRACTICE",
    },
  },
  {
    timestamps: true,
  },
);

// ========== 🔍 COMPOUND INDEXES ==========
// Unique constraint for one progress record per context
studentProgressSchema.index(
  {
    userId: 1,
    category: 1,
    contextId: 1,
  },
  { unique: true },
);

// For dashboard queries
studentProgressSchema.index({ userId: 1, category: 1, lastAttemptAt: -1 });
studentProgressSchema.index({ userId: 1, isCompleted: 1 });
studentProgressSchema.index({ contextId: 1, bestScore: -1 }); // for leaderboards

// ========== 🛠 INSTANCE METHODS ==========
studentProgressSchema.methods.updateMasteryLevel = function () {
  if (this.bestScore >= 90) {
    this.masteryLevel = "EXPERT";
    this.nextAction = "MASTERED";
  } else if (this.bestScore >= 75) {
    this.masteryLevel = "ADVANCED";
    this.nextAction = "MOVE_FORWARD";
  } else if (this.bestScore >= 60) {
    this.masteryLevel = "INTERMEDIATE";
    this.nextAction = "PRACTICE";
  } else {
    this.masteryLevel = "BEGINNER";
    this.nextAction = "REVIEW";
  }
  return this.masteryLevel;
};

// ========== 🛠 UPDATE PROGRESS WITH TRANSACTION SUPPORT (FIXED) ==========
studentProgressSchema.statics.updateProgress = async function (
  {
    userId,
    category,
    contextId,
    score,
    timeTaken,
    attemptId,
    passed,
    attemptNumber,
  },
  session,
) {
  // Map category to categoryModel
  const categoryModelMap = {
    PAGE: "Page",
    CHAPTER: "Chapter",
    SUBJECT: "Subject",
  };

  // Find existing progress or create new
  let progress = await this.findOne({ userId, category, contextId }).session(
    session,
  );

  if (!progress) {
    // 🎯 FIX: Add categoryModel when creating
    [progress] = await this.create(
      [
        {
          userId,
          category,
          contextId,
          categoryModel: categoryModelMap[category], // 👈 IMPORTANT FIX
          firstAttemptAt: new Date(),
          lowestScore: score, // Initialize lowest score
          bestScore: score, // Initialize best score
        },
      ],
      { session },
    );

    console.log(
      `✅ New progress created for ${category} with ID: ${progress._id}`,
    );
  }

  // ========== 📊 UPDATE METRICS ==========
  const oldBest = progress.bestScore;
  const oldTotal = progress.totalAttempts;
  const oldAvg = progress.averageScore;
  const oldLowest = progress.lowestScore;

  // Update best score
  if (score > progress.bestScore) {
    progress.bestScore = score;
    progress.bestAttemptId = attemptId;
  }

  // Update lowest score
  if (score < progress.lowestScore || progress.lowestScore === 0) {
    progress.lowestScore = score;
  }

  // Update latest
  progress.latestScore = score;
  progress.latestAttemptId = attemptId;
  progress.lastAttemptAt = new Date();

  // Update attempt counts
  progress.totalAttempts += 1;
  if (passed) {
    progress.passCount = (progress.passCount || 0) + 1;
  } else {
    progress.failCount = (progress.failCount || 0) + 1;
  }

  // Update time
  progress.totalTimeSpent = (progress.totalTimeSpent || 0) + (timeTaken || 0);
  progress.averageTimePerAttempt =
    progress.totalTimeSpent / progress.totalAttempts;

  // Calculate new average (running average)
  progress.averageScore = (oldAvg * oldTotal + score) / (oldTotal + 1);

  // Add to recent scores
  if (!progress.recentScores) progress.recentScores = [];

  progress.recentScores.push({
    attemptNumber,
    score,
    timeTaken,
    date: new Date(),
  });

  // Keep only last 10
  if (progress.recentScores.length > 10) {
    progress.recentScores = progress.recentScores.slice(-10);
  }

  // ========== 🏆 CALCULATE IMPROVEMENT ==========
  if (progress.recentScores.length >= 2) {
    const firstScore = progress.recentScores[0].score;
    const lastScore =
      progress.recentScores[progress.recentScores.length - 1].score;
    progress.improvementRate = lastScore - firstScore;
  }

  // ========== 🎯 UPDATE MASTERY LEVEL ==========
  progress.updateMasteryLevel(); // Using instance method

  // Update streak (optional - implement if needed)
  // progress.updateStreak();

  await progress.save({ session });

  console.log(`📊 Progress updated for ${category}:`, {
    totalAttempts: progress.totalAttempts,
    bestScore: progress.bestScore,
    averageScore: progress.averageScore,
    masteryLevel: progress.masteryLevel,
  });

  return progress;
};

// ========== 📈 AGGREGATION PIPELINES ==========
studentProgressSchema.statics.getStudentDashboard = function (userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$category",
        totalContexts: { $sum: 1 },
        completedContexts: {
          $sum: { $cond: ["$isCompleted", 1, 0] },
        },
        averageBestScore: { $avg: "$bestScore" },
        totalTimeSpent: { $sum: "$totalTimeSpent" },
        totalAttempts: { $sum: "$totalAttempts" },
      },
    },
    {
      $project: {
        category: "$_id",
        totalContexts: 1,
        completedContexts: 1,
        completionRate: {
          $multiply: [
            { $divide: ["$completedContexts", "$totalContexts"] },
            100,
          ],
        },
        averageBestScore: 1,
        totalTimeSpent: 1,
        totalAttempts: 1,
      },
    },
  ]);
};

studentProgressSchema.statics.getLeaderboard = function (
  contextId,
  category,
  limit = 10,
) {
  return this.find({ contextId, category })
    .sort({ bestScore: -1, totalAttempts: 1 })
    .limit(limit)
    .populate("userId", "name email avatar")
    .select("userId bestScore totalAttempts lastAttemptAt");
};

module.exports = mongoose.model("StudentProgress", studentProgressSchema);
