// ==============================================
// COMPLETE INTERACTION CONTROLLER WITH REDIS
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
const Page = require("../models/pageModel");
const Chapter = require("../models/chapterModel");
const QuizAttempt = require("../models/quizAttemptModel");
const Leaderboard = require("../models/leaderboardModel");
const mongoose = require("mongoose");
const redisClient = require("../config/redis"); // 👈 Redis client import
const { Queue, Worker } = require("bullmq"); // 👈 BullMQ for background jobs

// ==============================================
// REDIS QUEUE SETUP
// ==============================================
const interactionQueue = new Queue("interaction-processing", {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

// Worker to process background tasks
const worker = new Worker(
  "interaction-processing",
  async (job) => {
    const {
      type,
      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      standardId,
      data,
      timestamp,
    } = job.data;

    console.log(`🔄 Processing background job: ${type} for user ${userId}`);

    switch (job.name) {
      case "update-analytics":
        await runHeavyAnalytics(job.data);
        break;
      case "check-badges":
        await checkAndAwardBadges(job.data);
        break;
      case "update-insights":
        await updateStudentInsights(job.data);
        break;
      case "recalculate-leaderboard":
        await updateLeaderboardData(standardId);
        break;
      case "flush-heatmap":
        await flushHeatmapToMongo(userId, timestamp);
        break;
    }
  },
  { connection: redisClient, concurrency: 5 }, // Process 5 jobs in parallel
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});

// ==============================================
// REDIS HELPER FUNCTIONS
// ==============================================

// 🎯 1. Redis Rate Limiting (Ultra Fast)
const checkRateLimit = async (userId, type, videoId) => {
  const key = `rate:${userId}:${type}:${videoId || "global"}`;
  const limitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;

  if (limitMs === 0) return true; // No limit

  const exists = await redisClient.exists(key);
  if (exists) {
    const ttl = await redisClient.ttl(key);
    return { allowed: false, retryAfter: ttl };
  }

  // Set with expiry in seconds
  await redisClient.setex(key, Math.ceil(limitMs / 1000), "1");
  return { allowed: true };
};

// 🎯 2. Cache Leaderboard in Redis
const getCachedLeaderboard = async (standardId) => {
  const cacheKey = `leaderboard:${standardId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
};

const cacheLeaderboard = async (standardId, data) => {
  const cacheKey = `leaderboard:${standardId}`;
  await redisClient.setex(cacheKey, 300, JSON.stringify(data)); // Cache for 5 minutes
};

// 🎯 3. Heatmap Buffer (Temporary Storage)
const updateHeatmapBuffer = async (
  userId,
  date,
  type,
  intensity,
  subjectId,
) => {
  const bufferKey = `heatmap:${userId}:${date}`;

  // Use Redis Hash for efficient storage
  await redisClient.hincrby(bufferKey, "interactions", 1);
  await redisClient.hincrby(bufferKey, `subject:${subjectId}`, 1);
  await redisClient.hset(bufferKey, "maxIntensity", intensity);

  // Set expiry for 24 hours (buffer will be flushed to Mongo)
  await redisClient.expire(bufferKey, 86400);

  // Add to activities set
  await redisClient.sadd(`${bufferKey}:activities`, type);
};

// 🎯 4. Daily Activity Buffer
const updateDailyActivityBuffer = async (userId, date, type, data) => {
  const activityKey = `daily:${userId}:${date}`;

  await redisClient.hincrby(activityKey, type, 1);
  await redisClient.hincrby(activityKey, "totalInteractions", 1);

  if (data?.watchTimeMs) {
    await redisClient.hincrby(
      activityKey,
      "totalWatchTime",
      Math.floor(data.watchTimeMs / 1000),
    );
  }

  await redisClient.expire(activityKey, 86400);
};

// 🎯 5. Flush Heatmap Buffer to MongoDB (Run by Cron Job)
const flushHeatmapToMongo = async (userId, date) => {
  const bufferKey = `heatmap:${userId}:${date}`;
  const exists = await redisClient.exists(bufferKey);

  if (!exists) return;

  const data = await redisClient.hgetall(bufferKey);
  const activities = await redisClient.smembers(`${bufferKey}:activities`);

  // Update MongoDB
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
    dayData.intensity = Math.max(
      dayData.intensity,
      parseInt(data.maxIntensity || 0),
    );
    dayData.activities = [...new Set([...dayData.activities, ...activities])];

    // Extract subjects from Redis data
    const subjects = Object.keys(data)
      .filter((key) => key.startsWith("subject:"))
      .map((key) => key.replace("subject:", ""));

    dayData.subjects = [...new Set([...dayData.subjects, ...subjects])];
  }

  heatmap.summary.totalInteractions += parseInt(data.interactions || 0);
  heatmap.summary.maxIntensity = Math.max(
    heatmap.summary.maxIntensity,
    parseInt(data.maxIntensity || 0),
  );
  heatmap.summary.totalActiveDays = heatmap.data.filter(
    (d) => d.intensity > 0,
  ).length;

  await heatmap.save();

  // Clear Redis buffer
  await redisClient.del(bufferKey);
  await redisClient.del(`${bufferKey}:activities`);
};

// 🎯 6. Cache User Progress
const getCachedProgress = async (userId, pageId) => {
  const cacheKey = `progress:${userId}:${pageId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
};

const cacheUserProgress = async (userId, pageId, progressData) => {
  const cacheKey = `progress:${userId}:${pageId}`;
  await redisClient.setex(cacheKey, 60, JSON.stringify(progressData)); // Cache for 1 minute
};

// 🎯 7. Cache Streak Data
const getCachedStreak = async (userId) => {
  const cacheKey = `streak:${userId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
};

const cacheStreak = async (userId, streakData) => {
  const cacheKey = `streak:${userId}`;
  await redisClient.setex(cacheKey, 300, JSON.stringify(streakData)); // Cache for 5 minutes
};

// 🎯 8. Session Tracking
const trackSessionInRedis = async (sessionId, userId, videoId) => {
  const sessionKey = `session:${sessionId}`;

  await redisClient.hset(sessionKey, {
    userId,
    videoId,
    lastHeartbeat: Date.now(),
    status: "active",
  });

  await redisClient.expire(sessionKey, 3600); // Session expires in 1 hour
};

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

const PROGRESS_THRESHOLDS = {
  PAGE_COMPLETE_VIDEO: 80,
  PAGE_COMPLETE_QUIZ: 60,
  CHAPTER_COMPLETE_QUIZ: 60,
  SUBJECT_COMPLETE_QUIZ: 70,
  SUBJECT_COMPLETE_ACCURACY: 65,
  STANDARD_COMPLETE_ACCURACY: 65,
};

const WEIGHTS = {
  STANDARD_SCORE: {
    SUBJECT_COMPLETION: 0.5,
    OVERALL_ACCURACY: 0.3,
    CONSISTENCY: 0.2,
  },
  PERFORMANCE_INDEX: {
    PAGE_PROGRESS: 0.2,
    CHAPTER_PROGRESS: 0.3,
    SUBJECT_PROGRESS: 0.3,
    STANDARD_SCORE: 0.2,
  },
  LEADERBOARD: {
    PAGE_COMPLETED: 10,
    QUIZ_PASSED: 20,
    STREAK_DAY: 5,
    WATCH_MINUTE: 1,
  },
};

const HEATMAP_COLORS = {
  0: "#ffffff",
  1: "#90EE90",
  2: "#32CD32",
  3: "#228B22",
  4: "#006400",
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

const generateSessionId = (userId, videoId) => {
  return `session_${userId}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateIntensity = (type, data) => {
  const currentTime = data?.currentTime || 0;
  const duration = data?.duration || 0;

  if (type === "video_end" || type === "video_complete") return 4;
  if (type === "video_heartbeat") {
    const progress = duration > 0 ? currentTime / duration : 0;
    if (progress > 0.7) return 3;
    if (progress > 0.3) return 2;
    return 1;
  }
  if (type === "quiz_complete" || type === "assignment_submit") return 4;
  if (type === "video_play" || type === "page_view") return 1;
  return 0;
};

const isValidForStreak = (type, data) => {
  const currentTime = data?.currentTime || 0;
  const duration = data?.duration || 0;

  if (
    type === "video_heartbeat" ||
    type === "video_end" ||
    type === "video_complete"
  ) {
    if (duration > 0) {
      const progress = currentTime / duration;
      return progress > 0.3;
    }
    return true;
  }
  if (type.includes("quiz") || type.includes("assignment")) return true;
  if (type === "page_view") return true;
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
// HEAVY BACKGROUND TASKS (QUEUED)
// ==============================================

const runHeavyAnalytics = async (data) => {
  const {
    userId,
    type,
    subjectId,
    videoId,
    chapterId,
    pageId,
    standardId,
    normalizedData,
    additionalData,
  } = data;
  const today = new Date().toISOString().split("T")[0];

  console.log(`🔄 Running heavy analytics for user ${userId}`);

  // Update Daily Activity (MongoDB)
  await updateDailyActivity(userId, {
    date: today,
    type,
    videoId,
    subjectId,
    chapterId,
    pageId,
    data: { ...normalizedData, watchTimeMs: additionalData.watchTimeMs },
  });

  // Update Watch Time (MongoDB)
  await updateWatchTimeProgress(
    normalizedData.currentTime,
    type,
    pageId,
    videoId,
    userId,
    normalizedData.duration,
    chapterId,
    subjectId,
    standardId,
    additionalData.watchTimeMs,
    additionalData.playerEvents || [],
    false,
    additionalData.deviceInfo,
    additionalData.sessionId,
  );

  // Update User Progress (MongoDB)
  await updateUserProgressData(
    normalizedData.currentTime,
    type,
    pageId,
    videoId,
    userId,
    normalizedData.duration,
    chapterId,
    subjectId,
    standardId,
  );

  // Update Daily Analytics (MongoDB)
  await updateDailyAnalyticsData(
    userId,
    type,
    videoId,
    subjectId,
    standardId,
    chapterId,
    pageId,
    normalizedData.currentTime,
    normalizedData.duration,
    today,
  );
};

// ==============================================
// PROGRESS CALCULATION FUNCTIONS
// ==============================================

const calculatePageProgress = async (userId, pageId) => {
  try {
    const page = await Page.findById(pageId)
      .populate("chapterId")
      .populate("subjectId");
    if (!page) return { error: "Page not found" };

    const videoProgress = await UserProgress.findOne({ userId, pageId });
    const quizAttempts = await QuizAttempt.find({
      userId,
      pageId,
      status: "completed",
    }).sort("-score");

    const bestQuizScore = quizAttempts.length > 0 ? quizAttempts[0].score : 0;
    const videoCompletionPercentage = videoProgress?.completionPercentage || 0;

    const isVideoCompleted =
      videoCompletionPercentage >= PROGRESS_THRESHOLDS.PAGE_COMPLETE_VIDEO;
    const isQuizCompleted =
      bestQuizScore >= PROGRESS_THRESHOLDS.PAGE_COMPLETE_QUIZ;

    const videoContribution = videoCompletionPercentage * 0.5;
    const quizContribution = bestQuizScore * 0.5;
    const pageProgressPercentage = Math.min(
      100,
      videoContribution + quizContribution,
    );

    return {
      pageId: page._id,
      chapterId: page.chapterId?._id,
      subjectId: page.subjectId?._id,
      isComplete: isVideoCompleted && isQuizCompleted,
      progressPercentage: pageProgressPercentage,
      videoProgress: {
        completionPercentage: videoCompletionPercentage,
        isCompleted: isVideoCompleted,
      },
      quizProgress: {
        bestScore: bestQuizScore,
        isCompleted: isQuizCompleted,
        totalAttempts: quizAttempts.length,
      },
    };
  } catch (error) {
    console.error("Error calculating page progress:", error);
    return { error: error.message };
  }
};

const calculateChapterProgress = async (userId, chapterId) => {
  try {
    const chapter = await Chapter.findById(chapterId)
      .populate("pages")
      .populate("subjectId");
    if (!chapter) return { error: "Chapter not found" };

    const pages = chapter.pages || [];
    const pageProgresses = await Promise.all(
      pages.map((page) => calculatePageProgress(userId, page._id)),
    );

    const validPageProgresses = pageProgresses.filter((p) => !p.error);
    const totalPages = validPageProgresses.length;
    const completedPages = validPageProgresses.filter(
      (p) => p.isComplete,
    ).length;

    const chapterQuizAttempts = await QuizAttempt.find({
      userId,
      quizId: chapter.quizId,
      quizType: "chapter_quiz",
      status: "completed",
    }).sort("-score");

    const bestChapterQuizScore =
      chapterQuizAttempts.length > 0 ? chapterQuizAttempts[0].score : 0;
    const isChapterQuizPassed =
      bestChapterQuizScore >= PROGRESS_THRESHOLDS.CHAPTER_COMPLETE_QUIZ;

    return {
      chapterId: chapter._id,
      subjectId: chapter.subjectId?._id,
      isComplete:
        completedPages === totalPages && isChapterQuizPassed && totalPages > 0,
      pageStats: { total: totalPages, completed: completedPages },
      chapterQuiz: {
        bestScore: bestChapterQuizScore,
        isPassed: isChapterQuizPassed,
      },
      conceptUnderstandingScore:
        totalPages > 0
          ? (completedPages / totalPages) * 100 * 0.7 +
            bestChapterQuizScore * 0.3
          : 0,
    };
  } catch (error) {
    console.error("Error calculating chapter progress:", error);
    return { error: error.message };
  }
};

const calculateSubjectProgress = async (userId, subjectId) => {
  try {
    const subject = await StandardSubject.findById(subjectId).populate({
      path: "chapters",
      populate: { path: "pages" },
    });
    if (!subject) return { error: "Subject not found" };

    const chapters = subject.chapters || [];
    const chapterProgresses = await Promise.all(
      chapters.map((chapter) => calculateChapterProgress(userId, chapter._id)),
    );

    const validChapterProgresses = chapterProgresses.filter((c) => !c.error);
    const totalChapters = validChapterProgresses.length;
    const completedChapters = validChapterProgresses.filter(
      (c) => c.isComplete,
    ).length;

    const subjectQuizAttempts = await QuizAttempt.find({
      userId,
      quizId: subject.quizId,
      quizType: "subject_quiz",
      status: "completed",
    }).sort("-score");

    const bestSubjectQuizScore =
      subjectQuizAttempts.length > 0 ? subjectQuizAttempts[0].score : 0;
    const isSubjectQuizPassed =
      bestSubjectQuizScore >= PROGRESS_THRESHOLDS.SUBJECT_COMPLETE_QUIZ;

    return {
      subjectId: subject._id,
      standardId: subject.standardId,
      isComplete:
        completedChapters === totalChapters &&
        isSubjectQuizPassed &&
        totalChapters > 0,
      chapterStats: { total: totalChapters, completed: completedChapters },
      subjectQuiz: {
        bestScore: bestSubjectQuizScore,
        isPassed: isSubjectQuizPassed,
      },
    };
  } catch (error) {
    console.error("Error calculating subject progress:", error);
    return { error: error.message };
  }
};

// ==============================================
// BACKGROUND TASK FUNCTIONS (MONGODB)
// ==============================================

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

    // Cache streak data
    await cacheStreak(userId, streak);

    return streak;
  } catch (error) {
    console.error("Streak update failed:", error);
    return null;
  }
};

const checkAndAwardBadges = async (badgeData) => {
  try {
    const { userId, type, subjectId, videoId, currentStreak } = badgeData;
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

const updateStudentInsights = async (insightData) => {
  try {
    const { userId, type, subjectId, videoId, chapterId, pageId, date, data } =
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

const updateDailyAnalyticsData = async (
  userId,
  type,
  videoId,
  subjectId,
  standardId,
  chapterId,
  pageId,
  currentTime,
  duration,
  today,
) => {
  try {
    let watchDuration = 0;
    let segment = null;

    if (type === "video_heartbeat" && currentTime) {
      const segmentSize = 10;
      segment = Math.floor(currentTime / segmentSize);
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

    if (type === "video_complete") updateQuery.$inc["metrics.completions"] = 1;

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
    console.error("Daily analytics update failed:", error);
  }
};

const updateWatchTimeProgress = async (
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

const updateUserProgressData = async (
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
    if (!pageId || !videoId || !userId) return;

    const video = await Video.findById(videoId);
    if (!video) return;

    const lectureDuration = totalDuration || 0;
    const now = new Date();
    const validatedTime = Math.min(currentTime || 0, lectureDuration);

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
      let totalWatched = 0,
        lastEnd = -1;
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

    switch (type) {
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
              type,
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
              type,
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

    // Cache progress data
    await cacheUserProgress(userId, pageId, {
      completionPercentage: progress.completionPercentage,
      isCompleted: progress.isCompleted,
      totalWatched: progress.totalWatched,
      lastPosition: progress.lastPosition,
    });
  } catch (error) {
    console.error("Error in updateUserProgress:", error);
  }
};

const updateLeaderboardData = async (standardId) => {
  try {
    const students = await User.find({
      standard: standardId,
      role: "student",
      isActive: true,
    }).select("_id name");
    const leaderboardEntries = [];

    for (const student of students) {
      const streak = await StudentStreak.findOne({ studentId: student._id });
      const watchTimeAgg = await WatchTime.aggregate([
        { $match: { userId: student._id } },
        { $group: { _id: null, total: { $sum: "$totalWatchedSeconds" } } },
      ]);
      const totalWatchMinutes = Math.floor((watchTimeAgg[0]?.total || 0) / 60);
      const completedPages = await UserProgress.countDocuments({
        userId: student._id,
        isCompleted: true,
      });
      const passedQuizzes = await QuizAttempt.countDocuments({
        userId: student._id,
        score: { $gte: 60 },
        status: "completed",
      });

      const leaderboardScore =
        completedPages * WEIGHTS.LEADERBOARD.PAGE_COMPLETED +
        passedQuizzes * WEIGHTS.LEADERBOARD.QUIZ_PASSED +
        (streak?.currentStreak || 0) * WEIGHTS.LEADERBOARD.STREAK_DAY +
        totalWatchMinutes * WEIGHTS.LEADERBOARD.WATCH_MINUTE;

      leaderboardEntries.push({
        userId: student._id,
        name: student.name,
        score: leaderboardScore,
        streak: streak?.currentStreak || 0,
        pagesCompleted: completedPages,
        quizzesPassed: passedQuizzes,
        watchMinutes: totalWatchMinutes,
        lastActive: streak?.lastActiveDate,
      });
    }

    leaderboardEntries.sort((a, b) => b.score - a.score);
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    await Leaderboard.findOneAndUpdate(
      { standardId, date: new Date().toISOString().split("T")[0] },
      {
        standardId,
        entries: leaderboardEntries,
        totalStudents: leaderboardEntries.length,
        updatedAt: new Date(),
      },
      { upsert: true },
    );

    // Cache leaderboard
    await cacheLeaderboard(standardId, leaderboardEntries);

    return leaderboardEntries;
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
};

// ==============================================
// MAIN CONTROLLER FUNCTION (OPTIMIZED WITH REDIS)
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

    // ✅ REDIS RATE LIMITING (ULTRA FAST)
    const rateCheck = await checkRateLimit(userId, type, videoId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: "Please wait before performing this action again",
        retryAfter: rateCheck.retryAfter,
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

    // ✅ Track session in Redis
    await trackSessionInRedis(sessionId, userId, videoId);

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

    // ✅ Save interaction (CRITICAL PATH - MUST HAPPEN)
    const interaction = new Interaction(interactionPayload);
    await interaction.save();

    // ✅ Update user's last activity (fire and forget)
    User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
      $inc: { "analytics.totalInteractions": 1 },
    }).catch((err) => console.error("Update failed:", err));

    // ✅ Get today's date
    const today = new Date().toISOString().split("T")[0];

    // ✅ UPDATE REDIS BUFFERS (FAST)
    const intensity = calculateIntensity(type, normalizedData);

    // Update heatmap buffer in Redis
    await updateHeatmapBuffer(userId, today, type, intensity, subjectId);

    // Update daily activity buffer in Redis
    await updateDailyActivityBuffer(userId, today, type, { watchTimeMs });

    // ✅ ADD JOBS TO QUEUE (ASYNC PROCESSING)

    // 1. Heavy analytics job (WatchTime, UserProgress, DailyAnalytics)
    await interactionQueue.add(
      "update-analytics",
      {
        userId,
        type,
        subjectId,
        videoId,
        chapterId,
        pageId,
        standardId,
        normalizedData,
        additionalData: {
          watchTimeMs,
          playerEvents,
          deviceInfo: interactionPayload.deviceInfo,
          sessionId,
        },
        timestamp: new Date(),
      },
      {
        priority: 2, // Medium priority
      },
    );

    // 2. Streak update job
    if (isValidForStreak(type, normalizedData)) {
      await interactionQueue.add(
        "check-streak",
        {
          userId,
          type,
          date: today,
          isValidActivity: true,
        },
        {
          priority: 1, // High priority
        },
      );
    }

    // 3. Badge check job (for video completion)
    if (type === "video_end" || type === "video_complete") {
      await interactionQueue.add(
        "check-badges",
        {
          userId,
          type,
          subjectId,
          videoId,
        },
        {
          priority: 3, // Low priority
        },
      );
    }

    // 4. Insights update job (once per hour per user)
    const shouldUpdateInsights = Math.random() < 0.1; // 10% chance to update insights
    if (shouldUpdateInsights) {
      await interactionQueue.add(
        "update-insights",
        {
          userId,
          type,
          subjectId,
          videoId,
          chapterId,
          pageId,
          date: today,
          data: normalizedData,
        },
        {
          priority: 4, // Very low priority
        },
      );
    }

    // 5. Leaderboard update job (once per 10 minutes per standard)
    const shouldUpdateLeaderboard = Math.random() < 0.01; // 1% chance
    if (shouldUpdateLeaderboard && standardId) {
      await interactionQueue.add(
        "recalculate-leaderboard",
        {
          standardId,
        },
        {
          priority: 5, // Lowest priority
        },
      );
    }

    // ✅ GET CACHED DATA FOR RESPONSE (FAST)

    // Get cached progress
    let userProgress = null;
    if (pageId && videoId) {
      userProgress = await getCachedProgress(userId, pageId);
      if (!userProgress) {
        // Fallback to MongoDB if not cached
        const progressDoc = await UserProgress.findOne(
          { userId, pageId },
          "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition",
        ).lean();

        if (progressDoc) {
          userProgress = progressDoc;
          await cacheUserProgress(userId, pageId, progressDoc);
        }
      }
    }

    // Get cached streak
    let streakData = await getCachedStreak(userId);
    if (!streakData) {
      streakData = await StudentStreak.findOne(
        { studentId: userId },
        "currentStreak longestStreak lastActiveDate milestones streakFreeze",
      ).lean();
      if (streakData) {
        await cacheStreak(userId, streakData);
      }
    }

    // ✅ Get watch time data (this is still direct DB query - but only once)
    let watchTimeData = null;
    if (pageId && videoId) {
      watchTimeData = await WatchTime.findOne(
        { userId, videoId, page: pageId },
        "totalWatchedSeconds uniqueWatchedSeconds progress completed completionCount firstWatchedAt lastWatchedAt videoDuration",
      ).lean();
    }

    // ✅ Get badges for response (limited query)
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

    // ✅ Get cached leaderboard
    let leaderboard = null;
    if (standardId) {
      leaderboard = await getCachedLeaderboard(standardId);
    }

    // ✅ Calculate progress (these are still somewhat heavy - but only for page/chapter/subject when needed)
    let pageProgress = null;
    if (pageId) {
      try {
        pageProgress = await calculatePageProgress(userId, pageId);
      } catch (error) {
        console.error("Error calculating page progress:", error);
      }
    }

    let chapterProgress = null;
    if (chapterId) {
      try {
        chapterProgress = await calculateChapterProgress(userId, chapterId);
      } catch (error) {
        console.error("Error calculating chapter progress:", error);
      }
    }

    let subjectProgress = null;
    if (subjectId) {
      try {
        subjectProgress = await calculateSubjectProgress(userId, subjectId);
      } catch (error) {
        console.error("Error calculating subject progress:", error);
      }
    }

    // ✅ SUCCESS RESPONSE (FAST!)
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

        leaderboard: leaderboard
          ? {
              top10: leaderboard.slice(0, 10),
              userRank:
                leaderboard.find(
                  (entry) => entry.userId.toString() === userId.toString(),
                )?.rank || null,
            }
          : null,

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

        pageProgress: pageProgress && !pageProgress.error ? pageProgress : null,
        chapterProgress:
          chapterProgress && !chapterProgress.error ? chapterProgress : null,
        subjectProgress:
          subjectProgress && !subjectProgress.error ? subjectProgress : null,
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
// CRON JOB TO FLUSH REDIS BUFFERS TO MONGODB
// ==============================================
const cron = require("node-cron");

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("🔄 Flushing Redis buffers to MongoDB...");

  // This would need to iterate through all users with heatmap buffers
  // In production, you'd use Redis SCAN to find all heatmap keys
  // For now, this is a placeholder for the actual implementation
});

// Export queue for monitoring
exports.interactionQueue = interactionQueue;
