// ==============================================
// COMPLETE INTERACTION CONTROLLER
// ==============================================
const Interaction = require("../models/interaction");
const WatchSession = require("../models/watchSession");
const Video = require("../models/videoModel");
const WatchTime = require("../models/watchTimeSchema");
const UserProgress = require("../models/userProgressSchema");
const Course = require("../models/course");
const { v4: uuidv4 } = require("uuid");
const StandardSubject = require("../models/standardSubjectSchema");
const StandardChapter = require("../models/standardChapterScheema");
const StandardPage = require("../models/StandardPageScheema");
const DailyInteraction = require("../models/dailyInteraction");
const User = require("../models/loginUserModel");
const UserVideoProgress = require("../models/UserVideoProgressModel.js");
const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment.js");
const DailyUniqueUser = require("../models/dailyUniqueUserSchema.js");
const ProgressService = require("../services/progressService.js");
const StudentStreak = require("../models/StudentStreak.js");
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../models/StudentBadge.js");
const StudentHeatmap = require("../models/StudentHeatmap.js");
const StudentInsight = require("../models/StudentInsight.js");
const DailyActivity = require("../models/StudentActivity.js");

// ==============================================
// CONSTANTS & CONFIGURATION
// ==============================================
const VALID_INTERACTION_TYPES = [
  "video_play",
  "video_pause",
  "video_seek_forward",
  "video_seek_backward",
  "video_end",
  "video_seek",
  "video_view",
  "timeupdate",
  "video_quality_change",
  "video_speed_change",
  "video_mute",
  "video_unmute",
  "video_fullscreen",
  "video_exit_fullscreen",
  "video_picture_in_picture",
  "video_heartbeat",
  "video_caption_toggle",
  "chapter_view",
  "page_view",
  "course_enroll",
  "course_complete",
  "course_review",
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "assignment_view",
  "assignment_submit",
  "comment_add",
  "question_ask",
  "note_add",
  "note_update",
  "note_delete",
  "bookmark_add",
  "bookmark_remove",
  "search",
  "filter",
  "sort",
  "share",
];

const PREMIUM_TYPES = [
  "video_download",
  "course_certificate",
  "quiz_feedback",
  "assignment_review",
  "live_chat",
  "instructor_message",
];

const RATE_LIMIT_CONFIG = {
  video_heartbeat: 10000,
  video_play: 1000,
  video_pause: 500,
  video_resume: 500,
  video_seek: 2000,
  video_quality_change: 5000,
  video_speed_change: 5000,
  video_view: 0,
  video_like: 2000,
  video_dislike: 2000,
  video_bookmark: 1000,
  comment_add: 3000,
  note_add: 2000,
  default: 500,
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    return "mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  return "desktop";
};

const normalizeLanguage = (lang) => {
  return lang || "en-US";
};

const calculateIntensity = (type, normalizedData) => {
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
};

const isValidForStreak = (type, normalizedData) => {
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
};

// ==============================================
// BACKGROUND TASK FUNCTIONS
// ==============================================

// 1️⃣ UPDATE DAILY ACTIVITY
const updateDailyActivity = async (userId, activityData) => {
  try {
    const { date, type, videoId, subjectId, chapterId, pageId, data } =
      activityData;

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
        currentTime: data?.currentTime,
        duration: data?.duration,
        progress: data?.duration ? (data.currentTime / data.duration) * 100 : 0,
      },
    });

    dailyActivity.metrics.interactions += 1;

    if (type.includes("video")) {
      if (type === "video_view" || type === "video_play") {
        dailyActivity.metrics.videosWatched += 1;
      }
      if (data?.watchTimeMs) {
        dailyActivity.metrics.totalWatchTime += data.watchTimeMs / 1000;
      }
    }

    if (type === "page_view") dailyActivity.metrics.pagesVisited += 1;
    if (type.includes("quiz")) dailyActivity.metrics.quizzesTaken += 1;

    if (isValidForStreak(type, data)) {
      dailyActivity.isValidLearningDay = true;
    }

    await dailyActivity.save();
    return dailyActivity;
  } catch (error) {
    console.error("Daily activity update failed:", error);
  }
};

// 2️⃣ UPDATE HEATMAP
const updateStudentHeatmap = async (userId, heatmapData) => {
  try {
    const { date, type, intensity, subjectId } = heatmapData;

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
  } catch (error) {
    console.error("Heatmap update failed:", error);
  }
};

// 3️⃣ UPDATE STREAK
const checkAndUpdateStreak = async (userId, streakData) => {
  try {
    const { date, type, isValidActivity } = streakData;

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
  } catch (error) {
    console.error("Streak update failed:", error);
    return null;
  }
};

// 4️⃣ CHECK AND AWARD BADGES
const checkAndAwardBadges = async (userId, badgeData) => {
  try {
    const { type, subjectId, videoId, currentStreak } = badgeData;

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
          const completedCount = await WatchTime.countDocuments({
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
          const watchTimeData = await WatchTime.aggregate([
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
  } catch (error) {
    console.error("Badge check failed:", error);
  }
};

// 5️⃣ UPDATE STUDENT INSIGHTS
const updateStudentInsights = async (userId, insightData) => {
  try {
    const { type, subjectId, videoId, chapterId, pageId, date, data } =
      insightData;

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
      metadata: { progress: data?.progress, duration: data?.duration },
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
      const activeDays = dailyActivity.filter(
        (d) => d.isValidLearningDay,
      ).length;
      insights.learningPatterns.consistencyScore = (activeDays / 7) * 100;
    }

    insights.lastUpdated = new Date();
    await insights.save();
  } catch (error) {
    console.error("Insights update failed:", error);
  }
};

// 6️⃣ UPDATE DAILY ANALYTICS
const updateDailyAnalytics = async (interactionPayload, normalizedData) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;

    let watchDuration = 0;
    let segment = null;

    if (type === "video_heartbeat" && normalizedData.currentTime) {
      const segmentSize = 10;
      segment = Math.floor(normalizedData.currentTime / segmentSize);
      watchDuration = 10;
    }

    await DailyInteraction.findOneAndUpdate(
      {
        date: today,
        ...(videoId ? { videoId } : {}),
        ...(pageId ? { pageId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      {
        $inc: {
          "metrics.totalViews": type === "video_view" ? 1 : 0,
          [`metrics.interactions.${type}`]: 1,
          "metrics.totalWatchTime": watchDuration,
        },
        $set: {
          lastUpdated: new Date(),
          standardId,
          subjectId,
          ...(videoId && { videoId }),
          ...(pageId && { pageId }),
          ...(chapterId && { chapterId }),
        },
      },
      { upsert: true },
    );

    if (segment !== null && videoId) {
      const heatmapResult = await DailyInteraction.updateOne(
        { date: today, videoId, "metrics.watchSegments.segment": segment },
        {
          $inc: {
            "metrics.watchSegments.$.watchCount": 1,
            "metrics.watchSegments.$.totalTime": watchDuration,
          },
        },
      );

      if (heatmapResult.matchedCount === 0) {
        await DailyInteraction.updateOne(
          { date: today, videoId },
          {
            $push: {
              "metrics.watchSegments": {
                segment,
                watchCount: 1,
                totalTime: watchDuration,
              },
            },
          },
        );
      }
    }

    if (videoId) {
      await DailyUniqueUser.findOneAndUpdate(
        { date: today, videoId, userId },
        { $set: { lastSeen: new Date() }, $inc: { interactions: 1 } },
        { upsert: true },
      );

      const uniqueCount = await DailyUniqueUser.countDocuments({
        date: today,
        videoId,
      });
      await DailyInteraction.updateOne(
        { date: today, videoId },
        { $set: { "metrics.uniqueUserCount": uniqueCount } },
      );
    }

    const doc = await DailyInteraction.findOne({
      date: today,
      ...(videoId && { videoId }),
    });
    if (doc) {
      doc.metrics.averageWatchTime =
        doc.metrics.totalWatchTime / (doc.metrics.totalViews || 1);
      doc.metrics.completionRate =
        (doc.metrics.completions / (doc.metrics.totalViews || 1)) * 100;
      await doc.save();
    }
  } catch (error) {
    console.error("❌ Daily analytics update failed:", error);
  }
};

// 7️⃣ UPDATE WATCH TIME PROGRESS
const actualWatchTimeProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
  watchTimeMs,
  playerEvents = [],
  isPreview = false,
  deviceInfo,
  sessionId,
) => {
  try {
    if (!watchTimeMs || !videoId || !userId) return;

    const watchedSeconds = Math.round(watchTimeMs / 1000);
    if (watchedSeconds < 3) return;

    const progress =
      totalDuration && totalDuration > 0
        ? Number(((currentTime / totalDuration) * 100).toFixed(1))
        : 0;

    let watchTime = await WatchTime.findOne({ userId, videoId, page: pageId });

    let validWatchedSeconds = watchedSeconds;
    if (watchTime) {
      if (currentTime - watchTime.lastPosition > 30) validWatchedSeconds = 0;
      if (currentTime < watchTime.lastPosition) validWatchedSeconds = 0;
    }

    const isFirstTime = !watchTime;
    const isCompletingNow = !watchTime?.completed && progress >= 90;

    const updateData = {
      $set: {
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        lastPosition: currentTime,
        lastWatchedAt: new Date(),
        progress,
        isPreview,
      },
      $inc: { totalWatchedSeconds: validWatchedSeconds },
      $setOnInsert: {
        firstWatchedAt: new Date(),
        videoDuration: totalDuration,
        hierarchyPath: {
          standard: standardId,
          subject: subjectId,
          chapter: chapterId,
          page: pageId,
          video: videoId,
        },
      },
    };

    if (isFirstTime) {
      updateData.$inc.uniqueWatchedSeconds = validWatchedSeconds;
    } else {
      const lastPosition = watchTime?.lastPosition || 0;
      if (currentTime > lastPosition) {
        const uniqueSeconds = Math.min(
          validWatchedSeconds,
          currentTime - lastPosition,
        );
        updateData.$inc.uniqueWatchedSeconds = uniqueSeconds;
      }
    }

    if (isCompletingNow) {
      updateData.$set.completed = true;
      updateData.$set.completedAt = new Date();
      updateData.$inc.completionCount = 1;
    }

    watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, page: pageId },
      updateData,
      { upsert: true, new: true },
    );

    if (watchTime) {
      const finalSessionId =
        sessionId ||
        `session_${userId}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionStartTime = Math.max(0, currentTime - validWatchedSeconds);

      const session = new WatchSession({
        sessionId: finalSessionId,
        userId,
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        startedAt: new Date(Date.now() - watchTimeMs),
        endedAt: new Date(),
        startPosition: sessionStartTime,
        endPosition: currentTime,
        videoDuration: totalDuration,
        watchTimeMs,
        watchedSeconds: validWatchedSeconds,
        isPreview,
        isUnique: isFirstTime,
        progress,
        completed: isCompletingNow,
        deviceInfo: deviceInfo || {},
        playerEvents: playerEvents || [],
        engagementScore: 50,
      });

      session
        .save()
        .catch((err) => console.error("❌ Session save failed:", err.message));
    }

    return watchTime;
  } catch (error) {
    console.error("❌ Watch time error:", error);
  }
};

// 8️⃣ MAIN BACKGROUND TASK ORCHESTRATOR
const runAllBackgroundTasks = async (
  interactionPayload,
  normalizedData,
  additionalData = {},
) => {
  try {
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;
    const today = new Date().toISOString().split("T")[0];

    console.log(`🚀 Running background tasks for user ${userId}, type ${type}`);

    // 1️⃣ Update Daily Activity
    await updateDailyActivity(userId, {
      date: today,
      type,
      videoId,
      subjectId,
      chapterId,
      pageId,
      data: { ...normalizedData, watchTimeMs: additionalData.watchTimeMs },
    });

    // 2️⃣ Update Heatmap
    await updateStudentHeatmap(userId, {
      date: today,
      type,
      intensity: calculateIntensity(type, normalizedData),
      subjectId,
      videoId,
    });

    // 3️⃣ Update Streak
    const streakUpdated = await checkAndUpdateStreak(userId, {
      date: today,
      type,
      isValidActivity: isValidForStreak(type, normalizedData),
      subjectId,
      videoId,
    });

    // 4️⃣ Check Badges
    if (streakUpdated || type === "video_end" || type === "video_complete") {
      await checkAndAwardBadges(userId, {
        type,
        subjectId,
        videoId,
        currentStreak: streakUpdated?.currentStreak,
        activityDate: today,
      });
    }

    // 5️⃣ Update Insights
    await updateStudentInsights(userId, {
      type,
      subjectId,
      videoId,
      chapterId,
      pageId,
      date: today,
      data: normalizedData,
    });

    console.log(`✅ All background tasks completed for ${userId}`);
  } catch (error) {
    console.error("❌ Background tasks failed:", error);
  }
};

// ==============================================
// 9️⃣ UPDATE ANALYTICS COUNTERS
// ==============================================
const updateAnalyticsCounters = async (
  type,
  subjectId,
  videoId,
  userId,
  normalizedData,
  additionalData = {},
) => {
  try {
    switch (type) {
      case "video_play":
      case "video_pause":
      case "video_end":
      case "video_seek":
      case "video_heartbeat":
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { [`analytics.${type}`]: 1 },
            $set: { "analytics.lastActivity": new Date() },
          });
        }
        break;

      case "video_view":
        if (videoId) {
          const update = {
            $inc: { "analytics.totalViews": 1 },
            $addToSet: { "analytics.uniqueViewers": userId },
            $set: { "analytics.lastView": new Date() },
          };
          if (additionalData.viewDuration)
            update.$inc["analytics.totalWatchTime"] =
              additionalData.viewDuration;
          await Video.findByIdAndUpdate(videoId, update);
        }
        break;
    }

    await StandardSubject.findByIdAndUpdate(subjectId, {
      $inc: { [`analytics.interactions.${type}`]: 1 },
      $set: { "analytics.lastInteraction": new Date() },
    });
  } catch (error) {
    console.error("Error updating analytics counters:", error);
  }
};

// ==============================================
// 🔟 UPDATE USER PROGRESS
// ==============================================
const updateUserProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
) => {
  try {
    const action = type;

    if (!pageId || !videoId || !userId) return;

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) return;

    const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
    const now = new Date();
    const validatedTime = Math.min(
      parseFloat(currentTime) || 0,
      lectureDuration,
    );

    let progress = await UserProgress.findOne({ userId, pageId });

    if (!progress) {
      progress = new UserProgress({
        chapterId,
        subjectId,
        standardId,
        userId,
        pageId,
        videoId,
        duration: lectureDuration,
        lastPosition: 0,
        completionPercentage: 0,
        isCompleted: false,
        watchedRanges: [],
        pageSessions: [{ startTime: now, endTime: null, timeSpent: 0 }],
      });
      await progress.save();
    } else {
      const lastSession =
        progress.pageSessions[progress.pageSessions.length - 1];
      const timeSinceLastSession = lastSession?.endTime
        ? (now - lastSession.endTime) / 1000 / 60
        : 0;

      if (!lastSession?.endTime || timeSinceLastSession > 30) {
        progress.pageSessions.push({
          startTime: now,
          endTime: null,
          timeSpent: 0,
        });
      }
    }

    const currentSession =
      progress.pageSessions[progress.pageSessions.length - 1];
    const previousPosition = progress.lastPosition || 0;

    const addWatchedRange = (progress, start, end, maxDuration, action) => {
      if (action === "seek") return false;
      const rangeSize = end - start;
      if (rangeSize > 30) return false;
      if (rangeSize > maxDuration * 0.8) return false;
      if (start < 0 || end > maxDuration || end <= start || rangeSize < 0.5)
        return false;

      const newRange = {
        start: parseFloat(start.toFixed(2)),
        end: parseFloat(end.toFixed(2)),
      };
      let merged = false;
      for (const existing of progress.watchedRanges) {
        if (
          newRange.start <= existing.end + 2 &&
          newRange.end >= existing.start - 2
        ) {
          existing.start = Math.min(existing.start, newRange.start);
          existing.end = Math.max(existing.end, newRange.end);
          merged = true;
          break;
        }
      }
      if (!merged) progress.watchedRanges.push(newRange);
      progress.watchedRanges.sort((a, b) => a.start - b.start);
      return true;
    };

    const calculateTotalWatched = (ranges, duration) => {
      if (!ranges || ranges.length === 0) return 0;
      let totalWatched = 0;
      let lastEnd = -1;
      const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
      for (const range of sortedRanges) {
        const start = Math.max(0, Math.min(range.start, duration));
        const end = Math.max(0, Math.min(range.end, duration));
        if (end <= start) continue;
        if (start > lastEnd) {
          totalWatched += end - start;
          lastEnd = end;
        } else if (end > lastEnd) {
          totalWatched += end - lastEnd;
          lastEnd = end;
        }
      }
      return parseFloat(totalWatched.toFixed(2));
    };

    switch (action) {
      case "play":
      case "video_play":
        progress.lastPosition = validatedTime;
        if (!currentSession.startTime) currentSession.startTime = now;
        break;

      case "pause":
      case "video_pause":
        progress.lastPosition = validatedTime;
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 300) {
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }
        break;

      case "seek":
        progress.lastPosition = validatedTime;
        break;

      case "timeupdate":
      case "video_heartbeat":
        progress.lastPosition = validatedTime;
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 120) {
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }
        break;

      case "end":
      case "video_end":
        progress.lastPosition = validatedTime;
        if (
          validatedTime > previousPosition &&
          validatedTime - previousPosition <= 10
        ) {
          addWatchedRange(
            progress,
            previousPosition,
            validatedTime,
            lectureDuration,
            "end",
          );
        }
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }
        break;
    }

    progress.totalWatched = calculateTotalWatched(
      progress.watchedRanges,
      lectureDuration,
    );

    if (lectureDuration > 0) {
      const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
      progress.completionPercentage = Math.min(100, Math.round(rawPercentage));
      if (!progress.isCompleted && progress.completionPercentage >= 95) {
        progress.isCompleted = true;
      }
    }

    progress.totalTimeSpent = progress.pageSessions.reduce(
      (total, session) => total + (session.timeSpent || 0),
      0,
    );
    await progress.save();
  } catch (error) {
    console.error("❌ Error in updateUserProgress:", error);
  }
};

// ==============================================
// MAIN CONTROLLER FUNCTION
// ==============================================
exports.trackInteraction = async (req, res) => {
  try {
    const {
      type,
      subjectId,
      chapterId,
      pageId,
      videoId,
      eventTime,
      data = {},
      currentTime,
      totalDuration,
      watchTimeMs,
      playerEvents = [],
    } = req.body;

    const userId = req.user._id;

    // ✅ Basic validation
    if (!type || !subjectId) {
      return res.status(400).json({
        success: false,
        error: "type and subjectId are required",
      });
    }

    if (!VALID_INTERACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type: ${type}`,
        validTypes: VALID_INTERACTION_TYPES,
      });
    }

    // ✅ Get standard from subject
    const subjectDoc =
      await StandardSubject.findById(subjectId).select("standardId");
    if (!subjectDoc) {
      return res
        .status(404)
        .json({ success: false, error: "Subject not found" });
    }
    const standardId = subjectDoc.standardId;

    // ✅ Check user
    const user = await User.findById(userId).select("isActive tier lastActive");
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, error: "User account is not active" });

    // ✅ Premium check
    const userTier = user.tier || "free";
    if (PREMIUM_TYPES.includes(type) && userTier === "free") {
      return res.status(403).json({
        success: false,
        error: "This feature requires a premium subscription",
        upgradeRequired: true,
      });
    }

    // ✅ Generate session ID
    let sessionId;
    const existingInteraction = await Interaction.findOne({
      pageId,
      videoId,
      userId,
      sessionEnded: false,
    }).sort({ createdAt: -1 });

    if (existingInteraction) {
      sessionId = existingInteraction.sessionId;
    } else {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ✅ Normalize data
    const normalizedData = {
      currentTime: Number(req.body.currentTime ?? data.currentTime ?? 0),
      duration: Number(req.body.totalDuration ?? data.duration ?? 0),
      playbackRate: Number(req.body.playbackRate ?? data.playbackRate ?? 1),
      volume: Number(req.body.volume ?? data.volume ?? 1),
      isMuted: Boolean(req.body.isMuted ?? data.isMuted ?? false),
    };

    // ✅ Rate limiting
    const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
    if (rateLimitMs > 0) {
      const recentInteraction = await Interaction.findOne({
        userId,
        type,
        videoId,
        pageId,
        eventTime: { $gte: new Date(Date.now() - rateLimitMs) },
      })
        .sort({ eventTime: -1 })
        .lean();

      if (recentInteraction) {
        const timeSinceLast =
          Date.now() - new Date(recentInteraction.eventTime).getTime();
        if (timeSinceLast < rateLimitMs) {
          const waitSeconds = Math.ceil((rateLimitMs - timeSinceLast) / 1000);
          return res.status(429).json({
            success: false,
            error: "Please wait before performing this action again",
            retryAfter: waitSeconds,
          });
        }
      }
    }

    // ✅ Create interaction payload
    const interactionPayload = {
      standardId,
      sessionId,
      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      type,
      eventTime,
      data: {
        currentTime: normalizedData.currentTime,
        duration: normalizedData.duration,
        playbackRate: normalizedData.playbackRate,
        volume: normalizedData.volume,
        isMuted: normalizedData.isMuted,
        ...(type === "video_seek" && {
          fromTime: Number(data.fromTime ?? null),
          toTime: Number(data.toTime ?? null),
          seekAmount: data.seekAmount
            ? Number(data.seekAmount)
            : data.toTime && data.fromTime
              ? Number(data.toTime - data.fromTime)
              : null,
          seekDirection:
            data.seekDirection ??
            (data.toTime > data.fromTime ? "forward" : "backward"),
        }),
        ...(type === "video_view" && {
          viewDuration: Number(data.viewDuration || 0),
          isAutoplay: Boolean(data.isAutoplay || false),
          completed: Boolean(data.completed || false),
        }),
        ...(type === "video_heartbeat" && {
          progress:
            normalizedData.duration > 0
              ? Math.round(
                  (normalizedData.currentTime / normalizedData.duration) * 100,
                )
              : 0,
          buffering: Boolean(data.buffering || false),
        }),
        ...(type === "video_quality_change" && {
          fromQuality: data.fromQuality,
          toQuality: data.toQuality,
          auto: Boolean(data.auto || false),
        }),
        ...(type === "video_speed_change" && {
          fromSpeed: Number(data.fromSpeed || 1),
          toSpeed: Number(data.toSpeed || 1),
        }),
        ...(type.match(/^(quiz|assignment|comment|question|note|bookmark)/) && {
          ...data,
        }),
      },
      deviceInfo: {
        userAgent:
          req.body.deviceInfo?.userAgent || req.get("User-Agent") || "Unknown",
        platform: req.body.deviceInfo?.platform || "unknown",
        screenResolution: req.body.deviceInfo?.screenResolution || "unknown",
        deviceType:
          req.body.deviceInfo?.deviceType ||
          getDeviceType(req.get("User-Agent")),
        timezone:
          req.body.deviceInfo?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: normalizeLanguage(req.body.deviceInfo?.language) || "en-US",
        ip: req.ip || req.connection.remoteAddress,
      },
      eventOccurredAt: eventTime,
      serverReceivedAt: new Date(),
    };

    // ✅ Save interaction
    const interaction = new Interaction(interactionPayload);
    await interaction.save();

    // ✅ Update user's last activity (fire and forget)
    User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
      $inc: { "analytics.totalInteractions": 1 },
    }).catch((err) => console.error("Failed to update user lastActive:", err));

    // ✅ Update analytics counters (fire and forget)
    updateAnalyticsCounters(
      type,
      subjectId,
      videoId,
      userId,
      normalizedData,
      data,
    ).catch((error) => {
      console.error(`❌ Analytics update failed for type ${type}:`, error);
    });

    // ✅ Update progress (fire and forget)
    updateUserProgress(
      currentTime,
      type,
      pageId,
      videoId,
      userId,
      totalDuration,
      chapterId,
      subjectId,
      standardId,
    ).catch((error) => {
      console.error(`❌ Progress update failed for type ${type}:`, error);
    });

    // ✅ Update watch time (fire and forget)
    actualWatchTimeProgress(
      currentTime,
      type,
      pageId,
      videoId,
      userId,
      totalDuration,
      chapterId,
      subjectId,
      standardId,
      watchTimeMs,
      playerEvents,
      false,
      interactionPayload.deviceInfo,
      sessionId,
    ).catch((error) => {
      console.error(`❌ Watch time update failed for type ${type}:`, error);
    });

    // ✅ Update daily analytics (fire and forget)
    updateDailyAnalytics(interactionPayload, normalizedData).catch((err) =>
      console.error("Background analytics update failed:", err),
    );

    // ✅ 🚀 NEW: Run all gamification background tasks (streak, badges, heatmap, insights)
    runAllBackgroundTasks(interactionPayload, normalizedData, {
      watchTimeMs,
      playerEvents,
    }).catch((err) => console.error("Gamification tasks failed:", err));

    // ✅ Get user progress for response
    let userProgress = null;
    let watchTimeData = null;

    if (pageId && videoId) {
      try {
        userProgress = await UserProgress.findOne(
          { userId, pageId },
          "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition",
        ).lean();

        watchTimeData = await WatchTime.findOne(
          { userId, videoId, page: pageId },
          "totalWatchedSeconds uniqueWatchedSeconds progress completed completionCount firstWatchedAt lastWatchedAt videoDuration",
        ).lean();
      } catch (progressError) {
        console.error("Error fetching progress:", progressError);
      }
    }

    // ✅ Get streak data for response
    let streakData = null;
    try {
      streakData = await StudentStreak.findOne(
        { studentId: userId },
        "currentStreak longestStreak lastActiveDate milestones streakFreeze",
      ).lean();
    } catch (streakError) {
      console.error("Error fetching streak:", streakError);
    }

    // ✅ Get badges for response
    let badges = [];
    try {
      badges = await StudentBadge.find({ userId })
        .populate("badgeId", "name description icon category")
        .sort("-earnedAt")
        .limit(5)
        .lean();
    } catch (badgeError) {
      console.error("Error fetching badges:", badgeError);
    }

    // ✅ SUCCESS RESPONSE - WITH ALL DATA
    return res.status(201).json({
      success: true,
      message: "Interaction tracked successfully",
      data: {
        interaction: {
          id: interaction._id,
          type: interaction.type,
          timestamp: interaction.eventOccurredAt || interaction.eventTime,
        },

        // 📊 Progress data
        progress: userProgress
          ? {
              completionPercentage: userProgress.completionPercentage || 0,
              isCompleted: userProgress.isCompleted || false,
              totalWatched: userProgress.totalWatched || 0,
              totalTimeSpent: userProgress.totalTimeSpent || 0,
              lastPosition: userProgress.lastPosition || 0,
              watchStatus:
                userProgress.completionPercentage >= 95
                  ? "completed"
                  : userProgress.completionPercentage >= 50
                    ? "in-progress"
                    : "started",
            }
          : null,

        // ⏱️ Watch time data
        watchTime: watchTimeData
          ? {
              totalWatchSeconds: watchTimeData.totalWatchedSeconds || 0,
              uniqueWatchSeconds: watchTimeData.uniqueWatchedSeconds || 0,
              progress: watchTimeData.progress || 0,
              completed: watchTimeData.completed || false,
              completionCount: watchTimeData.completionCount || 0,
              watchType:
                watchTimeData.completionCount > 1
                  ? "revision"
                  : watchTimeData.completed
                    ? "completed"
                    : "in-progress",
              firstWatched: watchTimeData.firstWatchedAt,
              lastWatched: watchTimeData.lastWatchedAt,
            }
          : null,

        // 🔥 Streak data
        streak: streakData
          ? {
              currentStreak: streakData.currentStreak,
              longestStreak: streakData.longestStreak,
              lastActiveDate: streakData.lastActiveDate,
              milestones:
                streakData.milestones
                  ?.filter((m) => m.badgeAwarded)
                  .map((m) => ({
                    days: m.days,
                    achievedAt: m.achievedAt,
                  })) || [],
              streakFreeze: {
                isActive: streakData.streakFreeze?.isActive || false,
                freezeCount: streakData.streakFreeze?.freezeCount || 0,
              },
            }
          : null,

        // 🏅 Badges (recent 5)
        badges: badges.map((b) => ({
          id: b.badgeId?._id,
          name: b.badgeId?.name,
          description: b.badgeId?.description,
          icon: b.badgeId?.icon,
          category: b.badgeId?.category,
          earnedAt: b.earnedAt,
        })),

        // 🎯 Milestone message if any
        milestone: streakData?.milestones?.find(
          (m) =>
            m.days === streakData.currentStreak &&
            new Date(m.achievedAt).toDateString() === new Date().toDateString(),
        )
          ? {
              message: `🎉 Congratulations! You've reached a ${streakData.currentStreak}-day streak!`,
              days: streakData.currentStreak,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    console.error("Error details:", error.errors || error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to track interaction",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const Interaction = require("../models/interaction");
const WatchSession = require("../models/watchSession");
const Video = require("../models/videoModel");
const WatchTime = require("../models/watchTimeSchema");
const UserProgress = require("../models/userProgressSchema");
const Course = require("../models/course");
const { v4: uuidv4 } = require("uuid");
const StandardSubject = require("../models/standardSubjectSchema");
const StandardChapter = require("../models/standardChapterScheema");
const StandardPage = require("../models/StandardPageScheema");
const DailyInteraction = require("../models/dailyInteraction");
const User = require("../models/loginUserModel");
const UserVideoProgress = require("../models/UserVideoProgressModel.js");
const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment.js");
const DailyUniqueUser = require("../models/dailyUniqueUserSchema.js");
const ProgressService = require("../services/progressService.js");
const StudentStreak = require("../models/StudentStreak.js");
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../models/StudentBadge.js");

const StudentHeatmap = require("../models/StudentHeatmap.js");
const StudentInsight = require("../models/StudentInsight.js");
const DailyActivity = require("../models/StudentActivity.js");
//ഒരു action എത്ര millisecond interval ന് ഒരിക്കൽ മാത്രം allow ചെയ്യണം.
//1000 ms = 1 secondMeaning: 👉 User 1 second ൽ ഒരിക്കൽ മാത്രം video play event trigger ചെയ്യാം.

//very important for me
// ======================================
// BACKEND: interactionController.js
// ======================================

// // Save single interaction
// exports.saveInteraction = async (req, res) => {
//   try {
//     const interaction = new Interaction(req.body);
//     await interaction.save();

//     // Also update session
//     await updateSessionWithInteraction(req.body);

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error saving interaction:', error);
//     res.status(500).json({ error: 'Failed to save interaction' });
//   }
// };

// Save multiple interactions (batch)
// Constants at the top
const VALID_INTERACTION_TYPES = [
  "video_play",
  "video_pause",
  "video_seek_forward",
  "video_seek_backward",
  "video_end",
  "video_seek",
  "video_view",
  "timeupdate",
  "video_quality_change",
  "video_speed_change",
  "video_mute",
  "video_unmute",
  "video_fullscreen",
  "video_exit_fullscreen",
  "video_picture_in_picture",
  "video_heartbeat",
  "video_caption_toggle",
  "chapter_view",
  "page_view",
  "course_enroll",
  "course_complete",
  "course_review",
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "assignment_view",
  "assignment_submit",
  "comment_add",
  "question_ask",
  "note_add",
  "note_update",
  "note_delete",
  "bookmark_add",
  "bookmark_remove",
  "search",
  "filter",
  "sort",
  "share",
];

const PREMIUM_TYPES = [
  "video_download",
  "course_certificate",
  "quiz_feedback",
  "assignment_review",
  "live_chat",
  "instructor_message",
];

// Constants at the top of interactionController.js
const RATE_LIMIT_CONFIG = {
  video_heartbeat: 10000, // 10 seconds
  video_play: 1000, // 1 second
  video_pause: 500, // 0.5 seconds
  video_resume: 500, // 0.5 seconds
  video_seek: 2000, // 2 seconds
  video_quality_change: 5000, // 5 seconds
  video_speed_change: 5000, // 5 seconds
  video_view: 0, // No limit
  video_like: 2000, // 2 seconds
  video_dislike: 2000, // 2 seconds
  video_bookmark: 1000, // 1 second
  comment_add: 3000, // 3 seconds
  note_add: 2000, // 2 seconds
  default: 500, // Default 500ms
};

// Helper function to get device type from user agent
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    return "mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  return "desktop";
};

// Helper function to normalize language
const normalizeLanguage = (lang) => {
  if (!lang) return "en-US";
  // Add language normalization logic here if needed
  return lang;
};
// Add this at the top of your controller file

// ============================================
// NEW FUNCTION: Update Daily Analytics
// ============================================
// ============================================
// FIXED: Update Daily Analytics (Use correct model)
// ============================================
// Fixed updateDailyAnalytics function
const updateDailyAnalytics = async (interactionPayload, normalizedData) => {
  // console.log("normalizedData", normalizedData);
  try {
    const today = new Date().toISOString().split("T")[0]; //year-month-date formattil kittum
    console.log("today", today);
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;

    let watchDuration = 0;
    let segment = null;

    // Calculate segment and duration for heartbeat
    if (type === "video_heartbeat" && normalizedData.currentTime) {
      const segmentSize = 10; // 10 seconds per segment
      segment = Math.floor(normalizedData.currentTime / segmentSize);
      watchDuration = 10; // Assume 10 seconds watched
    }

    // 1️⃣ Update main analytics document
    const updateQuery = {
      $inc: {
        "metrics.totalViews": type === "video_view" ? 1 : 0,
        [`metrics.interactions.${type}`]: 1,
        "metrics.totalWatchTime": watchDuration,
      },
      $set: {
        lastUpdated: new Date(),
        standardId,
        subjectId,
        ...(videoId && { videoId }),
        ...(pageId && { pageId }),
        ...(chapterId && { chapterId }),
      },
    };

    // Handle video completion
    if (type === "video_complete") {
      updateQuery.$inc["metrics.completions"] = 1;
    }

    // Update or create daily analytics
    await DailyInteraction.findOneAndUpdate(
      {
        date: today,
        ...(videoId ? { videoId } : {}),
        ...(pageId ? { pageId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      updateQuery,
      { upsert: true },
    );

    // 2️⃣ FIXED HEATMAP: Update existing segment or push new one
    if (segment !== null && videoId) {
      // Try to update existing segment first
      const heatmapResult = await DailyInteraction.updateOne(
        {
          date: today,
          videoId,
          "metrics.watchSegments.segment": segment,
        },
        {
          $inc: {
            "metrics.watchSegments.$.watchCount": 1,
            "metrics.watchSegments.$.totalTime": watchDuration,
          },
        },
      );

      // If no segment existed, push new one
      if (heatmapResult.matchedCount === 0) {
        await DailyInteraction.updateOne(
          { date: today, videoId },
          {
            $push: {
              "metrics.watchSegments": {
                segment,
                watchCount: 1,
                totalTime: watchDuration,
              },
            },
          },
        );
      }
    }

    // 3️⃣ FIXED UNIQUE USERS: Use separate collection
    if (videoId) {
      const uniqueUserResult = await DailyUniqueUser.findOneAndUpdate(
        { date: today, videoId, userId },
        {
          $set: { lastSeen: new Date() },
          $inc: { interactions: 1 },
        },
        { upsert: true, new: true },
      );

      // Update the count in daily analytics
      const uniqueCount = await DailyUniqueUser.countDocuments({
        date: today,
        videoId,
      });

      await DailyInteraction.updateOne(
        { date: today, videoId },
        { $set: { "metrics.uniqueUserCount": uniqueCount } },
      );
    }

    // 4️⃣ Calculate derived metrics
    const doc = await DailyInteraction.findOne({
      date: today,
      ...(videoId && { videoId }),
    });

    if (doc) {
      doc.metrics.averageWatchTime =
        doc.metrics.totalWatchTime / (doc.metrics.totalViews || 1);
      doc.metrics.completionRate =
        (doc.metrics.completions / (doc.metrics.totalViews || 1)) * 100;
      await doc.save();
    }
  } catch (error) {
    console.error("❌ Daily analytics update failed:", error);
  }
};

exports.trackInteraction = async (req, res) => {
  try {
    const {
      type,
      subjectId,
      chapterId,
      pageId,
      videoId,
      eventISOTime,
      eventTime,

      data = {},
      currentTime,

      totalDuration,
      sectionId,
      lectureId,
      watchTimeMs,
      playerEvents = [],
    } = req.body;

    // 🔒 Get userId from authenticated user
    const userId = req.user._id;

    // ✅ Step 1: Basic validation
    if (!type || !subjectId) {
      return res.status(400).json({
        success: false,
        error: "type and subjectId are required",
      });
    }

    // ✅ Validate interaction type
    if (!VALID_INTERACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type: ${type}`,
        validTypes: VALID_INTERACTION_TYPES,
      });
    }
    // 📏 Get standard from subject
    const subjectDoc =
      await StandardSubject.findById(subjectId).select("standardId");
    if (!subjectDoc) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }
    const standardId = subjectDoc.standardId;
    const existingInteraction = await Interaction.findOne({
      pageId,
      videoId,
      userId,
      sessionEnded: false, // important
    }).sort({ createdAt: -1 });
    let sessionId;

    if (existingInteraction) {
      sessionId = existingInteraction.sessionId;
    } else {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    // ✅ Step 2: Validate user exists and is active
    const user = await User.findById(userId).select("isActive tier lastActive");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "User account is not active",
      });
    }

    // ✅ Step 3: Validate course exists (use lean() for better performance)
    const course = await StandardSubject.findById(subjectId)
      .select("title standardId")
      .lean();
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // ✅ Step 4: Validate video exists if provided
    if (videoId) {
      const videoExists = await Video.findById(videoId);

      if (!videoExists) {
        return res.status(404).json({
          success: false,
          error: "Video not found",
        });
      }
    }

    // 🔒 Premium features check user.tier എന്ന് പറയുന്നത് user ഏത് plan ആണെന്ന്
    //If user.tier ഇല്ലെങ്കിൽ → default ആയി "free" ആയി set ചെയ്യുന്നു.
    const userTier = user.tier || "free";
    if (PREMIUM_TYPES.includes(type) && userTier === "free") {
      return res.status(403).json({
        success: false,
        error: "This feature requires a premium subscription",
        upgradeRequired: true,
      });
    }

    // Normalize data for video interactions
    const normalizedData = {
      currentTime: Number(req.body.currentTime ?? data.currentTime ?? 0),
      duration: Number(req.body.totalDuration ?? data.duration ?? 0),
      playbackRate: Number(req.body.playbackRate ?? data.playbackRate ?? 1),
      volume: Number(req.body.volume ?? data.volume ?? 1),
      isMuted: Boolean(req.body.isMuted ?? data.isMuted ?? false),
    };

    // 🔒 Rate limiting check
    const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;

    if (rateLimitMs > 0) {
      // ✅ eventTime ഉപയോഗിക്കുക (createdAt അല്ല)
      const query = {
        userId,
        type,
        videoId,
        pageId,
        eventTime: { $gte: new Date(Date.now() - rateLimitMs) }, // ഇത് ശരി
      };

      const recentInteraction = await Interaction.findOne(query)
        .sort({ eventTime: -1 }) // eventTime അനുസരിച്ച് sort ചെയ്യുക
        .select("eventTime")
        .lean();

      if (recentInteraction) {
        const timeSinceLast =
          Date.now() - new Date(recentInteraction.eventTime).getTime();
        console.log("Time since last:", timeSinceLast, "ms");

        if (timeSinceLast < rateLimitMs) {
          const waitSeconds = Math.ceil((rateLimitMs - timeSinceLast) / 1000);
          return res.status(429).json({
            success: false,
            error: "Please wait before performing this action again",
            retryAfter: waitSeconds,
            lastInteraction: recentInteraction.eventTime,
          });
        }
      }
    }

    // ✅ Create interaction payload
    const interactionPayload = {
      standardId: course.standardId,
      sessionId,

      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      type,
      eventTime,

      // Data contains interaction metadata
      data: {
        currentTime: normalizedData.currentTime,
        duration: normalizedData.duration,
        playbackRate: normalizedData.playbackRate,
        volume: normalizedData.volume,
        isMuted: normalizedData.isMuted,
        //type "video_seek" ആണെങ്കിൽ മാത്രം
        //ഈ object add ചെയ്യുക
        //അല്ലെങ്കിൽ ഒന്നും ചെയ്യണ്ട
        // Type-specific data
        ...(type === "video_seek" && {
          fromTime: Number(data.fromTime ?? null),
          toTime: Number(data.toTime ?? null),
          seekAmount: data.seekAmount
            ? Number(data.seekAmount)
            : data.toTime && data.fromTime
              ? Number(data.toTime - data.fromTime)
              : null,
          seekDirection:
            data.seekDirection ??
            (data.toTime > data.fromTime ? "forward" : "backward"),
        }),

        ...(type === "video_view" && {
          viewDuration: Number(data.viewDuration || 0),
          isAutoplay: Boolean(data.isAutoplay || false),
          completed: Boolean(data.completed || false),
        }),

        ...(type === "video_heartbeat" && {
          progress:
            normalizedData.duration > 0
              ? Math.round(
                  (normalizedData.currentTime / normalizedData.duration) * 100,
                )
              : 0,
          buffering: Boolean(data.buffering || false),
        }),

        ...(type === "video_quality_change" && {
          fromQuality: data.fromQuality,
          toQuality: data.toQuality,
          auto: Boolean(data.auto || false),
        }),

        ...(type === "video_speed_change" && {
          fromSpeed: Number(data.fromSpeed || 1),
          toSpeed: Number(data.toSpeed || 1),
        }),

        ...(type.match(/^(quiz|assignment|comment|question|note|bookmark)/) && {
          ...data, // Include all data for these types
        }),
      },

      // Device information
      deviceInfo: {
        userAgent:
          req.body.deviceInfo?.userAgent || req.get("User-Agent") || "Unknown",
        platform: req.body.deviceInfo?.platform || "unknown",
        screenResolution: req.body.deviceInfo?.screenResolution || "unknown",
        deviceType:
          req.body.deviceInfo?.deviceType ||
          getDeviceType(req.get("User-Agent")),
        timezone:
          req.body.deviceInfo?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: normalizeLanguage(req.body.deviceInfo?.language) || "en-US",
        ip: req.ip || req.connection.remoteAddress,
      },

      // Timestamps
      eventOccurredAt: eventTime,
      serverReceivedAt: new Date(),
    };

    // ✅ Create and save interaction
    const interaction = new Interaction(interactionPayload);
    await interaction.save();
    // 🔥 NEW: Update daily analytics (non-blocking)
    updateDailyAnalytics(interactionPayload, normalizedData).catch((err) =>
      console.error("Background analytics update failed:", err),
    );
    // ✅ Update user's last activity (no await - fire and forget)
    User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
      $inc: { "analytics.totalInteractions": 1 },
    }).catch((err) => console.error("Failed to update user lastActive:", err));

    // ✅ Update analytics counters (async - don't await)
    updateAnalyticsCounters(
      type,
      subjectId,
      videoId,
      userId,
      normalizedData,
      data,
    ).catch((error) => {
      console.error(`❌ Analytics update failed for type ${type}:`, error);
    });

    // ✅ Update progress (async - don't await)
    updateUserProgress(
      normalizedData.currentTime,
      type,
      pageId,
      videoId,
      userId,
      normalizedData.duration,
      chapterId,
      subjectId,
      course.standardId,
    ).catch((error) => {
      console.error(`❌ Progress update failed for type ${type}:`, error);
    });
    actualWatchTimeProgress(
      currentTime,
      type,
      pageId,
      videoId,
      userId,
      totalDuration,
      chapterId,
      subjectId,
      standardId,
      watchTimeMs,
      playerEvents, // ✅ correct
      false, // ✅ correct
    ).catch((error) => {
      console.error(`❌ Progress update failed for type ${type}:`, error);
    });

    // ✅ Special handling for specific event types (async operations)
    let additionalData = {};
    const promises = [];

    switch (type) {
      case "course_enroll":
        promises.push(
          StandardSubject.findByIdAndUpdate(subjectId, {
            $addToSet: { enrolledUsers: userId },
            $inc: { "analytics.totalEnrollments": 1 },
          }).catch((err) =>
            console.error("Failed to update course enrollment:", err),
          ),
        );
        promises.push(
          User.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: subjectId },
          }).catch((err) =>
            console.error("Failed to update user enrollments:", err),
          ),
        );
        additionalData.enrollment = {
          courseTitle: course.title,
          enrolledAt: new Date(),
        };
        break;

      case "course_complete":
        promises.push(
          User.findByIdAndUpdate(userId, {
            $addToSet: { completedCourses: subjectId },
            $inc: { "analytics.completedCourses": 1 },
          }).catch((err) =>
            console.error("Failed to update user completions:", err),
          ),
        );
        additionalData.completion = {
          courseTitle: course.title,
          completedAt: new Date(),
          certificateEligible: true,
        };
        break;

      case "video_end":
        additionalData.videoEnded = {
          videoId,
          endedAt: new Date(),
          totalDuration: normalizedData.duration || 0,
          watchedPercentage: normalizedData.duration > 0 ? 100 : 0,
        };
        break;

      case "video_view":
        if (data.completed) {
          // If video is marked as completed, update user progress
          promises.push(
            User.findByIdAndUpdate(userId, {
              $addToSet: { "progress.completedVideos": videoId },
            }).catch((err) =>
              console.error("Failed to update video completion:", err),
            ),
          );
        }
        break;
    }

    // Execute all promises in parallel (fire and forget)
    if (promises.length > 0) {
      Promise.all(promises).catch((err) =>
        console.error("Error in background operations:", err),
      );
    }

    // Get analytics counts (with timeout to avoid blocking)
    // Get analytics counts (with timeout)
    const analyticsPromise = Promise.all([
      Interaction.countDocuments({ userId }).catch(() => 0),
      Interaction.countDocuments({ subjectId, userId }).catch(() => 0),
    ]).catch(() => [0, 0]);

    // 🔥 Get user progress
    let userProgress = null;
    let watchTimeData = null; // 👈 NEW

    if (pageId && videoId) {
      try {
        // Get progress
        userProgress = await UserProgress.findOne(
          { userId, pageId },
          "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition watchedRanges pageSessions duration",
        ).lean();

        // 👇 NEW: Get watch time data
        watchTimeData = await WatchTime.findOne(
          { userId, videoId, page: pageId },
          "totalWatchedSeconds uniqueWatchedSeconds progress completed completionCount firstWatchedAt lastWatchedAt videoDuration",
        ).lean();

        // Calculate additional metrics for progress
        if (userProgress) {
          userProgress.sessionCount = userProgress.pageSessions?.length || 0;
          const lastSession =
            userProgress.pageSessions?.[userProgress.pageSessions.length - 1];
          userProgress.lastSessionTime = lastSession?.startTime || null;

          if (userProgress.pageSessions?.length > 0) {
            const totalSessionTime = userProgress.pageSessions.reduce(
              (sum, session) => sum + (session.timeSpent || 0),
              0,
            );
            userProgress.avgSessionDuration = Math.round(
              totalSessionTime / userProgress.pageSessions.length,
            );
          }

          // Clean up
          delete userProgress.watchedRanges;
          delete userProgress.pageSessions;
        }
      } catch (progressError) {
        console.error("Error fetching progress:", progressError);
      }
    }

    // Timeout for analytics
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve([0, 0]), 500),
    );
    const [totalInteractions, totalCourseInteractions] = await Promise.race([
      analyticsPromise,
      timeoutPromise,
    ]);

    // ✅ SUCCESS RESPONSE - WITH ALL DATA
    res.status(201).json({
      success: true,
      message: "Interaction tracked successfully",
      data: {
        interaction: {
          id: interaction._id,
          type: interaction.type,
          timestamp: interaction.eventOccurredAt || interaction.eventTime,
        },
        analytics: {
          totalInteractions,
          totalCourseInteractions,
        },
        // 👇 PROGRESS DATA
        progress: userProgress
          ? {
              completionPercentage: userProgress.completionPercentage || 0,
              isCompleted: userProgress.isCompleted || false,
              totalWatched: userProgress.totalWatched || 0,
              totalTimeSpent: userProgress.totalTimeSpent || 0,
              lastPosition: userProgress.lastPosition || 0,
              sessionCount: userProgress.sessionCount || 0,
              avgSessionDuration: userProgress.avgSessionDuration || 0,
              lastSessionTime: userProgress.lastSessionTime,
              watchStatus:
                userProgress.completionPercentage >= 95
                  ? "completed"
                  : userProgress.completionPercentage >= 50
                    ? "in-progress"
                    : "started",
              remainingTime: userProgress.duration
                ? Math.max(
                    0,
                    userProgress.duration - (userProgress.totalWatched || 0),
                  )
                : 0,
            }
          : null,
        // 👇 WATCH TIME DATA
        watchTime: watchTimeData
          ? {
              totalWatchSeconds: watchTimeData.totalWatchedSeconds || 0,
              uniqueWatchSeconds: watchTimeData.uniqueWatchedSeconds || 0,
              progress: watchTimeData.progress || 0,
              completed: watchTimeData.completed || false,
              completionCount: watchTimeData.completionCount || 0,
              watchType:
                watchTimeData.completionCount > 1
                  ? "revision"
                  : watchTimeData.completed
                    ? "completed"
                    : "in-progress",
              firstWatched: watchTimeData.firstWatchedAt,
              lastWatched: watchTimeData.lastWatchedAt,
              videoDuration: watchTimeData.videoDuration || 0,
            }
          : null,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    console.error("Error details:", error.errors || error.message);

    res.status(500).json({
      success: false,
      error: "Failed to track interaction",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Updated analytics counters function
const updateAnalyticsCounters = async (
  type,
  subjectId,
  videoId,
  userId,
  normalizedData,
  additionalData = {},
) => {
  try {
    // Update based on type
    switch (type) {
      case "video_play":
      case "video_pause":
      case "video_end":
      case "video_seek":
      case "video_heartbeat":
        // Update video analytics
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { [`analytics.${type}`]: 1 },
            $set: { "analytics.lastActivity": new Date() },
          });
        }
        break;

      case "video_view":
        if (videoId) {
          const update = {
            $inc: { "analytics.totalViews": 1 },
            $addToSet: { "analytics.uniqueViewers": userId },
            $set: { "analytics.lastView": new Date() },
          };

          // Update total watch time
          if (additionalData.viewDuration) {
            update.$inc["analytics.totalWatchTime"] =
              additionalData.viewDuration;
          }

          await Video.findByIdAndUpdate(videoId, update);
        }
        break;

      case "video_quality_change":
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { "analytics.qualityChanges": 1 },
            $push: {
              "analytics.qualityHistory": {
                userId,
                from: additionalData.fromQuality,
                to: additionalData.toQuality,
                timestamp: new Date(),
              },
            },
          });
        }
        break;

      // Add more cases as needed for other interaction types
    }

    // Update subject (course) analytics
    await StandardSubject.findByIdAndUpdate(subjectId, {
      $inc: { [`analytics.interactions.${type}`]: 1 },
      $set: { "analytics.lastInteraction": new Date() },
    });
  } catch (error) {
    console.error("Error updating analytics counters:", error);
    // Don't throw - analytics should not fail main request
  }
};
// ✅ Progress update function - FOR BACKGROUND USE (no req/res)
// ✅ Progress update function - FOR BACKGROUND USE (no req/res)
const updateUserProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
) => {
  try {
    const action = type;

    // 1️⃣ Basic validation
    if (!pageId || !videoId || !userId) {
      console.log("❌ Missing required fields:", { pageId, videoId, userId });
      return;
    }
    console.log("Type of videoId:", typeof videoId);
    // 2️⃣ Validate video exists
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) {
      console.log("❌ Video not found here bro:", videoId);
      return;
    }

    const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
    const now = new Date();
    const validatedTime = Math.min(
      parseFloat(currentTime) || 0,
      lectureDuration,
    );

    // 3️⃣ Find or create progress
    let progress = await UserProgress.findOne({ userId, pageId });

    if (!progress) {
      // 🆕 Create new progress document (schema അനുസരിച്ച്)
      progress = new UserProgress({
        chapterId,
        subjectId,
        standardId,
        userId,
        pageId,
        videoId,
        duration: lectureDuration,
        lastPosition: 0,
        completionPercentage: 0,
        isCompleted: false,
        watchedRanges: [],
        pageSessions: [
          {
            startTime: now,
            endTime: null,
            timeSpent: 0,
          },
        ],
      });

      await progress.save();
    } else {
      // 🔄 Update existing progress

      // Check if this is a new session (30 minutes gap)
      const lastSession =
        progress.pageSessions[progress.pageSessions.length - 1];
      const timeSinceLastSession = lastSession?.endTime
        ? (now - lastSession.endTime) / 1000 / 60 // in minutes
        : 0;

      if (!lastSession?.endTime || timeSinceLastSession > 30) {
        // New session
        progress.pageSessions.push({
          startTime: now,
          endTime: null,
          timeSpent: 0,
        });
        console.log("🆕 New session started");
      }
    }

    // Get current session
    const currentSession =
      progress.pageSessions[progress.pageSessions.length - 1];
    const previousPosition = progress.lastPosition || 0;

    // 4️⃣ Handle different actions
    switch (action) {
      case "play":
      case "video_play":
        console.log(`▶️ Play at ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Session already started, just update
        if (!currentSession.startTime) {
          currentSession.startTime = now;
        }
        break;

      case "pause":
      case "video_pause":
        console.log(`⏸️ Pause at ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Add watched range if valid (anti-cheat)
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 300) {
            // Max 5 minutes
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }

        // Update session time
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000; // in seconds
        }
        break;

      case "seek":
        console.log(`⏩ Seek: ${previousPosition}s → ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Check for rapid seeking (anti-cheat)
        checkRapidSeek(progress, previousPosition, validatedTime, now);
        break;

      case "timeupdate":
      case "video_heartbeat":
        // Regular progress update
        progress.lastPosition = validatedTime;

        // Add watched range if valid
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 120) {
            // Max 2 minutes for heartbeat
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }
        break;

      case "end":
      case "video_end":
        console.log(`🏁 Video end at ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Add final watched range
        if (
          validatedTime > previousPosition &&
          validatedTime - previousPosition <= 10
        ) {
          addWatchedRange(
            progress,
            previousPosition,
            validatedTime,
            lectureDuration,
            "end",
          );
        }

        // End current session
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }

        // Check if video is completed
        checkVideoCompletion(progress, lectureDuration);
        break;

      default:
        console.log("Unknown action:", action);
    }

    // 5️⃣ Calculate total watched time from ranges
    progress.totalWatched = calculateTotalWatched(
      progress.watchedRanges,
      lectureDuration,
    );

    // 6️⃣ Calculate completion percentage
    if (lectureDuration > 0) {
      const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
      progress.completionPercentage = Math.min(100, Math.round(rawPercentage));

      // Auto-mark as completed if >95% watched
      if (!progress.isCompleted && progress.completionPercentage >= 95) {
        progress.isCompleted = true;
        console.log(`🎉 Video completed! ${progress.completionPercentage}%`);
      }
    }

    // 7️⃣ Calculate total time spent on this page (all sessions)
    progress.totalTimeSpent = progress.pageSessions.reduce(
      (total, session) => total + (session.timeSpent || 0),
      0,
    );

    // 8️⃣ Save progress
    await progress.save();

    console.log(`✅ Progress saved:`, {
      userId,
      pageId,
      completion: `${progress.completionPercentage}%`,
      totalWatched: `${progress.totalWatched.toFixed(2)}s`,
      totalTimeSpent: `${progress.totalTimeSpent.toFixed(2)}s`,
      sessions: progress.pageSessions.length,
    });
  } catch (error) {
    console.error("❌ Error in updateUserProgress:", error);
    // Don't throw - background operation
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * 🎯 Add watched range with anti-cheat
 */
function addWatchedRange(progress, start, end, maxDuration, action) {
  // Anti-cheat validations
  if (action === "seek") {
    console.log(`🚫 Seek - range add ചെയ്യുന്നില്ല`);
    return false;
  }

  const rangeSize = end - start;

  // Suspicious checks
  if (rangeSize > 30) {
    console.log(`🚫 Large jump: ${rangeSize.toFixed(2)}s > 30s`);
    return false;
  }

  if (rangeSize > maxDuration * 0.8) {
    console.log(`🚫 Watched >80% at once`);
    return false;
  }

  if (start < 0 || end > maxDuration || end <= start || rangeSize < 0.5) {
    return false;
  }

  // Add range
  const newRange = {
    start: parseFloat(start.toFixed(2)),
    end: parseFloat(end.toFixed(2)),
  };

  // Check if this range overlaps with existing ones
  let merged = false;
  for (const existing of progress.watchedRanges) {
    if (
      newRange.start <= existing.end + 2 &&
      newRange.end >= existing.start - 2
    ) {
      existing.start = Math.min(existing.start, newRange.start);
      existing.end = Math.max(existing.end, newRange.end);
      merged = true;
      break;
    }
  }

  if (!merged) {
    progress.watchedRanges.push(newRange);
  }

  // Sort ranges
  progress.watchedRanges.sort((a, b) => a.start - b.start);

  console.log(
    `✅ Range added: ${newRange.start} → ${newRange.end} (${rangeSize.toFixed(2)}s)`,
  );
  return true;
}

/**
 * 🎯 Calculate total unique watched time
 */
function calculateTotalWatched(ranges, duration) {
  if (!ranges || ranges.length === 0) return 0;

  let totalWatched = 0;
  let lastEnd = -1;

  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

  for (const range of sortedRanges) {
    const start = Math.max(0, Math.min(range.start, duration));
    const end = Math.max(0, Math.min(range.end, duration));

    if (end <= start) continue;

    if (start > lastEnd) {
      totalWatched += end - start;
      lastEnd = end;
    } else if (end > lastEnd) {
      totalWatched += end - lastEnd;
      lastEnd = end;
    }
  }

  return parseFloat(totalWatched.toFixed(2));
}

/**
 * 🎯 Check for rapid seeking (anti-cheat)
 */
function checkRapidSeek(progress, from, to, now) {
  if (!progress.seekHistory) {
    progress.seekHistory = [];
  }

  progress.seekHistory.push({
    from,
    to,
    delta: Math.abs(to - from),
    timestamp: now,
  });

  // Keep last 10 seeks
  if (progress.seekHistory.length > 10) {
    progress.seekHistory = progress.seekHistory.slice(-10);
  }

  // Check for rapid seeking: 5 seeks in 30 seconds
  const recentSeeks = progress.seekHistory.slice(-5);
  if (recentSeeks.length === 5) {
    const timeSpan = (now - recentSeeks[0].timestamp) / 1000;
    if (timeSpan < 30) {
      console.log(`⚠️ Rapid seeking detected: ${timeSpan}s-ൽ 5 seeks`);
      progress.rapidSeeking = true;
    }
  }
}

/**
 * 🎯 Check if video is completed
 */
function checkVideoCompletion(progress, duration) {
  if (duration === 0) return false;

  const watched = calculateTotalWatched(progress.watchedRanges, duration);
  const percentage = (watched / duration) * 100;

  if (percentage >= 90 && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
    console.log(`🎉 First time completion at ${percentage.toFixed(1)}%`);
    return true;
  }

  return false;
}
// ✅ FIXED: Actual watch time progress - BACKGROUND USE ONLY (no res)
const actualWatchTimeProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
  watchTimeMs,
  playerEvents = [],
  isPreview = false,
  deviceInfo,
  sessionId,
) => {
  try {
    // 🔒 Validation
    if (!watchTimeMs || !videoId || !userId) {
      console.log("❌ Missing required fields for watch time:", {
        videoId,
        userId,
        watchTimeMs,
      });
      return;
    }

    // ⏱️ Accurate watch time (convert ms to seconds)
    const watchedSeconds = Math.round(watchTimeMs / 1000);

    if (watchedSeconds < 3) {
      console.log("⏱️ Watch time too short, skipping");
      return;
    }

    // 📊 Progress calculation
    const progress =
      totalDuration && totalDuration > 0
        ? Number(((currentTime / totalDuration) * 100).toFixed(1))
        : 0;

    // ===== 🔍 FIND OR CREATE WATCH TIME =====
    let watchTime = await WatchTime.findOne({
      userId,
      videoId,
      page: pageId,
    });

    const isFirstTime = !watchTime;
    const isCompletingNow = !watchTime?.completed && progress >= 90;

    // ===== 🎯 ANTI-CHEAT =====
    let validWatchedSeconds = watchedSeconds;

    if (watchTime) {
      // Don't count if large jump (>30 seconds)
      if (currentTime - watchTime.lastPosition > 30) {
        console.log(
          `🚫 Anti-cheat: Large jump (${currentTime - watchTime.lastPosition}s)`,
        );
        validWatchedSeconds = 0;
      }

      // Don't count if seeking backwards
      if (currentTime < watchTime.lastPosition) {
        console.log(`⏪ Seeking backwards, not counting`);
        validWatchedSeconds = 0;
      }
    }

    // ===== 📝 UPDATE WATCH TIME =====
    const updateData = {
      $set: {
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        lastPosition: currentTime,
        lastWatchedAt: new Date(),
        progress,
        isPreview,
      },
      $inc: {
        totalWatchedSeconds: validWatchedSeconds,
      },
      $setOnInsert: {
        firstWatchedAt: new Date(),
        videoDuration: totalDuration,
        hierarchyPath: {
          standard: standardId,
          subject: subjectId,
          chapter: chapterId,
          page: pageId,
          video: videoId,
        },
      },
    };

    // 🎯 Handle unique watch seconds
    if (isFirstTime) {
      updateData.$inc.uniqueWatchedSeconds = validWatchedSeconds;
    } else {
      const lastPosition = watchTime?.lastPosition || 0;
      if (currentTime > lastPosition) {
        const uniqueSeconds = Math.min(
          validWatchedSeconds,
          currentTime - lastPosition,
        );
        updateData.$inc.uniqueWatchedSeconds = uniqueSeconds;
      }
    }

    // 🏆 Handle completion
    if (isCompletingNow) {
      updateData.$set.completed = true;
      updateData.$set.completedAt = new Date();
      updateData.$inc.completionCount = 1;
    }

    // Execute update
    watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, page: pageId },
      updateData,
      {
        upsert: true,
        new: true,
        select:
          "lastPosition totalWatchedSeconds uniqueWatchedSeconds progress completed videoDuration firstWatchedAt completionCount",
      },
    );

    console.log("📊 WatchTime updated:", {
      videoId,
      totalWatched: watchTime.totalWatchedSeconds,
      uniqueWatched: watchTime.uniqueWatchedSeconds,
      completed: watchTime.completed,
      progress: watchTime.progress,
    });

    // ===== 📝 CREATE WATCH SESSION =====
    if (watchTime) {
      const finalSessionId =
        sessionId ||
        `session_${userId}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionStartTime = Math.max(0, currentTime - validWatchedSeconds);

      const session = new WatchSession({
        sessionId: finalSessionId,
        userId,
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        startedAt: new Date(Date.now() - watchTimeMs),
        endedAt: new Date(),
        startPosition: sessionStartTime,
        endPosition: currentTime,
        videoDuration: totalDuration,
        watchTimeMs,
        watchedSeconds: validWatchedSeconds,
        isPreview,
        isUnique: isFirstTime,
        progress,
        completed: isCompletingNow,
        deviceInfo: deviceInfo || {},
        playerEvents: playerEvents || [],
        engagementScore: calculateEngagementScore(
          playerEvents,
          validWatchedSeconds,
          totalDuration,
        ),
      });

      // Fire and forget
      session
        .save()
        .catch((err) => console.error("❌ Session save failed:", err.message));
    }

    console.log(`✅ Watch time updated for user ${userId}, video ${videoId}`);
    return watchTime; // Optional: return for chaining
  } catch (error) {
    console.error("❌ Watch time error:", error);
    // Don't throw - background operation
  }
};
/**
 * 🎯 Helper: Calculate engagement score
 */
function calculateEngagementScore(playerEvents, watchedSeconds, totalDuration) {
  if (!playerEvents || playerEvents.length === 0) return 50;

  let score = 50; // Base score

  // Count interactions
  const pauseCount = playerEvents.filter((e) => e.type === "pause").length;
  const seekCount = playerEvents.filter((e) => e.type === "seek").length;

  // Penalize excessive seeking
  if (seekCount > 5) score -= 10;
  if (seekCount > 10) score -= 10;

  // Reward watching most of video
  if (totalDuration > 0) {
    const watchRatio = watchedSeconds / totalDuration;
    if (watchRatio > 0.9) score += 20;
    else if (watchRatio > 0.7) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
// Helper: Format milliseconds to readable time
function formatMs(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ==============================================
// LEAN REDIS INTERACTION CONTROLLER
// ==============================================
const Interaction = require("../models/interaction");
const WatchSession = require("../models/watchSession");
const Video = require("../models/videoModel");
const WatchTime = require("../models/watchTimeSchema");
const UserProgress = require("../models/userProgressSchema");
const StandardSubject = require("../models/standardSubjectSchema");
const DailyInteraction = require("../models/dailyInteraction");
const User = require("../models/loginUserModel");
const DailyUniqueUser = require("../models/dailyUniqueUserSchema.js");
const StudentStreak = require("../models/StudentStreak.js");
const { BadgeDefinition, StudentBadge } = require("../models/StudentBadge.js");
const StudentHeatmap = require("../models/StudentHeatmap.js");
const StudentInsight = require("../models/StudentInsight.js");
const DailyActivity = require("../models/StudentActivity.js");
const mongoose = require("mongoose");
const redisClient = require("../config/index.js"); // You'll need this

// ==============================================
// CONSTANTS (same as before)
// ==============================================
const VALID_INTERACTION_TYPES = [
  "video_play",
  "video_pause",
  "video_seek_forward",
  "video_seek_backward",
  "video_end",
  "video_seek",
  "video_view",
  "timeupdate",
  "video_quality_change",
  "video_speed_change",
  "video_mute",
  "video_unmute",
  "video_fullscreen",
  "video_exit_fullscreen",
  "video_picture_in_picture",
  "video_heartbeat",
  "video_caption_toggle",
  "chapter_view",
  "page_view",
  "course_enroll",
  "course_complete",
  "course_review",
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "assignment_view",
  "assignment_submit",
  "comment_add",
  "question_ask",
  "note_add",
  "note_update",
  "note_delete",
  "bookmark_add",
  "bookmark_remove",
  "search",
  "filter",
  "sort",
  "share",
];

const PREMIUM_TYPES = [
  "video_download",
  "course_certificate",
  "quiz_feedback",
  "assignment_review",
  "live_chat",
  "instructor_message",
];

const RATE_LIMIT_CONFIG = {
  video_heartbeat: 10000,
  video_play: 1000,
  video_pause: 500,
  video_resume: 500,
  video_seek: 2000,
  video_quality_change: 5000,
  video_speed_change: 5000,
  video_view: 0,
  video_like: 2000,
  video_dislike: 2000,
  video_bookmark: 1000,
  comment_add: 3000,
  note_add: 2000,
  default: 500,
};

// ==============================================
// SIMPLE HELPER FUNCTIONS
// ==============================================
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    return "mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  return "desktop";
};

const normalizeLanguage = (lang) => lang || "en-US";

// ==============================================
// SIMPLE REDIS FUNCTIONS - ONLY WHAT YOU NEED
// ==============================================

// 1️⃣ Rate limiting only - keep this, it's useful
const checkRateLimit = async (userId, type) => {
  const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
  if (rateLimitMs === 0) return { allowed: true };

  const key = `rl:${userId}:${type}`;

  try {
    const lastInteraction = await redisClient.get(key);
    const now = Date.now();

    if (lastInteraction) {
      const timeSinceLast = now - parseInt(lastInteraction);
      if (timeSinceLast < rateLimitMs) {
        return {
          allowed: false,
          retryAfter: Math.ceil((rateLimitMs - timeSinceLast) / 1000),
        };
      }
    }

    await redisClient.setex(key, Math.ceil(rateLimitMs / 1000), now.toString());
    return { allowed: true };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    return { allowed: true }; // Fail open
  }
};

// 2️⃣ Simple user cache (optional, but helpful)
const getUserCached = async (userId) => {
  const key = `user:${userId}`;

  try {
    let user = await redisClient.get(key);
    if (user) return JSON.parse(user);

    user = await User.findById(userId)
      .select("isActive tier lastActive")
      .lean();
    if (user) await redisClient.setex(key, 300, JSON.stringify(user)); // 5 min
    return user;
  } catch (error) {
    console.error("Redis user cache error:", error);
    return await User.findById(userId)
      .select("isActive tier lastActive")
      .lean();
  }
};

// 3️⃣ Simple subject cache (optional)
const getSubjectCached = async (subjectId) => {
  const key = `subject:${subjectId}`;

  try {
    let subject = await redisClient.get(key);
    if (subject) return JSON.parse(subject);

    subject = await StandardSubject.findById(subjectId)
      .select("standardId")
      .lean();
    if (subject) await redisClient.setex(key, 3600, JSON.stringify(subject));
    return subject;
  } catch (error) {
    console.error("Redis subject cache error:", error);
    return await StandardSubject.findById(subjectId)
      .select("standardId")
      .lean();
  }
};

// 4️⃣ Simple progress cache (read-only, for response)
const getProgressCached = async (userId, pageId) => {
  const key = `progress:${userId}:${pageId}`;

  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);

    const progress = await UserProgress.findOne(
      { userId, pageId },
      "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition",
    ).lean();

    if (progress) await redisClient.setex(key, 300, JSON.stringify(progress));
    return progress;
  } catch (error) {
    console.error("Redis progress cache error:", error);
    return await UserProgress.findOne(
      { userId, pageId },
      "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition",
    ).lean();
  }
};

// 5️⃣ Simple streak cache (read-only)
const getStreakCached = async (userId) => {
  const key = `streak:${userId}`;

  try {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached);

    const streak = await StudentStreak.findOne(
      { studentId: userId },
      "currentStreak longestStreak lastActiveDate milestones streakFreeze",
    ).lean();

    if (streak) await redisClient.setex(key, 3600, JSON.stringify(streak));
    return streak;
  } catch (error) {
    console.error("Redis streak cache error:", error);
    return await StudentStreak.findOne(
      { studentId: userId },
      "currentStreak longestStreak lastActiveDate milestones streakFreeze",
    ).lean();
  }
};

// ==============================================
// MAIN CONTROLLER - SIMPLE AND RELIABLE
// ==============================================
exports.trackInteraction = async (req, res) => {
  try {
    const {
      type,
      subjectId,
      chapterId,
      pageId,
      videoId,
      eventTime,
      data = {},
      currentTime,
      totalDuration,
      watchTimeMs,
      playerEvents = [],
    } = req.body;

    const userId = req.user._id;

    // ✅ Basic validation
    if (!type || !subjectId) {
      return res.status(400).json({
        success: false,
        error: "type and subjectId are required",
      });
    }

    if (!VALID_INTERACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type: ${type}`,
        validTypes: VALID_INTERACTION_TYPES,
      });
    }

    // ✅ Rate limiting (keep this)
    const rateLimitCheck = await checkRateLimit(userId, type);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: "Please wait before performing this action again",
        retryAfter: rateLimitCheck.retryAfter,
      });
    }

    // ✅ Get subject (with optional cache)
    const subjectDoc = await getSubjectCached(subjectId);
    if (!subjectDoc) {
      return res
        .status(404)
        .json({ success: false, error: "Subject not found" });
    }
    const standardId = subjectDoc.standardId;

    // ✅ Get user (with optional cache)
    const user = await getUserCached(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, error: "User account is not active" });
    }

    // ✅ Premium check
    const userTier = user.tier || "free";
    if (PREMIUM_TYPES.includes(type) && userTier === "free") {
      return res.status(403).json({
        success: false,
        error: "This feature requires a premium subscription",
        upgradeRequired: true,
      });
    }

    // ✅ Generate session ID
    let sessionId;
    const existingInteraction = await Interaction.findOne({
      pageId,
      videoId,
      userId,
      sessionEnded: false,
    }).sort({ createdAt: -1 });

    if (existingInteraction) {
      sessionId = existingInteraction.sessionId;
    } else {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ✅ Normalize data
    const normalizedData = {
      currentTime: Number(req.body.currentTime ?? data.currentTime ?? 0),
      duration: Number(req.body.totalDuration ?? data.duration ?? 0),
      playbackRate: Number(req.body.playbackRate ?? data.playbackRate ?? 1),
      volume: Number(req.body.volume ?? data.volume ?? 1),
      isMuted: Boolean(req.body.isMuted ?? data.isMuted ?? false),
    };

    // ✅ Create interaction payload
    const interactionPayload = {
      standardId,
      sessionId,
      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      type,
      eventTime,
      data: {
        currentTime: normalizedData.currentTime,
        duration: normalizedData.duration,
        playbackRate: normalizedData.playbackRate,
        volume: normalizedData.volume,
        isMuted: normalizedData.isMuted,
        ...(type === "video_seek" && {
          fromTime: Number(data.fromTime ?? null),
          toTime: Number(data.toTime ?? null),
          seekAmount: data.seekAmount
            ? Number(data.seekAmount)
            : data.toTime && data.fromTime
              ? Number(data.toTime - data.fromTime)
              : null,
          seekDirection:
            data.seekDirection ??
            (data.toTime > data.fromTime ? "forward" : "backward"),
        }),
        ...(type === "video_view" && {
          viewDuration: Number(data.viewDuration || 0),
          isAutoplay: Boolean(data.isAutoplay || false),
          completed: Boolean(data.completed || false),
        }),
        ...(type === "video_heartbeat" && {
          progress:
            normalizedData.duration > 0
              ? Math.round(
                  (normalizedData.currentTime / normalizedData.duration) * 100,
                )
              : 0,
          buffering: Boolean(data.buffering || false),
        }),
        ...(type.match(/^(quiz|assignment|comment|question|note|bookmark)/) && {
          ...data,
        }),
      },
      deviceInfo: {
        userAgent:
          req.body.deviceInfo?.userAgent || req.get("User-Agent") || "Unknown",
        platform: req.body.deviceInfo?.platform || "unknown",
        screenResolution: req.body.deviceInfo?.screenResolution || "unknown",
        deviceType:
          req.body.deviceInfo?.deviceType ||
          getDeviceType(req.get("User-Agent")),
        timezone:
          req.body.deviceInfo?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: normalizeLanguage(req.body.deviceInfo?.language) || "en-US",
        ip: req.ip || req.connection.remoteAddress,
      },
      eventOccurredAt: eventTime,
      serverReceivedAt: new Date(),
    };

    // ✅ Save interaction (direct DB write - simple)
    const interaction = new Interaction(interactionPayload);
    await interaction.save();

    // ✅ Update user's last activity (direct DB update)
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
      $inc: { "analytics.totalInteractions": 1 },
    });

    // ✅ Run background tasks (fire and forget - but with error logging)
    // These will still work, just not blocking the response
    Promise.all([
      updateAnalyticsCounters(
        type,
        subjectId,
        videoId,
        userId,
        normalizedData,
        data,
      ),

      updateUserProgress(
        currentTime,
        type,
        pageId,
        videoId,
        userId,
        totalDuration,
        chapterId,
        subjectId,
        standardId,
      ),

      actualWatchTimeProgress(
        currentTime,
        type,
        pageId,
        videoId,
        userId,
        totalDuration,
        chapterId,
        subjectId,
        standardId,
        watchTimeMs,
        playerEvents,
        false,
        interactionPayload.deviceInfo,
        sessionId,
      ),

      updateDailyAnalytics(interactionPayload, normalizedData),

      runAllBackgroundTasks(interactionPayload, normalizedData, {
        watchTimeMs,
        playerEvents,
      }),
    ])
      .then(() => {
        console.log("✅ Background tasks completed");
      })
      .catch((err) => {
        console.error("❌ Background task error:", err);
      });

    // ✅ Get data for response (from cache if available)
    const [userProgress, watchTimeData, streakData, badges] = await Promise.all(
      [
        getProgressCached(userId, pageId),
        WatchTime.findOne(
          { userId, videoId, page: pageId },
          "totalWatchedSeconds uniqueWatchedSeconds progress completed completionCount firstWatchedAt lastWatchedAt videoDuration",
        ).lean(),
        getStreakCached(userId),
        StudentBadge.find({ userId })
          .populate("badgeId", "name description icon category")
          .sort("-earnedAt")
          .limit(5)
          .lean(),
      ],
    );

    // ✅ Update cache with fresh data (optional)
    if (userProgress) {
      redisClient
        .setex(
          `progress:${userId}:${pageId}`,
          300,
          JSON.stringify(userProgress),
        )
        .catch(() => {});
    }
    if (streakData) {
      redisClient
        .setex(`streak:${userId}`, 3600, JSON.stringify(streakData))
        .catch(() => {});
    }

    // ✅ SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message: "Interaction tracked successfully",
      data: {
        interaction: {
          id: interaction._id,
          type: interaction.type,
          timestamp: interaction.eventOccurredAt || interaction.eventTime,
        },

        progress: userProgress
          ? {
              completionPercentage: userProgress.completionPercentage || 0,
              isCompleted: userProgress.isCompleted || false,
              totalWatched: userProgress.totalWatched || 0,
              totalTimeSpent: userProgress.totalTimeSpent || 0,
              lastPosition: userProgress.lastPosition || 0,
              watchStatus:
                userProgress.completionPercentage >= 95
                  ? "completed"
                  : userProgress.completionPercentage >= 50
                    ? "in-progress"
                    : "started",
            }
          : null,

        watchTime: watchTimeData
          ? {
              totalWatchSeconds: watchTimeData.totalWatchedSeconds || 0,
              uniqueWatchSeconds: watchTimeData.uniqueWatchedSeconds || 0,
              progress: watchTimeData.progress || 0,
              completed: watchTimeData.completed || false,
              completionCount: watchTimeData.completionCount || 0,
              watchType:
                watchTimeData.completionCount > 1
                  ? "revision"
                  : watchTimeData.completed
                    ? "completed"
                    : "in-progress",
              firstWatched: watchTimeData.firstWatchedAt,
              lastWatched: watchTimeData.lastWatchedAt,
            }
          : null,

        streak: streakData
          ? {
              currentStreak: streakData.currentStreak,
              longestStreak: streakData.longestStreak,
              lastActiveDate: streakData.lastActiveDate,
              milestones:
                streakData.milestones
                  ?.filter((m) => m.badgeAwarded)
                  .map((m) => ({
                    days: m.days,
                    achievedAt: m.achievedAt,
                  })) || [],
              streakFreeze: {
                isActive: streakData.streakFreeze?.isActive || false,
                freezeCount: streakData.streakFreeze?.freezeCount || 0,
              },
            }
          : null,

        badges: badges.map((b) => ({
          id: b.badgeId?._id,
          name: b.badgeId?.name,
          description: b.badgeId?.description,
          icon: b.badgeId?.icon,
          category: b.badgeId?.category,
          earnedAt: b.earnedAt,
        })),

        milestone: streakData?.milestones?.find(
          (m) =>
            m.days === streakData.currentStreak &&
            new Date(m.achievedAt).toDateString() === new Date().toDateString(),
        )
          ? {
              message: `🎉 Congratulations! You've reached a ${streakData.currentStreak}-day streak!`,
              days: streakData.currentStreak,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    console.error("Error details:", error.errors || error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to track interaction",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==============================================
// BACKGROUND FUNCTIONS - YOUR ORIGINAL ONES
// (Keep them exactly as they were)
// ==============================================

// Just copy your original functions here:
// updateAnalyticsCounters
// updateUserProgress
// actualWatchTimeProgress
// updateDailyAnalytics
// runAllBackgroundTasks
// And all the other helper functions from your original code

// ==============================================
// REDIS CLIENT SETUP (config/redis.js)
// ==============================================
/*
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redisClient;
*/

module.exports = exports;

// ==============================================
// COMPLETE INTERACTION CONTROLLER
// ==============================================
const Interaction = require("../models/interaction");
const WatchSession = require("../models/watchSession");
const Video = require("../models/videoModel");
const WatchTime = require("../models/watchTimeSchema");
const UserProgress = require("../models/userProgressSchema");
const Course = require("../models/course");
const { v4: uuidv4 } = require("uuid");
const StandardSubject = require("../models/standardSubjectSchema");
const StandardChapter = require("../models/standardChapterScheema");
const StandardPage = require("../models/StandardPageScheema");
const DailyInteraction = require("../models/dailyInteraction");
const User = require("../models/loginUserModel");
const UserVideoProgress = require("../models/UserVideoProgressModel.js");
const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment.js");
const DailyUniqueUser = require("../models/dailyUniqueUserSchema.js");
const ProgressService = require("../services/progressService.js");
const StudentStreak = require("../models/StudentStreak.js");
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../models/StudentBadge.js");
const StudentHeatmap = require("../models/StudentHeatmap.js");
const StudentInsight = require("../models/StudentInsight.js");
const DailyActivity = require("../models/StudentActivity.js");

// ==============================================
// CONSTANTS & CONFIGURATION
// ==============================================
const VALID_INTERACTION_TYPES = [
  "video_play",
  "video_pause",
  "video_seek_forward",
  "video_seek_backward",
  "video_end",
  "video_seek",
  "video_view",
  "timeupdate",
  "video_quality_change",
  "video_speed_change",
  "video_mute",
  "video_unmute",
  "video_fullscreen",
  "video_exit_fullscreen",
  "video_picture_in_picture",
  "video_heartbeat",
  "video_caption_toggle",
  "chapter_view",
  "page_view",
  "course_enroll",
  "course_complete",
  "course_review",
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "assignment_view",
  "assignment_submit",
  "comment_add",
  "question_ask",
  "note_add",
  "note_update",
  "note_delete",
  "bookmark_add",
  "bookmark_remove",
  "search",
  "filter",
  "sort",
  "share",
];

const PREMIUM_TYPES = [
  "video_download",
  "course_certificate",
  "quiz_feedback",
  "assignment_review",
  "live_chat",
  "instructor_message",
];

const RATE_LIMIT_CONFIG = {
  video_heartbeat: 10000,
  video_play: 1000,
  video_pause: 500,
  video_resume: 500,
  video_seek: 2000,
  video_quality_change: 5000,
  video_speed_change: 5000,
  video_view: 0,
  video_like: 2000,
  video_dislike: 2000,
  video_bookmark: 1000,
  comment_add: 3000,
  note_add: 2000,
  default: 500,
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    return "mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  return "desktop";
};

const normalizeLanguage = (lang) => {
  return lang || "en-US";
};

const calculateIntensity = (type, normalizedData) => {
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
};

const isValidForStreak = (type, normalizedData) => {
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
};

// ==============================================
// BACKGROUND TASK FUNCTIONS
// ==============================================

// 1️⃣ UPDATE DAILY ACTIVITY
const updateDailyActivity = async (userId, activityData) => {
  try {
    const { date, type, videoId, subjectId, chapterId, pageId, data } =
      activityData;

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
        currentTime: data?.currentTime,
        duration: data?.duration,
        progress: data?.duration ? (data.currentTime / data.duration) * 100 : 0,
      },
    });

    dailyActivity.metrics.interactions += 1;

    if (type.includes("video")) {
      if (type === "video_view" || type === "video_play") {
        dailyActivity.metrics.videosWatched += 1;
      }
      if (data?.watchTimeMs) {
        dailyActivity.metrics.totalWatchTime += data.watchTimeMs / 1000;
      }
    }

    if (type === "page_view") dailyActivity.metrics.pagesVisited += 1;
    if (type.includes("quiz")) dailyActivity.metrics.quizzesTaken += 1;

    if (isValidForStreak(type, data)) {
      dailyActivity.isValidLearningDay = true;
    }

    await dailyActivity.save();
    return dailyActivity;
  } catch (error) {
    console.error("Daily activity update failed:", error);
  }
};

// 2️⃣ UPDATE HEATMAP
const updateStudentHeatmap = async (userId, heatmapData) => {
  try {
    const { date, type, intensity, subjectId } = heatmapData;

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
  } catch (error) {
    console.error("Heatmap update failed:", error);
  }
};

// 3️⃣ UPDATE STREAK
const checkAndUpdateStreak = async (userId, streakData) => {
  try {
    const { date, type, isValidActivity } = streakData;

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
  } catch (error) {
    console.error("Streak update failed:", error);
    return null;
  }
};

// 4️⃣ CHECK AND AWARD BADGES
const checkAndAwardBadges = async (userId, badgeData) => {
  try {
    const { type, subjectId, videoId, currentStreak } = badgeData;

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
          const completedCount = await WatchTime.countDocuments({
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
          const watchTimeData = await WatchTime.aggregate([
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
  } catch (error) {
    console.error("Badge check failed:", error);
  }
};

// 5️⃣ UPDATE STUDENT INSIGHTS
const updateStudentInsights = async (userId, insightData) => {
  try {
    const { type, subjectId, videoId, chapterId, pageId, date, data } =
      insightData;

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
      metadata: { progress: data?.progress, duration: data?.duration },
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
      const activeDays = dailyActivity.filter(
        (d) => d.isValidLearningDay,
      ).length;
      insights.learningPatterns.consistencyScore = (activeDays / 7) * 100;
    }

    insights.lastUpdated = new Date();
    await insights.save();
  } catch (error) {
    console.error("Insights update failed:", error);
  }
};

// 6️⃣ UPDATE DAILY ANALYTICS
const updateDailyAnalytics = async (interactionPayload, normalizedData) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;

    let watchDuration = 0;
    let segment = null;

    if (type === "video_heartbeat" && normalizedData.currentTime) {
      const segmentSize = 10;
      segment = Math.floor(normalizedData.currentTime / segmentSize);
      watchDuration = 10;
    }

    await DailyInteraction.findOneAndUpdate(
      {
        date: today,
        ...(videoId ? { videoId } : {}),
        ...(pageId ? { pageId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      {
        $inc: {
          "metrics.totalViews": type === "video_view" ? 1 : 0,
          [`metrics.interactions.${type}`]: 1,
          "metrics.totalWatchTime": watchDuration,
        },
        $set: {
          lastUpdated: new Date(),
          standardId,
          subjectId,
          ...(videoId && { videoId }),
          ...(pageId && { pageId }),
          ...(chapterId && { chapterId }),
        },
      },
      { upsert: true },
    );

    if (segment !== null && videoId) {
      const heatmapResult = await DailyInteraction.updateOne(
        { date: today, videoId, "metrics.watchSegments.segment": segment },
        {
          $inc: {
            "metrics.watchSegments.$.watchCount": 1,
            "metrics.watchSegments.$.totalTime": watchDuration,
          },
        },
      );

      if (heatmapResult.matchedCount === 0) {
        await DailyInteraction.updateOne(
          { date: today, videoId },
          {
            $push: {
              "metrics.watchSegments": {
                segment,
                watchCount: 1,
                totalTime: watchDuration,
              },
            },
          },
        );
      }
    }

    if (videoId) {
      await DailyUniqueUser.findOneAndUpdate(
        { date: today, videoId, userId },
        { $set: { lastSeen: new Date() }, $inc: { interactions: 1 } },
        { upsert: true },
      );

      const uniqueCount = await DailyUniqueUser.countDocuments({
        date: today,
        videoId,
      });
      await DailyInteraction.updateOne(
        { date: today, videoId },
        { $set: { "metrics.uniqueUserCount": uniqueCount } },
      );
    }

    const doc = await DailyInteraction.findOne({
      date: today,
      ...(videoId && { videoId }),
    });
    if (doc) {
      doc.metrics.averageWatchTime =
        doc.metrics.totalWatchTime / (doc.metrics.totalViews || 1);
      doc.metrics.completionRate =
        (doc.metrics.completions / (doc.metrics.totalViews || 1)) * 100;
      await doc.save();
    }
  } catch (error) {
    console.error("❌ Daily analytics update failed:", error);
  }
};

// 7️⃣ UPDATE WATCH TIME PROGRESS
const actualWatchTimeProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
  watchTimeMs,
  playerEvents = [],
  isPreview = false,
  deviceInfo,
  sessionId,
) => {
  try {
    if (!watchTimeMs || !videoId || !userId) return;

    const watchedSeconds = Math.round(watchTimeMs / 1000);
    if (watchedSeconds < 3) return;

    const progress =
      totalDuration && totalDuration > 0
        ? Number(((currentTime / totalDuration) * 100).toFixed(1))
        : 0;

    let watchTime = await WatchTime.findOne({ userId, videoId, page: pageId });

    let validWatchedSeconds = watchedSeconds;
    if (watchTime) {
      if (currentTime - watchTime.lastPosition > 30) validWatchedSeconds = 0;
      if (currentTime < watchTime.lastPosition) validWatchedSeconds = 0;
    }

    const isFirstTime = !watchTime;
    const isCompletingNow = !watchTime?.completed && progress >= 90;

    const updateData = {
      $set: {
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        lastPosition: currentTime,
        lastWatchedAt: new Date(),
        progress,
        isPreview,
      },
      $inc: { totalWatchedSeconds: validWatchedSeconds },
      $setOnInsert: {
        firstWatchedAt: new Date(),
        videoDuration: totalDuration,
        hierarchyPath: {
          standard: standardId,
          subject: subjectId,
          chapter: chapterId,
          page: pageId,
          video: videoId,
        },
      },
    };

    if (isFirstTime) {
      updateData.$inc.uniqueWatchedSeconds = validWatchedSeconds;
    } else {
      const lastPosition = watchTime?.lastPosition || 0;
      if (currentTime > lastPosition) {
        const uniqueSeconds = Math.min(
          validWatchedSeconds,
          currentTime - lastPosition,
        );
        updateData.$inc.uniqueWatchedSeconds = uniqueSeconds;
      }
    }

    if (isCompletingNow) {
      updateData.$set.completed = true;
      updateData.$set.completedAt = new Date();
      updateData.$inc.completionCount = 1;
    }

    watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, page: pageId },
      updateData,
      { upsert: true, new: true },
    );

    if (watchTime) {
      const finalSessionId =
        sessionId ||
        `session_${userId}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionStartTime = Math.max(0, currentTime - validWatchedSeconds);

      const session = new WatchSession({
        sessionId: finalSessionId,
        userId,
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        startedAt: new Date(Date.now() - watchTimeMs),
        endedAt: new Date(),
        startPosition: sessionStartTime,
        endPosition: currentTime,
        videoDuration: totalDuration,
        watchTimeMs,
        watchedSeconds: validWatchedSeconds,
        isPreview,
        isUnique: isFirstTime,
        progress,
        completed: isCompletingNow,
        deviceInfo: deviceInfo || {},
        playerEvents: playerEvents || [],
        engagementScore: 50,
      });

      session
        .save()
        .catch((err) => console.error("❌ Session save failed:", err.message));
    }

    return watchTime;
  } catch (error) {
    console.error("❌ Watch time error:", error);
  }
};

// 8️⃣ MAIN BACKGROUND TASK ORCHESTRATOR
const runAllBackgroundTasks = async (
  interactionPayload,
  normalizedData,
  additionalData = {},
) => {
  try {
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;
    const today = new Date().toISOString().split("T")[0];

    console.log(`🚀 Running background tasks for user ${userId}, type ${type}`);

    // 1️⃣ Update Daily Activity
    await updateDailyActivity(userId, {
      date: today,
      type,
      videoId,
      subjectId,
      chapterId,
      pageId,
      data: { ...normalizedData, watchTimeMs: additionalData.watchTimeMs },
    });

    // 2️⃣ Update Heatmap
    await updateStudentHeatmap(userId, {
      date: today,
      type,
      intensity: calculateIntensity(type, normalizedData),
      subjectId,
      videoId,
    });

    // 3️⃣ Update Streak
    const streakUpdated = await checkAndUpdateStreak(userId, {
      date: today,
      type,
      isValidActivity: isValidForStreak(type, normalizedData),
      subjectId,
      videoId,
    });

    // 4️⃣ Check Badges
    if (streakUpdated || type === "video_end" || type === "video_complete") {
      await checkAndAwardBadges(userId, {
        type,
        subjectId,
        videoId,
        currentStreak: streakUpdated?.currentStreak,
        activityDate: today,
      });
    }

    // 5️⃣ Update Insights
    await updateStudentInsights(userId, {
      type,
      subjectId,
      videoId,
      chapterId,
      pageId,
      date: today,
      data: normalizedData,
    });

    console.log(`✅ All background tasks completed for ${userId}`);
  } catch (error) {
    console.error("❌ Background tasks failed:", error);
  }
};

// ==============================================
// 9️⃣ UPDATE ANALYTICS COUNTERS
// ==============================================
const updateAnalyticsCounters = async (
  type,
  subjectId,
  videoId,
  userId,
  normalizedData,
  additionalData = {},
) => {
  try {
    switch (type) {
      case "video_play":
      case "video_pause":
      case "video_end":
      case "video_seek":
      case "video_heartbeat":
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { [`analytics.${type}`]: 1 },
            $set: { "analytics.lastActivity": new Date() },
          });
        }
        break;

      case "video_view":
        if (videoId) {
          const update = {
            $inc: { "analytics.totalViews": 1 },
            $addToSet: { "analytics.uniqueViewers": userId },
            $set: { "analytics.lastView": new Date() },
          };
          if (additionalData.viewDuration)
            update.$inc["analytics.totalWatchTime"] =
              additionalData.viewDuration;
          await Video.findByIdAndUpdate(videoId, update);
        }
        break;
    }

    await StandardSubject.findByIdAndUpdate(subjectId, {
      $inc: { [`analytics.interactions.${type}`]: 1 },
      $set: { "analytics.lastInteraction": new Date() },
    });
  } catch (error) {
    console.error("Error updating analytics counters:", error);
  }
};

// ==============================================
// 🔟 UPDATE USER PROGRESS
// ==============================================
const updateUserProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
) => {
  try {
    const action = type;

    if (!pageId || !videoId || !userId) return;

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) return;

    const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
    const now = new Date();
    const validatedTime = Math.min(
      parseFloat(currentTime) || 0,
      lectureDuration,
    );

    let progress = await UserProgress.findOne({ userId, pageId });

    if (!progress) {
      progress = new UserProgress({
        chapterId,
        subjectId,
        standardId,
        userId,
        pageId,
        videoId,
        duration: lectureDuration,
        lastPosition: 0,
        completionPercentage: 0,
        isCompleted: false,
        watchedRanges: [],
        pageSessions: [{ startTime: now, endTime: null, timeSpent: 0 }],
      });
      await progress.save();
    } else {
      const lastSession =
        progress.pageSessions[progress.pageSessions.length - 1];
      const timeSinceLastSession = lastSession?.endTime
        ? (now - lastSession.endTime) / 1000 / 60
        : 0;

      if (!lastSession?.endTime || timeSinceLastSession > 30) {
        progress.pageSessions.push({
          startTime: now,
          endTime: null,
          timeSpent: 0,
        });
      }
    }

    const currentSession =
      progress.pageSessions[progress.pageSessions.length - 1];
    const previousPosition = progress.lastPosition || 0;

    const addWatchedRange = (progress, start, end, maxDuration, action) => {
      if (action === "seek") return false;
      const rangeSize = end - start;
      if (rangeSize > 30) return false;
      if (rangeSize > maxDuration * 0.8) return false;
      if (start < 0 || end > maxDuration || end <= start || rangeSize < 0.5)
        return false;

      const newRange = {
        start: parseFloat(start.toFixed(2)),
        end: parseFloat(end.toFixed(2)),
      };
      let merged = false;
      for (const existing of progress.watchedRanges) {
        if (
          newRange.start <= existing.end + 2 &&
          newRange.end >= existing.start - 2
        ) {
          existing.start = Math.min(existing.start, newRange.start);
          existing.end = Math.max(existing.end, newRange.end);
          merged = true;
          break;
        }
      }
      if (!merged) progress.watchedRanges.push(newRange);
      progress.watchedRanges.sort((a, b) => a.start - b.start);
      return true;
    };

    const calculateTotalWatched = (ranges, duration) => {
      if (!ranges || ranges.length === 0) return 0;
      let totalWatched = 0;
      let lastEnd = -1;
      const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
      for (const range of sortedRanges) {
        const start = Math.max(0, Math.min(range.start, duration));
        const end = Math.max(0, Math.min(range.end, duration));
        if (end <= start) continue;
        if (start > lastEnd) {
          totalWatched += end - start;
          lastEnd = end;
        } else if (end > lastEnd) {
          totalWatched += end - lastEnd;
          lastEnd = end;
        }
      }
      return parseFloat(totalWatched.toFixed(2));
    };

    switch (action) {
      case "play":
      case "video_play":
        progress.lastPosition = validatedTime;
        if (!currentSession.startTime) currentSession.startTime = now;
        break;

      case "pause":
      case "video_pause":
        progress.lastPosition = validatedTime;
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 300) {
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }
        break;

      case "seek":
        progress.lastPosition = validatedTime;
        break;

      case "timeupdate":
      case "video_heartbeat":
        progress.lastPosition = validatedTime;
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 120) {
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }
        break;

      case "end":
      case "video_end":
        progress.lastPosition = validatedTime;
        if (
          validatedTime > previousPosition &&
          validatedTime - previousPosition <= 10
        ) {
          addWatchedRange(
            progress,
            previousPosition,
            validatedTime,
            lectureDuration,
            "end",
          );
        }
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }
        break;
    }

    progress.totalWatched = calculateTotalWatched(
      progress.watchedRanges,
      lectureDuration,
    );

    if (lectureDuration > 0) {
      const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
      progress.completionPercentage = Math.min(100, Math.round(rawPercentage));
      if (!progress.isCompleted && progress.completionPercentage >= 95) {
        progress.isCompleted = true;
      }
    }

    progress.totalTimeSpent = progress.pageSessions.reduce(
      (total, session) => total + (session.timeSpent || 0),
      0,
    );
    await progress.save();
  } catch (error) {
    console.error("❌ Error in updateUserProgress:", error);
  }
};

// ==============================================
// MAIN CONTROLLER FUNCTION
// ==============================================
exports.trackInteraction = async (req, res) => {
  try {
    const {
      type,
      subjectId,
      chapterId,
      pageId,
      videoId,
      eventTime,
      data = {},
      currentTime,
      totalDuration,
      watchTimeMs,
      playerEvents = [],
    } = req.body;

    const userId = req.user._id;

    // ✅ Basic validation
    if (!type || !subjectId) {
      return res.status(400).json({
        success: false,
        error: "type and subjectId are required",
      });
    }

    if (!VALID_INTERACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type: ${type}`,
        validTypes: VALID_INTERACTION_TYPES,
      });
    }

    // ✅ Get standard from subject
    const subjectDoc =
      await StandardSubject.findById(subjectId).select("standardId");
    if (!subjectDoc) {
      return res
        .status(404)
        .json({ success: false, error: "Subject not found" });
    }
    const standardId = subjectDoc.standardId;

    // ✅ Check user
    const user = await User.findById(userId).select("isActive tier lastActive");
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, error: "User account is not active" });

    // ✅ Premium check
    const userTier = user.tier || "free";
    if (PREMIUM_TYPES.includes(type) && userTier === "free") {
      return res.status(403).json({
        success: false,
        error: "This feature requires a premium subscription",
        upgradeRequired: true,
      });
    }

    // ✅ Generate session ID
    let sessionId;
    const existingInteraction = await Interaction.findOne({
      pageId,
      videoId,
      userId,
      sessionEnded: false,
    }).sort({ createdAt: -1 });

    if (existingInteraction) {
      sessionId = existingInteraction.sessionId;
    } else {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ✅ Normalize data
    const normalizedData = {
      currentTime: Number(req.body.currentTime ?? data.currentTime ?? 0),
      duration: Number(req.body.totalDuration ?? data.duration ?? 0),
      playbackRate: Number(req.body.playbackRate ?? data.playbackRate ?? 1),
      volume: Number(req.body.volume ?? data.volume ?? 1),
      isMuted: Boolean(req.body.isMuted ?? data.isMuted ?? false),
    };

    // ✅ Rate limiting
    const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
    if (rateLimitMs > 0) {
      const recentInteraction = await Interaction.findOne({
        userId,
        type,
        videoId,
        pageId,
        eventTime: { $gte: new Date(Date.now() - rateLimitMs) },
      })
        .sort({ eventTime: -1 })
        .lean();

      if (recentInteraction) {
        const timeSinceLast =
          Date.now() - new Date(recentInteraction.eventTime).getTime();
        if (timeSinceLast < rateLimitMs) {
          const waitSeconds = Math.ceil((rateLimitMs - timeSinceLast) / 1000);
          return res.status(429).json({
            success: false,
            error: "Please wait before performing this action again",
            retryAfter: waitSeconds,
          });
        }
      }
    }

    // ✅ Create interaction payload
    const interactionPayload = {
      standardId,
      sessionId,
      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      type,
      eventTime,
      data: {
        currentTime: normalizedData.currentTime,
        duration: normalizedData.duration,
        playbackRate: normalizedData.playbackRate,
        volume: normalizedData.volume,
        isMuted: normalizedData.isMuted,
        ...(type === "video_seek" && {
          fromTime: Number(data.fromTime ?? null),
          toTime: Number(data.toTime ?? null),
          seekAmount: data.seekAmount
            ? Number(data.seekAmount)
            : data.toTime && data.fromTime
              ? Number(data.toTime - data.fromTime)
              : null,
          seekDirection:
            data.seekDirection ??
            (data.toTime > data.fromTime ? "forward" : "backward"),
        }),
        ...(type === "video_view" && {
          viewDuration: Number(data.viewDuration || 0),
          isAutoplay: Boolean(data.isAutoplay || false),
          completed: Boolean(data.completed || false),
        }),
        ...(type === "video_heartbeat" && {
          progress:
            normalizedData.duration > 0
              ? Math.round(
                  (normalizedData.currentTime / normalizedData.duration) * 100,
                )
              : 0,
          buffering: Boolean(data.buffering || false),
        }),
        ...(type === "video_quality_change" && {
          fromQuality: data.fromQuality,
          toQuality: data.toQuality,
          auto: Boolean(data.auto || false),
        }),
        ...(type === "video_speed_change" && {
          fromSpeed: Number(data.fromSpeed || 1),
          toSpeed: Number(data.toSpeed || 1),
        }),
        ...(type.match(/^(quiz|assignment|comment|question|note|bookmark)/) && {
          ...data,
        }),
      },
      deviceInfo: {
        userAgent:
          req.body.deviceInfo?.userAgent || req.get("User-Agent") || "Unknown",
        platform: req.body.deviceInfo?.platform || "unknown",
        screenResolution: req.body.deviceInfo?.screenResolution || "unknown",
        deviceType:
          req.body.deviceInfo?.deviceType ||
          getDeviceType(req.get("User-Agent")),
        timezone:
          req.body.deviceInfo?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: normalizeLanguage(req.body.deviceInfo?.language) || "en-US",
        ip: req.ip || req.connection.remoteAddress,
      },
      eventOccurredAt: eventTime,
      serverReceivedAt: new Date(),
    };

    // ✅ Save interaction
    const interaction = new Interaction(interactionPayload);
    await interaction.save();

    // ✅ Update user's last activity (fire and forget)
    User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
      $inc: { "analytics.totalInteractions": 1 },
    }).catch((err) => console.error("Failed to update user lastActive:", err));

    // ✅ Update analytics counters (fire and forget)
    updateAnalyticsCounters(
      type,
      subjectId,
      videoId,
      userId,
      normalizedData,
      data,
    ).catch((error) => {
      console.error(`❌ Analytics update failed for type ${type}:`, error);
    });

    // ✅ Update progress (fire and forget)
    updateUserProgress(
      currentTime,
      type,
      pageId,
      videoId,
      userId,
      totalDuration,
      chapterId,
      subjectId,
      standardId,
    ).catch((error) => {
      console.error(`❌ Progress update failed for type ${type}:`, error);
    });

    // ✅ Update watch time (fire and forget)
    actualWatchTimeProgress(
      currentTime,
      type,
      pageId,
      videoId,
      userId,
      totalDuration,
      chapterId,
      subjectId,
      standardId,
      watchTimeMs,
      playerEvents,
      false,
      interactionPayload.deviceInfo,
      sessionId,
    ).catch((error) => {
      console.error(`❌ Watch time update failed for type ${type}:`, error);
    });

    // ✅ Update daily analytics (fire and forget)
    updateDailyAnalytics(interactionPayload, normalizedData).catch((err) =>
      console.error("Background analytics update failed:", err),
    );

    // ✅ 🚀 NEW: Run all gamification background tasks (streak, badges, heatmap, insights)
    runAllBackgroundTasks(interactionPayload, normalizedData, {
      watchTimeMs,
      playerEvents,
    }).catch((err) => console.error("Gamification tasks failed:", err));

    // ✅ Get user progress for response
    let userProgress = null;
    let watchTimeData = null;

    if (pageId && videoId) {
      try {
        userProgress = await UserProgress.findOne(
          { userId, pageId },
          "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition",
        ).lean();

        watchTimeData = await WatchTime.findOne(
          { userId, videoId, page: pageId },
          "totalWatchedSeconds uniqueWatchedSeconds progress completed completionCount firstWatchedAt lastWatchedAt videoDuration",
        ).lean();
      } catch (progressError) {
        console.error("Error fetching progress:", progressError);
      }
    }

    // ✅ Get streak data for response
    let streakData = null;
    try {
      streakData = await StudentStreak.findOne(
        { studentId: userId },
        "currentStreak longestStreak lastActiveDate milestones streakFreeze",
      ).lean();
    } catch (streakError) {
      console.error("Error fetching streak:", streakError);
    }

    // ✅ Get badges for response
    let badges = [];
    try {
      badges = await StudentBadge.find({ userId })
        .populate("badgeId", "name description icon category")
        .sort("-earnedAt")
        .limit(5)
        .lean();
    } catch (badgeError) {
      console.error("Error fetching badges:", badgeError);
    }

    // ✅ SUCCESS RESPONSE - WITH ALL DATA
    return res.status(201).json({
      success: true,
      message: "Interaction tracked successfully",
      data: {
        interaction: {
          id: interaction._id,
          type: interaction.type,
          timestamp: interaction.eventOccurredAt || interaction.eventTime,
        },

        // 📊 Progress data
        progress: userProgress
          ? {
              completionPercentage: userProgress.completionPercentage || 0,
              isCompleted: userProgress.isCompleted || false,
              totalWatched: userProgress.totalWatched || 0,
              totalTimeSpent: userProgress.totalTimeSpent || 0,
              lastPosition: userProgress.lastPosition || 0,
              watchStatus:
                userProgress.completionPercentage >= 95
                  ? "completed"
                  : userProgress.completionPercentage >= 50
                    ? "in-progress"
                    : "started",
            }
          : null,

        // ⏱️ Watch time data
        watchTime: watchTimeData
          ? {
              totalWatchSeconds: watchTimeData.totalWatchedSeconds || 0,
              uniqueWatchSeconds: watchTimeData.uniqueWatchedSeconds || 0,
              progress: watchTimeData.progress || 0,
              completed: watchTimeData.completed || false,
              completionCount: watchTimeData.completionCount || 0,
              watchType:
                watchTimeData.completionCount > 1
                  ? "revision"
                  : watchTimeData.completed
                    ? "completed"
                    : "in-progress",
              firstWatched: watchTimeData.firstWatchedAt,
              lastWatched: watchTimeData.lastWatchedAt,
            }
          : null,

        // 🔥 Streak data
        streak: streakData
          ? {
              currentStreak: streakData.currentStreak,
              longestStreak: streakData.longestStreak,
              lastActiveDate: streakData.lastActiveDate,
              milestones:
                streakData.milestones
                  ?.filter((m) => m.badgeAwarded)
                  .map((m) => ({
                    days: m.days,
                    achievedAt: m.achievedAt,
                  })) || [],
              streakFreeze: {
                isActive: streakData.streakFreeze?.isActive || false,
                freezeCount: streakData.streakFreeze?.freezeCount || 0,
              },
            }
          : null,

        // 🏅 Badges (recent 5)
        badges: badges.map((b) => ({
          id: b.badgeId?._id,
          name: b.badgeId?.name,
          description: b.badgeId?.description,
          icon: b.badgeId?.icon,
          category: b.badgeId?.category,
          earnedAt: b.earnedAt,
        })),

        // 🎯 Milestone message if any
        milestone: streakData?.milestones?.find(
          (m) =>
            m.days === streakData.currentStreak &&
            new Date(m.achievedAt).toDateString() === new Date().toDateString(),
        )
          ? {
              message: `🎉 Congratulations! You've reached a ${streakData.currentStreak}-day streak!`,
              days: streakData.currentStreak,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    console.error("Error details:", error.errors || error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to track interaction",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const Interaction = require("../models/interaction");
const WatchSession = require("../models/watchSession");
const Video = require("../models/videoModel");
const WatchTime = require("../models/watchTimeSchema");
const UserProgress = require("../models/userProgressSchema");
const Course = require("../models/course");
const { v4: uuidv4 } = require("uuid");
const StandardSubject = require("../models/standardSubjectSchema");
const StandardChapter = require("../models/standardChapterScheema");
const StandardPage = require("../models/StandardPageScheema");
const DailyInteraction = require("../models/dailyInteraction");
const User = require("../models/loginUserModel");
const UserVideoProgress = require("../models/UserVideoProgressModel.js");
const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment.js");
const DailyUniqueUser = require("../models/dailyUniqueUserSchema.js");
const ProgressService = require("../services/progressService.js");
const StudentStreak = require("../models/StudentStreak.js");
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../models/StudentBadge.js");

const StudentHeatmap = require("../models/StudentHeatmap.js");
const StudentInsight = require("../models/StudentInsight.js");
const DailyActivity = require("../models/StudentActivity.js");
//ഒരു action എത്ര millisecond interval ന് ഒരിക്കൽ മാത്രം allow ചെയ്യണം.
//1000 ms = 1 secondMeaning: 👉 User 1 second ൽ ഒരിക്കൽ മാത്രം video play event trigger ചെയ്യാം.

//very important for me
// ======================================
// BACKEND: interactionController.js
// ======================================

// // Save single interaction
// exports.saveInteraction = async (req, res) => {
//   try {
//     const interaction = new Interaction(req.body);
//     await interaction.save();

//     // Also update session
//     await updateSessionWithInteraction(req.body);

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error saving interaction:', error);
//     res.status(500).json({ error: 'Failed to save interaction' });
//   }
// };

// Save multiple interactions (batch)
// Constants at the top
const VALID_INTERACTION_TYPES = [
  "video_play",
  "video_pause",
  "video_seek_forward",
  "video_seek_backward",
  "video_end",
  "video_seek",
  "video_view",
  "timeupdate",
  "video_quality_change",
  "video_speed_change",
  "video_mute",
  "video_unmute",
  "video_fullscreen",
  "video_exit_fullscreen",
  "video_picture_in_picture",
  "video_heartbeat",
  "video_caption_toggle",
  "chapter_view",
  "page_view",
  "course_enroll",
  "course_complete",
  "course_review",
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "assignment_view",
  "assignment_submit",
  "comment_add",
  "question_ask",
  "note_add",
  "note_update",
  "note_delete",
  "bookmark_add",
  "bookmark_remove",
  "search",
  "filter",
  "sort",
  "share",
];

const PREMIUM_TYPES = [
  "video_download",
  "course_certificate",
  "quiz_feedback",
  "assignment_review",
  "live_chat",
  "instructor_message",
];

// Constants at the top of interactionController.js
const RATE_LIMIT_CONFIG = {
  video_heartbeat: 10000, // 10 seconds
  video_play: 1000, // 1 second
  video_pause: 500, // 0.5 seconds
  video_resume: 500, // 0.5 seconds
  video_seek: 2000, // 2 seconds
  video_quality_change: 5000, // 5 seconds
  video_speed_change: 5000, // 5 seconds
  video_view: 0, // No limit
  video_like: 2000, // 2 seconds
  video_dislike: 2000, // 2 seconds
  video_bookmark: 1000, // 1 second
  comment_add: 3000, // 3 seconds
  note_add: 2000, // 2 seconds
  default: 500, // Default 500ms
};

// Helper function to get device type from user agent
const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    return "mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  return "desktop";
};

// Helper function to normalize language
const normalizeLanguage = (lang) => {
  if (!lang) return "en-US";
  // Add language normalization logic here if needed
  return lang;
};
// Add this at the top of your controller file

// ============================================
// NEW FUNCTION: Update Daily Analytics
// ============================================
// ============================================
// FIXED: Update Daily Analytics (Use correct model)
// ============================================
// Fixed updateDailyAnalytics function
const updateDailyAnalytics = async (interactionPayload, normalizedData) => {
  // console.log("normalizedData", normalizedData);
  try {
    const today = new Date().toISOString().split("T")[0]; //year-month-date formattil kittum
    console.log("today", today);
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;

    let watchDuration = 0;
    let segment = null;

    // Calculate segment and duration for heartbeat
    if (type === "video_heartbeat" && normalizedData.currentTime) {
      const segmentSize = 10; // 10 seconds per segment
      segment = Math.floor(normalizedData.currentTime / segmentSize);
      watchDuration = 10; // Assume 10 seconds watched
    }

    // 1️⃣ Update main analytics document
    const updateQuery = {
      $inc: {
        "metrics.totalViews": type === "video_view" ? 1 : 0,
        [`metrics.interactions.${type}`]: 1,
        "metrics.totalWatchTime": watchDuration,
      },
      $set: {
        lastUpdated: new Date(),
        standardId,
        subjectId,
        ...(videoId && { videoId }),
        ...(pageId && { pageId }),
        ...(chapterId && { chapterId }),
      },
    };

    // Handle video completion
    if (type === "video_complete") {
      updateQuery.$inc["metrics.completions"] = 1;
    }

    // Update or create daily analytics
    await DailyInteraction.findOneAndUpdate(
      {
        date: today,
        ...(videoId ? { videoId } : {}),
        ...(pageId ? { pageId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      updateQuery,
      { upsert: true },
    );

    // 2️⃣ FIXED HEATMAP: Update existing segment or push new one
    if (segment !== null && videoId) {
      // Try to update existing segment first
      const heatmapResult = await DailyInteraction.updateOne(
        {
          date: today,
          videoId,
          "metrics.watchSegments.segment": segment,
        },
        {
          $inc: {
            "metrics.watchSegments.$.watchCount": 1,
            "metrics.watchSegments.$.totalTime": watchDuration,
          },
        },
      );

      // If no segment existed, push new one
      if (heatmapResult.matchedCount === 0) {
        await DailyInteraction.updateOne(
          { date: today, videoId },
          {
            $push: {
              "metrics.watchSegments": {
                segment,
                watchCount: 1,
                totalTime: watchDuration,
              },
            },
          },
        );
      }
    }

    // 3️⃣ FIXED UNIQUE USERS: Use separate collection
    if (videoId) {
      const uniqueUserResult = await DailyUniqueUser.findOneAndUpdate(
        { date: today, videoId, userId },
        {
          $set: { lastSeen: new Date() },
          $inc: { interactions: 1 },
        },
        { upsert: true, new: true },
      );

      // Update the count in daily analytics
      const uniqueCount = await DailyUniqueUser.countDocuments({
        date: today,
        videoId,
      });

      await DailyInteraction.updateOne(
        { date: today, videoId },
        { $set: { "metrics.uniqueUserCount": uniqueCount } },
      );
    }

    // 4️⃣ Calculate derived metrics
    const doc = await DailyInteraction.findOne({
      date: today,
      ...(videoId && { videoId }),
    });

    if (doc) {
      doc.metrics.averageWatchTime =
        doc.metrics.totalWatchTime / (doc.metrics.totalViews || 1);
      doc.metrics.completionRate =
        (doc.metrics.completions / (doc.metrics.totalViews || 1)) * 100;
      await doc.save();
    }
  } catch (error) {
    console.error("❌ Daily analytics update failed:", error);
  }
};

exports.trackInteraction = async (req, res) => {
  try {
    const {
      type,
      subjectId,
      chapterId,
      pageId,
      videoId,
      eventISOTime,
      eventTime,

      data = {},
      currentTime,

      totalDuration,
      sectionId,
      lectureId,
      watchTimeMs,
      playerEvents = [],
    } = req.body;

    // 🔒 Get userId from authenticated user
    const userId = req.user._id;

    // ✅ Step 1: Basic validation
    if (!type || !subjectId) {
      return res.status(400).json({
        success: false,
        error: "type and subjectId are required",
      });
    }

    // ✅ Validate interaction type
    if (!VALID_INTERACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type: ${type}`,
        validTypes: VALID_INTERACTION_TYPES,
      });
    }
    // 📏 Get standard from subject
    const subjectDoc =
      await StandardSubject.findById(subjectId).select("standardId");
    if (!subjectDoc) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }
    const standardId = subjectDoc.standardId;
    const existingInteraction = await Interaction.findOne({
      pageId,
      videoId,
      userId,
      sessionEnded: false, // important
    }).sort({ createdAt: -1 });
    let sessionId;

    if (existingInteraction) {
      sessionId = existingInteraction.sessionId;
    } else {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    // ✅ Step 2: Validate user exists and is active
    const user = await User.findById(userId).select("isActive tier lastActive");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "User account is not active",
      });
    }

    // ✅ Step 3: Validate course exists (use lean() for better performance)
    const course = await StandardSubject.findById(subjectId)
      .select("title standardId")
      .lean();
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // ✅ Step 4: Validate video exists if provided
    if (videoId) {
      const videoExists = await Video.findById(videoId);

      if (!videoExists) {
        return res.status(404).json({
          success: false,
          error: "Video not found",
        });
      }
    }

    // 🔒 Premium features check user.tier എന്ന് പറയുന്നത് user ഏത് plan ആണെന്ന്
    //If user.tier ഇല്ലെങ്കിൽ → default ആയി "free" ആയി set ചെയ്യുന്നു.
    const userTier = user.tier || "free";
    if (PREMIUM_TYPES.includes(type) && userTier === "free") {
      return res.status(403).json({
        success: false,
        error: "This feature requires a premium subscription",
        upgradeRequired: true,
      });
    }

    // Normalize data for video interactions
    const normalizedData = {
      currentTime: Number(req.body.currentTime ?? data.currentTime ?? 0),
      duration: Number(req.body.totalDuration ?? data.duration ?? 0),
      playbackRate: Number(req.body.playbackRate ?? data.playbackRate ?? 1),
      volume: Number(req.body.volume ?? data.volume ?? 1),
      isMuted: Boolean(req.body.isMuted ?? data.isMuted ?? false),
    };

    // 🔒 Rate limiting check
    const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;

    if (rateLimitMs > 0) {
      // ✅ eventTime ഉപയോഗിക്കുക (createdAt അല്ല)
      const query = {
        userId,
        type,
        videoId,
        pageId,
        eventTime: { $gte: new Date(Date.now() - rateLimitMs) }, // ഇത് ശരി
      };

      const recentInteraction = await Interaction.findOne(query)
        .sort({ eventTime: -1 }) // eventTime അനുസരിച്ച് sort ചെയ്യുക
        .select("eventTime")
        .lean();

      if (recentInteraction) {
        const timeSinceLast =
          Date.now() - new Date(recentInteraction.eventTime).getTime();
        console.log("Time since last:", timeSinceLast, "ms");

        if (timeSinceLast < rateLimitMs) {
          const waitSeconds = Math.ceil((rateLimitMs - timeSinceLast) / 1000);
          return res.status(429).json({
            success: false,
            error: "Please wait before performing this action again",
            retryAfter: waitSeconds,
            lastInteraction: recentInteraction.eventTime,
          });
        }
      }
    }

    // ✅ Create interaction payload
    const interactionPayload = {
      standardId: course.standardId,
      sessionId,

      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      type,
      eventTime,

      // Data contains interaction metadata
      data: {
        currentTime: normalizedData.currentTime,
        duration: normalizedData.duration,
        playbackRate: normalizedData.playbackRate,
        volume: normalizedData.volume,
        isMuted: normalizedData.isMuted,
        //type "video_seek" ആണെങ്കിൽ മാത്രം
        //ഈ object add ചെയ്യുക
        //അല്ലെങ്കിൽ ഒന്നും ചെയ്യണ്ട
        // Type-specific data
        ...(type === "video_seek" && {
          fromTime: Number(data.fromTime ?? null),
          toTime: Number(data.toTime ?? null),
          seekAmount: data.seekAmount
            ? Number(data.seekAmount)
            : data.toTime && data.fromTime
              ? Number(data.toTime - data.fromTime)
              : null,
          seekDirection:
            data.seekDirection ??
            (data.toTime > data.fromTime ? "forward" : "backward"),
        }),

        ...(type === "video_view" && {
          viewDuration: Number(data.viewDuration || 0),
          isAutoplay: Boolean(data.isAutoplay || false),
          completed: Boolean(data.completed || false),
        }),

        ...(type === "video_heartbeat" && {
          progress:
            normalizedData.duration > 0
              ? Math.round(
                  (normalizedData.currentTime / normalizedData.duration) * 100,
                )
              : 0,
          buffering: Boolean(data.buffering || false),
        }),

        ...(type === "video_quality_change" && {
          fromQuality: data.fromQuality,
          toQuality: data.toQuality,
          auto: Boolean(data.auto || false),
        }),

        ...(type === "video_speed_change" && {
          fromSpeed: Number(data.fromSpeed || 1),
          toSpeed: Number(data.toSpeed || 1),
        }),

        ...(type.match(/^(quiz|assignment|comment|question|note|bookmark)/) && {
          ...data, // Include all data for these types
        }),
      },

      // Device information
      deviceInfo: {
        userAgent:
          req.body.deviceInfo?.userAgent || req.get("User-Agent") || "Unknown",
        platform: req.body.deviceInfo?.platform || "unknown",
        screenResolution: req.body.deviceInfo?.screenResolution || "unknown",
        deviceType:
          req.body.deviceInfo?.deviceType ||
          getDeviceType(req.get("User-Agent")),
        timezone:
          req.body.deviceInfo?.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: normalizeLanguage(req.body.deviceInfo?.language) || "en-US",
        ip: req.ip || req.connection.remoteAddress,
      },

      // Timestamps
      eventOccurredAt: eventTime,
      serverReceivedAt: new Date(),
    };

    // ✅ Create and save interaction
    const interaction = new Interaction(interactionPayload);
    await interaction.save();
    // 🔥 NEW: Update daily analytics (non-blocking)
    updateDailyAnalytics(interactionPayload, normalizedData).catch((err) =>
      console.error("Background analytics update failed:", err),
    );
    // ✅ Update user's last activity (no await - fire and forget)
    User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
      $inc: { "analytics.totalInteractions": 1 },
    }).catch((err) => console.error("Failed to update user lastActive:", err));

    // ✅ Update analytics counters (async - don't await)
    updateAnalyticsCounters(
      type,
      subjectId,
      videoId,
      userId,
      normalizedData,
      data,
    ).catch((error) => {
      console.error(`❌ Analytics update failed for type ${type}:`, error);
    });

    // ✅ Update progress (async - don't await)
    updateUserProgress(
      normalizedData.currentTime,
      type,
      pageId,
      videoId,
      userId,
      normalizedData.duration,
      chapterId,
      subjectId,
      course.standardId,
    ).catch((error) => {
      console.error(`❌ Progress update failed for type ${type}:`, error);
    });
    actualWatchTimeProgress(
      currentTime,
      type,
      pageId,
      videoId,
      userId,
      totalDuration,
      chapterId,
      subjectId,
      standardId,
      watchTimeMs,
      playerEvents, // ✅ correct
      false, // ✅ correct
    ).catch((error) => {
      console.error(`❌ Progress update failed for type ${type}:`, error);
    });

    // ✅ Special handling for specific event types (async operations)
    let additionalData = {};
    const promises = [];

    switch (type) {
      case "course_enroll":
        promises.push(
          StandardSubject.findByIdAndUpdate(subjectId, {
            $addToSet: { enrolledUsers: userId },
            $inc: { "analytics.totalEnrollments": 1 },
          }).catch((err) =>
            console.error("Failed to update course enrollment:", err),
          ),
        );
        promises.push(
          User.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: subjectId },
          }).catch((err) =>
            console.error("Failed to update user enrollments:", err),
          ),
        );
        additionalData.enrollment = {
          courseTitle: course.title,
          enrolledAt: new Date(),
        };
        break;

      case "course_complete":
        promises.push(
          User.findByIdAndUpdate(userId, {
            $addToSet: { completedCourses: subjectId },
            $inc: { "analytics.completedCourses": 1 },
          }).catch((err) =>
            console.error("Failed to update user completions:", err),
          ),
        );
        additionalData.completion = {
          courseTitle: course.title,
          completedAt: new Date(),
          certificateEligible: true,
        };
        break;

      case "video_end":
        additionalData.videoEnded = {
          videoId,
          endedAt: new Date(),
          totalDuration: normalizedData.duration || 0,
          watchedPercentage: normalizedData.duration > 0 ? 100 : 0,
        };
        break;

      case "video_view":
        if (data.completed) {
          // If video is marked as completed, update user progress
          promises.push(
            User.findByIdAndUpdate(userId, {
              $addToSet: { "progress.completedVideos": videoId },
            }).catch((err) =>
              console.error("Failed to update video completion:", err),
            ),
          );
        }
        break;
    }

    // Execute all promises in parallel (fire and forget)
    if (promises.length > 0) {
      Promise.all(promises).catch((err) =>
        console.error("Error in background operations:", err),
      );
    }

    // Get analytics counts (with timeout to avoid blocking)
    // Get analytics counts (with timeout)
    const analyticsPromise = Promise.all([
      Interaction.countDocuments({ userId }).catch(() => 0),
      Interaction.countDocuments({ subjectId, userId }).catch(() => 0),
    ]).catch(() => [0, 0]);

    // 🔥 Get user progress
    let userProgress = null;
    let watchTimeData = null; // 👈 NEW

    if (pageId && videoId) {
      try {
        // Get progress
        userProgress = await UserProgress.findOne(
          { userId, pageId },
          "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition watchedRanges pageSessions duration",
        ).lean();

        // 👇 NEW: Get watch time data
        watchTimeData = await WatchTime.findOne(
          { userId, videoId, page: pageId },
          "totalWatchedSeconds uniqueWatchedSeconds progress completed completionCount firstWatchedAt lastWatchedAt videoDuration",
        ).lean();

        // Calculate additional metrics for progress
        if (userProgress) {
          userProgress.sessionCount = userProgress.pageSessions?.length || 0;
          const lastSession =
            userProgress.pageSessions?.[userProgress.pageSessions.length - 1];
          userProgress.lastSessionTime = lastSession?.startTime || null;

          if (userProgress.pageSessions?.length > 0) {
            const totalSessionTime = userProgress.pageSessions.reduce(
              (sum, session) => sum + (session.timeSpent || 0),
              0,
            );
            userProgress.avgSessionDuration = Math.round(
              totalSessionTime / userProgress.pageSessions.length,
            );
          }

          // Clean up
          delete userProgress.watchedRanges;
          delete userProgress.pageSessions;
        }
      } catch (progressError) {
        console.error("Error fetching progress:", progressError);
      }
    }

    // Timeout for analytics
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve([0, 0]), 500),
    );
    const [totalInteractions, totalCourseInteractions] = await Promise.race([
      analyticsPromise,
      timeoutPromise,
    ]);

    // ✅ SUCCESS RESPONSE - WITH ALL DATA
    res.status(201).json({
      success: true,
      message: "Interaction tracked successfully",
      data: {
        interaction: {
          id: interaction._id,
          type: interaction.type,
          timestamp: interaction.eventOccurredAt || interaction.eventTime,
        },
        analytics: {
          totalInteractions,
          totalCourseInteractions,
        },
        // 👇 PROGRESS DATA
        progress: userProgress
          ? {
              completionPercentage: userProgress.completionPercentage || 0,
              isCompleted: userProgress.isCompleted || false,
              totalWatched: userProgress.totalWatched || 0,
              totalTimeSpent: userProgress.totalTimeSpent || 0,
              lastPosition: userProgress.lastPosition || 0,
              sessionCount: userProgress.sessionCount || 0,
              avgSessionDuration: userProgress.avgSessionDuration || 0,
              lastSessionTime: userProgress.lastSessionTime,
              watchStatus:
                userProgress.completionPercentage >= 95
                  ? "completed"
                  : userProgress.completionPercentage >= 50
                    ? "in-progress"
                    : "started",
              remainingTime: userProgress.duration
                ? Math.max(
                    0,
                    userProgress.duration - (userProgress.totalWatched || 0),
                  )
                : 0,
            }
          : null,
        // 👇 WATCH TIME DATA
        watchTime: watchTimeData
          ? {
              totalWatchSeconds: watchTimeData.totalWatchedSeconds || 0,
              uniqueWatchSeconds: watchTimeData.uniqueWatchedSeconds || 0,
              progress: watchTimeData.progress || 0,
              completed: watchTimeData.completed || false,
              completionCount: watchTimeData.completionCount || 0,
              watchType:
                watchTimeData.completionCount > 1
                  ? "revision"
                  : watchTimeData.completed
                    ? "completed"
                    : "in-progress",
              firstWatched: watchTimeData.firstWatchedAt,
              lastWatched: watchTimeData.lastWatchedAt,
              videoDuration: watchTimeData.videoDuration || 0,
            }
          : null,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    console.error("Error details:", error.errors || error.message);

    res.status(500).json({
      success: false,
      error: "Failed to track interaction",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Updated analytics counters function
const updateAnalyticsCounters = async (
  type,
  subjectId,
  videoId,
  userId,
  normalizedData,
  additionalData = {},
) => {
  try {
    // Update based on type
    switch (type) {
      case "video_play":
      case "video_pause":
      case "video_end":
      case "video_seek":
      case "video_heartbeat":
        // Update video analytics
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { [`analytics.${type}`]: 1 },
            $set: { "analytics.lastActivity": new Date() },
          });
        }
        break;

      case "video_view":
        if (videoId) {
          const update = {
            $inc: { "analytics.totalViews": 1 },
            $addToSet: { "analytics.uniqueViewers": userId },
            $set: { "analytics.lastView": new Date() },
          };

          // Update total watch time
          if (additionalData.viewDuration) {
            update.$inc["analytics.totalWatchTime"] =
              additionalData.viewDuration;
          }

          await Video.findByIdAndUpdate(videoId, update);
        }
        break;

      case "video_quality_change":
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { "analytics.qualityChanges": 1 },
            $push: {
              "analytics.qualityHistory": {
                userId,
                from: additionalData.fromQuality,
                to: additionalData.toQuality,
                timestamp: new Date(),
              },
            },
          });
        }
        break;

      // Add more cases as needed for other interaction types
    }

    // Update subject (course) analytics
    await StandardSubject.findByIdAndUpdate(subjectId, {
      $inc: { [`analytics.interactions.${type}`]: 1 },
      $set: { "analytics.lastInteraction": new Date() },
    });
  } catch (error) {
    console.error("Error updating analytics counters:", error);
    // Don't throw - analytics should not fail main request
  }
};
// ✅ Progress update function - FOR BACKGROUND USE (no req/res)
// ✅ Progress update function - FOR BACKGROUND USE (no req/res)
const updateUserProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
) => {
  try {
    const action = type;

    // 1️⃣ Basic validation
    if (!pageId || !videoId || !userId) {
      console.log("❌ Missing required fields:", { pageId, videoId, userId });
      return;
    }
    console.log("Type of videoId:", typeof videoId);
    // 2️⃣ Validate video exists
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) {
      console.log("❌ Video not found here bro:", videoId);
      return;
    }

    const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
    const now = new Date();
    const validatedTime = Math.min(
      parseFloat(currentTime) || 0,
      lectureDuration,
    );

    // 3️⃣ Find or create progress
    let progress = await UserProgress.findOne({ userId, pageId });

    if (!progress) {
      // 🆕 Create new progress document (schema അനുസരിച്ച്)
      progress = new UserProgress({
        chapterId,
        subjectId,
        standardId,
        userId,
        pageId,
        videoId,
        duration: lectureDuration,
        lastPosition: 0,
        completionPercentage: 0,
        isCompleted: false,
        watchedRanges: [],
        pageSessions: [
          {
            startTime: now,
            endTime: null,
            timeSpent: 0,
          },
        ],
      });

      await progress.save();
    } else {
      // 🔄 Update existing progress

      // Check if this is a new session (30 minutes gap)
      const lastSession =
        progress.pageSessions[progress.pageSessions.length - 1];
      const timeSinceLastSession = lastSession?.endTime
        ? (now - lastSession.endTime) / 1000 / 60 // in minutes
        : 0;

      if (!lastSession?.endTime || timeSinceLastSession > 30) {
        // New session
        progress.pageSessions.push({
          startTime: now,
          endTime: null,
          timeSpent: 0,
        });
        console.log("🆕 New session started");
      }
    }

    // Get current session
    const currentSession =
      progress.pageSessions[progress.pageSessions.length - 1];
    const previousPosition = progress.lastPosition || 0;

    // 4️⃣ Handle different actions
    switch (action) {
      case "play":
      case "video_play":
        console.log(`▶️ Play at ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Session already started, just update
        if (!currentSession.startTime) {
          currentSession.startTime = now;
        }
        break;

      case "pause":
      case "video_pause":
        console.log(`⏸️ Pause at ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Add watched range if valid (anti-cheat)
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 300) {
            // Max 5 minutes
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }

        // Update session time
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000; // in seconds
        }
        break;

      case "seek":
        console.log(`⏩ Seek: ${previousPosition}s → ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Check for rapid seeking (anti-cheat)
        checkRapidSeek(progress, previousPosition, validatedTime, now);
        break;

      case "timeupdate":
      case "video_heartbeat":
        // Regular progress update
        progress.lastPosition = validatedTime;

        // Add watched range if valid
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 120) {
            // Max 2 minutes for heartbeat
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
              action,
            );
          }
        }
        break;

      case "end":
      case "video_end":
        console.log(`🏁 Video end at ${validatedTime}s`);
        progress.lastPosition = validatedTime;

        // Add final watched range
        if (
          validatedTime > previousPosition &&
          validatedTime - previousPosition <= 10
        ) {
          addWatchedRange(
            progress,
            previousPosition,
            validatedTime,
            lectureDuration,
            "end",
          );
        }

        // End current session
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }

        // Check if video is completed
        checkVideoCompletion(progress, lectureDuration);
        break;

      default:
        console.log("Unknown action:", action);
    }

    // 5️⃣ Calculate total watched time from ranges
    progress.totalWatched = calculateTotalWatched(
      progress.watchedRanges,
      lectureDuration,
    );

    // 6️⃣ Calculate completion percentage
    if (lectureDuration > 0) {
      const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
      progress.completionPercentage = Math.min(100, Math.round(rawPercentage));

      // Auto-mark as completed if >95% watched
      if (!progress.isCompleted && progress.completionPercentage >= 95) {
        progress.isCompleted = true;
        console.log(`🎉 Video completed! ${progress.completionPercentage}%`);
      }
    }

    // 7️⃣ Calculate total time spent on this page (all sessions)
    progress.totalTimeSpent = progress.pageSessions.reduce(
      (total, session) => total + (session.timeSpent || 0),
      0,
    );

    // 8️⃣ Save progress
    await progress.save();

    console.log(`✅ Progress saved:`, {
      userId,
      pageId,
      completion: `${progress.completionPercentage}%`,
      totalWatched: `${progress.totalWatched.toFixed(2)}s`,
      totalTimeSpent: `${progress.totalTimeSpent.toFixed(2)}s`,
      sessions: progress.pageSessions.length,
    });
  } catch (error) {
    console.error("❌ Error in updateUserProgress:", error);
    // Don't throw - background operation
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * 🎯 Add watched range with anti-cheat
 */
function addWatchedRange(progress, start, end, maxDuration, action) {
  // Anti-cheat validations
  if (action === "seek") {
    console.log(`🚫 Seek - range add ചെയ്യുന്നില്ല`);
    return false;
  }

  const rangeSize = end - start;

  // Suspicious checks
  if (rangeSize > 30) {
    console.log(`🚫 Large jump: ${rangeSize.toFixed(2)}s > 30s`);
    return false;
  }

  if (rangeSize > maxDuration * 0.8) {
    console.log(`🚫 Watched >80% at once`);
    return false;
  }

  if (start < 0 || end > maxDuration || end <= start || rangeSize < 0.5) {
    return false;
  }

  // Add range
  const newRange = {
    start: parseFloat(start.toFixed(2)),
    end: parseFloat(end.toFixed(2)),
  };

  // Check if this range overlaps with existing ones
  let merged = false;
  for (const existing of progress.watchedRanges) {
    if (
      newRange.start <= existing.end + 2 &&
      newRange.end >= existing.start - 2
    ) {
      existing.start = Math.min(existing.start, newRange.start);
      existing.end = Math.max(existing.end, newRange.end);
      merged = true;
      break;
    }
  }

  if (!merged) {
    progress.watchedRanges.push(newRange);
  }

  // Sort ranges
  progress.watchedRanges.sort((a, b) => a.start - b.start);

  console.log(
    `✅ Range added: ${newRange.start} → ${newRange.end} (${rangeSize.toFixed(2)}s)`,
  );
  return true;
}

/**
 * 🎯 Calculate total unique watched time
 */
function calculateTotalWatched(ranges, duration) {
  if (!ranges || ranges.length === 0) return 0;

  let totalWatched = 0;
  let lastEnd = -1;

  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

  for (const range of sortedRanges) {
    const start = Math.max(0, Math.min(range.start, duration));
    const end = Math.max(0, Math.min(range.end, duration));

    if (end <= start) continue;

    if (start > lastEnd) {
      totalWatched += end - start;
      lastEnd = end;
    } else if (end > lastEnd) {
      totalWatched += end - lastEnd;
      lastEnd = end;
    }
  }

  return parseFloat(totalWatched.toFixed(2));
}

/**
 * 🎯 Check for rapid seeking (anti-cheat)
 */
function checkRapidSeek(progress, from, to, now) {
  if (!progress.seekHistory) {
    progress.seekHistory = [];
  }

  progress.seekHistory.push({
    from,
    to,
    delta: Math.abs(to - from),
    timestamp: now,
  });

  // Keep last 10 seeks
  if (progress.seekHistory.length > 10) {
    progress.seekHistory = progress.seekHistory.slice(-10);
  }

  // Check for rapid seeking: 5 seeks in 30 seconds
  const recentSeeks = progress.seekHistory.slice(-5);
  if (recentSeeks.length === 5) {
    const timeSpan = (now - recentSeeks[0].timestamp) / 1000;
    if (timeSpan < 30) {
      console.log(`⚠️ Rapid seeking detected: ${timeSpan}s-ൽ 5 seeks`);
      progress.rapidSeeking = true;
    }
  }
}

/**
 * 🎯 Check if video is completed
 */
function checkVideoCompletion(progress, duration) {
  if (duration === 0) return false;

  const watched = calculateTotalWatched(progress.watchedRanges, duration);
  const percentage = (watched / duration) * 100;

  if (percentage >= 90 && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
    console.log(`🎉 First time completion at ${percentage.toFixed(1)}%`);
    return true;
  }

  return false;
}
// ✅ FIXED: Actual watch time progress - BACKGROUND USE ONLY (no res)
const actualWatchTimeProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
  watchTimeMs,
  playerEvents = [],
  isPreview = false,
  deviceInfo,
  sessionId,
) => {
  try {
    // 🔒 Validation
    if (!watchTimeMs || !videoId || !userId) {
      console.log("❌ Missing required fields for watch time:", {
        videoId,
        userId,
        watchTimeMs,
      });
      return;
    }

    // ⏱️ Accurate watch time (convert ms to seconds)
    const watchedSeconds = Math.round(watchTimeMs / 1000);

    if (watchedSeconds < 3) {
      console.log("⏱️ Watch time too short, skipping");
      return;
    }

    // 📊 Progress calculation
    const progress =
      totalDuration && totalDuration > 0
        ? Number(((currentTime / totalDuration) * 100).toFixed(1))
        : 0;

    // ===== 🔍 FIND OR CREATE WATCH TIME =====
    let watchTime = await WatchTime.findOne({
      userId,
      videoId,
      page: pageId,
    });

    const isFirstTime = !watchTime;
    const isCompletingNow = !watchTime?.completed && progress >= 90;

    // ===== 🎯 ANTI-CHEAT =====
    let validWatchedSeconds = watchedSeconds;

    if (watchTime) {
      // Don't count if large jump (>30 seconds)
      if (currentTime - watchTime.lastPosition > 30) {
        console.log(
          `🚫 Anti-cheat: Large jump (${currentTime - watchTime.lastPosition}s)`,
        );
        validWatchedSeconds = 0;
      }

      // Don't count if seeking backwards
      if (currentTime < watchTime.lastPosition) {
        console.log(`⏪ Seeking backwards, not counting`);
        validWatchedSeconds = 0;
      }
    }

    // ===== 📝 UPDATE WATCH TIME =====
    const updateData = {
      $set: {
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        lastPosition: currentTime,
        lastWatchedAt: new Date(),
        progress,
        isPreview,
      },
      $inc: {
        totalWatchedSeconds: validWatchedSeconds,
      },
      $setOnInsert: {
        firstWatchedAt: new Date(),
        videoDuration: totalDuration,
        hierarchyPath: {
          standard: standardId,
          subject: subjectId,
          chapter: chapterId,
          page: pageId,
          video: videoId,
        },
      },
    };

    // 🎯 Handle unique watch seconds
    if (isFirstTime) {
      updateData.$inc.uniqueWatchedSeconds = validWatchedSeconds;
    } else {
      const lastPosition = watchTime?.lastPosition || 0;
      if (currentTime > lastPosition) {
        const uniqueSeconds = Math.min(
          validWatchedSeconds,
          currentTime - lastPosition,
        );
        updateData.$inc.uniqueWatchedSeconds = uniqueSeconds;
      }
    }

    // 🏆 Handle completion
    if (isCompletingNow) {
      updateData.$set.completed = true;
      updateData.$set.completedAt = new Date();
      updateData.$inc.completionCount = 1;
    }

    // Execute update
    watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, page: pageId },
      updateData,
      {
        upsert: true,
        new: true,
        select:
          "lastPosition totalWatchedSeconds uniqueWatchedSeconds progress completed videoDuration firstWatchedAt completionCount",
      },
    );

    console.log("📊 WatchTime updated:", {
      videoId,
      totalWatched: watchTime.totalWatchedSeconds,
      uniqueWatched: watchTime.uniqueWatchedSeconds,
      completed: watchTime.completed,
      progress: watchTime.progress,
    });

    // ===== 📝 CREATE WATCH SESSION =====
    if (watchTime) {
      const finalSessionId =
        sessionId ||
        `session_${userId}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionStartTime = Math.max(0, currentTime - validWatchedSeconds);

      const session = new WatchSession({
        sessionId: finalSessionId,
        userId,
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        startedAt: new Date(Date.now() - watchTimeMs),
        endedAt: new Date(),
        startPosition: sessionStartTime,
        endPosition: currentTime,
        videoDuration: totalDuration,
        watchTimeMs,
        watchedSeconds: validWatchedSeconds,
        isPreview,
        isUnique: isFirstTime,
        progress,
        completed: isCompletingNow,
        deviceInfo: deviceInfo || {},
        playerEvents: playerEvents || [],
        engagementScore: calculateEngagementScore(
          playerEvents,
          validWatchedSeconds,
          totalDuration,
        ),
      });

      // Fire and forget
      session
        .save()
        .catch((err) => console.error("❌ Session save failed:", err.message));
    }

    console.log(`✅ Watch time updated for user ${userId}, video ${videoId}`);
    return watchTime; // Optional: return for chaining
  } catch (error) {
    console.error("❌ Watch time error:", error);
    // Don't throw - background operation
  }
};
/**
 * 🎯 Helper: Calculate engagement score
 */
function calculateEngagementScore(playerEvents, watchedSeconds, totalDuration) {
  if (!playerEvents || playerEvents.length === 0) return 50;

  let score = 50; // Base score

  // Count interactions
  const pauseCount = playerEvents.filter((e) => e.type === "pause").length;
  const seekCount = playerEvents.filter((e) => e.type === "seek").length;

  // Penalize excessive seeking
  if (seekCount > 5) score -= 10;
  if (seekCount > 10) score -= 10;

  // Reward watching most of video
  if (totalDuration > 0) {
    const watchRatio = watchedSeconds / totalDuration;
    if (watchRatio > 0.9) score += 20;
    else if (watchRatio > 0.7) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
// Helper: Format milliseconds to readable time
function formatMs(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
