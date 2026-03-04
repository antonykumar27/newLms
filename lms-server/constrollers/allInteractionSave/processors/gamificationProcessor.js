// services/processors/gamificationProcessor.js
const StudentStreak = require("../../models/StudentStreak");
const StudentHeatmap = require("../../models/StudentHeatmap");
const StudentInsight = require("../../models/StudentInsight");
const DailyActivity = require("../../models/StudentActivity");
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../../models/StudentBadge");

module.exports = async (job) => {
  const {
    userId,
    type,
    videoId,
    subjectId,
    chapterId,
    pageId,
    normalizedData,
    timestamp,
  } = job.data;
  const today = new Date(timestamp).toISOString().split("T")[0];
  const date = new Date(timestamp);

  try {
    const intensity = calculateIntensity(type, normalizedData);
    const isValidActivity = isValidForStreak(type, normalizedData);

    // Run all gamification tasks in parallel
    await Promise.all([
      updateDailyActivity(userId, {
        date: today,
        type,
        videoId,
        subjectId,
        chapterId,
        pageId,
        normalizedData,
      }),
      updateHeatmap(userId, { date, type, intensity, subjectId, videoId }),
      updateStreak(userId, { date, type, isValidActivity, subjectId, videoId }),
      updateInsights(userId, {
        type,
        subjectId,
        videoId,
        chapterId,
        pageId,
        date: today,
        normalizedData,
      }),
    ]);

    // Check badges (depends on streak)
    if (isValidActivity) {
      const streak = await StudentStreak.findOne({ studentId: userId });
      await checkBadges(userId, {
        type,
        subjectId,
        videoId,
        currentStreak: streak?.currentStreak || 0,
      });
    }

    console.log(`✅ Gamification processed for user ${userId}`);
  } catch (error) {
    console.error("❌ Gamification processor error:", error);
    throw error;
  }
};

// ========== Helper Functions ==========

function calculateIntensity(type, normalizedData) {
  if (type === "video_end" || type === "video_complete") return 4;
  if (type === "video_heartbeat") {
    const progress = normalizedData.currentTime / normalizedData.duration;
    if (progress > 0.7) return 3;
    if (progress > 0.3) return 2;
    return 1;
  }
  if (type === "quiz_complete" || type === "assignment_submit") return 4;
  if (type === "video_play" || type === "page_view") return 1;
  return 0;
}

function isValidForStreak(type, normalizedData) {
  if (
    type === "video_heartbeat" ||
    type === "video_end" ||
    type === "video_complete"
  ) {
    if (normalizedData.duration > 0) {
      const progress = normalizedData.currentTime / normalizedData.duration;
      return progress > 0.3;
    }
    return true;
  }
  if (type.includes("quiz") || type.includes("assignment")) return true;
  if (type === "page_view") return normalizedData.timeSpent > 120;
  return false;
}

async function updateDailyActivity(userId, data) {
  const { date, type, videoId, subjectId, chapterId, pageId, normalizedData } =
    data;

  let dailyActivity = await DailyActivity.findOne({ userId, date });
  if (!dailyActivity) {
    dailyActivity = new DailyActivity({
      userId,
      date,
      activities: [],
      metrics: {
        totalWatchTime: 0,
        videosWatched: 0,
        pagesVisited: 0,
        quizzesTaken: 0,
        interactions: 0,
      },
    });
  }

  dailyActivity.activities.push({
    type,
    timestamp: new Date(),
    videoId,
    subjectId,
    chapterId,
    pageId,
    metadata: {
      currentTime: normalizedData?.currentTime,
      duration: normalizedData?.duration,
      progress: normalizedData?.duration
        ? (normalizedData.currentTime / normalizedData.duration) * 100
        : 0,
    },
  });

  dailyActivity.metrics.interactions += 1;

  if (type.includes("video")) {
    if (type === "video_view" || type === "video_play") {
      dailyActivity.metrics.videosWatched += 1;
    }
    if (normalizedData?.watchTimeMs) {
      dailyActivity.metrics.totalWatchTime += normalizedData.watchTimeMs / 1000;
    }
  }

  if (type === "page_view") dailyActivity.metrics.pagesVisited += 1;
  if (type.includes("quiz")) dailyActivity.metrics.quizzesTaken += 1;

  if (isValidForStreak(type, normalizedData)) {
    dailyActivity.isValidLearningDay = true;
  }

  await dailyActivity.save();
  return dailyActivity;
}

async function updateHeatmap(userId, data) {
  const { date, type, intensity, subjectId } = data;
  const currentDate = new Date(date);
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  let heatmap = await StudentHeatmap.findOne({ userId, month, year });
  if (!heatmap) {
    heatmap = new StudentHeatmap({
      userId,
      month,
      year,
      data: [],
      summary: {
        totalActiveDays: 0,
        totalInteractions: 0,
        maxIntensity: 0,
        subjectBreakdown: {},
      },
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      heatmap.data.push({
        day: d,
        intensity: 0,
        activities: [],
        subjects: [],
        note: "",
      });
    }
  }

  const day = currentDate.getDate();
  const dayData = heatmap.data.find((d) => d.day === day);
  if (dayData) {
    dayData.intensity = Math.max(dayData.intensity, intensity);
    if (!dayData.activities.includes(type)) dayData.activities.push(type);
    if (subjectId && !dayData.subjects.includes(subjectId.toString())) {
      dayData.subjects.push(subjectId.toString());
    }
  }

  heatmap.summary.totalInteractions += 1;
  heatmap.summary.maxIntensity = Math.max(
    heatmap.summary.maxIntensity,
    intensity,
  );
  heatmap.summary.totalActiveDays = heatmap.data.filter(
    (d) => d.intensity > 0,
  ).length;

  if (subjectId) {
    const subjectKey = subjectId.toString();
    if (!heatmap.summary.subjectBreakdown[subjectKey]) {
      heatmap.summary.subjectBreakdown[subjectKey] = {
        count: 0,
        totalIntensity: 0,
      };
    }
    heatmap.summary.subjectBreakdown[subjectKey].count += 1;
    heatmap.summary.subjectBreakdown[subjectKey].totalIntensity += intensity;
  }

  await heatmap.save();
  return heatmap;
}

async function updateStreak(userId, data) {
  const { date, type, isValidActivity } = data;
  if (!isValidActivity) return null;

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  let streak = await StudentStreak.findOne({ studentId: userId });
  if (!streak) {
    streak = new StudentStreak({
      studentId: userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      streakFreeze: {
        isActive: false,
        freezeCount: 3,
        lastFrozenDate: null,
        expiresAt: null,
      },
      reminders: { enabled: true, time: "20:00" },
    });
    await streak.save();
    return streak;
  }

  const lastActive = streak.lastActiveDate
    ? new Date(streak.lastActiveDate).setHours(0, 0, 0, 0)
    : null;

  if (lastActive === today.getTime()) return streak;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActive === yesterday.getTime()) {
    streak.currentStreak += 1;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    const milestoneDays = [7, 30, 50, 100, 200, 365];
    if (milestoneDays.includes(streak.currentStreak)) {
      const existingMilestone = streak.milestones.find(
        (m) => m.days === streak.currentStreak,
      );
      if (!existingMilestone) {
        streak.milestones.push({
          days: streak.currentStreak,
          achievedAt: new Date(),
          badgeAwarded: true,
        });
      }
    }
  } else {
    const daysMissed =
      Math.floor((today.getTime() - lastActive) / (1000 * 60 * 60 * 24)) - 1;

    if (
      streak.streakFreeze.isActive &&
      streak.streakFreeze.freezeCount > 0 &&
      daysMissed === 1
    ) {
      streak.streakFreeze.freezeCount -= 1;
      streak.streakFreeze.lastFrozenDate = yesterday;
      if (streak.streakFreeze.freezeCount === 0)
        streak.streakFreeze.isActive = false;
    } else {
      if (streak.currentStreak > 0) {
        streak.streakHistory.push({
          startDate: streak.lastActiveDate,
          endDate: yesterday,
          streakLength: streak.currentStreak,
          isActive: false,
        });
      }
      streak.currentStreak = 1;
    }
  }

  streak.lastActiveDate = today;
  await streak.save();
  return streak;
}

async function updateInsights(userId, data) {
  const { type, subjectId, videoId, chapterId, pageId, date, normalizedData } =
    data;

  let insights = await StudentInsight.findOne({ userId });
  if (!insights) {
    insights = new StudentInsight({
      userId,
      learningPatterns: {
        preferredTimeOfDay: "evening",
        averageSessionLength: 0,
        completionRate: 0,
        consistencyScore: 0,
        subjectStrengths: [],
      },
      recentActivity: [],
      weeklySummary: {
        activeDays: 0,
        totalWatchTime: 0,
        videosCompleted: 0,
        topSubjects: [],
      },
      recommendations: [],
      lastUpdated: new Date(),
    });
  }

  insights.recentActivity.unshift({
    type,
    subjectId,
    videoId,
    chapterId,
    pageId,
    timestamp: new Date(date),
    metadata: {
      progress: normalizedData?.progress,
      duration: normalizedData?.duration,
    },
  });

  if (insights.recentActivity.length > 50) {
    insights.recentActivity = insights.recentActivity.slice(0, 50);
  }

  const activityHour = new Date(date).getHours();
  if (activityHour < 12)
    insights.learningPatterns.preferredTimeOfDay = "morning";
  else if (activityHour < 17)
    insights.learningPatterns.preferredTimeOfDay = "afternoon";
  else insights.learningPatterns.preferredTimeOfDay = "evening";

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyActivities = await DailyActivity.find({
    userId,
    date: { $gte: oneWeekAgo.toISOString().split("T")[0] },
  });

  insights.weeklySummary.activeDays = weeklyActivities.filter(
    (a) => a.isValidLearningDay,
  ).length;
  insights.weeklySummary.totalWatchTime = weeklyActivities.reduce(
    (sum, day) => sum + (day.metrics?.totalWatchTime || 0),
    0,
  );

  const dailyActivity = await DailyActivity.find({
    userId,
    date: { $gte: oneWeekAgo.toISOString().split("T")[0] },
  }).sort({ date: 1 });

  if (dailyActivity.length > 0) {
    const activeDays = dailyActivity.filter((d) => d.isValidLearningDay).length;
    insights.learningPatterns.consistencyScore = (activeDays / 7) * 100;
  }

  insights.lastUpdated = new Date();
  await insights.save();
  return insights;
}

async function checkBadges(userId, data) {
  const { type, subjectId, videoId, currentStreak } = data;

  const badgeDefinitions = await BadgeDefinition.find({ isActive: true });

  for (const badge of badgeDefinitions) {
    const alreadyEarned = await StudentBadge.findOne({
      userId,
      badgeId: badge._id,
    });
    if (alreadyEarned) continue;

    let earned = false;
    let progress = 0;

    switch (badge.criteria.type) {
      case "streak":
        if (currentStreak >= badge.criteria.threshold) {
          earned = true;
          progress = 100;
        } else {
          progress = (currentStreak / badge.criteria.threshold) * 100;
        }
        break;

      case "videos_completed":
        const completedCount =
          await require("../../models/watchTimeSchema").countDocuments({
            userId,
            completed: true,
          });
        if (completedCount >= badge.criteria.threshold) {
          earned = true;
          progress = 100;
        } else {
          progress = (completedCount / badge.criteria.threshold) * 100;
        }
        break;

      case "watch_time":
        const watchTimeData =
          await require("../../models/watchTimeSchema").aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: "$totalWatchedSeconds" } } },
          ]);
        const totalMinutes = (watchTimeData[0]?.total || 0) / 60;

        if (totalMinutes >= badge.criteria.threshold) {
          earned = true;
          progress = 100;
        } else {
          progress = (totalMinutes / badge.criteria.threshold) * 100;
        }
        break;

      case "first_video":
        if (type === "video_end" || type === "video_complete") {
          earned = true;
          progress = 100;
        }
        break;
    }

    await BadgeProgress.findOneAndUpdate(
      { userId, badgeId: badge._id },
      {
        $set: { progress: Math.min(progress, 100), lastUpdated: new Date() },
        $inc: { attempts: 1 },
      },
      { upsert: true },
    );

    if (earned) {
      const studentBadge = new StudentBadge({
        userId,
        badgeId: badge._id,
        earnedAt: new Date(),
        progress: 100,
        metadata: {
          source: type,
          subjectId,
          videoId,
          streakAtEarn: currentStreak,
        },
      });
      await studentBadge.save();
    }
  }
}
