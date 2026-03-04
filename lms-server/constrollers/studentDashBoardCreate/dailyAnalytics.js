const DailyActivity = require("../../models/dailyActivitySchema");
const {
  calculateEngagementScore,
  isValidLearningDay,
} = require("../../utilis/engagementCalculator");
const { getCurrentStreak } = require("../../utilis/streakCalculator");

// ==============================================
// UPDATE DAILY ANALYTICS - FIXED VERSION
// ==============================================
const updateDailyAnalytics = async (interactionPayload, normalizedData) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { userId, type, videoId, subjectId, chapterId, pageId } =
      interactionPayload;

    // IMPORTANT: Must have userId
    if (!userId) {
      console.error("❌ No userId in interaction payload");
      return;
    }

    // Calculate watch duration
    let watchDuration = 0;
    if (type === "video_heartbeat" && normalizedData?.currentTime) {
      watchDuration = 10; // 10 seconds per heartbeat
    }

    // Find or create daily activity
    let dailyActivity = await DailyActivity.findOne({ userId, date: today });

    if (!dailyActivity) {
      dailyActivity = new DailyActivity({
        userId,
        date: today,
        metrics: {
          firstActivityAt: new Date(),
          lastActivityAt: new Date(),
        },
      });
    }

    // Update metrics based on type
    dailyActivity.metrics.totalInteractions += 1;
    dailyActivity.metrics.lastActivityAt = new Date();

    // Update interaction counts
    if (dailyActivity.metrics.interactionCounts[type] !== undefined) {
      dailyActivity.metrics.interactionCounts[type] += 1;
    }

    // Type-specific updates
    switch (type) {
      case "video_play":
        dailyActivity.metrics.videosWatched += 1;
        break;

      case "video_complete":
        dailyActivity.metrics.videosCompleted += 1;
        dailyActivity.metrics.meaningfulInteractions += 1;
        break;

      case "video_heartbeat":
        dailyActivity.metrics.totalWatchTime += watchDuration;
        break;

      case "page_view":
        dailyActivity.metrics.pagesVisited += 1;
        break;

      case "quiz_submit":
        dailyActivity.metrics.quizzesTaken += 1;
        dailyActivity.metrics.meaningfulInteractions += 1;
        if (interactionPayload.data?.score) {
          // Simple moving average
          const currentAvg = dailyActivity.metrics.averageQuizScore;
          const currentCount = dailyActivity.metrics.quizzesTaken;
          const newScore = interactionPayload.data.score;
          dailyActivity.metrics.averageQuizScore =
            (currentAvg * (currentCount - 1) + newScore) / currentCount;
        }
        break;

      case "quiz_answer":
        dailyActivity.metrics.meaningfulInteractions += 1;
        break;
    }

    // Update subject tracking
    if (subjectId && watchDuration > 0) {
      const subjectIndex = dailyActivity.subjectsStudied.findIndex(
        (s) => s.subjectId?.toString() === subjectId.toString(),
      );

      if (subjectIndex >= 0) {
        dailyActivity.subjectsStudied[subjectIndex].timeSpent += watchDuration;
      } else {
        dailyActivity.subjectsStudied.push({
          subjectId,
          timeSpent: watchDuration,
          videosCompleted: type === "video_complete" ? 1 : 0,
        });
      }
    }

    // Update chapter tracking
    if (chapterId && watchDuration > 0) {
      const chapterIndex = dailyActivity.chaptersCovered.findIndex(
        (c) => c.chapterId?.toString() === chapterId.toString(),
      );

      if (chapterIndex >= 0) {
        dailyActivity.chaptersCovered[chapterIndex].timeSpent += watchDuration;
      } else {
        dailyActivity.chaptersCovered.push({
          chapterId,
          timeSpent: watchDuration,
        });
      }
    }

    // Calculate learning minutes
    dailyActivity.metrics.learningMinutes = Math.floor(
      dailyActivity.metrics.totalWatchTime / 60,
    );

    // Check if valid learning day
    dailyActivity.metrics.isValidLearningDay = isValidLearningDay(
      dailyActivity.metrics,
    );

    // Calculate engagement score
    dailyActivity.metrics.engagementScore = calculateEngagementScore(
      dailyActivity.metrics,
    );

    // Update realtime stats
    dailyActivity.realtime.todayGoal.achieved = Math.floor(
      dailyActivity.metrics.totalWatchTime / 60,
    );
    dailyActivity.realtime.todayGoal.percentage = Math.min(
      Math.floor(
        (dailyActivity.realtime.todayGoal.achieved /
          dailyActivity.realtime.todayGoal.target) *
          100,
      ),
      100,
    );
    dailyActivity.realtime.lastUpdated = new Date();

    // Save
    await dailyActivity.save();

    // Update streak (async)
    getCurrentStreak(userId).then((streak) => {
      dailyActivity.realtime.currentStreak = streak;
      dailyActivity
        .save()
        .catch((err) => console.error("❌ Failed to update streak:", err));
    });

    return dailyActivity;
  } catch (error) {
    console.error("❌ Daily analytics update failed:", error);
  }
};

// ==============================================
// GET DAILY ACTIVITY
// ==============================================
const getDailyActivity = async (userId, date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return await DailyActivity.findOne({ userId, date: targetDate });
  } catch (error) {
    console.error("❌ Get daily activity error:", error);
    throw error;
  }
};

// ==============================================
// GET WEEKLY REPORT
// ==============================================
const getWeeklyReport = async (userId) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const endDateStr = endDate.toISOString().split("T")[0];
    const startDateStr = startDate.toISOString().split("T")[0];

    const activities = await DailyActivity.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    }).sort({ date: 1 });

    const report = {
      totalWatchTime: 0,
      totalVideosCompleted: 0,
      totalQuizzesTaken: 0,
      activeDays: 0,
      streak: await getCurrentStreak(userId),
      dailyBreakdown: [],
    };

    activities.forEach((day) => {
      report.totalWatchTime += day.metrics.totalWatchTime;
      report.totalVideosCompleted += day.metrics.videosCompleted;
      report.totalQuizzesTaken += day.metrics.quizzesTaken;
      if (day.metrics.isValidLearningDay) report.activeDays++;

      report.dailyBreakdown.push({
        date: day.date,
        watchTime: day.metrics.totalWatchTime,
        interactions: day.metrics.totalInteractions,
        engagementScore: day.metrics.engagementScore,
        isValidDay: day.metrics.isValidLearningDay,
      });
    });

    return report;
  } catch (error) {
    console.error("❌ Get weekly report error:", error);
    throw error;
  }
};

// ==============================================
// EXPORT
// ==============================================
module.exports = {
  updateDailyAnalytics,
};
