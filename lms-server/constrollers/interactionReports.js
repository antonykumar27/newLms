const mongoose = require("mongoose");
const Interaction = require("../models/interaction");

const Course = require("../models/course");

const User = require("../models/loginUserModel");

const Video = require("../models/videoModel");
class ReportController {
  // ✅ 1. ANALYTICS REPORT (Admin/Teachers only)
  static async getAnalyticsReport(req, res) {
    try {
      const {
        period = "7d",
        courseId,
        videoId,
        startDate,
        endDate,
      } = req.query;
      const user = req.user;

      // 🔒 Check permissions
      if (!["admin", "teacher", "instructor"].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: "Only admins and teachers can view analytics reports",
        });
      }

      // Determine date range
      const dateRange = getDateRange(period, startDate, endDate);

      // Build filter
      const filter = {
        "timestamps.eventOccurred": {
          $gte: dateRange.start,
          $lte: dateRange.end,
        },
      };

      if (courseId) {
        filter.courseId = new mongoose.Types.ObjectId(courseId);
      }

      if (videoId) {
        filter.videoId = new mongoose.Types.ObjectId(videoId);
      }

      // If teacher, only show their courses
      if (user.role === "teacher") {
        const teacherCourses = await Course.find({
          instructor: user._id,
        }).select("_id");
        filter.courseId = { $in: teacherCourses.map((c) => c._id) };
      }

      // 📊 Generate analytics
      const analytics = await Interaction.aggregate([
        { $match: filter },
        {
          $facet: {
            // Overview stats
            overview: [
              {
                $group: {
                  _id: null,
                  totalInteractions: { $sum: 1 },
                  uniqueUsers: { $addToSet: "$userId" },
                  uniqueCourses: { $addToSet: "$courseId" },
                  uniqueVideos: { $addToSet: "$videoId" },
                  totalWatchTime: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$type", "video_view"] },
                            { $gt: ["$data.watchTime", 0] },
                          ],
                        },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  avgEngagement: { $avg: "$analytics.engagementValue" },
                  conversionRate: {
                    $avg: {
                      $cond: [
                        {
                          $in: ["$type", ["course_enroll", "payment_success"]],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalInteractions: 1,
                  uniqueUsers: { $size: "$uniqueUsers" },
                  uniqueCourses: { $size: "$uniqueCourses" },
                  uniqueVideos: { $size: "$uniqueVideos" },
                  totalWatchHours: {
                    $round: [{ $divide: ["$totalWatchTime", 3600] }, 2],
                  },
                  avgEngagement: { $round: ["$avgEngagement", 2] },
                  conversionRate: {
                    $round: [{ $multiply: ["$conversionRate", 100] }, 2],
                  },
                  avgInteractionsPerUser: {
                    $round: [
                      {
                        $divide: [
                          "$totalInteractions",
                          { $size: "$uniqueUsers" },
                        ],
                      },
                      2,
                    ],
                  },
                },
              },
            ],

            // Daily trend
            dailyTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$timestamps.eventOccurred",
                      timezone: "Asia/Kolkata",
                    },
                  },
                  interactions: { $sum: 1 },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  users: { $addToSet: "$userId" },
                  newUsers: {
                    $addToSet: {
                      $cond: [
                        { $eq: ["$type", "user_signup"] },
                        "$userId",
                        null,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  date: "$_id",
                  interactions: 1,
                  watchHours: {
                    $round: [{ $divide: ["$watchTime", 3600] }, 2],
                  },
                  activeUsers: { $size: "$users" },
                  newUsers: { $size: "$newUsers" },
                },
              },
              { $sort: { date: 1 } },
            ],

            // Event type distribution
            eventDistribution: [
              {
                $group: {
                  _id: "$type",
                  count: { $sum: 1 },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  uniqueUsers: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  eventType: "$_id",
                  count: 1,
                  percentage: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$count", { $sum: "$count" }] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                  avgWatchTime: {
                    $round: [{ $divide: ["$watchTime", "$count"] }, 2],
                  },
                  uniqueUsers: { $size: "$uniqueUsers" },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 15 },
            ],

            // Top videos
            topVideos: [
              {
                $match: { videoId: { $exists: true } },
              },
              {
                $group: {
                  _id: "$videoId",
                  views: {
                    $sum: { $cond: [{ $eq: ["$type", "video_view"] }, 1, 0] },
                  },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  likes: {
                    $sum: { $cond: [{ $eq: ["$type", "video_like"] }, 1, 0] },
                  },
                  completionRate: {
                    $avg: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$type", "video_view"] },
                            { $gte: ["$data.percentageWatched", 90] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $lookup: {
                  from: "videos",
                  localField: "_id",
                  foreignField: "_id",
                  as: "video",
                },
              },
              { $unwind: "$video" },
              {
                $project: {
                  videoId: "$_id",
                  title: "$video.title",
                  duration: "$video.duration",
                  views: 1,
                  watchHours: {
                    $round: [{ $divide: ["$watchTime", 3600] }, 2],
                  },
                  likes: 1,
                  completionRate: {
                    $round: [{ $multiply: ["$completionRate", 100] }, 2],
                  },
                  engagementScore: {
                    $round: [
                      {
                        $add: [
                          { $multiply: ["$completionRate", 50] },
                          {
                            $multiply: [
                              {
                                $divide: [
                                  "$watchTime",
                                  { $multiply: ["$views", "$video.duration"] },
                                ],
                              },
                              30,
                            ],
                          },
                          {
                            $multiply: [{ $divide: ["$likes", "$views"] }, 20],
                          },
                        ],
                      },
                      2,
                    ],
                  },
                },
              },
              { $sort: { views: -1 } },
              { $limit: 10 },
            ],

            // User segments
            userSegments: [
              {
                $match: { "userContext.segment": { $exists: true } },
              },
              {
                $group: {
                  _id: "$userContext.segment",
                  users: { $addToSet: "$userId" },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  avgEngagement: { $avg: "$analytics.engagementValue" },
                  conversionRate: {
                    $avg: {
                      $cond: [
                        {
                          $in: ["$type", ["course_enroll", "payment_success"]],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  segment: "$_id",
                  userCount: { $size: "$users" },
                  avgWatchTime: {
                    $round: [
                      { $divide: ["$watchTime", { $size: "$users" }] },
                      2,
                    ],
                  },
                  avgEngagement: { $round: ["$avgEngagement", 2] },
                  conversionRate: {
                    $round: [{ $multiply: ["$conversionRate", 100] }, 2],
                  },
                },
              },
              { $sort: { userCount: -1 } },
            ],

            // Device breakdown
            deviceBreakdown: [
              {
                $match: { "deviceInfo.deviceType": { $exists: true } },
              },
              {
                $group: {
                  _id: "$deviceInfo.deviceType",
                  count: { $sum: 1 },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  users: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  deviceType: "$_id",
                  count: 1,
                  percentage: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$count", { $sum: "$count" }] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                  avgWatchTime: {
                    $round: [{ $divide: ["$watchTime", "$count"] }, 2],
                  },
                  uniqueUsers: { $size: "$users" },
                },
              },
              { $sort: { count: -1 } },
            ],

            // Geographic distribution
            geographicDistribution: [
              {
                $match: { "geoLocation.country": { $exists: true } },
              },
              {
                $group: {
                  _id: "$geoLocation.country",
                  count: { $sum: 1 },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                  users: { $addToSet: "$userId" },
                },
              },
              {
                $project: {
                  country: "$_id",
                  count: 1,
                  watchHours: {
                    $round: [{ $divide: ["$watchTime", 3600] }, 2],
                  },
                  uniqueUsers: { $size: "$users" },
                  avgWatchTimePerUser: {
                    $round: [
                      { $divide: ["$watchTime", { $size: "$users" }] },
                      2,
                    ],
                  },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 15 },
            ],

            // Hourly activity pattern
            hourlyPattern: [
              {
                $group: {
                  _id: {
                    hour: {
                      $hour: {
                        date: "$timestamps.eventOccurred",
                        timezone: "Asia/Kolkata",
                      },
                    },
                  },
                  count: { $sum: 1 },
                  watchTime: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "video_view"] },
                        "$data.watchTime",
                        0,
                      ],
                    },
                  },
                },
              },
              {
                $project: {
                  hour: "$_id.hour",
                  count: 1,
                  watchHours: {
                    $round: [{ $divide: ["$watchTime", 3600] }, 2],
                  },
                  timeLabel: {
                    $concat: [{ $toString: "$_id.hour" }, ":00"],
                  },
                  period: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $and: [
                              { $gte: ["$_id.hour", 6] },
                              { $lt: ["$_id.hour", 12] },
                            ],
                          },
                          then: "Morning",
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ["$_id.hour", 12] },
                              { $lt: ["$_id.hour", 17] },
                            ],
                          },
                          then: "Afternoon",
                        },
                        {
                          case: {
                            $and: [
                              { $gte: ["$_id.hour", 17] },
                              { $lt: ["$_id.hour", 22] },
                            ],
                          },
                          then: "Evening",
                        },
                        {
                          case: {
                            $or: [
                              { $lt: ["$_id.hour", 6] },
                              { $gte: ["$_id.hour", 22] },
                            ],
                          },
                          then: "Night",
                        },
                      ],
                      default: "Unknown",
                    },
                  },
                },
              },
              { $sort: { hour: 1 } },
            ],
          },
        },
      ]);

      res.status(200).json({
        success: true,
        reportType: "ANALYTICS",
        period: period,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end,
        },
        generatedAt: new Date().toISOString(),
        role: user.role,
        data: analytics[0],
      });
    } catch (error) {
      console.error("❌ Analytics report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate analytics report",
      });
    }
  }

  // ✅ 2. INTERACTION REPORT (User's own activity)
  static async getInteractionReport(req, res) {
    try {
      const {
        period = "today",
        courseId,
        videoId,
        page = 1,
        limit = 50,
      } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Check if user is requesting someone else's data
      let targetUserId = userId;
      if (req.query.userId && ["admin", "teacher"].includes(userRole)) {
        targetUserId = req.query.userId;
      }

      // Date range
      const dateRange = getDateRange(period);

      // Build filter
      const filter = {
        userId: new mongoose.Types.ObjectId(targetUserId),
        "timestamps.eventOccurred": {
          $gte: dateRange.start,
          $lte: dateRange.end,
        },
      };

      if (courseId) {
        filter.courseId = new mongoose.Types.ObjectId(courseId);
      }

      if (videoId) {
        filter.videoId = new mongoose.Types.ObjectId(videoId);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get interactions
      const interactions = await Interaction.find(filter)
        .sort({ "timestamps.eventOccurred": -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("courseId", "title thumbnail")
        .populate("videoId", "title duration thumbnail")
        .lean();

      // Get summary stats
      const summary = await Interaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalInteractions: { $sum: 1 },
            uniqueCourses: { $addToSet: "$courseId" },
            uniqueVideos: { $addToSet: "$videoId" },
            totalWatchTime: {
              $sum: {
                $cond: [{ $eq: ["$type", "video_view"] }, "$data.watchTime", 0],
              },
            },
            eventBreakdown: {
              $push: {
                type: "$type",
                timestamp: "$timestamps.eventOccurred",
                currentTime: "$data.currentTime",
                duration: "$data.duration",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalInteractions: 1,
            uniqueCourses: { $size: "$uniqueCourses" },
            uniqueVideos: { $size: "$uniqueVideos" },
            totalWatchHours: {
              $round: [{ $divide: ["$totalWatchTime", 3600] }, 2],
            },
            avgWatchTimePerVideo: {
              $round: [
                { $divide: ["$totalWatchTime", { $size: "$uniqueVideos" }] },
                2,
              ],
            },
          },
        },
      ]);

      // Format response
      const formattedInteractions = interactions.map((interaction) => ({
        id: interaction._id,
        type: interaction.type,
        timestamp: interaction.timestamps?.eventOccurred,
        course: interaction.courseId
          ? {
              id: interaction.courseId._id,
              title: interaction.courseId.title,
              thumbnail: interaction.courseId.thumbnail,
            }
          : null,
        video: interaction.videoId
          ? {
              id: interaction.videoId._id,
              title: interaction.videoId.title,
              duration: interaction.videoId.duration,
              thumbnail: interaction.videoId.thumbnail,
            }
          : null,
        data: {
          currentTime: interaction.data?.currentTime,
          duration: interaction.data?.duration,
          percentageWatched: interaction.data?.percentageWatched,
          playbackRate: interaction.data?.playbackRate,
          volume: interaction.data?.volume,
          isMuted: interaction.data?.isMuted,
        },
        device: interaction.deviceInfo?.deviceType,
        platform: interaction.deviceInfo?.platform,
      }));

      res.status(200).json({
        success: true,
        reportType: "INTERACTION",
        period: period,
        user: {
          id: targetUserId,
          isSelf: targetUserId === userId.toString(),
        },
        summary: summary[0] || {},
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Interaction.countDocuments(filter),
          totalPages: Math.ceil(
            (await Interaction.countDocuments(filter)) / limit,
          ),
        },
        interactions: formattedInteractions,
        insights: generateInteractionInsights(interactions),
      });
    } catch (error) {
      console.error("❌ Interaction report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate interaction report",
      });
    }
  }

  // ✅ 3. PROGRESS REPORT (Course completion)
  static async getProgressReport(req, res) {
    try {
      const { courseId, studentId } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Determine target user
      let targetUserId = userId;
      let isSelf = true;

      // If teacher/admin requesting student progress
      if (studentId && ["admin", "teacher"].includes(userRole)) {
        targetUserId = studentId;
        isSelf = false;
      }

      // Get user
      const user = await User.findById(targetUserId).select(
        "name email tier progress enrolledCourses completedCourses watchProgress",
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      let courses = [];

      // If specific course requested
      if (courseId) {
        const course = await Course.findById(courseId).select(
          "title description thumbnail sections instructor duration level category",
        );

        if (!course) {
          return res.status(404).json({
            success: false,
            error: "Course not found",
          });
        }

        // Get course progress
        const courseProgress = await calculateCourseProgress(
          targetUserId,
          courseId,
        );

        courses = [
          {
            course: {
              id: course._id,
              title: course.title,
              thumbnail: course.thumbnail,
              instructor: course.instructor,
              duration: course.duration,
              level: course.level,
            },
            progress: courseProgress,
          },
        ];
      } else {
        // Get all enrolled courses with progress
        const enrolledCourseIds = user.enrolledCourses || [];

        for (const courseId of enrolledCourseIds) {
          const course = await Course.findById(courseId).select(
            "title thumbnail instructor duration level",
          );

          if (course) {
            const progress = await calculateCourseProgress(
              targetUserId,
              courseId,
            );
            courses.push({
              course: {
                id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                instructor: course.instructor,
                duration: course.duration,
                level: course.level,
              },
              progress: progress,
            });
          }
        }
      }

      // Sort by progress
      courses.sort((a, b) => b.progress.overall - a.progress.overall);

      // Calculate overall stats
      const overallStats = {
        totalCourses: courses.length,
        completedCourses: user.completedCourses?.length || 0,
        inProgressCourses: courses.filter(
          (c) => c.progress.overall > 0 && c.progress.overall < 100,
        ).length,
        notStartedCourses: courses.filter((c) => c.progress.overall === 0)
          .length,
        totalWatchHours: await calculateTotalWatchTime(targetUserId),
        avgCompletionRate:
          courses.length > 0
            ? courses.reduce((sum, c) => sum + c.progress.overall, 0) /
              courses.length
            : 0,
        lastActive: user.lastActive || new Date(),
      };

      res.status(200).json({
        success: true,
        reportType: "PROGRESS",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          tier: user.tier,
          isSelf: isSelf,
        },
        overallStats: overallStats,
        courses: courses,
        generatedAt: new Date().toISOString(),
        recommendations: generateProgressRecommendations(courses),
      });
    } catch (error) {
      console.error("❌ Progress report error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate progress report",
      });
    }
  }

  // ✅ 4. TEACHER DASHBOARD (All students in a course)
  static async getTeacherDashboard(req, res) {
    try {
      const { courseId } = req.query;
      const teacherId = req.user._id;

      // Verify teacher owns the course
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      });

      if (!course) {
        return res.status(403).json({
          success: false,
          error: "You do not have access to this course or course not found",
        });
      }

      // Get all enrolled students
      const enrolledUsers = course.enrolledUsers || [];

      const students = [];
      for (const studentId of enrolledUsers) {
        const student = await User.findById(studentId).select(
          "name email tier joinedAt lastActive",
        );

        if (student) {
          const progress = await calculateCourseProgress(studentId, courseId);
          const activity = await getRecentActivity(studentId, courseId);

          students.push({
            student: {
              id: student._id,
              name: student.name,
              email: student.email,
              tier: student.tier,
              joinedAt: student.joinedAt,
              lastActive: student.lastActive,
            },
            progress: progress,
            recentActivity: activity,
            engagementScore: calculateEngagementScore(progress, activity),
          });
        }
      }

      // Sort by engagement
      students.sort((a, b) => b.engagementScore - a.engagementScore);

      // Course analytics
      const courseAnalytics = await Interaction.aggregate([
        {
          $match: {
            courseId: new mongoose.Types.ObjectId(courseId),
            "timestamps.eventOccurred": {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalInteractions: { $sum: 1 },
            uniqueStudents: { $addToSet: "$userId" },
            totalWatchTime: {
              $sum: {
                $cond: [{ $eq: ["$type", "video_view"] }, "$data.watchTime", 0],
              },
            },
            avgCompletionRate: {
              $avg: {
                $cond: [{ $eq: ["$type", "course_complete"] }, 1, 0],
              },
            },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        reportType: "TEACHER_DASHBOARD",
        course: {
          id: course._id,
          title: course.title,
          totalStudents: students.length,
          totalVideos: await getTotalVideos(courseId),
        },
        analytics: courseAnalytics[0] || {},
        students: students,
        topPerformers: students.slice(0, 5),
        needsAttention: students
          .filter((s) => s.engagementScore < 30)
          .slice(0, 5),
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Teacher dashboard error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate teacher dashboard",
      });
    }
  }

  // ✅ 5. EXPORT REPORTS (CSV/PDF)
  static async exportReport(req, res) {
    try {
      const { reportType, format = "csv", ...filters } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      let data;

      switch (reportType) {
        case "analytics":
          if (!["admin", "teacher"].includes(userRole)) {
            return res.status(403).json({ error: "Unauthorized" });
          }
          data = await generateExportData("analytics", filters);
          break;

        case "interaction":
          data = await generateExportData("interaction", {
            ...filters,
            userId,
          });
          break;

        case "progress":
          data = await generateExportData("progress", { ...filters, userId });
          break;

        default:
          return res.status(400).json({ error: "Invalid report type" });
      }

      if (format === "csv") {
        const csv = convertToCSV(data);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${reportType}_${Date.now()}.csv`,
        );
        return res.send(csv);
      } else if (format === "pdf") {
        // PDF generation logic
        const pdf = await generatePDF(data, reportType);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${reportType}_${Date.now()}.pdf`,
        );
        return res.send(pdf);
      } else {
        return res.status(400).json({ error: "Unsupported format" });
      }
    } catch (error) {
      console.error("❌ Export error:", error);
      res.status(500).json({ error: "Export failed" });
    }
  }
}

// 🔧 HELPER FUNCTIONS

function getDateRange(period, startDate, endDate) {
  const now = new Date();
  let start,
    end = now;

  if (startDate && endDate) {
    return { start: new Date(startDate), end: new Date(endDate) };
  }

  switch (period) {
    case "today":
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "yesterday":
      start = new Date(now.setDate(now.getDate() - 1));
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "7d":
      start = new Date(now.setDate(now.getDate() - 7));
      break;
    case "30d":
      start = new Date(now.setDate(now.getDate() - 30));
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.setDate(now.getDate() - 7));
  }

  return { start, end };
}

async function calculateCourseProgress(userId, courseId) {
  const videos = await Video.find({ courseId }).select(
    "_id duration title order",
  );
  const userInteractions = await Interaction.find({
    userId: new mongoose.Types.ObjectId(userId),
    courseId: new mongoose.Types.ObjectId(courseId),
    type: "video_view",
  }).lean();

  let totalWatchTime = 0;
  let completedVideos = 0;
  let totalPossibleTime = 0;

  const videoProgress = [];

  for (const video of videos) {
    const videoInteractions = userInteractions.filter(
      (i) => i.videoId?.toString() === video._id.toString(),
    );

    let videoWatchTime = 0;
    let maxPercentage = 0;

    for (const interaction of videoInteractions) {
      if (interaction.data?.watchTime) {
        videoWatchTime += interaction.data.watchTime;
      }
      if (interaction.data?.percentageWatched) {
        maxPercentage = Math.max(
          maxPercentage,
          interaction.data.percentageWatched,
        );
      }
    }

    totalWatchTime += videoWatchTime;
    totalPossibleTime += video.duration || 0;

    const isCompleted = maxPercentage >= 90;
    if (isCompleted) completedVideos++;

    videoProgress.push({
      videoId: video._id,
      title: video.title,
      duration: video.duration,
      watchTime: videoWatchTime,
      percentageWatched: Math.min(maxPercentage, 100),
      isCompleted: isCompleted,
      lastWatched:
        videoInteractions.length > 0
          ? new Date(
              Math.max(
                ...videoInteractions.map(
                  (i) => new Date(i.timestamps?.eventOccurred || i.createdAt),
                ),
              ),
            )
          : null,
    });
  }

  const overallPercentage =
    videos.length > 0 ? (completedVideos / videos.length) * 100 : 0;

  const timeBasedPercentage =
    totalPossibleTime > 0 ? (totalWatchTime / totalPossibleTime) * 100 : 0;

  return {
    overall: Math.min(Math.max(overallPercentage, timeBasedPercentage), 100),
    videosCompleted: completedVideos,
    totalVideos: videos.length,
    totalWatchHours: totalWatchTime / 3600,
    estimatedCompletion: calculateEstimatedCompletion(videoProgress),
    videoProgress: videoProgress,
    lastActivity:
      userInteractions.length > 0
        ? new Date(
            Math.max(
              ...userInteractions.map(
                (i) => new Date(i.timestamps?.eventOccurred || i.createdAt),
              ),
            ),
          )
        : null,
  };
}

async function calculateTotalWatchTime(userId) {
  const result = await Interaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: "video_view",
      },
    },
    {
      $group: {
        _id: null,
        totalWatchTime: {
          $sum: {
            $cond: [{ $gt: ["$data.watchTime", 0] }, "$data.watchTime", 0],
          },
        },
      },
    },
  ]);

  return result[0]?.totalWatchTime ? result[0].totalWatchTime / 3600 : 0;
}

async function getRecentActivity(userId, courseId) {
  return await Interaction.find({
    userId: new mongoose.Types.ObjectId(userId),
    courseId: courseId
      ? new mongoose.Types.ObjectId(courseId)
      : { $exists: true },
  })
    .sort({ "timestamps.eventOccurred": -1 })
    .limit(10)
    .select("type timestamps.eventOccurred data.currentTime videoId")
    .populate("videoId", "title")
    .lean();
}

function calculateEngagementScore(progress, activities) {
  let score = 0;

  // Progress based (50%)
  score += progress.overall * 0.5;

  // Activity frequency (30%)
  if (activities.length >= 10) score += 30;
  else if (activities.length >= 5) score += 20;
  else if (activities.length >= 2) score += 10;

  // Recency (20%)
  if (activities.length > 0) {
    const lastActivity = new Date(
      activities[0].timestamps?.eventOccurred || activities[0].createdAt,
    );
    const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);

    if (daysSince <= 1) score += 20;
    else if (daysSince <= 3) score += 15;
    else if (daysSince <= 7) score += 10;
    else if (daysSince <= 30) score += 5;
  }

  return Math.min(score, 100);
}

function generateInteractionInsights(interactions) {
  const insights = [];

  if (interactions.length === 0) {
    return ["No activity recorded for this period"];
  }

  // Check for binge watching
  const playEvents = interactions.filter((i) => i.type === "play");
  if (playEvents.length > 10) {
    insights.push("Active watching session detected");
  }

  // Check for frequent pauses
  const pauseEvents = interactions.filter((i) => i.type === "pause");
  if (pauseEvents.length > 5) {
    insights.push("Frequent pauses suggest taking notes or breaks");
  }

  // Check for seeking behavior
  const seekEvents = interactions.filter((i) => i.type.includes("seek"));
  if (seekEvents.length > 3) {
    insights.push("User is actively navigating through content");
  }

  // Check completion rate
  const videoViews = interactions.filter((i) => i.type === "video_view");
  const completedViews = videoViews.filter(
    (v) => v.data?.percentageWatched >= 90,
  );
  if (completedViews.length > 0) {
    insights.push(`Completed ${completedViews.length} video(s) fully`);
  }

  return insights;
}

function generateProgressRecommendations(courses) {
  const recommendations = [];

  for (const course of courses) {
    if (course.progress.overall < 30) {
      recommendations.push({
        course: course.course.title,
        message:
          "Just getting started! Try to watch at least one video this week.",
        priority: "low",
      });
    } else if (course.progress.overall < 70) {
      recommendations.push({
        course: course.course.title,
        message:
          "Good progress! You're halfway there. Consider increasing your study time.",
        priority: "medium",
      });
    } else if (course.progress.overall >= 70 && course.progress.overall < 100) {
      recommendations.push({
        course: course.course.title,
        message:
          "Almost there! Finish the remaining videos to complete the course.",
        priority: "high",
      });
    }
  }

  return recommendations;
}

function calculateEstimatedCompletion(videoProgress) {
  const remainingVideos = videoProgress.filter(
    (v) => !v.isCompleted && v.percentageWatched < 90,
  );

  if (remainingVideos.length === 0) return "Already completed";

  const totalRemainingDuration = remainingVideos.reduce(
    (sum, v) => sum + (v.duration || 0),
    0,
  );
  const avgDailyWatchTime = 1800; // 30 minutes in seconds

  const daysNeeded = Math.ceil(totalRemainingDuration / avgDailyWatchTime);

  if (daysNeeded <= 1) return "Less than a day";
  if (daysNeeded <= 7) return `${daysNeeded} days`;
  if (daysNeeded <= 30) return `${Math.ceil(daysNeeded / 7)} weeks`;
  return `${Math.ceil(daysNeeded / 30)} months`;
}

async function getTotalVideos(courseId) {
  return await Video.countDocuments({ courseId });
}

async function generateExportData(reportType, filters) {
  // Implementation based on report type
  switch (reportType) {
    case "analytics":
      return await generateAnalyticsExport(filters);
    case "interaction":
      return await generateInteractionExport(filters);
    case "progress":
      return await generateProgressExport(filters);
    default:
      return [];
  }
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) =>
        typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value,
      )
      .join(","),
  );

  return [headers, ...rows].join("\n");
}

async function generatePDF(data, reportType) {
  // PDF generation using pdfkit or similar
  // This is a placeholder
  return Buffer.from(`PDF for ${reportType} report`);
}

module.exports = ReportController;
//////////////////////////////////////////////////////////////////////
