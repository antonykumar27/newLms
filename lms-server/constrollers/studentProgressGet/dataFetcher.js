// services/dataFetcher.js

const Enrollment = require("../../models/enrollment");
const StandardSubject = require("../../models/standardSubjectSchema");
const StandardChapter = require("../../models/standardChapterScheema");
const StandardPage = require("../../models/StandardPageScheema");
const Video = require("../../models/videoModel");
const WatchTime = require("../../models/watchTimeSchema");
const QuizAttempt = require("../../models/quizAttempt");
const UserProgress = require("../../models/userProgressSchema");
const User = require("../../models/loginUserModel");
const DailyUniqueUser = require("../../models/dailyUniqueUserSchema");
const StudentStreak = require("../../models/StudentStreak");
const { StudentBadge, BadgeProgress } = require("../../models/StudentBadge");
const { Leaderboard } = require("../../models/Leaderboard");
const mongoose = require("mongoose");

/**
 * Fetches all data needed for the dashboard in parallel
 */
exports.fetchDashboardData = async (
  userId,
  enrolledStandardId,
  progressFilter,
  quizFilter,
  sections,
  queryParams,
) => {
  const {
    subjectId,
    chapterId,
    pageId,
    contentType,
    fromDate,
    toDate,
    limit = 50,
    sortBy = "lastAccessed",
    sortOrder = "desc",
    heatmapYear,
  } = queryParams;

  return await Promise.all([
    // 1. User data
    User.findById(userId)
      .select(
        "name username email avatar currentStreak maxStreak badges completedChapters completedSubjects completedPages lastActiveDate createdAt",
      )
      .lean(),

    // 2. Streak data
    StudentStreak.findOne({ studentId: userId }).lean(),

    // 3. Subjects
    StandardSubject.find({
      standardId: enrolledStandardId,
      ...(subjectId && { _id: subjectId }),
    })
      .select("_id subject name description icon order")
      .sort("order")
      .lean(),

    // 4. Chapters
    StandardChapter.find({
      standardId: enrolledStandardId,
      ...(subjectId && { subjectId }),
      ...(chapterId && { _id: chapterId }),
    })
      .select("_id subjectId chapterNumber title description")
      .sort("chapterNumber")
      .lean(),

    // 5. Pages
    StandardPage.find({
      standardId: enrolledStandardId,
      ...(subjectId && { subjectId }),
      ...(chapterId && { chapterId }),
      ...(pageId && { _id: pageId }),
      ...(contentType && { contentType }),
    })
      .select(
        "_id chapterId title description contentType order media metadata",
      )
      .sort("order")
      .lean(),

    // 6. Videos
    Video.find({
      standardId: enrolledStandardId,
      ...(subjectId && { subjectId }),
      ...(chapterId && { chapterId }),
      ...(pageId && { pageId }),
    })
      .select("_id pageId title description duration thumbnailUrl order")
      .sort("order")
      .lean(),

    // 7. Watch time progress
    sections.includes("watchtime") ||
    sections.includes("content") ||
    sections.includes("overall")
      ? WatchTime.find(progressFilter)
          .populate("videoId", "title duration")
          .populate("page", "title contentType")
          .populate("chapter", "title chapterNumber")
          .populate("subject", "subject name")
          .populate("standard", "standard")
          .sort({
            [sortBy === "lastAccessed" ? "lastWatchedAt" : sortBy]:
              sortOrder === "desc" ? -1 : 1,
          })
          .limit(parseInt(limit))
          .lean()
      : [],

    // 8. Quiz attempts
    sections.includes("quiz") || sections.includes("overall")
      ? QuizAttempt.find(quizFilter)
          .sort("-createdAt")
          .limit(parseInt(limit))
          .lean()
      : [],

    // 9. User progress
    sections.includes("activity") || sections.includes("overall")
      ? UserProgress.find(progressFilter)
          .sort("-date")
          .limit(parseInt(limit))
          .lean()
      : [],

    // 10. Daily unique stats
    sections.includes("analytics")
      ? DailyUniqueUser.aggregate([
          { $match: { userId: mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              uniqueVideos: { $sum: 1 },
              totalWatchTime: { $sum: "$totalWatchTime" },
              completions: { $sum: { $cond: ["$completed", 1, 0] } },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 30 },
        ])
      : [],

    // 11. Earned badges
    sections.includes("achievements")
      ? StudentBadge.find({ studentId: userId })
          .populate("badgeId")
          .sort("-earnedAt")
          .lean()
      : [],

    // 12. Badge progress
    sections.includes("achievements")
      ? BadgeProgress.find({ studentId: userId })
          .populate("badgeId")
          .sort("-progress")
          .limit(5)
          .lean()
      : [],

    // 13. Class leaderboard
    sections.includes("leaderboard")
      ? Leaderboard.findOne({
          type: "class",
          "context.standardId": enrolledStandardId,
        })
          .sort("-lastUpdated")
          .limit(1)
          .lean()
      : null,

    // 14. Subject leaderboard
    sections.includes("leaderboard") && subjectId
      ? Leaderboard.findOne({ type: "subject", "context.subjectId": subjectId })
          .sort("-lastUpdated")
          .limit(1)
          .lean()
      : null,

    // 15. Heatmap data
    sections.includes("heatmap")
      ? DailyUniqueUser.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
              date: {
                $gte: new Date(heatmapYear, 0, 1),
                $lte: new Date(heatmapYear, 11, 31),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              intensity: { $sum: "$totalWatchTime" },
              videosCompleted: { $sum: { $cond: ["$completed", 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ])
      : [],
  ]);
};

/**
 * Validates user enrollment and returns enrolled standard
 */
exports.validateEnrollment = async (userId, requestedStandardId) => {
  const enrollment = await Enrollment.findOne({
    student: userId,
    isActive: true,
    paymentStatus: "paid",
    status: "active",
  })
    .populate("standard", "standard name description")
    .lean();

  if (!enrollment) {
    throw new Error("No active enrollment found");
  }

  // Verify standard access
  if (
    requestedStandardId &&
    requestedStandardId !== enrollment.standard._id.toString()
  ) {
    throw new Error("Access denied to this standard");
  }

  return enrollment;
};
