const Interaction = require("../models/interaction");

const WatchTime = require("../models/watchTimeSchema");
const UserProgress = require("../models/userProgressSchema");
const Course = require("../models/course");
const StandardSubject = require("../models/standardSubjectSchema");
const WatchSession = require("../models/watchSession");
const User = require("../models/loginUserModel");
const InteractionService = require("../models/interactionService");
const mongoose = require("mongoose");
const Video = require("../models/videoModel");

// Helper function to extract device info
// Helper function to extract device info - WITH DEBUG
const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(userAgent);

  return {
    userAgent,
    ipAddress: req.ip || req.connection.remoteAddress,
    platform: req.useragent?.platform || "unknown",
    browser: req.useragent?.browser || "unknown",
    browserVersion: req.useragent?.version || "unknown",
    os: req.useragent?.os || "unknown",
    osVersion: req.useragent?.osVersion || "unknown",
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    referer: req.headers.referer || "",

    // ✅ FIXED: Return only first language code
    language: req.headers["accept-language"]
      ? req.headers["accept-language"].split(",")[0].split(";")[0].trim()
      : "en-US",
  };
};

// Helper function to update analytics counters
const updateAnalyticsCounters = async (type, courseId, videoId, userId) => {
  try {
    // Update user's activity counter
    await User.findByIdAndUpdate(userId, {
      $inc: { "analytics.totalInteractions": 1 },
      $set: { "analytics.lastActive": new Date() },
    });

    // Update course analytics based on type
    switch (type) {
      case "course_enroll":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.totalEnrollments": 1 },
          $push: {
            "analytics.recentEnrollments": { userId, date: new Date() },
          },
        });
        break;

      case "course_view":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.totalViews": 1 },
          $addToSet: { "analytics.uniqueViewers": userId },
        });
        break;

      case "course_wishlist_add":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.wishlistCount": 1 },
          $addToSet: { "analytics.wishlistedBy": userId },
        });
        break;

      case "course_wishlist_remove":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.wishlistCount": -1 },
          $pull: { "analytics.wishlistedBy": userId },
        });
        break;

      case "course_review":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.totalReviews": 1 },
        });
        break;

      case "course_completed":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.completions": 1 },
          $addToSet: { "analytics.completedBy": userId },
        });

        // Also update user's completed courses
        await User.findByIdAndUpdate(userId, {
          $addToSet: { completedCourses: courseId },
          $inc: { "analytics.completedCourses": 1 },
        });
        break;

      case "video_like":
        await Video.findByIdAndUpdate(videoId, {
          $inc: { "analytics.likes": 1 },
          $addToSet: { "analytics.likedBy": userId },
        });
        break;

      case "video_dislike":
        await Video.findByIdAndUpdate(videoId, {
          $inc: { "analytics.dislikes": 1 },
          $addToSet: { "analytics.dislikedBy": userId },
        });
        break;

      case "video_bookmark":
        await Video.findByIdAndUpdate(videoId, {
          $inc: { "analytics.bookmarks": 1 },
          $addToSet: { "analytics.bookmarkedBy": userId },
        });
        break;

      case "video_view":
        // Update video view count (unique views)
        await Video.findByIdAndUpdate(videoId, {
          $inc: { "analytics.totalViews": 1 },
          $addToSet: { "analytics.uniqueViewers": userId },
        });

        // Update user's watch history
        await User.findByIdAndUpdate(userId, {
          $addToSet: { watchHistory: { videoId, timestamp: new Date() } },
          $inc: { "analytics.totalWatchTime": data?.watchTime || 0 },
        });
        break;

      case "comment_add":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.totalComments": 1 },
        });
        break;

      case "question_ask":
        await Course.findByIdAndUpdate(courseId, {
          $inc: { "analytics.totalQuestions": 1 },
        });
        break;
    }
  } catch (error) {
    console.error("Error updating analytics counters:", error);
    // Don't throw error here - analytics update shouldn't fail the main request
  }
};

// Helper function to validate interaction data validateInteractionData() value return ചെയ്യില്ല,
//പക്ഷേ invalid data ആണെങ്കിൽ error throw ചെയ്ത്
//catch block-ലേക്ക് control കൊടുക്കും
const validateInteractionData = (type, data) => {
  const validations = {
    course_review: () => {
      if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      if (!data.comment || data.comment.trim().length < 10) {
        throw new Error("Review comment must be at least 10 characters");
      }
    },
    video_view: () => {
      if (!data.watchTime || data.watchTime < 0) {
        throw new Error("Valid watch time required");
      }
    },
    player_speed_change: () => {
      const validSpeeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
      if (!validSpeeds.includes(data.speed)) {
        throw new Error("Invalid playback speed");
      }
    },
    comment_add: () => {
      if (!data.comment || data.comment.trim().length < 1) {
        throw new Error("Comment cannot be empty");
      }
    },
  };
  //ok vanna type nookkum  athu undenlkil call cheyyum illenkil no problem
  //type = "course_review" ആണെങ്കിൽ

  //validations["course_review"]();

  //👉 അതായത് dynamic function call
  if (validations[type]) {
    validations[type]();
  }
};
const getDeviceType = (userAgent = "") => {
  if (/mobile|android|iphone|ipod/i.test(userAgent)) return "mobile";
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  return "desktop";
};

class InteractionController {
  // ✅ Track interaction with full validation
  // ✅ Track interaction with full validation
  static async trackInteraction(req, res) {
    try {
      const {
        type,
        subjectId,
        chapterId,
        pageId,
        videoId,
        data = {},
      } = req.body;

      // 🔒 Get userId from authenticated user (NEVER from request body)
      const userId = req.user._id;

      // 🔒 Use type from data if type is not provided
      const interactionType = type;

      // ✅ Step 1: Basic validation
      if (!interactionType || !subjectId) {
        return res.status(400).json({
          success: false,
          error: "type  subjectId is Missing",
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

      // ✅ Step 3: Validate course exists and is published
      const course = await StandardSubject.findById(subjectId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      // ithu pinned clear cheyanam
      // if (course.status !== "published" && type !== "course_view") {
      //   return res.status(403).json({
      //     success: false,
      //     error: "Course is not available",
      //   });
      // }

      // ✅ Step 4: Validate video exists if provided
      if (videoId) {
        const courseWithVideo = await Course.findOne({
          "media._id": new mongoose.Types.ObjectId(videoId),
          "media.type": "video",
        }).select("_id");

        if (!courseWithVideo) {
          return res.status(404).json({
            success: false,
            error: "Video not found",
          });
        }
      }

      // ✅ VALID INTERACTION TYPES (ONLY EVENTS, NO PROGRESS)
      const validInteractionTypes = [
        "video_play",
        "video_pause",
        "video_resume",
        "video_end",

        "video_seek_forward",
        "video_seek_backward",

        "video_watch_time",

        "video_buffer_start",
        "video_buffer_end",

        "playback_rate_change",

        "fullscreen_enter",
        "fullscreen_exit",

        "tab_hidden",
        "tab_visible",

        "video_rewatch",
      ];

      if (!validInteractionTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid interaction type: ${type}`,
          validTypes: validInteractionTypes,
        });
      }

      // 🔒 Premium features check
      const userTier = user.tier || "free";
      const premiumTypes = ["video_download", "certificate_download"];

      if (premiumTypes.includes(type) && userTier === "free") {
        return res.status(403).json({
          success: false,
          error: "This feature requires a premium subscription",
          upgradeRequired: true,
        });
      }

      // 🔒 Rate limiting check
      const RATE_LIMIT_CONFIG = {
        video_play: 1000,
        video_pause: 500,
        video_resume: 500,
        video_view: 0, // No limit for views
        video_like: 2000,
        video_dislike: 2000,
        video_bookmark: 1000,
        comment_add: 3000,
        note_add: 2000,
        default: 1000,
      };

      const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;

      const recentInteraction = await Interaction.findOne({
        userId,
        type,
        videoId: videoId || { $exists: false },
        eventTime: { $gte: new Date(Date.now() - rateLimitMs) },
      }).sort({ eventTime: -1 });

      if (recentInteraction && type !== "video_view") {
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

      const normalizeLanguage = (lang) => {
        if (!lang) return "en";
        return lang.split("-")[0];
      };

      // ✅ CREATE INTERACTION RECORD (CLEAN - NO PROGRESS)
      const interactionPayload = {
        userId,
        subjectId,
        videoId,
        chapterId,
        pageId,
        type,
        eventTime: data.eventTime || req.body.eventTime || new Date(),

        // Data contains only interaction metadata, NOT progress
        data: {
          currentTime: Number(data.currentTime ?? 0),
          duration: Number(data.duration ?? 0),
          playbackRate: data.playbackRate ?? 1,
          volume: data.volume ?? 1,
          isMuted: data.isMuted ?? false,

          ...(type === "manual_seek" && {
            fromTime: data.fromTime ?? null,
            toTime: data.toTime ?? null,
            seekAmount: data.seekAmount ?? null,
            seekDirection: data.seekDirection ?? null,
          }),

          // For video_view events (just view, not progress)
          ...(type === "video_view" && {
            viewDuration: data.viewDuration || 0,
            isAutoplay: data.isAutoplay || false,
          }),
        },

        deviceInfo: {
          userAgent:
            req.body.deviceInfo?.userAgent ||
            req.get("User-Agent") ||
            "Unknown",
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

      // Save interaction
      const interaction =
        await InteractionService.trackInteraction(interactionPayload);

      // ✅ UPDATE ANALYTICS COUNTERS (ASYNC)
      updateAnalyticsCounters(type, subjectId, videoId, userId).catch(
        (error) => {
          console.error("❌ Analytics update failed:", error);
        },
      );

      // ✅ UPDATE USER'S LAST ACTIVITY
      await User.findByIdAndUpdate(userId, {
        lastActive: new Date(),
      });

      // ✅ SPECIAL HANDLING FOR NON-PROGRESS TYPES ONLY
      let additionalData = {};

      switch (type) {
        case "course_enroll":
          await Course.findByIdAndUpdate(subjectId, {
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

        case "video_ended":
          // Just log the ended event, don't mark as completed
          // Completion will be handled by separate /video/complete endpoint
          additionalData.videoEnded = {
            videoId,
            endedAt: new Date(),
            totalDuration: data.duration || 0,
          };
          break;

        // 🔴 REMOVED: video_view progress logic
        // 🔴 REMOVED: All progress calculation
        // Progress will be handled by separate /progress endpoint
      }

      // ✅ SUCCESS RESPONSE
      res.status(201).json({
        success: true,
        message: "Interaction tracked successfully",
        data: {
          interaction: {
            id: interaction._id,
            type: interaction.type,
            timestamp: interaction.timestamps.eventOccurred,
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
      console.error("❌ Track interaction error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to track interaction",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // ✅ Bulk track interactions
  static async trackBulkInteractions(req, res) {
    try {
      const { interactions } = req.body;
      const userId = req.user._id;

      if (!Array.isArray(interactions) || interactions.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Interactions array is required and must not be empty",
        });
      }

      // Limit batch size
      if (interactions.length > 100) {
        return res.status(400).json({
          success: false,
          error: "Maximum batch size is 100 interactions",
        });
      }

      // Validate each interaction
      const validTypes = Interaction.schema.path("type").enumValues;
      const validatedInteractions = [];

      for (const interaction of interactions) {
        const { type, courseId, videoId, data = {}, timestamp } = interaction;

        // Validate required fields
        if (!type || !courseId) {
          continue; // Skip invalid
        }

        // Validate type
        if (!validTypes.includes(type)) {
          continue; // Skip invalid type
        }

        // Check rate limiting for non-view events
        if (type !== "video_view") {
          const recent = await Interaction.findOne({
            userId,
            type,
            timestamp: { $gte: new Date(Date.now() - 5000) },
          });
          if (recent) continue;
        }

        validatedInteractions.push({
          userId,
          courseId,
          videoId,
          type,
          data: { ...data, timestamp: timestamp || new Date().toISOString() },
          deviceInfo: getDeviceInfo(req),
          userTier: req.user.tier || "free",
          userSegment: req.user.segment || "active",
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          clientTimestamp: timestamp ? new Date(timestamp) : new Date(),
        });
      }

      if (validatedInteractions.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid interactions to track",
        });
      }

      // Track bulk interactions
      const result = await InteractionService.trackBulkInteractions(
        validatedInteractions,
      );

      // Update analytics (async)
      for (const interaction of validatedInteractions) {
        updateAnalyticsCounters(
          interaction.type,
          interaction.courseId,
          interaction.videoId,
          userId,
        ).catch(console.error);
      }

      res.status(201).json({
        success: true,
        message: `${result.length} interactions tracked successfully`,
        data: {
          tracked: result.length,
          failed: interactions.length - result.length,
          interactions: result.map((i) => ({
            id: i._id,
            type: i.type,
            timestamp: i.timestamp,
          })),
        },
      });
    } catch (error) {
      console.error("❌ Bulk track interactions error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to track bulk interactions",
      });
    }
  }

  // ✅ Get user activity timeline
  static async getUserActivity(req, res) {
    try {
      const userId = req.params.userId || req.user._id;
      const { limit = 50, offset = 0, types, startDate, endDate } = req.query;

      // Authorization check
      if (userId !== req.user._id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view this user's activity",
        });
      }

      const activity = await InteractionService.getUserActivity(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        types: types ? types.split(",") : [],
        startDate,
        endDate,
      });

      res.json({
        success: true,
        data: activity,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: await Interaction.countDocuments({ userId }),
        },
      });
    } catch (error) {
      console.error("❌ Get user activity error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user activity",
      });
    }
  }

  // ✅ Get course engagement metrics
  static async getCourseEngagement(req, res) {
    try {
      const { courseId } = req.params;
      const { period = "30d" } = req.query;

      // Authorization check (course owner or admin)
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (
        course.instructorId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view this course's analytics",
        });
      }

      const analytics = await InteractionService.getCourseEngagement(
        courseId,
        period,
      );

      res.json({
        success: true,
        data: analytics,
        courseInfo: {
          title: course.title,
          instructor: course.instructorName,
          category: course.category,
          enrolled: course.enrolledUsers?.length || 0,
          rating: course.rating || 0,
        },
      });
    } catch (error) {
      console.error("❌ Get course engagement error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch course engagement data",
      });
    }
  }

  // ✅ Get video analytics
  static async getVideoAnalytics(req, res) {
    try {
      const { videoId } = req.params;
      const { period = "30d" } = req.query;

      // Get video and course for authorization
      const video = await Video.findById(videoId).populate("courseId");
      if (!video) {
        return res.status(404).json({
          success: false,
          error: "Video not foundddddddddddddddddd",
        });
      }

      // Check if user is course instructor or admin
      if (
        video.courseId.instructorId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view this video's analytics",
        });
      }

      const analytics = await InteractionService.getVideoAnalytics(
        videoId,
        period,
      );

      res.json({
        success: true,
        data: analytics,
        videoInfo: {
          title: video.title,
          duration: video.duration,
          courseTitle: video.courseId.title,
        },
      });
    } catch (error) {
      console.error("❌ Get video analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch video analytics",
      });
    }
  }

  // ✅ Get user engagement profile
  static async getUserEngagementProfile(req, res) {
    try {
      const userId = req.params.userId || req.user._id;

      // Authorization check
      if (userId !== req.user._id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view this user's profile",
        });
      }

      const profile = await InteractionService.getUserEngagementProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error("❌ Get user engagement profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch user engagement profile",
      });
    }
  }

  // ✅ Get system analytics (admin only)
  static async getSystemAnalytics(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Admin access required",
        });
      }

      const { period = "30d" } = req.query;
      const analytics = await InteractionService.getSystemAnalytics(period);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("❌ Get system analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch system analytics",
      });
    }
  }

  // ✅ Get active users
  static async getActiveUsers(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Admin access required",
        });
      }

      const { minutes = 5 } = req.query;
      const activeUsers = await InteractionService.getActiveUsers(
        parseInt(minutes),
      );

      res.json({
        success: true,
        data: activeUsers,
        count: activeUsers.length,
      });
    } catch (error) {
      console.error("❌ Get active users error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch active users",
      });
    }
  }

  // ✅ Get heatmap data
  static async getHeatmapData(req, res) {
    try {
      const { courseId } = req.params;
      const { videoId } = req.query;

      // Check course authorization
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (
        course.instructorId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view this course's heatmap",
        });
      }

      const heatmap = await InteractionService.getHeatmapData(
        courseId,
        videoId,
      );

      res.json({
        success: true,
        data: heatmap,
        courseInfo: {
          title: course.title,
          category: course.category,
        },
      });
    } catch (error) {
      console.error("❌ Get heatmap data error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch heatmap data",
      });
    }
  }

  // ✅ Get retention funnel
  static async getRetentionFunnel(req, res) {
    try {
      const { courseId } = req.params;

      // Authorization check
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      if (
        course.instructorId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to view this course's funnel",
        });
      }

      const funnel = await InteractionService.getRetentionFunnel(courseId);

      res.json({
        success: true,
        data: funnel,
        courseInfo: {
          title: course.title,
          instructor: course.instructorName,
        },
      });
    } catch (error) {
      console.error("❌ Get retention funnel error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch retention funnel",
      });
    }
  }

  // ✅ Cleanup old interactions (admin only)
  static async cleanupOldInteractions(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Admin access required",
        });
      }

      const { days = 365 } = req.query;
      const result = await InteractionService.cleanupOldInteractions(
        parseInt(days),
      );

      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      console.error("❌ Cleanup old interactions error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cleanup old interactions",
      });
    }
  }

  // ✅ Get real-time stats (for dashboard)
  static async getRealTimeStats(req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "instructor") {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const stats = await Interaction.aggregate([
        {
          $facet: {
            today: [
              { $match: { timestamp: { $gte: todayStart } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  uniqueUsers: { $addToSet: "$userId" },
                  conversions: {
                    $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                  },
                  revenue: { $sum: "$revenueImpact" },
                },
              },
            ],
            yesterday: [
              {
                $match: {
                  timestamp: { $gte: yesterdayStart, $lt: todayStart },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  uniqueUsers: { $addToSet: "$userId" },
                },
              },
            ],
            topTypes: [
              { $match: { timestamp: { $gte: todayStart } } },
              {
                $group: {
                  _id: "$type",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            activeCourses: [
              { $match: { timestamp: { $gte: todayStart } } },
              {
                $group: {
                  _id: "$courseId",
                  interactions: { $sum: 1 },
                  users: { $addToSet: "$userId" },
                },
              },
              { $sort: { interactions: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "courses",
                  localField: "_id",
                  foreignField: "_id",
                  as: "course",
                },
              },
              {
                $project: {
                  courseId: "$_id",
                  courseTitle: { $arrayElemAt: ["$course.title", 0] },
                  interactions: 1,
                  uniqueUsers: { $size: "$users" },
                },
              },
            ],
          },
        },
      ]);

      res.json({
        success: true,
        data: stats[0],
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("❌ Get real-time stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch real-time stats",
      });
    }
  }
}

module.exports = InteractionController;
