const StudentProgress = require("../models/studentProgressScheema");

// ========== 🎯 UPDATE PROGRESS AFTER ATTEMPT ==========
exports.updateAfterAttempt = async (attemptData) => {
  const {
    userId,
    quizCategory,
    quizType, // contextId
    score,
    timeTaken,
    _id: attemptId,
    passed,
    attemptNumber,
  } = attemptData;

  return await StudentProgress.updateProgress({
    userId,
    category: quizCategory,
    contextId: quizType,
    score,
    timeTaken,
    attemptId,
    passed,
    attemptNumber,
  });
};

// ========== 📈 GET PROGRESS TREND ==========
exports.getProgressTrend = async (userId, category, contextId) => {
  try {
    const progress = await StudentProgress.findOne({
      userId,
      category,
      contextId,
    });

    if (!progress) {
      return {
        exists: false,
        message: "No progress data found for this context",
        stats: {
          best: 0,
          average: 0,
          latest: 0,
          totalAttempts: 0,
          timeSpent: 0,
        },
        scores: [],
        improvement: 0,
        masteryLevel: "BEGINNER",
        nextAction: "PRACTICE",
      };
    }

    const trend = {
      scores: progress.recentScores.map((s) => ({
        attempt: s.attemptNumber,
        score: s.score,
        date: s.date,
        timeTaken: s.timeTaken,
      })),
      improvement: progress.improvementRate || 0,
      masteryLevel: progress.masteryLevel || "BEGINNER",
      nextAction: progress.nextAction || "PRACTICE",
      stats: {
        best: progress.bestScore || 0,
        average: progress.averageScore || 0,
        latest: progress.latestScore || 0,
        lowest: progress.lowestScore || 0,
        totalAttempts: progress.totalAttempts || 0,
        timeSpent: progress.totalTimeSpent || 0,
        passCount: progress.passCount || 0,
        failCount: progress.failCount || 0,
      },
      exists: true,
    };

    return trend;
  } catch (error) {
    console.error("Error in getProgressTrend:", error);
    return null;
  }
};

// ========== 📊 GET STUDENT FULL PROGRESS ==========
exports.getStudentFullProgress = async (userId) => {
  try {
    // Get dashboard summary
    const dashboard = await StudentProgress.getStudentDashboard(userId);

    // Get page-wise progress (last 10)
    const pageProgress = await StudentProgress.find({
      userId,
      category: "PAGE",
    })
      .populate("contextId", "title pageNumber")
      .sort("-lastAttemptAt")
      .limit(10);

    // Get chapter-wise progress
    const chapterProgress = await StudentProgress.find({
      userId,
      category: "CHAPTER",
    })
      .populate("contextId", "title chapterNumber")
      .sort("-lastAttemptAt");

    // Get subject-wise progress
    const subjectProgress = await StudentProgress.find({
      userId,
      category: "SUBJECT",
    })
      .populate("contextId", "name")
      .sort("-lastAttemptAt");

    // Calculate overall progress
    const overall = {
      totalPages: pageProgress.length,
      completedPages: pageProgress.filter((p) => p.isCompleted).length,
      averageScore:
        pageProgress.reduce((acc, p) => acc + (p.bestScore || 0), 0) /
        (pageProgress.length || 1),
      totalTimeSpent: pageProgress.reduce(
        (acc, p) => acc + (p.totalTimeSpent || 0),
        0,
      ),
      totalAttempts: pageProgress.reduce(
        (acc, p) => acc + (p.totalAttempts || 0),
        0,
      ),
    };

    return {
      dashboard: dashboard || [],
      overall,
      byPage: pageProgress,
      byChapter: chapterProgress,
      bySubject: subjectProgress,
    };
  } catch (error) {
    console.error("Error in getStudentFullProgress:", error);
    return {
      dashboard: [],
      overall: {
        totalPages: 0,
        completedPages: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        totalAttempts: 0,
      },
      byPage: [],
      byChapter: [],
      bySubject: [],
    };
  }
};

// ========== 🔥 GET RECOMMENDED NEXT PAGES ==========
exports.getRecommendedPages = async (userId, standardId) => {
  try {
    const mongoose = require("mongoose");

    // Get completed pages
    const completedPages = await StudentProgress.find({
      userId,
      category: "PAGE",
      isCompleted: true,
    }).distinct("contextId");

    // Get incomplete pages
    const Page = mongoose.model("Page");
    const recommendedPages = await Page.find({
      standardId,
      _id: { $nin: completedPages },
    })
      .sort("order")
      .limit(5)
      .select("title pageNumber");

    return recommendedPages;
  } catch (error) {
    console.error("Error in getRecommendedPages:", error);
    return [];
  }
};

// ========== 🎯 GET SINGLE CONTEXT PROGRESS ==========
exports.getContextProgress = async (userId, category, contextId) => {
  try {
    const progress = await StudentProgress.findOne({
      userId,
      category,
      contextId,
    }).populate("contextId");

    if (!progress) {
      return {
        exists: false,
        message: "No progress found for this context",
        progress: null,
      };
    }

    return {
      exists: true,
      progress,
    };
  } catch (error) {
    console.error("Error in getContextProgress:", error);
    return {
      exists: false,
      message: "Error fetching progress",
      error: error.message,
    };
  }
};

// ========== 🏆 GET LEADERBOARD ==========
exports.getLeaderboard = async (contextId, category, limit = 10) => {
  try {
    const leaderboard = await StudentProgress.find({
      contextId,
      category,
    })
      .sort({ bestScore: -1, totalAttempts: 1 })
      .limit(limit)
      .populate("userId", "name email avatar")
      .select("userId bestScore totalAttempts lastAttemptAt masteryLevel");

    return leaderboard;
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    return [];
  }
};

// ========== 📊 GET PROGRESS STATS ==========
exports.getProgressStats = async (userId) => {
  try {
    const stats = await StudentProgress.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalContexts: { $sum: 1 },
          totalCompleted: {
            $sum: { $cond: ["$isCompleted", 1, 0] },
          },
          avgBestScore: { $avg: "$bestScore" },
          totalTimeSpent: { $sum: "$totalTimeSpent" },
          totalAttempts: { $sum: "$totalAttempts" },
        },
      },
    ]);

    return (
      stats[0] || {
        totalContexts: 0,
        totalCompleted: 0,
        avgBestScore: 0,
        totalTimeSpent: 0,
        totalAttempts: 0,
      }
    );
  } catch (error) {
    console.error("Error in getProgressStats:", error);
    return {
      totalContexts: 0,
      totalCompleted: 0,
      avgBestScore: 0,
      totalTimeSpent: 0,
      totalAttempts: 0,
    };
  }
};

// ========== 🎚 UPDATE MASTERY LEVEL ==========
exports.updateMasteryLevel = async (progressId) => {
  try {
    const progress = await StudentProgress.findById(progressId);

    if (!progress) return null;

    let masteryLevel = "BEGINNER";
    let nextAction = "REVIEW";

    if (progress.bestScore >= 90) {
      masteryLevel = "EXPERT";
      nextAction = "MASTERED";
    } else if (progress.bestScore >= 75) {
      masteryLevel = "ADVANCED";
      nextAction = "MOVE_FORWARD";
    } else if (progress.bestScore >= 60) {
      masteryLevel = "INTERMEDIATE";
      nextAction = "PRACTICE";
    }

    progress.masteryLevel = masteryLevel;
    progress.nextAction = nextAction;

    await progress.save();
    return progress;
  } catch (error) {
    console.error("Error in updateMasteryLevel:", error);
    return null;
  }
};
