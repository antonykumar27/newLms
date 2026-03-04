const mongoose = require("mongoose");
const Interaction = require("./interaction"); // Assuming your schema file is named interaction.js

class InteractionService {
  // Track new interaction
  static async trackInteraction(data) {
    try {
      const interaction = new Interaction({
        ...data,
        serverTimestamp: new Date(),
      });

      await interaction.save();
      return interaction;
    } catch (error) {
      console.error("Error tracking interaction:", error);
      throw error;
    }
  }

  // Bulk track interactions
  static async trackBulkInteractions(interactions) {
    try {
      const results = await Interaction.insertMany(interactions);
      return results;
    } catch (error) {
      console.error("Error bulk tracking interactions:", error);
      throw error;
    }
  }

  // Get user activity timeline
  static async getUserActivity(userId, options = {}) {
    const { limit = 50, offset = 0, types = [], startDate, endDate } = options;

    const query = { userId };

    // Add type filter if provided
    if (types.length > 0) {
      query.type = { $in: types };
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const activities = await Interaction.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .populate("courseId", "title thumbnail category")
      .populate("videoId", "title thumbnail duration")
      .lean();

    return activities;
  }

  // Get course engagement metrics
  static async getCourseEngagement(courseId, period = "7d") {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0); // From beginning
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const metrics = await Interaction.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId),
          timestamp: { $gte: startDate, $lte: now },
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalInteractions: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                totalUsers: { $addToSet: "$userId" },
                totalRevenue: { $sum: "$revenueImpact" },
                totalConversions: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
                highValueInteractions: {
                  $sum: { $cond: [{ $gte: ["$engagementValue", 70] }, 1, 0] },
                },
                negativeInteractions: {
                  $sum: { $cond: [{ $lte: ["$engagementValue", 30] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalInteractions: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                uniqueUsers: { $size: "$totalUsers" },
                totalRevenue: 1,
                totalConversions: 1,
                highValueInteractions: 1,
                negativeInteractions: 1,
                conversionRate: {
                  $cond: [
                    { $eq: ["$totalInteractions", 0] },
                    0,
                    {
                      $divide: [
                        { $multiply: ["$totalConversions", 100] },
                        "$totalInteractions",
                      ],
                    },
                  ],
                },
                highValueRate: {
                  $cond: [
                    { $eq: ["$totalInteractions", 0] },
                    0,
                    {
                      $divide: [
                        { $multiply: ["$highValueInteractions", 100] },
                        "$totalInteractions",
                      ],
                    },
                  ],
                },
              },
            },
          ],
          byType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
            { $sort: { count: -1 } },
            {
              $project: {
                type: "$_id",
                count: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                uniqueUsers: { $size: "$uniqueUsers" },
              },
            },
          ],
          dailyTrend: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
                engagement: { $avg: "$engagementValue" },
                conversions: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
                revenue: { $sum: "$revenueImpact" },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                count: 1,
                engagement: { $round: ["$engagement", 2] },
                conversions: 1,
                revenue: 1,
              },
            },
          ],
          hourlyTrend: [
            {
              $group: {
                _id: {
                  hour: { $hour: "$timestamp" },
                  day: {
                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.day": 1, "_id.hour": 1 } },
            {
              $project: {
                hour: "$_id.hour",
                day: "$_id.day",
                count: 1,
              },
            },
          ],
          topUsers: [
            {
              $group: {
                _id: "$userId",
                interactionCount: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                totalRevenue: { $sum: "$revenueImpact" },
                conversions: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
                lastActive: { $max: "$timestamp" },
              },
            },
            { $sort: { interactionCount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo",
              },
            },
            {
              $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                userId: "$_id",
                name: "$userInfo.name",
                email: "$userInfo.email",
                interactionCount: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                totalRevenue: 1,
                conversions: 1,
                lastActive: 1,
              },
            },
          ],
          deviceBreakdown: [
            {
              $group: {
                _id: {
                  $cond: [
                    { $eq: ["$deviceInfo.isMobile", true] },
                    "mobile",
                    {
                      $cond: [
                        { $eq: ["$deviceInfo.isTablet", true] },
                        "tablet",
                        "desktop",
                      ],
                    },
                  ],
                },
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
              },
            },
            {
              $project: {
                device: "$_id",
                count: 1,
                percentage: 0, // Will calculate in post-processing
                avgEngagement: { $round: ["$avgEngagement", 2] },
              },
            },
          ],
          geographicDistribution: [
            {
              $match: { "location.country": { $exists: true, $ne: null } },
            },
            {
              $group: {
                _id: "$location.country",
                count: { $sum: 1 },
                cities: { $addToSet: "$location.city" },
              },
            },
            { $sort: { count: -1 } },
            {
              $project: {
                country: "$_id",
                count: 1,
                cityCount: { $size: "$cities" },
              },
            },
          ],
        },
      },
    ]);

    const result = metrics[0];

    // Calculate percentages for byType
    if (result.byType && result.summary) {
      const total = result.summary[0]?.totalInteractions || 0;
      result.byType.forEach((item) => {
        item.percentage =
          total > 0 ? ((item.count / total) * 100).toFixed(2) : 0;
      });
    }

    // Calculate percentages for device breakdown
    if (result.deviceBreakdown && result.summary) {
      const total = result.summary[0]?.totalInteractions || 0;
      result.deviceBreakdown.forEach((item) => {
        item.percentage =
          total > 0 ? ((item.count / total) * 100).toFixed(2) : 0;
      });
    }

    return result;
  }

  // Get video analytics
  static async getVideoAnalytics(videoId, period = "30d") {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const analytics = await Interaction.aggregate([
      {
        $match: {
          videoId: new mongoose.Types.ObjectId(videoId),
          timestamp: { $gte: startDate, $lte: now },
        },
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalViews: {
                  $sum: { $cond: [{ $eq: ["$type", "video_view"] }, 1, 0] },
                },
                totalLikes: {
                  $sum: { $cond: [{ $eq: ["$type", "video_like"] }, 1, 0] },
                },
                totalDislikes: {
                  $sum: { $cond: [{ $eq: ["$type", "video_dislike"] }, 1, 0] },
                },
                totalBookmarks: {
                  $sum: { $cond: [{ $eq: ["$type", "video_bookmark"] }, 1, 0] },
                },
                totalShares: {
                  $sum: { $cond: [{ $eq: ["$type", "video_share"] }, 1, 0] },
                },
                totalDownloads: {
                  $sum: { $cond: [{ $eq: ["$type", "video_download"] }, 1, 0] },
                },
                avgWatchTime: { $avg: "$data.watchTime" },
                avgEngagement: { $avg: "$engagementValue" },
                completionRate: {
                  $avg: {
                    $cond: [
                      { $and: ["$data.watchTime", "$videoDuration"] },
                      { $divide: ["$data.watchTime", "$videoDuration"] },
                      0,
                    ],
                  },
                },
                uniqueViewers: { $addToSet: "$userId" },
                dropOffPoints: {
                  $push: {
                    $cond: [
                      { $and: ["$data.currentTime", "$videoDuration"] },
                      {
                        $multiply: [
                          { $divide: ["$data.currentTime", "$videoDuration"] },
                          100,
                        ],
                      },
                      null,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalViews: 1,
                totalLikes: 1,
                totalDislikes: 1,
                totalBookmarks: 1,
                totalShares: 1,
                totalDownloads: 1,
                likeDislikeRatio: {
                  $cond: [
                    { $eq: ["$totalDislikes", 0] },
                    "$totalLikes",
                    { $divide: ["$totalLikes", "$totalDislikes"] },
                  ],
                },
                avgWatchTime: { $round: ["$avgWatchTime", 2] },
                avgEngagement: { $round: ["$avgEngagement", 2] },
                completionRate: {
                  $multiply: [{ $round: ["$completionRate", 4] }, 100],
                },
                uniqueViewers: { $size: "$uniqueViewers" },
                engagementRate: {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $add: [
                            "$totalLikes",
                            "$totalBookmarks",
                            "$totalDislikes",
                            "$totalShares",
                            "$totalDownloads",
                          ],
                        },
                        "$totalViews",
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          ],
          watchTimeDistribution: [
            {
              $match: {
                type: "video_view",
                "data.watchTime": { $exists: true },
              },
            },
            {
              $bucket: {
                groupBy: {
                  $multiply: [
                    {
                      $divide: [
                        { $ifNull: ["$data.watchTime", 0] },
                        { $ifNull: ["$videoDuration", 1] },
                      ],
                    },
                    100,
                  ],
                },
                boundaries: [0, 25, 50, 75, 90, 100],
                default: "Other",
                output: {
                  count: { $sum: 1 },
                  avgWatchTime: { $avg: "$data.watchTime" },
                },
              },
            },
            {
              $project: {
                range: {
                  $concat: [
                    { $toString: "$$ROOT._id" },
                    "-",
                    {
                      $toString: {
                        $add: ["$$ROOT._id", 25],
                      },
                    },
                    "%",
                  ],
                },
                count: 1,
                avgWatchTime: { $round: ["$avgWatchTime", 2] },
              },
            },
          ],
          dailyViews: [
            {
              $match: { type: "video_view" },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                views: { $sum: 1 },
                uniqueViewers: { $addToSet: "$userId" },
                avgWatchTime: { $avg: "$data.watchTime" },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                views: 1,
                uniqueViewers: { $size: "$uniqueViewers" },
                avgWatchTime: { $round: ["$avgWatchTime", 2] },
              },
            },
          ],
          viewerSegments: [
            {
              $group: {
                _id: "$userSegment",
                count: { $sum: 1 },
                avgWatchTime: { $avg: "$data.watchTime" },
                avgEngagement: { $avg: "$engagementValue" },
              },
            },
            {
              $project: {
                segment: "$_id",
                count: 1,
                percentage: 0, // Will calculate in post-processing
                avgWatchTime: { $round: ["$avgWatchTime", 2] },
                avgEngagement: { $round: ["$avgEngagement", 2] },
              },
            },
          ],
          interactionTimeline: [
            {
              $group: {
                _id: {
                  hour: { $hour: "$timestamp" },
                },
                count: { $sum: 1 },
                likes: {
                  $sum: { $cond: [{ $eq: ["$type", "video_like"] }, 1, 0] },
                },
                bookmarks: {
                  $sum: { $cond: [{ $eq: ["$type", "video_bookmark"] }, 1, 0] },
                },
              },
            },
            { $sort: { "_id.hour": 1 } },
            {
              $project: {
                hour: "$_id.hour",
                count: 1,
                likes: 1,
                bookmarks: 1,
              },
            },
          ],
        },
      },
    ]);

    const result = analytics[0];

    // Calculate percentages for viewer segments
    if (result.viewerSegments && result.overview) {
      const total = result.overview[0]?.totalViews || 0;
      result.viewerSegments.forEach((segment) => {
        segment.percentage =
          total > 0 ? ((segment.count / total) * 100).toFixed(2) : 0;
      });
    }

    return result;
  }

  // Get user engagement profile
  static async getUserEngagementProfile(userId) {
    const profile = await Interaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalInteractions: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                totalRevenueImpact: { $sum: "$revenueImpact" },
                conversionCount: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
                highValueCount: {
                  $sum: { $cond: [{ $gte: ["$engagementValue", 70] }, 1, 0] },
                },
                firstInteraction: { $min: "$timestamp" },
                lastInteraction: { $max: "$timestamp" },
                totalCourses: { $addToSet: "$courseId" },
                totalVideos: { $addToSet: "$videoId" },
              },
            },
            {
              $project: {
                _id: 0,
                totalInteractions: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                totalRevenueImpact: 1,
                conversionCount: 1,
                highValueCount: 1,
                conversionRate: {
                  $cond: [
                    { $eq: ["$totalInteractions", 0] },
                    0,
                    {
                      $divide: [
                        { $multiply: ["$conversionCount", 100] },
                        "$totalInteractions",
                      ],
                    },
                  ],
                },
                highValueRate: {
                  $cond: [
                    { $eq: ["$totalInteractions", 0] },
                    0,
                    {
                      $divide: [
                        { $multiply: ["$highValueCount", 100] },
                        "$totalInteractions",
                      ],
                    },
                  ],
                },
                firstInteraction: 1,
                lastInteraction: 1,
                totalCourses: { $size: "$totalCourses" },
                totalVideos: { $size: "$totalVideos" },
                activityDurationDays: {
                  $cond: [
                    { $and: ["$firstInteraction", "$lastInteraction"] },
                    {
                      $divide: [
                        {
                          $subtract: ["$lastInteraction", "$firstInteraction"],
                        },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          ],
          activityByType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                lastActivity: { $max: "$timestamp" },
              },
            },
            { $sort: { count: -1 } },
            {
              $project: {
                type: "$_id",
                count: 1,
                percentage: 0, // Will calculate in post-processing
                avgEngagement: { $round: ["$avgEngagement", 2] },
                lastActivity: 1,
              },
            },
          ],
          activityTimeline: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                conversions: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                count: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                conversions: 1,
              },
            },
          ],
          courseEngagement: [
            {
              $group: {
                _id: "$courseId",
                interactionCount: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                lastActivity: { $max: "$timestamp" },
                completionStatus: {
                  $max: {
                    $cond: [
                      { $eq: ["$type", "course_completed"] },
                      true,
                      false,
                    ],
                  },
                },
              },
            },
            { $sort: { interactionCount: -1 } },
            {
              $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo",
              },
            },
            {
              $unwind: {
                path: "$courseInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                courseId: "$_id",
                courseTitle: "$courseInfo.title",
                courseCategory: "$courseInfo.category",
                interactionCount: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                lastActivity: 1,
                completionStatus: 1,
              },
            },
          ],
          preferredDevices: [
            {
              $group: {
                _id: {
                  $cond: [
                    { $eq: ["$deviceInfo.isMobile", true] },
                    "mobile",
                    {
                      $cond: [
                        { $eq: ["$deviceInfo.isTablet", true] },
                        "tablet",
                        "desktop",
                      ],
                    },
                  ],
                },
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
              },
            },
            {
              $project: {
                device: "$_id",
                count: 1,
                percentage: 0, // Will calculate in post-processing
                avgEngagement: { $round: ["$avgEngagement", 2] },
              },
            },
          ],
          peakActivityHours: [
            {
              $group: {
                _id: { $hour: "$timestamp" },
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $project: {
                hour: "$_id",
                count: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
              },
            },
          ],
        },
      },
    ]);

    const result = profile[0];

    // Calculate percentages
    if (result.overview && result.activityByType) {
      const total = result.overview[0]?.totalInteractions || 0;
      result.activityByType.forEach((item) => {
        item.percentage =
          total > 0 ? ((item.count / total) * 100).toFixed(2) : 0;
      });
    }

    if (result.overview && result.preferredDevices) {
      const total = result.overview[0]?.totalInteractions || 0;
      result.preferredDevices.forEach((device) => {
        device.percentage =
          total > 0 ? ((device.count / total) * 100).toFixed(2) : 0;
      });
    }

    return result;
  }

  // Get retention funnel
  static async getRetentionFunnel(courseId) {
    const funnel = await Interaction.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $facet: {
          views: [
            { $match: { type: "course_view" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
          wishlist: [
            { $match: { type: "course_wishlist_add" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
          previews: [
            { $match: { type: "free_preview_click" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
          enrollments: [
            { $match: { type: "course_enroll" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
          videoViews: [
            { $match: { type: "video_view" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
          completions: [
            { $match: { type: "course_completed" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
          reviews: [
            { $match: { type: "course_review" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
          ],
        },
      },
      {
        $project: {
          views: {
            count: { $arrayElemAt: ["$views.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$views.uniqueUsers", 0] } } || 0,
          },
          wishlist: {
            count: { $arrayElemAt: ["$wishlist.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$wishlist.uniqueUsers", 0] } } || 0,
          },
          previews: {
            count: { $arrayElemAt: ["$previews.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$previews.uniqueUsers", 0] } } || 0,
          },
          enrollments: {
            count: { $arrayElemAt: ["$enrollments.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$enrollments.uniqueUsers", 0] } } || 0,
          },
          videoViews: {
            count: { $arrayElemAt: ["$videoViews.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$videoViews.uniqueUsers", 0] } } || 0,
          },
          completions: {
            count: { $arrayElemAt: ["$completions.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$completions.uniqueUsers", 0] } } || 0,
          },
          reviews: {
            count: { $arrayElemAt: ["$reviews.count", 0] } || 0,
            uniqueUsers:
              { $size: { $arrayElemAt: ["$reviews.uniqueUsers", 0] } } || 0,
          },
        },
      },
    ]);

    const result = funnel[0];

    // Calculate conversion rates
    if (result) {
      result.conversionRates = {
        viewToWishlist:
          result.views.count > 0
            ? (
                (result.wishlist.uniqueUsers / result.views.uniqueUsers) *
                100
              ).toFixed(2)
            : 0,
        wishlistToPreview:
          result.wishlist.uniqueUsers > 0
            ? (
                (result.previews.uniqueUsers / result.wishlist.uniqueUsers) *
                100
              ).toFixed(2)
            : 0,
        previewToEnrollment:
          result.previews.uniqueUsers > 0
            ? (
                (result.enrollments.uniqueUsers / result.previews.uniqueUsers) *
                100
              ).toFixed(2)
            : 0,
        enrollmentToVideoView:
          result.enrollments.uniqueUsers > 0
            ? (
                (result.videoViews.uniqueUsers /
                  result.enrollments.uniqueUsers) *
                100
              ).toFixed(2)
            : 0,
        enrollmentToCompletion:
          result.enrollments.uniqueUsers > 0
            ? (
                (result.completions.uniqueUsers /
                  result.enrollments.uniqueUsers) *
                100
              ).toFixed(2)
            : 0,
        completionToReview:
          result.completions.uniqueUsers > 0
            ? (
                (result.reviews.uniqueUsers / result.completions.uniqueUsers) *
                100
              ).toFixed(2)
            : 0,
      };
    }

    return result;
  }

  // Get system-wide analytics
  static async getSystemAnalytics(period = "30d") {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const analytics = await Interaction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
        },
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalInteractions: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                totalRevenue: { $sum: "$revenueImpact" },
                totalUsers: { $addToSet: "$userId" },
                totalCourses: { $addToSet: "$courseId" },
                totalConversions: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalInteractions: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                totalRevenue: 1,
                uniqueUsers: { $size: "$totalUsers" },
                uniqueCourses: { $size: "$totalCourses" },
                totalConversions: 1,
                avgDailyInteractions: {
                  $divide: [
                    "$totalInteractions",
                    {
                      $divide: [
                        { $subtract: [now, startDate] },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                  ],
                },
                conversionRate: {
                  $cond: [
                    { $eq: ["$totalInteractions", 0] },
                    0,
                    {
                      $divide: [
                        { $multiply: ["$totalConversions", 100] },
                        "$totalInteractions",
                      ],
                    },
                  ],
                },
                revenuePerUser: {
                  $cond: [
                    { $eq: [{ $size: "$totalUsers" }, 0] },
                    0,
                    { $divide: ["$totalRevenue", { $size: "$totalUsers" }] },
                  ],
                },
              },
            },
          ],
          topCourses: [
            {
              $group: {
                _id: "$courseId",
                interactionCount: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                totalRevenue: { $sum: "$revenueImpact" },
                uniqueUsers: { $addToSet: "$userId" },
              },
            },
            { $sort: { interactionCount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo",
              },
            },
            {
              $unwind: {
                path: "$courseInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                courseId: "$_id",
                courseTitle: "$courseInfo.title",
                courseInstructor: "$courseInfo.instructor",
                interactionCount: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                totalRevenue: 1,
                uniqueUsers: { $size: "$uniqueUsers" },
                engagementPerUser: {
                  $cond: [
                    { $eq: [{ $size: "$uniqueUsers" }, 0] },
                    0,
                    {
                      $divide: ["$interactionCount", { $size: "$uniqueUsers" }],
                    },
                  ],
                },
              },
            },
          ],
          topUsers: [
            {
              $group: {
                _id: "$userId",
                interactionCount: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                totalRevenue: { $sum: "$revenueImpact" },
                conversions: {
                  $sum: { $cond: [{ $eq: ["$isConversion", true] }, 1, 0] },
                },
              },
            },
            { $sort: { interactionCount: -1 } },
            { $limit: 15 },
          ],
          activityByHour: [
            {
              $group: {
                _id: { $hour: "$timestamp" },
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                hour: "$_id",
                count: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
              },
            },
          ],
          engagementTrend: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
                avgEngagement: { $avg: "$engagementValue" },
                revenue: { $sum: "$revenueImpact" },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                count: 1,
                avgEngagement: { $round: ["$avgEngagement", 2] },
                revenue: 1,
              },
            },
          ],
        },
      },
    ]);

    return analytics[0];
  }

  // Clean up old interactions (for maintenance)
  static async cleanupOldInteractions(daysToKeep = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await Interaction.deleteMany({
      timestamp: { $lt: cutoffDate },
      isConversion: false,
      engagementValue: { $lt: 30 },
      type: {
        $nin: [
          "course_enroll",
          "course_completed",
          "certificate_download",
          "course_review",
        ],
      },
    });

    return {
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate,
      message: `Cleaned up ${result.deletedCount} old interactions`,
    };
  }

  // Get real-time active users
  static async getActiveUsers(minutes = 5) {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

    const activeUsers = await Interaction.aggregate([
      {
        $match: {
          timestamp: { $gte: cutoffTime },
        },
      },
      {
        $group: {
          _id: "$userId",
          lastActivity: { $max: "$timestamp" },
          activityCount: { $sum: 1 },
          types: { $addToSet: "$type" },
          currentCourse: { $last: "$courseId" },
        },
      },
      { $sort: { lastActivity: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          lastActivity: 1,
          activityCount: 1,
          activityTypes: "$types",
          currentCourse: 1,
          timeSinceLastActivity: {
            $divide: [
              { $subtract: [new Date(), "$lastActivity"] },
              1000 * 60, // Convert to minutes
            ],
          },
        },
      },
    ]);

    return activeUsers;
  }

  // Get heatmap data for course/video
  static async getHeatmapData(courseId, videoId = null) {
    const matchStage = { courseId: new mongoose.Types.ObjectId(courseId) };
    if (videoId) {
      matchStage.videoId = new mongoose.Types.ObjectId(videoId);
    }

    const heatmap = await Interaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            dayOfWeek: { $dayOfWeek: "$timestamp" },
          },
          count: { $sum: 1 },
          avgEngagement: { $avg: "$engagementValue" },
        },
      },
      {
        $project: {
          hour: "$_id.hour",
          dayOfWeek: "$_id.dayOfWeek",
          count: 1,
          avgEngagement: { $round: ["$avgEngagement", 2] },
          intensity: {
            $switch: {
              branches: [
                { case: { $gte: ["$count", 100] }, then: "high" },
                { case: { $gte: ["$count", 50] }, then: "medium" },
                { case: { $gte: ["$count", 10] }, then: "low" },
              ],
              default: "very-low",
            },
          },
        },
      },
    ]);

    return heatmap;
  }
}

module.exports = InteractionService;
