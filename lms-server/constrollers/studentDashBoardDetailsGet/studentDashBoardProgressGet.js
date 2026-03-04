// controllers/studentDashBoard/dashboardController.js

const DailyActivity = require("../../models/dailyActivity");
const StudentInsight = require("../../models/StudentInsight");
const StudentStreak = require("../../models/StudentStreak");
const { StudentBadge } = require("../../models/StudentBadge");
const UserProgress = require("../../models/userProgressSchema");
const QuizAttempt = require("../../models/quizAttempt");

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const startTime = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      resumeItems,
      todayActivity,
      weeklyProgress,
      streakData,
      badgePreview,
    ] = await Promise.all([
      getResumeItems(userId),
      getTodayActivity(userId, today),
      getWeeklyProgress(userId), // Fixed version
      getStreakInfo(userId),
      getNextBadge(userId),
    ]);

    const response = {
      success: true,
      data: {
        resume: {
          primary: resumeItems[0] || null,
          secondary: resumeItems.slice(1),
          hasItems: resumeItems.length > 0,
        },
        today: todayActivity,
        weekly: weeklyProgress,
        streak: streakData,
        achievement: badgePreview,
      },
      meta: {
        responseTime: Date.now() - startTime,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Dashboard data fetch failed",
    });
  }
};

// 1️⃣ FIXED RESUME ITEMS
async function getResumeItems(userId) {
  try {
    // Get all user progress, sorted by last watched
    const userProgress = await UserProgress.find({ userId })
      .sort({ lastWatchedAt: -1 })
      .populate({
        path: "pageId",
        populate: [
          { path: "subjectId", select: "name" },
          { path: "chapterId", select: "title" },
        ],
      })
      .lean();

    if (userProgress.length === 0) {
      return [];
    }

    // Group by pageId to get unique pages
    const pageMap = new Map();

    for (const progress of userProgress) {
      if (!progress.pageId) continue;

      const pageId = progress.pageId._id.toString();

      // Only take the most recent for each page
      if (!pageMap.has(pageId)) {
        // Get quiz status
        const lastQuiz = await QuizAttempt.findOne({
          studentId: userId,
          pageId: progress.pageId._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        const hasPendingQuiz = lastQuiz
          ? !lastQuiz.passed
          : progress.pageId.hasQuiz || false;

        pageMap.set(pageId, {
          id: progress._id,
          pageId: progress.pageId._id,
          title: progress.pageId.title || "Untitled",
          subject: progress.pageId.subjectId?.name || "Unknown",
          subjectId: progress.pageId.subjectId?._id,
          chapter: progress.pageId.chapterId?.title || "Unknown",
          chapterId: progress.pageId.chapterId?._id,
          thumbnail: progress.pageId.thumbnail,
          progress: Math.round(progress.completionPercentage || 0),
          lastAccessed: progress.lastWatchedAt || progress.updatedAt,
          timeAgo: getTimeAgo(progress.lastWatchedAt || progress.updatedAt),
          hasPendingQuiz: hasPendingQuiz,
          isCompleted: progress.isCompleted || false,
          action: getAction(progress.completionPercentage || 0, hasPendingQuiz),
          ctaText: getCTAText(
            progress.completionPercentage || 0,
            hasPendingQuiz,
          ),
        });
      }
    }

    const items = Array.from(pageMap.values());

    // Sort: incomplete first, then high progress, then recent
    items.sort((a, b) => {
      // Incomplete gets priority
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;

      // Pending quiz gets priority
      if (a.hasPendingQuiz && !b.hasPendingQuiz) return -1;
      if (!a.hasPendingQuiz && b.hasPendingQuiz) return 1;

      // Higher progress next
      if (a.progress !== b.progress) return b.progress - a.progress;

      // Recent last
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });

    return items.slice(0, 3);
  } catch (error) {
    console.error("❌ Resume items error:", error);
    return [];
  }
}

// 2️⃣ TODAY'S ACTIVITY (Fixed videosCompleted bug)
async function getTodayActivity(userId, today) {
  try {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activity = await DailyActivity.findOne({
      studentId: userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    if (!activity) {
      return {
        watchTime: 0,
        pagesStudied: 0,
        quizzesTaken: 0,
        videosCompleted: 0,
        hasActivity: false,
      };
    }

    // Debug log

    // FIX: videosCompleted might be wrong, calculate from sessions if needed
    let videosCompleted = activity.videosCompleted || 0;

    // If videosCompleted seems wrong (> watchTime/60), cap it
    const maxPossibleVideos = Math.floor(activity.totalWatchTime / 30); // 30 sec per video min
    if (videosCompleted > maxPossibleVideos) {
      videosCompleted = maxPossibleVideos;
    }

    return {
      watchTime: Math.round(activity.totalWatchTime / 60), // minutes
      pagesStudied: activity.subjectBreakdown?.length || 0,
      quizzesTaken: activity.quizzesCompleted || 0,
      videosCompleted: videosCompleted,
      hasActivity: true,
    };
  } catch (error) {
    console.error("❌ Today activity error:", error);
    return {
      watchTime: 0,
      pagesStudied: 0,
      quizzesTaken: 0,
      videosCompleted: 0,
      hasActivity: false,
    };
  }
}

// 3️⃣ FIXED WEEKLY PROGRESS
async function getWeeklyProgress(userId) {
  try {
    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivities = await DailyActivity.find({
      studentId: userId,
      date: { $gte: sevenDaysAgo },
    }).lean();

    const totalMinutes = weeklyActivities.reduce(
      (sum, day) => sum + day.totalWatchTime / 60,
      0,
    );

    const WEEKLY_GOAL = 300; // 5 hours
    const percentage = Math.min(
      100,
      Math.round((totalMinutes / WEEKLY_GOAL) * 100),
    );

    return {
      totalMinutes: Math.round(totalMinutes),
      goalMinutes: WEEKLY_GOAL,
      percentage: percentage,
      remainingMinutes: Math.max(0, WEEKLY_GOAL - totalMinutes),
      onTrack: totalMinutes >= WEEKLY_GOAL * (new Date().getDay() / 7),
    };
  } catch (error) {
    console.error("❌ Weekly progress error:", error);
    return {
      totalMinutes: 0,
      goalMinutes: 300,
      percentage: 0,
      remainingMinutes: 300,
      onTrack: false,
    };
  }
}

// 4️⃣ STREAK INFO (unchanged)
async function getStreakInfo(userId) {
  try {
    const streak = await StudentStreak.findOne({ studentId: userId }).lean();

    if (!streak) {
      return {
        current: 0,
        best: 0,
        message: "Start your learning streak today! 🔥",
      };
    }

    let message = "Keep going! 🔥";
    if (streak.currentStreak >= 30) message = "Unstoppable! 🔥🔥🔥";
    else if (streak.currentStreak >= 14) message = "Amazing consistency! 🔥🔥";
    else if (streak.currentStreak >= 7) message = "One week strong! 🔥";
    else if (streak.currentStreak >= 3) message = "Great momentum! 🔥";

    return {
      current: streak.currentStreak || 0,
      best: streak.longestStreak || 0,
      message: message,
    };
  } catch (error) {
    console.error("❌ Streak error:", error);
    return {
      current: 0,
      best: 0,
      message: "Start your streak today!",
    };
  }
}

// 5️⃣ NEXT BADGE (unchanged)
async function getNextBadge(userId) {
  try {
    const lastBadge = await StudentBadge.findOne({
      studentId: userId,
      isAwarded: true,
    })
      .sort({ awardedAt: -1 })
      .populate("badgeId")
      .lean();

    const nextProgress = await StudentBadge.findOne({
      studentId: userId,
      isAwarded: false,
    })
      .sort({ progress: -1 })
      .populate("badgeId")
      .lean();

    return {
      lastBadge: lastBadge
        ? {
            name: lastBadge.badgeId?.name || "Badge Earned",
            icon: lastBadge.badgeId?.icon,
            earnedAt: lastBadge.awardedAt,
          }
        : null,
      nextBadge: nextProgress
        ? {
            name: nextProgress.badgeId?.name || "Next Badge",
            icon: nextProgress.badgeId?.icon,
            progress: nextProgress.progress || 0,
            required: 100,
          }
        : null,
    };
  } catch (error) {
    console.error("❌ Badge preview error:", error);
    return {
      lastBadge: null,
      nextBadge: null,
    };
  }
}

// Utility functions
function getTimeAgo(timestamp) {
  if (!timestamp) return "Never";

  const minutes = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getAction(progress, hasPendingQuiz) {
  if (hasPendingQuiz) return "quiz";
  if (progress >= 95) return "finish";
  if (progress > 0) return "continue";
  return "start";
}

function getCTAText(progress, hasPendingQuiz) {
  if (hasPendingQuiz) return "Take Quiz";
  if (progress >= 95) return "Complete";
  if (progress > 0) return "Continue";
  return "Start";
}

module.exports = exports;
