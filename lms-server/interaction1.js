// ==============================================
// COMPLETE INTERACTION CONTROLLER
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
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../models/StudentBadge.js");
const StudentHeatmap = require("../models/StudentHeatmap.js");
const StudentInsight = require("../models/StudentInsight.js");
const DailyActivity = require("../models/StudentActivity.js");
const mongoose = require("mongoose");

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
  video_heartbeat: 10000, // 10 seconds
  video_play: 1000, // 1 second
  video_pause: 500, // 0.5 seconds
  video_seek: 2000, // 2 seconds
  video_quality_change: 5000, // 5 seconds
  video_speed_change: 5000, // 5 seconds
  video_view: 0, // No limit
  comment_add: 3000, // 3 seconds
  note_add: 2000, // 2 seconds
  default: 500, // Default 500ms
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

const normalizeLanguage = (lang) => lang || "en-US";

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

const calculateEngagementScore = (
  playerEvents,
  watchedSeconds,
  totalDuration,
) => {
  if (!playerEvents || playerEvents.length === 0) return 50;
  let score = 50;
  const seekCount = playerEvents.filter((e) => e.type === "seek").length;
  if (seekCount > 5) score -= 10;
  if (seekCount > 10) score -= 10;
  if (totalDuration > 0) {
    const watchRatio = watchedSeconds / totalDuration;
    if (watchRatio > 0.9) score += 20;
    else if (watchRatio > 0.7) score += 10;
  }
  return Math.min(100, Math.max(0, score));
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
    if (isValidForStreak(type, data)) dailyActivity.isValidLearningDay = true;

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

    if (type === "video_complete") {
      updateQuery.$inc["metrics.completions"] = 1;
    }

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
        engagementScore: calculateEngagementScore(
          playerEvents,
          validWatchedSeconds,
          totalDuration,
        ),
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

// 8️⃣ UPDATE USER PROGRESS (with anti-cheat)
// const updateUserProgress = async (
//   currentTime,
//   type,
//   pageId,
//   videoId,
//   userId,
//   totalDuration,
//   chapterId,
//   subjectId,
//   standardId,
// ) => {
//   try {
//     const action = type;

//     if (!pageId || !videoId || !userId) return;

//     const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
//     if (!video) return;

//     const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
//     const now = new Date();
//     const validatedTime = Math.min(
//       parseFloat(currentTime) || 0,
//       lectureDuration,
//     );

//     let progress = await UserProgress.findOne({ userId, pageId });

//     if (!progress) {
//       progress = new UserProgress({
//         chapterId,
//         subjectId,
//         standardId,
//         userId,
//         pageId,
//         videoId,
//         duration: lectureDuration,
//         lastPosition: 0,
//         completionPercentage: 0,
//         isCompleted: false,
//         watchedRanges: [],
//         pageSessions: [{ startTime: now, endTime: null, timeSpent: 0 }],
//       });
//       await progress.save();
//     } else {
//       const lastSession =
//         progress.pageSessions[progress.pageSessions.length - 1];

//       // അവസാന session active ആണോ (endTime ഇല്ല) എന്ന് നോക്കുക
//       if (!lastSession?.endTime) {
//         // ഇപ്പോഴും active ആണ്, പുതിയ session വേണ്ട
//         console.log("Same session continuing");
//       } else {
//         // endTime ഉണ്ട്, എത്ര gap എന്ന് നോക്കുക
//         const timeSinceLastSession = (now - lastSession.endTime) / 1000 / 60;

//         if (timeSinceLastSession > 30) {
//           // 30 മിനിറ്റ് കഴിഞ്ഞു, പുതിയ session
//           progress.pageSessions.push({
//             startTime: now,
//             endTime: null,
//             timeSpent: 0,
//           });
//         }
//       }
//     }

//     const currentSession =
//       progress.pageSessions[progress.pageSessions.length - 1];
//     const previousPosition = progress.lastPosition || 0;

//    const addWatchedRange = (progress, start, end, maxDuration, action) => {
//      if (action === "seek") return false;

//      // Validations
//      if (start < 0 || end > maxDuration || end <= start) return false;

//      const newRange = {
//        start: parseFloat(start.toFixed(2)),
//        end: parseFloat(end.toFixed(2)),
//      };

//      // Merge with existing ranges
//      let merged = false;
//      for (let i = 0; i < progress.watchedRanges.length; i++) {
//        const existing = progress.watchedRanges[i];

//        // Check if ranges overlap or are adjacent (no gap)
//        if (newRange.start <= existing.end && newRange.end >= existing.start) {
//          existing.start = Math.min(existing.start, newRange.start);
//          existing.end = Math.max(existing.end, newRange.end);

//          // Check if this merged range now overlaps with next ranges
//          while (
//            i + 1 < progress.watchedRanges.length &&
//            existing.end >= progress.watchedRanges[i + 1].start
//          ) {
//            existing.end = Math.max(
//              existing.end,
//              progress.watchedRanges[i + 1].end,
//            );
//            progress.watchedRanges.splice(i + 1, 1);
//          }

//          merged = true;
//          break;
//        }
//      }

//      if (!merged) progress.watchedRanges.push(newRange);

//      // Sort
//      progress.watchedRanges.sort((a, b) => a.start - b.start);

//      return true;
//    };

//     const calculateTotalWatched = (ranges, duration) => {
//       if (!ranges || ranges.length === 0) return 0;
//       let totalWatched = 0;
//       let lastEnd = -1;
//       const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
//       for (const range of sortedRanges) {
//         const start = Math.max(0, Math.min(range.start, duration));
//         const end = Math.max(0, Math.min(range.end, duration));
//         if (end <= start) continue;
//         if (start > lastEnd) {
//           totalWatched += end - start;
//           lastEnd = end;
//         } else if (end > lastEnd) {
//           totalWatched += end - lastEnd;
//           lastEnd = end;
//         }
//       }
//       return parseFloat(totalWatched.toFixed(2));
//     };

//     switch (action) {
//       case "play":
//       case "video_play":
//         progress.lastPosition = validatedTime;
//         if (!currentSession.startTime) currentSession.startTime = now;
//         break;

//       case "pause":
//       case "video_pause":
//         progress.lastPosition = validatedTime;
//         if (validatedTime > previousPosition) {
//           const delta = validatedTime - previousPosition;
//           if (delta > 0.5 && delta <= 300) {
//             addWatchedRange(
//               progress,
//               previousPosition,
//               validatedTime,
//               lectureDuration,
//               action,
//             );
//           }
//         }
//         if (currentSession.startTime && !currentSession.endTime) {
//           currentSession.endTime = now;
//           currentSession.timeSpent = (now - currentSession.startTime) / 1000;
//         }
//         break;

//       case "seek":
//         progress.lastPosition = validatedTime;
//         break;

//       case "timeupdate":
//       case "video_heartbeat":
//         progress.lastPosition = validatedTime;
//         if (validatedTime > previousPosition) {
//           const delta = validatedTime - previousPosition;
//           if (delta > 0.5 && delta <= 120) {
//             addWatchedRange(
//               progress,
//               previousPosition,
//               validatedTime,
//               lectureDuration,
//               action,
//             );
//           }
//         }
//         break;

//       case "end":
//       case "video_end":
//         progress.lastPosition = validatedTime;
//         if (
//           validatedTime > previousPosition &&
//           validatedTime - previousPosition <= 10
//         ) {
//           addWatchedRange(
//             progress,
//             previousPosition,
//             validatedTime,
//             lectureDuration,
//             "end",
//           );
//         }
//         if (currentSession.startTime && !currentSession.endTime) {
//           currentSession.endTime = now;
//           currentSession.timeSpent = (now - currentSession.startTime) / 1000;
//         }
//         break;
//     }

//     progress.totalWatched = calculateTotalWatched(
//       progress.watchedRanges,
//       lectureDuration,
//     );

//     if (lectureDuration > 0) {
//       const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
//       progress.completionPercentage = Math.min(100, Math.round(rawPercentage));
//       if (!progress.isCompleted && progress.completionPercentage >= 95) {
//         progress.isCompleted = true;
//       }
//     }

//     progress.totalTimeSpent = progress.pageSessions.reduce(
//       (total, session) => total + (session.timeSpent || 0),
//       0,
//     );
//     await progress.save();
//   } catch (error) {
//     console.error("❌ Error in updateUserProgress:", error);
//   }
// };
// Configuration Constants
const PROGRESS_CONFIG = {
  SAVE_THROTTLE_MS: 10000, // Save every 10 seconds
  COMPLETION_THRESHOLD: 95, // 95% = completed
  SESSION_GAP_MINUTES: 30, // 30 min gap = new session
  SESSION_GAP_MS: 30 * 60 * 1000, // 30 minutes in milliseconds
  MIN_WATCH_DELTA: 0.5, // Minimum watch time to record
  MAX_HEARTBEAT_DELTA: 120, // Max heartbeat gap (2 min)
  MAX_PAUSE_DELTA: 300, // Max pause gap (5 min)
  MAX_END_DELTA: 10, // Max end gap (10 sec)
  BATCH_SIZE: 100, // Batch update size
  MAX_RANGES_BEFORE_COMPRESS: 50, // Compress if ranges exceed this
};

// In-memory throttle tracking (instead of Redis)
const throttleMap = new Map();
const batchQueue = [];
let batchTimer = null;

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

    // 1️⃣ Early validation
    if (!pageId || !videoId || !userId) return;

    // 2️⃣ Get video from DB (simplified)
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) return;

    const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
    const now = new Date();
    const validatedTime = Math.min(
      parseFloat(currentTime) || 0,
      lectureDuration,
    );

    // 3️⃣ Get progress from DB
    let progress = await UserProgress.findOne({ userId, pageId });
    let isModified = false;

    // 4️⃣ Create new progress if not exists
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
        totalTimeSpent: 0,
        totalWatched: 0,
      });
      isModified = true;
    } else {
      // 5️⃣ Session management
      const sessionResult = manageSession(progress, now);
      isModified = isModified || sessionResult.modified;
    }

    const currentSession =
      progress.pageSessions[progress.pageSessions.length - 1];
    const previousPosition = progress.lastPosition || 0;

    // 6️⃣ Add watched range
    const rangeAdded = addWatchedRange(
      progress,
      previousPosition,
      validatedTime,
      lectureDuration,
      action,
    );
    isModified = isModified || rangeAdded;

    // 7️⃣ Handle different actions
    const actionResult = handleAction(
      action,
      progress,
      validatedTime,
      previousPosition,
      currentSession,
      now,
    );
    isModified = isModified || actionResult.modified;

    // 8️⃣ Calculate total watched (only if ranges changed)
    if (rangeAdded) {
      progress.totalWatched = calculateTotalWatched(
        progress.watchedRanges,
        lectureDuration,
      );

      // Compress ranges if too many
      if (
        progress.watchedRanges.length >
        PROGRESS_CONFIG.MAX_RANGES_BEFORE_COMPRESS
      ) {
        compressWatchedRanges(progress);
      }
    }

    // 9️⃣ Update completion percentage
    if (lectureDuration > 0 && rangeAdded) {
      const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
      progress.completionPercentage = Math.min(100, Math.round(rawPercentage));

      if (
        !progress.isCompleted &&
        progress.completionPercentage >= PROGRESS_CONFIG.COMPLETION_THRESHOLD
      ) {
        progress.isCompleted = true;
        progress.completedAt = now;
        isModified = true;
      }
    }

    // 🔟 Update total time spent incrementally
    if (currentSession.endTime) {
      const sessionTimeSpent =
        (currentSession.endTime - currentSession.startTime) / 1000;
      const timeDelta = sessionTimeSpent - (currentSession.timeSpent || 0);
      if (Math.abs(timeDelta) > 0.1) {
        progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeDelta;
        currentSession.timeSpent = sessionTimeSpent;
        isModified = true;
      }
    }

    // 1️⃣1️⃣ Save with throttling
    if (isModified) {
      await throttledSave(progress, userId, pageId);
    }
  } catch (error) {
    console.error("❌ Error in updateUserProgress:", error);
  }
};

// ==================== Helper Functions ====================

// 1️⃣ Session Management (Synchronous)
function manageSession(progress, now) {
  let modified = false;

  if (!progress.pageSessions || progress.pageSessions.length === 0) {
    progress.pageSessions = [{ startTime: now, endTime: null, timeSpent: 0 }];
    modified = true;
    return { progress, modified };
  }

  const lastSession = progress.pageSessions[progress.pageSessions.length - 1];

  if (lastSession.endTime) {
    const timeSinceLastSession = (now - lastSession.endTime) / 1000 / 60;

    if (timeSinceLastSession > PROGRESS_CONFIG.SESSION_GAP_MINUTES) {
      progress.pageSessions.push({
        startTime: now,
        endTime: null,
        timeSpent: 0,
      });
      modified = true;
    }
  }

  return { progress, modified };
}

// 2️⃣ Watched Range Addition (Optimized with Binary Search)
function addWatchedRange(progress, start, end, maxDuration, action) {
  // Skip seek actions
  if (action === "seek") return false;

  // Validate range
  if (start < 0 || end > maxDuration || end <= start) return false;

  const newRange = {
    start: parseFloat(start.toFixed(2)),
    end: parseFloat(end.toFixed(2)),
  };

  const ranges = progress.watchedRanges;
  if (!ranges || ranges.length === 0) {
    ranges.push(newRange);
    return true;
  }

  // Binary search for insertion point
  let left = 0;
  let right = ranges.length - 1;
  let insertIndex = ranges.length;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (ranges[mid].start <= newRange.start) {
      left = mid + 1;
    } else {
      insertIndex = mid;
      right = mid - 1;
    }
  }

  let merged = false;

  // Check merge with previous range
  if (insertIndex > 0) {
    const prev = ranges[insertIndex - 1];
    if (newRange.start <= prev.end + 2) {
      // 2 second tolerance
      prev.end = Math.max(prev.end, newRange.end);
      merged = true;

      // Check merge with next ranges
      while (
        insertIndex < ranges.length &&
        prev.end >= ranges[insertIndex].start - 2
      ) {
        prev.end = Math.max(prev.end, ranges[insertIndex].end);
        ranges.splice(insertIndex, 1);
      }
    }
  }

  // Check merge with next range if not merged
  if (!merged && insertIndex < ranges.length) {
    const next = ranges[insertIndex];
    if (newRange.end >= next.start - 2) {
      next.start = Math.min(newRange.start, next.start);
      next.end = Math.max(newRange.end, next.end);
      merged = true;
    }
  }

  // Add new range if not merged
  if (!merged) {
    ranges.splice(insertIndex, 0, newRange);
  }

  return true;
}

// 3️⃣ Compress Watched Ranges (Merge nearby ranges)
function compressWatchedRanges(progress) {
  const ranges = progress.watchedRanges;
  if (ranges.length <= 1) return;

  const compressed = [];
  let current = ranges[0];

  for (let i = 1; i < ranges.length; i++) {
    const next = ranges[i];

    // If gap is less than 5 seconds, merge
    if (next.start - current.end <= 5) {
      current.end = Math.max(current.end, next.end);
    } else {
      compressed.push(current);
      current = next;
    }
  }
  compressed.push(current);

  progress.watchedRanges = compressed;
}

// 4️⃣ Action Handler (Synchronous)
function handleAction(
  action,
  progress,
  validatedTime,
  previousPosition,
  currentSession,
  now,
) {
  let modified = false;

  // Update last position
  if (progress.lastPosition !== validatedTime) {
    progress.lastPosition = validatedTime;
    modified = true;
  }

  switch (action) {
    case "play":
    case "video_play":
      if (!currentSession.startTime) {
        currentSession.startTime = now;
        modified = true;
      }
      break;

    case "pause":
    case "video_pause":
    case "end":
    case "video_end":
      if (currentSession.startTime && !currentSession.endTime) {
        currentSession.endTime = now;
        modified = true;
      }
      break;

    case "timeupdate":
    case "video_heartbeat":
    case "seek":
      // Just update position
      break;
  }

  return { progress, modified };
}

// 5️⃣ Calculate Total Watched
function calculateTotalWatched(ranges, duration) {
  if (!ranges?.length) return 0;

  let total = 0;
  let lastEnd = -1;

  // Sort ranges (they should be sorted, but just to be safe)
  const sorted = [...ranges].sort((a, b) => a.start - b.start);

  for (const range of sorted) {
    const start = Math.max(0, Math.min(range.start, duration));
    const end = Math.max(0, Math.min(range.end, duration));

    if (end <= start) continue;

    if (start > lastEnd) {
      total += end - start;
    } else if (end > lastEnd) {
      total += end - lastEnd;
    }

    lastEnd = Math.max(lastEnd, end);
  }

  return parseFloat(total.toFixed(2));
}

// 6️⃣ Throttled Save
async function throttledSave(progress, userId, pageId) {
  const throttleKey = `${userId}:${pageId}`;
  const now = Date.now();
  const lastSave = throttleMap.get(throttleKey) || 0;

  // Check if we should save immediately or queue
  if (now - lastSave >= PROGRESS_CONFIG.SAVE_THROTTLE_MS) {
    // Save immediately
    await progress.save();
    throttleMap.set(throttleKey, now);

    // Process any queued updates for this user/page
    processQueuedUpdates(userId, pageId);
  } else {
    // Queue for batch update
    queueForBatchUpdate(progress, userId, pageId);
  }
}

// 7️⃣ Batch Update Queue
function queueForBatchUpdate(progress, userId, pageId) {
  const queueKey = `${userId}:${pageId}`;

  // Remove existing queued item for same key
  const existingIndex = batchQueue.findIndex((item) => item.key === queueKey);
  if (existingIndex !== -1) {
    batchQueue.splice(existingIndex, 1);
  }

  // Add to queue
  batchQueue.push({
    key: queueKey,
    progress: progress.toObject ? progress.toObject() : progress,
    userId,
    pageId,
    timestamp: Date.now(),
  });

  // Start batch timer if not already running
  if (!batchTimer) {
    startBatchProcessor();
  }
}

// 8️⃣ Start Batch Processor
function startBatchProcessor() {
  batchTimer = setInterval(async () => {
    if (batchQueue.length === 0) {
      // Stop timer if queue is empty
      clearInterval(batchTimer);
      batchTimer = null;
      return;
    }

    await processBatchUpdates();
  }, PROGRESS_CONFIG.SAVE_THROTTLE_MS);
}

// 9️⃣ Process Batch Updates
async function processBatchUpdates() {
  if (batchQueue.length === 0) return;

  const bulkOps = [];
  const now = Date.now();
  const processedKeys = new Set();

  // Group by key (take latest update for each key)
  for (let i = batchQueue.length - 1; i >= 0; i--) {
    const item = batchQueue[i];

    if (
      !processedKeys.has(item.key) &&
      now - item.timestamp >= PROGRESS_CONFIG.SAVE_THROTTLE_MS
    ) {
      processedKeys.add(item.key);

      bulkOps.push({
        updateOne: {
          filter: { userId: item.userId, pageId: item.pageId },
          update: { $set: item.progress },
          upsert: true,
        },
      });

      // Remove from queue
      batchQueue.splice(i, 1);
    }
  }

  // Execute batch update
  if (bulkOps.length > 0) {
    try {
      await UserProgress.bulkWrite(bulkOps);

      // Update throttle map for saved items
      for (const op of bulkOps) {
        const { userId, pageId } = op.updateOne.filter;
        throttleMap.set(`${userId}:${pageId}`, now);
      }
    } catch (error) {
      console.error("❌ Batch update error:", error);
    }
  }
}

// 🔟 Process Queued Updates for specific user/page
async function processQueuedUpdates(userId, pageId) {
  const queueKey = `${userId}:${pageId}`;
  const queuedItems = batchQueue.filter((item) => item.key === queueKey);

  if (queuedItems.length === 0) return;

  // Take the latest update
  const latest = queuedItems[queuedItems.length - 1];

  try {
    await UserProgress.updateOne(
      { userId, pageId },
      { $set: latest.progress },
      { upsert: true },
    );

    // Remove all queued items for this key
    const remainingQueue = batchQueue.filter((item) => item.key !== queueKey);
    batchQueue.length = 0;
    batchQueue.push(...remainingQueue);
  } catch (error) {
    console.error("❌ Queued update error:", error);
  }
}

// 9️⃣ UPDATE ANALYTICS COUNTERS  FUNCTION DECLARATION (നിർവ്വചനം)
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

      case "timeupdate":
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
    //എന്തിനാണ് ഈ LOGIC? Video Popularity അറിയാൻ
    // 📌 interactionController.js - updateAnalyticsCounters function
    await StandardSubject.findByIdAndUpdate(
      subjectId,
      {
        $inc: { [`analytics.interactions.${type}`]: 1 },
        $set: { "analytics.lastInteraction": new Date() },
        $setOnInsert: {
          // 👈 document ഇല്ലെങ്കിൽ create ചെയ്യും
          "analytics.interactions": {
            video_play: 0,
            video_pause: 0,
            video_end: 0,
            // ...
          },
        },
      },
      { upsert: true }, // 👈 upsert: true കൊടുക്കണം
    );
  } catch (error) {
    console.error("Error updating analytics counters:", error);
  }
};

// 🔟 MAIN BACKGROUND TASK ORCHESTRATOR
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
      return res
        .status(400)
        .json({ success: false, error: "type and subjectId are required" });
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
      lastActive: new Date(), // "ഇപ്പോൾ 3:45 PM-ൽ active ആയിരുന്നു"
      $inc: { "analytics.totalInteractions": 1 }, // "ഇത് അയാളുടെ 150-ാമത്തെ interaction ആണ്"
    }).catch((err) => console.error("Update failed:", err));

    //FUNCTION CALL (വിളി) - trackInteraction-നുള്ളിൽ
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

    // ✅ 🚀 Run all gamification background tasks
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
