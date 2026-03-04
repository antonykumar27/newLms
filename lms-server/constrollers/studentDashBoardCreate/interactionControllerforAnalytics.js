// ==============================================
// MAIN INTERACTION CONTROLLER
//==============================================

// Models
const Interaction = require("../../models/interaction.js");
const User = require("../../models/loginUserModel.js");
const Video = require("../../models/videoModel.js");
const StandardSubject = require("../../models/standardSubjectSchema.js");
const UserProgress = require("../../models/userProgressSchema.js");

// Constants
const { VALID_INTERACTION_TYPES, PREMIUM_TYPES } = require("./constants.js");

// Utils
const { getDeviceType, normalizeLanguage } = require("./helpers.js");

// Services
const updateAnalyticsCounters = require("./analyticsCounters.js");
const updateUserProgress = require("./userProgress.js");

const { updateDailyAnalytics } = require("./dailyAnalytics.js");
const runAllBackgroundTasks = require("./backgroundTasks.js");

// ✅ REMOVED: saveWatchTime import

// Middleware
const checkRateLimit = require("./rateLimiter.js");

exports.trackInteraction = async (req, res) => {
  try {
    const {
      type, //1
      subjectId, //2
      chapterId, //3
      pageId, //4
      videoId, //5
      eventTime, //6
      data = {}, //7
      currentTime, //8
      totalDuration, //9
      watchTimeMs, //10
      deviceInfo, //11
      playerEvents = [], //12
      isPreview = false, //13
    } = req.body;

    const userId = req.user._id;

    console.log("📥 Received trackInteraction request:", {
      type,
      subjectId,
      videoId,
      userId: userId?.toString(),
      watchTimeMs,
      currentTime,
    });

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
    const waitSeconds = await checkRateLimit(userId, type, videoId, pageId);
    if (waitSeconds) {
      return res.status(429).json({
        success: false,
        error: "Please wait before performing this action again",
        retryAfter: waitSeconds,
      });
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
    }).catch((err) => console.error("Update failed:", err));

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

    // ✅ Update daily analytics (fire and forget)
    updateDailyAnalytics(interactionPayload, normalizedData).catch((err) =>
      console.error("Background analytics update failed:", err),
    );

    // ✅ 🚀 Run all gamification background tasks
    // AWAIT the promise to get actual data
    const gamificationResult = await runAllBackgroundTasks(
      interactionPayload,
      normalizedData,
      {
        watchTimeMs,
        playerEvents,
      },
    ).catch((err) => {
      console.error("Gamification tasks failed:", err);
      return { streakData: null, badges: [] }; // Default on error
    });

    console.log("🎮 Gamification Result:", gamificationResult);

    // ✅ Extract streak and badges from result (SAME AS userProgress)
    const streakData = gamificationResult?.streakData || null;
    const badges = gamificationResult?.badges || [];

    // ✅ REMOVED: saveWatchTime duplicate call

    // ✅ Get user progress for response
    let userProgress = null;

    if (pageId && videoId) {
      try {
        userProgress = await UserProgress.findOne(
          { userId, pageId },
          "completionPercentage isCompleted totalWatched totalTimeSpent lastPosition",
        ).lean();
      } catch (progressError) {
        console.error("Error fetching progress:", progressError);
      }
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
