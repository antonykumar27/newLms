const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==================== CONSTANTS FOR WEIGHT MANAGEMENT ====================
const PRIORITY = {
  BLOCKING_CHAPTER_QUIZ: 1000,
  BLOCKING_PAGE_QUIZ: 800,
  NEAR_COMPLETE_MAX: 700,
  NEAR_COMPLETE_MIN: 600,
  FAILED_QUIZ: 500,
  RECENCY_MAX: 200,
  DEADLINE_URGENT: 150,
  DEADLINE_SOON: 100,
  DOUBT_PENDING: 75,
  DEFAULT: 0,
};

const COMPLETION_WEIGHTS = {
  VIDEO: 0.4,
  QUIZ_ATTEMPT: 0.3,
  QUIZ_PASS: 0.3,
};

// ==================== VIDEO PROGRESS - OPTIMIZED ====================
const VideoProgressSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      index: true,
    },

    // Basic progress
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // Enhanced tracking
    totalWatchedSeconds: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    watchSessions: {
      type: Number,
      default: 0,
    },
    lastWatchedAt: Date,

    // Engagement metrics
    rewatchCount: {
      type: Number,
      default: 0,
    },
    averageWatchSpeed: {
      type: Number,
      default: 1,
    },

    // Quality metrics
    completedWithoutSkipping: {
      type: Boolean,
      default: false,
    },
    droppedAtPosition: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

// ==================== SIMPLIFIED QUIZ PROGRESS (Aggregated Only) ====================
const QuizProgressSchema = new Schema(
  {
    // Basic stats
    averageScore: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    firstAttemptScore: { type: Number, default: 0 },
    lastAttemptScore: { type: Number, default: 0 },
    improvementPercentage: { type: Number, default: 0 },

    // Critical for resume logic
    passStatus: {
      type: Boolean,
      default: false,
    },
    requiredScoreToPass: {
      type: Number,
      default: 60,
    },
    failCount: {
      type: Number,
      default: 0,
    },

    // Quiz metadata
    quizType: {
      type: String,
      enum: ["page", "chapter", "subject", "revision"],
      default: "page",
    },

    // Performance metrics
    timeTakenAverage: {
      type: Number,
      default: 0,
    },

    questionsAttempted: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },

    // ✅ REMOVED timelineData - moved to separate collection
    // ✅ REMOVED difficultyBreakdown -太重 for page level

    // Computed insights (lightweight)
    insights: {
      confidenceLevel: {
        type: String,
        enum: ["very_low", "low", "medium", "high", "very_high"],
        default: "medium",
      },
      struggling: {
        type: Boolean,
        default: false,
      },
      needsPractice: {
        type: Boolean,
        default: false,
      },
      recommendedAction: {
        type: String,
        enum: ["review", "retry", "continue", "practice", "master"],
        default: "continue",
      },
    },

    lastAttempt: Date,
  },
  { _id: false },
);

// ==================== MAIN SCHEMA - ENTERPRISE EDITION ====================
const studentCompleteSchema = new Schema({
  // Core identifiers
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  standardId: {
    type: Schema.Types.ObjectId,
    ref: "Standard",
    required: true,
    index: true,
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: "StandardSubject",
    required: true,
    index: true,
  },
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: "StandardChapter",
    required: true,
    index: true,
  },
  pageId: {
    type: Schema.Types.ObjectId,
    ref: "StandardPage",
    required: true,
    index: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },

  // Denormalized page metadata (read optimization)
  pageTitle: String,
  pageThumbnail: String,
  expectedTimeMinutes: {
    type: Number,
    default: 15,
  },

  // Progress tracking
  quizProgress: QuizProgressSchema,
  videoProgress: VideoProgressSchema,

  // 🚀 PRE-COMPUTED SCORES (0-1000 scale for precision)
  completionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000,
  },

  masteryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000,
  },

  engagementScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000,
  },

  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000,
  },

  // 🚀 RESUME INTELLIGENCE (0-1000 scale)
  resumePriority: {
    type: Number,
    default: 0,
    min: 0,
    max: 1000,
    index: true,
  },
  resumeReason: String,
  resumeAction: {
    type: String,
    enum: ["continue", "finish", "quiz", "review", "retry", "discuss"],
    default: "continue",
  },
  resumeUrgency: {
    type: String,
    enum: ["low", "normal", "high", "critical"],
    default: "normal",
  },

  // Study time tracking
  totalStudyTime: {
    type: Number,
    default: 0,
  },
  lastSessionDuration: {
    type: Number,
    default: 0,
  },
  studyDaysCount: {
    type: Number,
    default: 0,
  },

  // Blocking status
  isBlockingNext: {
    type: Boolean,
    default: false,
  },
  unlocksNextWhenPassed: {
    type: Boolean,
    default: false,
  },

  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Timestamps
  lastAccessed: {
    type: Date,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ==================== CRITICAL INDEXES ====================

// ✅ One document per student per page
studentCompleteSchema.index({ studentId: 1, pageId: 1 }, { unique: true });

// ✅ Resume query optimization
studentCompleteSchema.index({
  studentId: 1,
  resumePriority: -1,
  lastAccessed: -1,
});

// ✅ Subject/Chapter rollups
studentCompleteSchema.index({ studentId: 1, subjectId: 1 });
studentCompleteSchema.index({ studentId: 1, chapterId: 1 });

// ✅ Leaderboard queries
studentCompleteSchema.index({ subjectId: 1, masteryScore: -1 });
studentCompleteSchema.index({ chapterId: 1, completionScore: -1 });

// ✅ Risk analysis
studentCompleteSchema.index({ riskScore: -1, studentId: 1 });

// ✅ Blocking content queries
studentCompleteSchema.index({ studentId: 1, isBlockingNext: 1 });

studentCompleteSchema.index({ createdBy: 1 });

// ==================== PRE-SAVE MIDDLEWARE ====================
studentCompleteSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (!this.lastAccessed) {
    this.lastAccessed = new Date();
  }
  next();
});

// ==================== SCORE UPDATE METHODS (Optimized) ====================

// Completion Score: Video 40% + Quiz Attempt 30% + Quiz Pass 30%
studentCompleteSchema.methods.updateCompletionScore = function () {
  let score = 0;

  // Video contribution (max 400)
  if (this.videoProgress) {
    score += (this.videoProgress.completionPercentage || 0) * 4; // 100% * 4 = 400
  }

  // Quiz attempt contribution (max 300)
  if (this.quizProgress && this.quizProgress.totalAttempts > 0) {
    score += 300; // Attempted = full 300

    // Extra for passing (max 300)
    if (this.quizProgress.passStatus) {
      score += 300;
    }
    // Partial for good score but not passed
    else if (this.quizProgress.bestScore > 0) {
      score += (this.quizProgress.bestScore / 100) * 150; // Up to 150
    }
  }

  this.completionScore = Math.min(1000, Math.round(score));
  return this.completionScore;
};

// Mastery Score: Based on quiz performance (0-1000)
studentCompleteSchema.methods.updateMasteryScore = function () {
  if (!this.quizProgress || this.quizProgress.totalAttempts === 0) {
    this.masteryScore = 0;
    return 0;
  }

  // Base on best score
  let score = (this.quizProgress.bestScore || 0) * 10; // 100% * 10 = 1000

  // Bonus for consistency
  if (
    this.quizProgress.totalAttempts > 1 &&
    this.quizProgress.improvementPercentage > 0
  ) {
    score += 50; // Improvement bonus
  }

  // Penalty for failing many times
  if (this.quizProgress.failCount > 3) {
    score -= 100;
  }

  this.masteryScore = Math.min(1000, Math.max(0, Math.round(score)));
  return this.masteryScore;
};

// Engagement Score (0-1000)
studentCompleteSchema.methods.updateEngagementScore = function () {
  let score = 0;

  // Video sessions (max 300)
  const sessionScore = Math.min(
    300,
    (this.videoProgress?.watchSessions || 0) * 30,
  );
  score += sessionScore;

  // Study time (max 400 - 4 hours = 400)
  const timeScore = Math.min(400, Math.round(this.totalStudyTime / 36)); // 36 seconds = 1 point
  score += timeScore;

  // Quiz attempts (max 300)
  const attemptScore = Math.min(
    300,
    (this.quizProgress?.totalAttempts || 0) * 30,
  );
  score += attemptScore;

  this.engagementScore = Math.min(1000, score);
  return this.engagementScore;
};

// Risk Score (0-1000 - higher = more risk)
studentCompleteSchema.methods.updateRiskScore = function () {
  let risk = 0;

  // Inactivity risk (max 400)
  if (this.lastAccessed) {
    const daysSinceAccess =
      (Date.now() - this.lastAccessed) / (1000 * 60 * 60 * 24);
    if (daysSinceAccess > 7) risk += 400;
    else if (daysSinceAccess > 3) risk += 200;
    else if (daysSinceAccess > 1) risk += 100;
  }

  // Quiz failure risk (max 300)
  if (this.quizProgress) {
    if (this.quizProgress.failCount > 3) risk += 300;
    else if (this.quizProgress.failCount > 1) risk += 150;

    // Low scores
    if (this.quizProgress.bestScore < 40) risk += 200;
    else if (this.quizProgress.bestScore < 60) risk += 100;
  }

  // Engagement risk (max 300)
  if (this.engagementScore < 200) risk += 300;
  else if (this.engagementScore < 400) risk += 150;

  this.riskScore = Math.min(1000, risk);
  return this.riskScore;
};

// 🚀 Resume Priority (Normalized 0-1000)
studentCompleteSchema.methods.updateResumePriority = function () {
  // ✅ Safe navigation with optional chaining
  const quiz = this.quizProgress || {};
  const video = this.videoProgress || {};

  let priority = 0;
  let reason = "";
  let action = "continue";
  let urgency = "normal";

  // 1. BLOCKING QUIZ (Highest)
  if (
    quiz.passStatus === false &&
    quiz.requiredScoreToPass > (quiz.bestScore || 0)
  ) {
    if (quiz.quizType === "chapter") {
      priority = PRIORITY.BLOCKING_CHAPTER_QUIZ;
      reason = "Complete chapter quiz to unlock next";
      action = "quiz";
      urgency = "critical";

      // Extra urgency for failures
      if (quiz.failCount >= 2) {
        priority += 100;
        reason = "Multiple attempts failed. Review before retry";
        action = "review";
      }
    } else {
      priority = PRIORITY.BLOCKING_PAGE_QUIZ;
      reason = "Complete quiz to continue";
      action = "quiz";
      urgency = "high";
    }
  }

  // 2. NEAR-COMPLETE CONTENT
  else if (this.completionScore > 850 && this.completionScore < 1000) {
    // Scale between 600-700 based on completion
    const nearCompleteBonus = Math.round(
      PRIORITY.NEAR_COMPLETE_MIN + ((this.completionScore - 850) / 150) * 100,
    );
    priority = nearCompleteBonus;
    reason = `Almost done! ${Math.round((1000 - this.completionScore) / 10)}% remaining`;
    action = "finish";
    urgency = "high";
  }

  // 3. FAILED QUIZZES
  else if (quiz.failCount >= 2) {
    priority = PRIORITY.FAILED_QUIZ;
    reason = "Struggling? Review and try again";
    action = "review";
    urgency = "medium";
  }

  // 4. RECENCY (base score)
  if (this.lastAccessed) {
    const hoursAgo = (Date.now() - this.lastAccessed) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, PRIORITY.RECENCY_MAX - hoursAgo * 2);
    priority += recencyScore;

    if (!reason) {
      reason = "Continue where you left";
      action = "continue";
    }
  }

  // 5. DEADLINE URGENCY (if not already prioritized)
  if (priority < PRIORITY.FAILED_QUIZ && quiz.deadline) {
    const daysLeft =
      (new Date(quiz.deadline) - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 1) {
      priority += PRIORITY.DEADLINE_URGENT;
      urgency = "critical";
      reason = "Due soon! Complete now";
    } else if (daysLeft <= 3) {
      priority += PRIORITY.DEADLINE_SOON;
      urgency = "high";
      reason = "Deadline approaching";
    }
  }

  // 6. DOUBT PENDING
  if (priority < PRIORITY.FAILED_QUIZ && this.hasDoubt) {
    priority += PRIORITY.DOUBT_PENDING;
    reason = "Pending doubt needs attention";
    action = "discuss";
    urgency = "medium";
  }

  // Normalize to 0-1000
  this.resumePriority = Math.min(1000, Math.max(0, Math.round(priority)));
  this.resumeReason = reason || "Continue learning";
  this.resumeAction = action;
  this.resumeUrgency = urgency;

  return this.resumePriority;
};

// ==================== BULK OPERATIONS (Performance Optimized) ====================

// Update single page efficiently
studentCompleteSchema.statics.updatePageScores = async function (
  studentId,
  pageId,
) {
  const doc = await this.findOne({ studentId, pageId });
  if (!doc) return null;

  doc.updateCompletionScore();
  doc.updateMasteryScore();
  doc.updateEngagementScore();
  doc.updateRiskScore();
  doc.updateResumePriority();

  return doc.save();
};

// Bulk update with single operation
studentCompleteSchema.statics.bulkUpdateScores = async function (
  studentId,
  pageIds,
) {
  const docs = await this.find({
    studentId,
    pageId: { $in: pageIds },
  });

  const bulkOps = docs.map((doc) => {
    doc.updateCompletionScore();
    doc.updateMasteryScore();
    doc.updateEngagementScore();
    doc.updateRiskScore();
    doc.updateResumePriority();

    return {
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            completionScore: doc.completionScore,
            masteryScore: doc.masteryScore,
            engagementScore: doc.engagementScore,
            riskScore: doc.riskScore,
            resumePriority: doc.resumePriority,
            resumeReason: doc.resumeReason,
            resumeAction: doc.resumeAction,
            resumeUrgency: doc.resumeUrgency,
            updatedAt: new Date(),
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }

  return docs.length;
};

// ==================== QUERY HELPERS ====================

// Get resume items (top 3)
studentCompleteSchema.statics.getResumeItems = async function (
  studentId,
  limit = 3,
) {
  return this.find({
    studentId,
    completionScore: { $lt: 1000 }, // Not fully complete
  })
    .sort({ resumePriority: -1, lastAccessed: -1 })
    .limit(limit)
    .select({
      pageTitle: 1,
      pageThumbnail: 1,
      subjectId: 1,
      chapterId: 1,
      pageNumber: 1,
      completionScore: 1,
      masteryScore: 1,
      resumePriority: 1,
      resumeReason: 1,
      resumeAction: 1,
      resumeUrgency: 1,
      lastAccessed: 1,
      quizProgress: 1,
      videoProgress: 1,
    })
    .populate("subjectId", "name")
    .populate("chapterId", "title")
    .lean();
};

// ==================== EXPORT ====================
module.exports = mongoose.model(
  "StudentCompleteprogress",
  studentCompleteSchema,
);
