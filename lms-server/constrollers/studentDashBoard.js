// controllers/analytics/index.js

const {
  getStudentDashboard,
} = require("./studentProgressGet/studentDashboardController");

module.exports = {
  getStudentDashboard,
};
// // controllers/combinedAnalyticsController.js

// const Enrollment = require("../models/enrollment");
// const StandardSubject = require("../models/standardSubjectSchema");
// const StandardChapter = require("../models/standardChapterScheema");
// const StandardPage = require("../models/StandardPageScheema");
// const Video = require("../models/videoModel");
// const WatchTime = require("../models/watchTimeSchema");
// const QuizAttempt = require("../models/quizAttempt");
// const UserProgress = require("../models/userProgressSchema");
// const User = require("../models/loginUserModel");
// const DailyUniqueUser = require("../models/dailyUniqueUserSchema");
// const StudentStreak = require("../models/StudentStreak");
// const mongoose = require("mongoose");
// const {
//   BadgeDefinition,
//   StudentBadge,
//   BadgeProgress,
// } = require("../models/StudentBadge");
// const {
//   Leaderboard,
//   StudentLeaderboardStats,
// } = require("../models/Leaderboard");
// /**
//  * MASTER ANALYTICS ENDPOINT - Get all student progress data in one call
//  * @route GET /api/analytics/student/dashboard
//  * @access Private
//  */
// exports.getStudentDashboard = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // ===== 1️⃣ PARSE QUERY PARAMETERS =====
//     const {
//       // Standard filters
//       standardId,
//       subjectId,
//       chapterId,
//       pageId,

//       // Content filters
//       search,
//       contentType,
//       completionStatus,

//       // Date filters
//       fromDate,
//       toDate,

//       // Pagination
//       limit = 50,
//       page = 1,

//       // Sorting
//       sortBy = "lastAccessed",
//       sortOrder = "desc",

//       // Response sections (comma-separated)
//       include = "overall,content,watchtime,quiz,engagement,achievements,leaderboard,heatmap,activity",

//       // View type
//       view = "comprehensive", // comprehensive, summary, mobile

//       // Year for heatmap
//       heatmapYear = new Date().getFullYear(),
//     } = req.query;

//     // ===== 2️⃣ PARSE INCLUDE PARAMETER =====
//     const sections = include.split(",").map((s) => s.trim());

//     // ===== 3️⃣ VALIDATE USER ENROLLMENT =====
//     const enrollment = await Enrollment.findOne({
//       student: userId,
//       isActive: true,
//       paymentStatus: "paid",
//       status: "active",
//     })
//       .populate("standard", "standard name description")
//       .lean();

//     if (!enrollment) {
//       return res.status(403).json({
//         success: false,
//         message: "You don't have access to any standard",
//       });
//     }

//     const enrolledStandardId = enrollment.standard._id;

//     // Verify standard access if provided
//     if (standardId && standardId !== enrolledStandardId.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "You don't have access to this standard",
//       });
//     }

//     // ===== 4️⃣ BUILD BASE FILTERS =====
//     const progressFilter = { userId };
//     if (standardId) progressFilter.standardId = standardId;
//     else progressFilter.standardId = enrolledStandardId;

//     if (subjectId) progressFilter.subjectId = subjectId;
//     if (chapterId) progressFilter.chapterId = chapterId;
//     if (pageId) progressFilter.pageId = pageId;

//     // Date range filter
//     if (fromDate || toDate) {
//       progressFilter.lastAccessed = {};
//       if (fromDate) progressFilter.lastAccessed.$gte = new Date(fromDate);
//       if (toDate) progressFilter.lastAccessed.$lte = new Date(toDate);
//     }

//     // ===== 5️⃣ PARALLEL DATA FETCHING =====
//     const [
//       // User basic data
//       user,

//       // Streak data
//       streak,

//       // Content structure
//       subjects,
//       chapters,
//       pages,
//       videos,

//       // Progress data
//       watchTimeProgress,
//       quizAttempts,
//       userProgress,

//       // Unique users data
//       dailyUniqueStats,

//       // Badges
//       earnedBadges,
//       badgeProgress,

//       // Leaderboard
//       classLeaderboard,
//       subjectLeaderboard,

//       // Heatmap
//       heatmapData,
//     ] = await Promise.all([
//       // 1. User data
//       User.findById(userId)
//         .select(
//           "name username email avatar currentStreak maxStreak badges completedChapters completedSubjects completedPages lastActiveDate createdAt",
//         )
//         .lean(),

//       // 2. Streak data
//       StudentStreak.findOne({ studentId: userId }).lean(),

//       // 3. Subjects
//       StandardSubject.find({
//         standardId: enrolledStandardId,
//         ...(subjectId && { _id: subjectId }),
//       })
//         .select("_id subject name description icon order")
//         .sort("order")
//         .lean(),

//       // 4. Chapters
//       StandardChapter.find({
//         standardId: enrolledStandardId,
//         ...(subjectId && { subjectId }),
//         ...(chapterId && { _id: chapterId }),
//       })
//         .select("_id subjectId chapterNumber title description")
//         .sort("chapterNumber")
//         .lean(),

//       // 5. Pages
//       StandardPage.find({
//         standardId: enrolledStandardId,
//         ...(subjectId && { subjectId }),
//         ...(chapterId && { chapterId }),
//         ...(pageId && { _id: pageId }),
//         ...(contentType && { contentType }),
//       })
//         .select(
//           "_id chapterId title description contentType order media metadata",
//         )
//         .sort("order")
//         .lean(),

//       // 6. Videos
//       Video.find({
//         standardId: enrolledStandardId,
//         ...(subjectId && { subjectId }),
//         ...(chapterId && { chapterId }),
//         ...(pageId && { pageId }),
//       })
//         .select("_id pageId title description duration thumbnailUrl order")
//         .sort("order")
//         .lean(),

//       // 7. Watch time progress
//       sections.includes("watchtime") ||
//       sections.includes("content") ||
//       sections.includes("overall")
//         ? WatchTime.find(progressFilter)
//             .populate("videoId", "title duration")
//             .populate("page", "title contentType")
//             .populate("chapter", "title chapterNumber")
//             .populate("subject", "subject name")
//             .populate("standard", "standard")
//             .sort({
//               [sortBy === "lastAccessed" ? "lastWatchedAt" : sortBy]:
//                 sortOrder === "desc" ? -1 : 1,
//             })
//             .limit(parseInt(limit))
//             .lean()
//         : [],

//       // 8. Quiz attempts
//       sections.includes("quiz") || sections.includes("overall")
//         ? QuizAttempt.find({
//             userId,
//             ...(subjectId && { "contextIds.subjectId": subjectId }),
//             ...(chapterId && { "contextIds.chapterId": chapterId }),
//             ...(pageId && { "contextIds.pageId": pageId }),
//             ...(fromDate && { createdAt: { $gte: new Date(fromDate) } }),
//             ...(toDate && { createdAt: { $lte: new Date(toDate) } }),
//           })
//             .sort("-createdAt")
//             .limit(parseInt(limit))
//             .lean()
//         : [],

//       // 9. User progress
//       sections.includes("activity") || sections.includes("overall")
//         ? UserProgress.find(progressFilter)
//             .sort("-date")
//             .limit(parseInt(limit))
//             .lean()
//         : [],

//       // 10. Daily unique stats (if requested)
//       sections.includes("analytics")
//         ? DailyUniqueUser.aggregate([
//             { $match: { userId: mongoose.Types.ObjectId(userId) } },
//             {
//               $group: {
//                 _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//                 uniqueVideos: { $sum: 1 },
//                 totalWatchTime: { $sum: "$totalWatchTime" },
//                 completions: { $sum: { $cond: ["$completed", 1, 0] } },
//               },
//             },
//             { $sort: { _id: -1 } },
//             { $limit: 30 },
//           ])
//         : [],

//       // 11. Earned badges
//       sections.includes("achievements")
//         ? StudentBadge.find({ studentId: userId })
//             .populate("badgeId")
//             .sort("-earnedAt")
//             .lean()
//         : [],

//       // 12. Badge progress
//       sections.includes("achievements")
//         ? BadgeProgress.find({ studentId: userId })
//             .populate("badgeId")
//             .sort("-progress")
//             .limit(5)
//             .lean()
//         : [],

//       // 13. Class leaderboard
//       sections.includes("leaderboard")
//         ? Leaderboard.findOne({
//             type: "class",
//             "context.standardId": enrolledStandardId,
//           })
//             .sort("-lastUpdated")
//             .limit(1)
//             .lean()
//         : null,

//       // 14. Subject leaderboard (if subject selected)
//       sections.includes("leaderboard") && subjectId
//         ? Leaderboard.findOne({
//             type: "subject",
//             "context.subjectId": subjectId,
//           })
//             .sort("-lastUpdated")
//             .limit(1)
//             .lean()
//         : null,

//       // 15. Heatmap data
//       sections.includes("heatmap")
//         ? DailyUniqueUser.aggregate([
//             {
//               $match: {
//                 userId: mongoose.Types.ObjectId(userId),
//                 date: {
//                   $gte: new Date(heatmapYear, 0, 1),
//                   $lte: new Date(heatmapYear, 11, 31),
//                 },
//               },
//             },
//             {
//               $group: {
//                 _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//                 intensity: { $sum: "$totalWatchTime" },
//                 videosCompleted: { $sum: { $cond: ["$completed", 1, 0] } },
//               },
//             },
//             { $sort: { _id: 1 } },
//           ])
//         : [],
//     ]);

//     // ===== 6️⃣ APPLY SEARCH FILTER =====
//     let filteredWatchTime = watchTimeProgress;
//     if (search && watchTimeProgress.length > 0) {
//       const searchRegex = new RegExp(search, "i");
//       filteredWatchTime = watchTimeProgress.filter(
//         (w) =>
//           w.videoId?.title?.match(searchRegex) ||
//           w.page?.title?.match(searchRegex) ||
//           w.chapter?.title?.match(searchRegex) ||
//           w.subject?.name?.match(searchRegex),
//       );
//     }

//     // Apply completion status filter
//     if (completionStatus && filteredWatchTime.length > 0) {
//       filteredWatchTime = filteredWatchTime.filter((w) => {
//         if (completionStatus === "completed") return w.completed;
//         if (completionStatus === "inProgress")
//           return !w.completed && w.progress > 0;
//         if (completionStatus === "notStarted") return w.progress === 0;
//         return true;
//       });
//     }

//     // ===== 7️⃣ PREPARE RESPONSE OBJECT =====
//     const response = {
//       success: true,
//       timestamp: new Date().toISOString(),
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         avatar: user.avatar,
//         joinedAt: user.createdAt,
//       },
//       standard: {
//         id: enrolledStandardId,
//         name: enrollment.standard.standard,
//         description: enrollment.standard.description,
//       },
//       filters: {
//         applied: {
//           standardId: standardId || enrolledStandardId,
//           subjectId,
//           chapterId,
//           pageId,
//           search,
//           contentType,
//           completionStatus,
//           fromDate,
//           toDate,
//         },
//         available: {
//           subjects: subjects.map((s) => ({
//             id: s._id,
//             name: s.subject || s.name,
//           })),
//           contentTypes: ["video", "quiz", "article", "interactive", "pdf"],
//         },
//       },
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalItems: watchTimeProgress.length,
//       },
//     };

//     // ===== 8️⃣ ADD REQUESTED SECTIONS =====

//     // 🔥 OVERALL STATS
//     if (sections.includes("overall")) {
//       response.overall = calculateOverallStats({
//         watchTime: filteredWatchTime,
//         quizAttempts,
//         userProgress,
//         user,
//         streak,
//         totalContent: {
//           subjects: subjects.length,
//           chapters: chapters.length,
//           pages: pages.length,
//           videos: videos.length,
//         },
//       });
//     }
//     console.log("watchTimewatchTime", watchTimeProgress);
//     // 🔥 STREAK SECTION
//     if (sections.includes("streak")) {
//       response.streak = {
//         current: streak?.currentStreak || 0,
//         longest: streak?.longestStreak || 0,
//         lastActiveDate: streak?.lastActiveDate || user.lastActiveDate,
//         freezeActive: streak?.streakFreeze?.isActive || false,
//         milestones: streak?.milestones || [],
//         nextMilestone: getNextMilestone(streak?.currentStreak || 0),
//         daysToNextMilestone:
//           getNextMilestone(streak?.currentStreak || 0) -
//             (streak?.currentStreak || 0) || 0,
//         message: getStreakMessage(streak?.currentStreak || 0),
//       };
//     }

//     // 🔥 WATCH TIME PROGRESS
//     if (sections.includes("watchtime")) {
//       response.watchTime = {
//         summary: {
//           total: filteredWatchTime.length,
//           completed: filteredWatchTime.filter((w) => w.completed).length,
//           inProgress: filteredWatchTime.filter(
//             (w) => !w.completed && w.progress > 0,
//           ).length,
//           notStarted: filteredWatchTime.filter((w) => w.progress === 0).length,
//           totalWatchTime: filteredWatchTime.reduce(
//             (sum, w) => sum + (w.totalWatchedSeconds || 0),
//             0,
//           ),
//           formattedTotalTime: formatDuration(
//             filteredWatchTime.reduce(
//               (sum, w) => sum + (w.totalWatchedSeconds || 0),
//               0,
//             ),
//           ),
//           averageProgress: filteredWatchTime.length
//             ? Math.round(
//                 filteredWatchTime.reduce(
//                   (sum, w) => sum + (w.progress || 0),
//                   0,
//                 ) / filteredWatchTime.length,
//               )
//             : 0,
//         },
//         items: filteredWatchTime.slice(0, 20).map((item) => ({
//           id: item._id,
//           videoId: item.videoId?._id,
//           videoTitle: item.videoId?.title,
//           pageId: item.page?._id,
//           pageTitle: item.page?.title,
//           chapterId: item.chapter?._id,
//           chapterTitle: item.chapter?.title,
//           chapterNumber: item.chapter?.chapterNumber,
//           subjectId: item.subject?._id,
//           subjectName: item.subject?.name || item.subject?.subject,
//           progress: item.progress,
//           completed: item.completed,
//           watchTime: item.totalWatchedSeconds,
//           formattedWatchTime: formatDuration(item.totalWatchedSeconds),
//           lastWatchedAt: item.lastWatchedAt,
//           lastWatchedFromNow: item.lastWatchedAt
//             ? timeAgo(item.lastWatchedAt)
//             : null,
//         })),
//       };
//     }

//     // 🔥 QUIZ PROGRESS
//     if (sections.includes("quiz")) {
//       const quizScores = quizAttempts.map((q) => q.score || 0);
//       response.quiz = {
//         summary: {
//           totalAttempts: quizAttempts.length,
//           averageScore: quizAttempts.length
//             ? Math.round(
//                 quizScores.reduce((a, b) => a + b, 0) / quizAttempts.length,
//               )
//             : 0,
//           passRate: quizAttempts.length
//             ? Math.round(
//                 (quizAttempts.filter((q) => q.passed).length /
//                   quizAttempts.length) *
//                   100,
//               )
//             : 0,
//           bestScore: Math.max(...quizScores, 0) || 0,
//           totalQuestions: quizAttempts.reduce(
//             (sum, q) => sum + (q.totalQuestions || 0),
//             0,
//           ),
//           correctAnswers: quizAttempts.reduce(
//             (sum, q) => sum + (q.correctAnswers || 0),
//             0,
//           ),
//         },
//         recentAttempts: quizAttempts.slice(0, 5).map((q) => ({
//           id: q._id,
//           quizId: q.quizId,
//           quizTitle: q.quizTitle,
//           score: q.score,
//           passed: q.passed,
//           totalQuestions: q.totalQuestions,
//           correctAnswers: q.correctAnswers,
//           timeTaken: q.timeTaken,
//           completedAt: q.createdAt,
//         })),
//       };
//     }

//     // 🔥 CONTENT HIERARCHY WITH PROGRESS
//     if (sections.includes("content")) {
//       response.content = buildContentHierarchy({
//         subjects,
//         chapters,
//         pages,
//         videos,
//         watchTime: filteredWatchTime,
//         quizAttempts,
//         user,
//       });
//     }

//     // 🔥 ENGAGEMENT METRICS
//     if (sections.includes("engagement")) {
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//       const recentActivity =
//         userProgress?.filter(
//           (p) => p.date && new Date(p.date) >= thirtyDaysAgo,
//         ) || [];
//       const activeDays = new Set(
//         recentActivity.map((a) => new Date(a.date).toISOString().split("T")[0]),
//       ).size;

//       response.engagement = {
//         currentStreak: streak?.currentStreak || 0,
//         maxStreak: streak?.longestStreak || 0,
//         activeDays,
//         consistencyScore:
//           activeDays > 0 ? Math.round((activeDays / 30) * 100) : 0,
//         lastActive: user.lastActiveDate,
//         totalSessions: userProgress.length,
//         averageDailyTime:
//           activeDays > 0
//             ? Math.round(
//                 userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0) /
//                   activeDays /
//                   60,
//               )
//             : 0,
//         mostProductiveHour: calculateMostProductiveHour(userProgress),
//         preferredStudyTime: getPreferredStudyTime(userProgress),
//       };
//     }

//     // 🔥 ACHIEVEMENTS & BADGES
//     if (sections.includes("achievements")) {
//       response.achievements = {
//         badges: {
//           total: earnedBadges.length,
//           earned: earnedBadges.map((b) => ({
//             id: b.badgeId?._id || b.badgeId,
//             name: b.badgeId?.name || getBadgeName(b.category, b.level),
//             description:
//               b.badgeId?.description ||
//               getBadgeDescription(b.category, b.level),
//             category: b.category,
//             level: b.level,
//             earnedAt: b.earnedAt,
//             icon: b.badgeId?.assets?.icon || getBadgeIcon(b.category),
//           })),
//           inProgress: badgeProgress.map((b) => ({
//             id: b.badgeId?._id,
//             name: b.badgeId?.name,
//             progress: b.progress,
//             currentValue: b.currentValue,
//             targetValue: b.targetValue,
//           })),
//         },
//         completed: {
//           subjects: user.completedSubjects?.length || 0,
//           chapters: user.completedChapters?.length || 0,
//           pages: user.completedPages?.length || 0,
//           totalSubjects: subjects.length,
//           totalChapters: chapters.length,
//           totalPages: pages.length,
//           overallCompletion: pages.length
//             ? Math.round(
//                 ((user.completedPages?.length || 0) / pages.length) * 100,
//               )
//             : 0,
//         },
//         nextMilestones: getNextMilestones(user, pages.length),
//       };
//     }

//     // 🔥 LEADERBOARD
//     if (sections.includes("leaderboard")) {
//       response.leaderboard = {
//         class: classLeaderboard
//           ? {
//               rank:
//                 classLeaderboard.entries.find(
//                   (e) => e.studentId.toString() === userId.toString(),
//                 )?.rank || "N/A",
//               totalParticipants: classLeaderboard.totalParticipants,
//               percentile: calculatePercentile(
//                 classLeaderboard.entries.find(
//                   (e) => e.studentId.toString() === userId.toString(),
//                 )?.rank,
//                 classLeaderboard.totalParticipants,
//               ),
//               topPerformers: classLeaderboard.entries.slice(0, 5).map((e) => ({
//                 rank: e.rank,
//                 name: e.studentId?.name,
//                 score: e.score,
//               })),
//             }
//           : null,
//         subject: subjectLeaderboard
//           ? {
//               rank:
//                 subjectLeaderboard.entries.find(
//                   (e) => e.studentId.toString() === userId.toString(),
//                 )?.rank || "N/A",
//               totalParticipants: subjectLeaderboard.totalParticipants,
//               percentile: calculatePercentile(
//                 subjectLeaderboard.entries.find(
//                   (e) => e.studentId.toString() === userId.toString(),
//                 )?.rank,
//                 subjectLeaderboard.totalParticipants,
//               ),
//             }
//           : null,
//         overallScore: calculateLeaderboardScore({
//           watchTime: filteredWatchTime,
//           quizAttempts,
//           streak: streak?.currentStreak || 0,
//           badges: earnedBadges.length,
//         }),
//       };
//     }

//     // 🔥 HEATMAP
//     if (sections.includes("heatmap")) {
//       response.heatmap = {
//         year: heatmapYear,
//         data: heatmapData.map((d) => ({
//           date: d._id,
//           intensity: getHeatmapIntensity(d.intensity),
//           videosCompleted: d.videosCompleted,
//           color: getHeatmapColor(getHeatmapIntensity(d.intensity)),
//         })),
//         summary: {
//           totalActiveDays: heatmapData.filter((d) => d.intensity > 0).length,
//           totalWatchTime: heatmapData.reduce((sum, d) => sum + d.intensity, 0),
//           bestDay: heatmapData.reduce(
//             (max, d) => (d.intensity > max.intensity ? d : max),
//             { intensity: 0 },
//           ),
//         },
//       };
//     }

//     // 🔥 RECENT ACTIVITY
//     if (sections.includes("activity")) {
//       response.recentActivity = userProgress
//         .sort((a, b) => new Date(b.date) - new Date(a.date))
//         .slice(0, 20)
//         .map((activity) => ({
//           id: activity._id,
//           type: activity.type || "page_view",
//           contentType: activity.contentType,
//           pageId: activity.pageId,
//           pageTitle: pages.find(
//             (p) => p._id.toString() === activity.pageId?.toString(),
//           )?.title,
//           chapterId: activity.chapterId,
//           chapterTitle: chapters.find(
//             (c) => c._id.toString() === activity.chapterId?.toString(),
//           )?.title,
//           subjectId: activity.subjectId,
//           subjectName: subjects.find(
//             (s) => s._id.toString() === activity.subjectId?.toString(),
//           )?.subject,
//           timeSpent: activity.timeSpent,
//           formattedTime: formatDuration(activity.timeSpent),
//           timestamp: activity.date,
//           timeAgo: timeAgo(activity.date),
//           details: activity.details,
//         }));
//     }

//     // 🔥 ANALYTICS (Unique users data)
//     if (sections.includes("analytics")) {
//       response.analytics = {
//         dailyUnique: dailyUniqueStats,
//         totalUniqueVideos: dailyUniqueStats.reduce(
//           (sum, d) => sum + d.uniqueVideos,
//           0,
//         ),
//         averageDailyWatchTime: dailyUniqueStats.length
//           ? Math.round(
//               dailyUniqueStats.reduce((sum, d) => sum + d.totalWatchTime, 0) /
//                 dailyUniqueStats.length /
//                 60,
//             )
//           : 0,
//       };
//     }

//     // 🔥 SUMMARY VIEW (lightweight version for mobile)
//     if (view === "summary") {
//       response.summary = {
//         streak: streak?.currentStreak || 0,
//         completedVideos: filteredWatchTime.filter((w) => w.completed).length,
//         totalWatchTime: formatDuration(
//           filteredWatchTime.reduce(
//             (sum, w) => sum + (w.totalWatchedSeconds || 0),
//             0,
//           ),
//         ),
//         overallProgress: pages.length
//           ? Math.round(
//               ((user.completedPages?.length || 0) / pages.length) * 100,
//             )
//           : 0,
//         nextBadge: badgeProgress[0] || null,
//         recentActivity: response.recentActivity?.slice(0, 3) || [],
//       };
//     }

//     // 🔥 MOBILE VIEW (optimized for mobile)
//     if (view === "mobile") {
//       response.mobile = {
//         header: {
//           name: user.name.split(" ")[0],
//           streak: streak?.currentStreak || 0,
//           class: enrollment.standard.standard,
//         },
//         stats: {
//           completed: filteredWatchTime.filter((w) => w.completed).length,
//           inProgress: filteredWatchTime.filter(
//             (w) => !w.completed && w.progress > 0,
//           ).length,
//           watchTime: formatDuration(
//             filteredWatchTime.reduce(
//               (sum, w) => sum + (w.totalWatchedSeconds || 0),
//               0,
//             ),
//           ),
//         },
//         continueWatching: filteredWatchTime
//           .filter((w) => !w.completed && w.progress > 0)
//           .slice(0, 3)
//           .map((w) => ({
//             id: w._id,
//             title: w.videoId?.title,
//             progress: w.progress,
//             subject: w.subject?.subject,
//           })),
//         quickActions: [
//           { type: "resume", label: "Resume Learning", icon: "play" },
//           { type: "quiz", label: "Take Quiz", icon: "quiz" },
//           { type: "review", label: "Review", icon: "review" },
//         ],
//       };
//     }

//     // ===== 9️⃣ SEND RESPONSE =====
//     res.json(response);
//   } catch (error) {
//     console.error("Error in getStudentDashboard:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // ==================== HELPER FUNCTIONS ====================

// /**
//  * Calculate overall statistics
//  */
// const calculateOverallStats = ({
//   watchTime,
//   quizAttempts,
//   userProgress,
//   user,
//   streak,
//   totalContent,
// }) => {
//   // Quiz stats
//   const quizScores = quizAttempts.map((q) => q.score || 0);
//   const avgQuizScore =
//     quizScores.length > 0
//       ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
//       : 0;

//   // Video stats
//   const completedVideos = watchTime.filter((w) => w.completed).length;
//   const totalWatchTimeSeconds = watchTime.reduce(
//     (sum, w) => sum + (w.totalWatchedSeconds || 0),
//     0,
//   );

//   // Engagement stats
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   const recentActivity =
//     userProgress?.filter((p) => p.date && new Date(p.date) >= thirtyDaysAgo) ||
//     [];
//   const activeDays = new Set(
//     recentActivity.map((a) => new Date(a.date).toISOString().split("T")[0]),
//   ).size;

//   // Calculate overall completion
//   const completedPages = user?.completedPages?.length || 0;
//   const totalPages = totalContent.pages || 0;
//   const overallCompletion =
//     totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;

//   // Calculate overall score
//   const overallScore = calculateLeaderboardScore({
//     watchTime,
//     quizAttempts,
//     streak: streak?.currentStreak || 0,
//     badges: user?.badges?.length || 0,
//   });

//   return {
//     quiz: {
//       totalAttempts: quizAttempts.length,
//       averageScore: avgQuizScore,
//       passRate: quizAttempts.length
//         ? Math.round(
//             (quizAttempts.filter((q) => q.passed).length /
//               quizAttempts.length) *
//               100,
//           )
//         : 0,
//       bestScore: Math.max(...quizScores, 0) || 0,
//     },
//     video: {
//       totalVideos: watchTime.length,
//       completedVideos,
//       completionRate:
//         watchTime.length > 0
//           ? Math.round((completedVideos / watchTime.length) * 100)
//           : 0,
//       totalWatchTime: Math.round(totalWatchTimeSeconds / 3600), // hours
//       formattedTotalTime: formatDuration(totalWatchTimeSeconds),
//       averageWatchTimePerVideo:
//         watchTime.length > 0
//           ? Math.round(totalWatchTimeSeconds / watchTime.length / 60) // minutes
//           : 0,
//     },
//     engagement: {
//       currentStreak: streak?.currentStreak || 0,
//       maxStreak: streak?.longestStreak || 0,
//       activeDays,
//       consistencyScore:
//         activeDays > 0 ? Math.round((activeDays / 30) * 100) : 0,
//       lastActive: user?.lastActiveDate,
//     },
//     achievements: {
//       badges: user?.badges?.length || 0,
//       chaptersCompleted: user?.completedChapters?.length || 0,
//       subjectsCompleted: user?.completedSubjects?.length || 0,
//       pagesCompleted: completedPages,
//       totalPages,
//       overallCompletion,
//     },
//     overallScore,
//     level: Math.floor(overallScore / 1000) + 1,
//     nextLevelScore: (Math.floor(overallScore / 1000) + 1) * 1000,
//     pointsToNextLevel:
//       (Math.floor(overallScore / 1000) + 1) * 1000 - overallScore,
//   };
// };

// /**
//  * Build content hierarchy with progress
//  */
// const buildContentHierarchy = ({
//   subjects,
//   chapters,
//   pages,
//   videos,
//   watchTime,
//   quizAttempts,
//   user,
// }) => {
//   return subjects.map((subject) => {
//     const subjectChapters = chapters.filter(
//       (ch) => ch.subjectId.toString() === subject._id.toString(),
//     );
//     const subjectWatchTime = watchTime.filter(
//       (w) => w.subject?._id?.toString() === subject._id.toString(),
//     );
//     const subjectQuizzes = quizAttempts.filter(
//       (q) => q.contextIds?.subjectId?.toString() === subject._id.toString(),
//     );

//     return {
//       subjectId: subject._id,
//       subjectName: subject.subject || subject.name,
//       description: subject.description,
//       icon: subject.icon,
//       order: subject.order,

//       progress: {
//         totalWatchTime: subjectWatchTime.reduce(
//           (sum, w) => sum + (w.totalWatchedSeconds || 0),
//           0,
//         ),
//         formattedWatchTime: formatDuration(
//           subjectWatchTime.reduce(
//             (sum, w) => sum + (w.totalWatchedSeconds || 0),
//             0,
//           ),
//         ),
//         averageProgress: subjectWatchTime.length
//           ? Math.round(
//               subjectWatchTime.reduce((sum, w) => sum + (w.progress || 0), 0) /
//                 subjectWatchTime.length,
//             )
//           : 0,
//         completedVideos: subjectWatchTime.filter((w) => w.completed).length,
//         totalVideos: subjectWatchTime.length,
//         quizAttempts: subjectQuizzes.length,
//         averageQuizScore: subjectQuizzes.length
//           ? Math.round(
//               subjectQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
//                 subjectQuizzes.length,
//             )
//           : 0,
//         chaptersCompleted: subjectChapters.filter((ch) =>
//           user?.completedChapters?.includes(ch._id),
//         ).length,
//         totalChapters: subjectChapters.length,
//         progressPercentage: subjectChapters.length
//           ? Math.round(
//               (subjectChapters.filter((ch) =>
//                 user?.completedChapters?.includes(ch._id),
//               ).length /
//                 subjectChapters.length) *
//                 100,
//             )
//           : 0,
//       },

//       chapters: subjectChapters.map((chapter) => {
//         const chapterPages = pages.filter(
//           (p) => p.chapterId.toString() === chapter._id.toString(),
//         );
//         const chapterVideos = videos.filter(
//           (v) => v.chapterId?.toString() === chapter._id.toString(),
//         );
//         const chapterWatchTime = watchTime.filter(
//           (w) => w.chapter?._id?.toString() === chapter._id.toString(),
//         );
//         const chapterQuizzes = quizAttempts.filter(
//           (q) => q.contextIds?.chapterId?.toString() === chapter._id.toString(),
//         );

//         return {
//           chapterId: chapter._id,
//           chapterNumber: chapter.chapterNumber,
//           title: chapter.title,
//           description: chapter.description,

//           progress: {
//             totalWatchTime: chapterWatchTime.reduce(
//               (sum, w) => sum + (w.totalWatchedSeconds || 0),
//               0,
//             ),
//             formattedWatchTime: formatDuration(
//               chapterWatchTime.reduce(
//                 (sum, w) => sum + (w.totalWatchedSeconds || 0),
//                 0,
//               ),
//             ),
//             averageProgress: chapterWatchTime.length
//               ? Math.round(
//                   chapterWatchTime.reduce(
//                     (sum, w) => sum + (w.progress || 0),
//                     0,
//                   ) / chapterWatchTime.length,
//                 )
//               : 0,
//             completedVideos: chapterWatchTime.filter((w) => w.completed).length,
//             totalVideos: chapterWatchTime.length,
//             quizAttempts: chapterQuizzes.length,
//             averageQuizScore: chapterQuizzes.length
//               ? Math.round(
//                   chapterQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
//                     chapterQuizzes.length,
//                 )
//               : 0,
//             pagesCompleted: chapterPages.filter((p) =>
//               user?.completedPages?.includes(p._id),
//             ).length,
//             totalPages: chapterPages.length,
//             progressPercentage: chapterPages.length
//               ? Math.round(
//                   (chapterPages.filter((p) =>
//                     user?.completedPages?.includes(p._id),
//                   ).length /
//                     chapterPages.length) *
//                     100,
//                 )
//               : 0,
//           },

//           pages: chapterPages.map((page) => {
//             const pageVideos = videos.filter(
//               (v) => v.pageId?.toString() === page._id.toString(),
//             );
//             const pageWatchTime = watchTime.filter(
//               (w) => w.page?._id?.toString() === page._id.toString(),
//             );
//             const pageQuizzes = quizAttempts.filter(
//               (q) => q.contextIds?.pageId?.toString() === page._id.toString(),
//             );

//             return {
//               pageId: page._id,
//               title: page.title,
//               description: page.description,
//               contentType: page.contentType,
//               order: page.order,

//               progress: {
//                 totalWatchTime: pageWatchTime.reduce(
//                   (sum, w) => sum + (w.totalWatchedSeconds || 0),
//                   0,
//                 ),
//                 formattedWatchTime: formatDuration(
//                   pageWatchTime.reduce(
//                     (sum, w) => sum + (w.totalWatchedSeconds || 0),
//                     0,
//                   ),
//                 ),
//                 averageProgress: pageWatchTime.length
//                   ? Math.round(
//                       pageWatchTime.reduce(
//                         (sum, w) => sum + (w.progress || 0),
//                         0,
//                       ) / pageWatchTime.length,
//                     )
//                   : 0,
//                 completedVideos: pageWatchTime.filter((w) => w.completed)
//                   .length,
//                 totalVideos: pageWatchTime.length,
//                 quizAttempts: pageQuizzes.length,
//                 lastQuizScore: pageQuizzes[0]?.score || null,
//                 bestQuizScore: Math.max(
//                   ...pageQuizzes.map((q) => q.score || 0),
//                   0,
//                 ),
//                 isCompleted: user?.completedPages?.includes(page._id) || false,
//                 lastAccessed: pageWatchTime[0]?.lastWatchedAt || null,
//               },

//               videos: pageVideos.map((video) => {
//                 const videoWatchTime = watchTime.find(
//                   (w) => w.videoId?._id?.toString() === video._id.toString(),
//                 );

//                 return {
//                   videoId: video._id,
//                   title: video.title,
//                   description: video.description,
//                   duration: video.duration,
//                   thumbnailUrl: video.thumbnailUrl,
//                   order: video.order,

//                   progress: videoWatchTime
//                     ? {
//                         watchedSeconds: videoWatchTime.totalWatchedSeconds || 0,
//                         formattedWatchTime: formatDuration(
//                           videoWatchTime.totalWatchedSeconds,
//                         ),
//                         progress: videoWatchTime.progress || 0,
//                         completed: videoWatchTime.completed || false,
//                         lastWatchedAt: videoWatchTime.lastWatchedAt,
//                         lastWatchedFromNow: timeAgo(
//                           videoWatchTime.lastWatchedAt,
//                         ),
//                         watchTimePercentage: video.duration
//                           ? Math.min(
//                               100,
//                               Math.round(
//                                 (videoWatchTime.totalWatchedSeconds /
//                                   video.duration) *
//                                   100,
//                               ),
//                             )
//                           : 0,
//                       }
//                     : {
//                         watchedSeconds: 0,
//                         formattedWatchTime: "0 min",
//                         progress: 0,
//                         completed: false,
//                         lastWatchedAt: null,
//                         watchTimePercentage: 0,
//                       },
//                 };
//               }),
//             };
//           }),
//         };
//       }),
//     };
//   });
// };

// /**
//  * Calculate leaderboard score
//  */
// const calculateLeaderboardScore = ({
//   watchTime,
//   quizAttempts,
//   streak,
//   badges,
// }) => {
//   const videoScore = watchTime.reduce(
//     (sum, w) => sum + (w.completed ? 10 : w.progress * 0.1),
//     0,
//   );
//   const quizScore =
//     quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) * 0.5;
//   const streakBonus = streak * 5;
//   const badgeBonus = badges * 20;

//   return Math.round(videoScore + quizScore + streakBonus + badgeBonus);
// };

// /**
//  * Get next milestone
//  */
// const getNextMilestone = (currentStreak) => {
//   const milestones = [3, 7, 15, 30, 50, 100, 200, 365];
//   return (
//     milestones.find((m) => m > currentStreak) ||
//     milestones[milestones.length - 1]
//   );
// };

// /**
//  * Get streak message
//  */
// const getStreakMessage = (streak) => {
//   if (streak === 0) return "Start your learning journey today! 🔥";
//   if (streak === 1) return "Great start! Come back tomorrow! 💪";
//   if (streak < 3) return `${streak} day streak! Keep going! 🔥`;
//   if (streak < 7) return `${streak} days! You're on fire! 🔥🔥`;
//   if (streak < 15) return `${streak} day streak! Amazing consistency! 🚀`;
//   if (streak < 30) return `${streak} days! You're unstoppable! 🌟`;
//   if (streak < 50) return `${streak} days! Legendary status! 👑`;
//   if (streak < 100) return `${streak} days! You're a learning machine! 🤖`;
//   if (streak < 365) return `${streak} days! Elite learner! ⭐`;
//   return `${streak} days! ULTIMATE CHAMPION! 🏆`;
// };

// /**
//  * Format duration
//  */
// const formatDuration = (seconds) => {
//   if (!seconds || seconds < 0) return "0 min";
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);

//   if (hours > 0) {
//     return `${hours}h ${minutes}m`;
//   }
//   return `${minutes} min`;
// };

// /**
//  * Time ago formatter
//  */
// const timeAgo = (date) => {
//   const seconds = Math.floor((new Date() - new Date(date)) / 1000);

//   let interval = seconds / 31536000;
//   if (interval > 1) return Math.floor(interval) + " years ago";

//   interval = seconds / 2592000;
//   if (interval > 1) return Math.floor(interval) + " months ago";

//   interval = seconds / 86400;
//   if (interval > 1) return Math.floor(interval) + " days ago";

//   interval = seconds / 3600;
//   if (interval > 1) return Math.floor(interval) + " hours ago";

//   interval = seconds / 60;
//   if (interval > 1) return Math.floor(interval) + " minutes ago";

//   return Math.floor(seconds) + " seconds ago";
// };

// /**
//  * Calculate most productive hour
//  */
// const calculateMostProductiveHour = (userProgress) => {
//   const hourCounts = Array(24).fill(0);

//   userProgress.forEach((p) => {
//     if (p.date) {
//       const hour = new Date(p.date).getHours();
//       hourCounts[hour] += p.timeSpent || 0;
//     }
//   });

//   const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
//   return maxHour !== -1 ? maxHour : 12;
// };

// /**
//  * Get preferred study time
//  */
// const getPreferredStudyTime = (userProgress) => {
//   const hourCounts = Array(24).fill(0);

//   userProgress.forEach((p) => {
//     if (p.date) {
//       const hour = new Date(p.date).getHours();
//       hourCounts[hour] += 1;
//     }
//   });

//   const maxHour = hourCounts.indexOf(Math.max(...hourCounts));

//   if (maxHour >= 5 && maxHour < 12) return "Morning 🌅";
//   if (maxHour >= 12 && maxHour < 17) return "Afternoon ☀️";
//   if (maxHour >= 17 && maxHour < 20) return "Evening 🌆";
//   return "Night 🌙";
// };

// /**
//  * Get next milestones
//  */
// const getNextMilestones = (user, totalPages) => {
//   const milestones = [];
//   const completedPages = user.completedPages?.length || 0;

//   // Page milestones
//   const pageMilestones = [10, 25, 50, 100, 250, 500];
//   for (const m of pageMilestones) {
//     if (completedPages < m) {
//       milestones.push({
//         type: "pages",
//         target: m,
//         current: completedPages,
//         progress: Math.round((completedPages / m) * 100),
//       });
//       break;
//     }
//   }

//   // Streak milestones
//   const streakMilestones = [3, 7, 15, 30, 50, 100];
//   for (const m of streakMilestones) {
//     if (user.currentStreak < m) {
//       milestones.push({
//         type: "streak",
//         target: m,
//         current: user.currentStreak,
//         progress: Math.round((user.currentStreak / m) * 100),
//       });
//       break;
//     }
//   }

//   return milestones;
// };

// /**
//  * Calculate percentile
//  */
// const calculatePercentile = (rank, total) => {
//   if (!rank || !total) return 0;
//   return Math.round(((total - rank) / total) * 100);
// };

// /**
//  * Get heatmap intensity
//  */
// const getHeatmapIntensity = (watchTime) => {
//   if (watchTime === 0) return 0;
//   if (watchTime < 900) return 1; // < 15 min
//   if (watchTime < 1800) return 2; // 15-30 min
//   if (watchTime < 3600) return 3; // 30-60 min
//   return 4; // > 60 min
// };

// /**
//  * Get heatmap color
//  */
// const getHeatmapColor = (intensity) => {
//   const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
//   return colors[intensity];
// };

// /**
//  * Get badge name
//  */
// const getBadgeName = (category, level) => {
//   if (category === "streak") return `${level} Day Streak 🔥`;
//   if (category === "completion") {
//     const badges = {
//       10: "Bronze Learner 🥉",
//       25: "Silver Learner 🥈",
//       50: "Gold Learner 🥇",
//       100: "Platinum Learner 💎",
//       250: "Diamond Learner 💎💎",
//       500: "Master Learner 👑",
//     };
//     return badges[level] || "Achievement Unlocked 🏆";
//   }
//   return "Special Achievement 🌟";
// };

// /**
//  * Get badge description
//  */
// const getBadgeDescription = (category, level) => {
//   if (category === "streak")
//     return `Maintained a ${level}-day learning streak!`;
//   if (category === "completion")
//     return `Completed ${level} videos! Keep up the great work!`;
//   return "Exceptional learning achievement!";
// };

// /**
//  * Get badge icon
//  */
// const getBadgeIcon = (category) => {
//   switch (category) {
//     case "streak":
//       return "🔥";
//     case "completion":
//       return "🏆";
//     default:
//       return "⭐";
//   }
// };
