exports.trackInteraction = async (req, res) => {
  try {
    const { type, subjectId, chapterId, pageId, videoId, data = {} } = req.body;
    const normalizedData = {
      currentTime: req.body.currentTime ?? req.body.data?.currentTime ?? 0,

      duration: req.body.totalDuration ?? req.body.data?.duration ?? 0,

      playbackRate: req.body.playbackRate ?? req.body.data?.playbackRate ?? 1,

      volume: req.body.volume ?? req.body.data?.volume ?? 1,

      isMuted: req.body.isMuted ?? req.body.data?.isMuted ?? false,
    };

    // 🔒 Get userId from authenticated user
    const userId = req.user._id;

    // 🔒 Use type from data if type is not provided
    const interactionType = type;

    // ✅ Step 1: Basic validation
    if (!interactionType || !subjectId) {
      return res.status(400).json({
        success: false,
        error: "type and subjectId are required",
      });
    }

    // ✅ Step 2: Validate user exists and is active
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user?.isActive) {
      return res.status(403).json({
        success: false,
        error: "User account is not active",
      });
    }

    // ✅ Step 3: Validate course exists
    const course = await StandardSubject.findById(subjectId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // ✅ Step 4: Validate video exists if provided inside Course Schema
    if (videoId) {
      const courseWithVideo = await Video.findById(videoId);

      if (!courseWithVideo) {
        return res.status(404).json({
          success: false,
          error: "Video not found",
        });
      }
    }

    // ✅ Validate interaction type
    if (!VALID_INTERACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type: ${type}`,
        validTypes: VALID_INTERACTION_TYPES,
      });
    }

    // 🔒 Premium features check
    const userTier = user.tier || "free";
    if (PREMIUM_TYPES.includes(type) && userTier === "free") {
      return res.status(403).json({
        success: false,
        error: "This feature requires a premium subscription",
        upgradeRequired: true,
      });
    }

    // 🔒 Rate limiting check iveidde athinte second kittum
    const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;

    if (rateLimitMs > 0) {
      const recentInteraction = await Interaction.findOne({
        userId,
        type,
        pageId,
        videoId: videoId || { $exists: false },
        eventTime: { $gte: new Date(Date.now() - rateLimitMs) },
      }).sort({ eventTime: -1 });

      if (recentInteraction) {
        const timeSinceLast =
          Date.now() - new Date(recentInteraction.eventTime).getTime();
        const waitSeconds = Math.ceil((rateLimitMs - timeSinceLast) / 1000);

        return res.status(429).json({
          success: false,
          error: "Please wait before performing this action again",
          retryAfter: waitSeconds,
          lastInteraction: recentInteraction.eventTime,
        });
      }
    }

    // ✅ Create interaction payload
    const interactionPayload = {
      standardId: course.standardId,
      userId,
      subjectId,
      videoId,
      chapterId,
      pageId,
      type,
      eventTime: data.eventTime || req.body.eventTime || new Date(),

      // Data contains only interaction metadata
      data: {
        currentTime: Number(normalizedData.currentTime),
        duration: Number(normalizedData.duration),
        playbackRate: normalizedData.playbackRate,
        volume: normalizedData.volume,
        isMuted: normalizedData.isMuted,

        ...(type === "manual_seek" && {
          fromTime: data.fromTime ?? null,
          toTime: data.toTime ?? null,
          seekAmount: data.seekAmount ?? null,
          seekDirection: data.seekDirection ?? null,
        }),

        ...(type === "video_view" && {
          viewDuration: data.viewDuration || 0,
          isAutoplay: data.isAutoplay || false,
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
      },

      timestamps: {
        eventOccurred: data.eventTime ? new Date(data.eventTime) : new Date(),
        serverReceived: new Date(),
      },
    };

    // ✅ Create and save interaction (FIXED HERE)
    // ❌ WRONG: const interaction = new Interaction({ interactionPayload, serverTimestamp: new Date() });
    // ✅ CORRECT: Spread the interactionPayload into the document
    const interaction = new Interaction({
      ...interactionPayload,
      serverTimestamp: new Date(),
    });

    await interaction.save();

    // ✅ Update analytics counters (async)
    updateAnalyticsCounters(type, subjectId, videoId, userId, data).catch(
      (error) => {
        console.error("❌ Analytics update failed:", error);
      },
    );

    // ✅ Update user's last activity
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });

    // ✅ Special handling for specific event types
    let additionalData = {};

    switch (type) {
      case "course_enroll":
        await StandardSubject.findByIdAndUpdate(subjectId, {
          $addToSet: { enrolledUsers: userId },
        });
        await User.findByIdAndUpdate(userId, {
          $addToSet: { enrolledCourses: subjectId },
        });
        additionalData.enrollment = {
          courseTitle: course.title,
          enrolledAt: new Date(),
        };
        break;

      case "course_completed":
        await User.findByIdAndUpdate(userId, {
          $addToSet: { completedCourses: subjectId },
        });
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
          totalDuration: data.duration || 0,
        };
        break;
    }

    // ✅ Success response
    res.status(201).json({
      success: true,
      message: "Interaction tracked successfully",
      data: {
        interaction: {
          id: interaction._id,
          type: interaction.type,
          timestamp:
            interaction.timestamps?.eventOccurred || interaction.eventTime,
          eventTime: interaction.eventTime,
        },
        analytics: {
          totalInteractions: await Interaction.countDocuments({ userId }),
          totalCourseInteractions: await Interaction.countDocuments({
            subjectId,
            userId,
          }),
        },
        ...additionalData,
      },
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error.message);
    console.error("Validation errors:", error.errors);
    res.status(500).json({
      success: false,
      error: "Failed to track interaction",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// ============================================
// NEW: Get Analytics for Dashboard
// ============================================
exports.getDailyAnalytics = async (req, res) => {
  try {
    const { standardId, subjectId, startDate, endDate, pageId } = req.query;

    const query = {};
    if (standardId) query.standardId = standardId;
    if (subjectId) query.subjectId = subjectId;
    if (pageId) query.pageId = pageId;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const analytics = await DailyInteraction.find(query)
      .sort({ date: -1 })
      .populate("pageId", "title")
      .populate("videoId", "title")
      .lean();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("❌ Daily analytics error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// NEW: Get Popular Pages
// ============================================
exports.getPopularPages = async (req, res) => {
  try {
    const { standardId, days = 30 } = req.query;

    // Calculate date range
    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const popularPages = await DailyInteraction.aggregate([
      {
        $match: {
          standardId: mongoose.Types.ObjectId(standardId),
          date: { $in: dates },
          pageId: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$pageId",
          totalViews: { $sum: "$metrics.totalViews" },
          uniqueUsers: { $sum: "$metrics.uniqueUserCount" },
          avgWatchTime: { $avg: "$metrics.averageWatchTime" },
          completionRate: { $avg: "$metrics.completionRate" },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "mathslessons",
          localField: "_id",
          foreignField: "_id",
          as: "pageDetails",
        },
      },
    ]);

    res.json({ success: true, data: popularPages });
  } catch (error) {
    console.error("❌ Popular pages error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// NEW: Get Video Heatmap
// ============================================
exports.getVideoHeatmap = async (req, res) => {
  try {
    const { videoId, startDate, endDate } = req.query;

    const query = { videoId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const heatmap = await DailyInteraction.aggregate([
      { $match: query },
      { $unwind: "$metrics.watchSegments" },
      {
        $group: {
          _id: "$metrics.watchSegments.segment",
          totalWatchCount: { $sum: "$metrics.watchSegments.watchCount" },
          totalWatchTime: { $sum: "$metrics.watchSegments.totalTime" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: heatmap });
  } catch (error) {
    console.error("❌ Heatmap error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// interactionRoutes.js
const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interactionController");

// Existing routes
router.post("/track", interactionController.trackInteraction);

// NEW: Analytics routes
router.get("/daily", interactionController.getDailyAnalytics);
router.get("/popular-pages", interactionController.getPopularPages);
router.get("/heatmap", interactionController.getVideoHeatmap);

module.exports = router;
