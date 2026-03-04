//1️⃣ Get User's Watch Progress (Fast UI Data from WatchTime)
// controllers/watchController.js
const WatchTime = require("../models/watchTimeSchema");
const Course = require("../models/course");

const User = require("../models/loginUserModel");
const LmsStudentProfile = require("../models/lmsStudent");
const Enrollment = require("../models/enrollment");
const StandardSubject = require("../models/standardSubjectSchema");
const StandardChapter = require("../models/standardChapterScheema");
const StandardPage = require("../models/StandardPageScheema");
const MathsLesson = require("../models/mathsLesson");
const crypto = require("crypto");
const QuizAttempt = require("../models/quizAttempt.js");
const UserProgress = require("../models/userProgressSchema.js");
const Video = require("../models/videoModel.js");
// 📺 Get user's watch progress for a specific video/page
// exports.getUserWatchProgress = async (req, res) => {
//   try {
//     const { videoId, pageId } = req.params;
//     const userId = req.user._id;
//     console.log("userId", userId);
//     console.log("videoId", videoId);
//     console.log("pageId", pageId);
//     const watchTime = await WatchTime.findOne({
//       userId,
//       videoId,
//       page: pageId,
//     }).select(
//       "progress lastPosition completed totalWatchedSeconds uniqueWatchedSeconds videoDuration firstWatchedAt",
//     );
//     console.log("watchTime", watchTime);
//     if (!watchTime) {
//       return res.json({
//         success: true,
//         data: {
//           progress: 0,
//           lastPosition: 0,
//           completed: false,
//           totalWatchTime: 0,
//           firstTime: true,
//         },
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         progress: watchTime.progress,
//         lastPosition: watchTime.lastPosition,
//         completed: watchTime.completed,
//         totalWatchTime: watchTime.totalWatchedSeconds,
//         uniqueWatchTime: watchTime.uniqueWatchedSeconds,
//         videoDuration: watchTime.videoDuration,
//         firstWatchedAt: watchTime.firstWatchedAt,
//         // Calculate repeats
//         repeatCount: watchTime.videoDuration
//           ? Math.floor(watchTime.totalWatchedSeconds / watchTime.videoDuration)
//           : 0,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching watch progress:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch watch progress",
//     });
//   }
// };
exports.getUserWatchProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId, pageId } = req.query;

    // Build filter - ONLY userId + optional videoId/pageId
    let filter = { userId };

    // ✅ STEP 1: Validate pageId if provided
    if (pageId) {
      const page = await StandardPage.findById(pageId);
      if (!page) {
        return res.status(404).json({
          success: false,
          error: "Page not found",
        });
      }
      filter.pageId = pageId;
    }

    // ✅ STEP 2: Validate videoId if provided
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
      filter.videoId = videoId;
    }

    // ✅ STEP 3: Fetch progress data
    const watchProgress = await WatchTime.find(filter)
      .populate("videoId", "title thumbnail duration")
      .populate("page", "title")
      .populate("chapter", "name")
      .populate("subject", "name")
      .populate("standard", "name grade")

      .sort("-lastWatchedAt");
    console.log("watchProgress", watchProgress);
    // ✅ STEP 4: If specific video requested
    if (videoId) {
      // If progress exists
      if (watchProgress.length > 0) {
        const video = watchProgress[0];
        return res.json({
          success: true,
          data: {
            video: {
              id: video.videoId?._id,
              title: video.videoId?.title,
              thumbnail: video.videoId?.thumbnail,
              duration: video.videoId?.duration || video.duration,
            },
            progress: {
              completionPercentage: video.completionPercentage || 0,
              lastPosition: video.lastPosition || 0,
              totalWatched: video.totalWatched || 0,
              playCount: video.playCount || 0,
              isCompleted: video.isCompleted || false,
              firstPlayedAt: video.firstPlayedAt,
              lastPlayedAt: video.lastPlayedAt,
            },
            location: {
              standard: video.standardId,
              subject: video.subjectId,
              chapter: video.chapterId,
              page: video.pageId,
            },
            watchedRanges: video.watchedRanges || [],
          },
        });
      }
      // If no progress yet for this video
      else {
        // Get video details from Course
        const course = await Course.findOne(
          { "media._id": videoId },
          { "media.$": 1 },
        );

        const videoDetails = course?.media?.[0];

        return res.json({
          success: true,
          data: {
            video: {
              id: videoId,
              title: videoDetails?.title || "Video",
              thumbnail: videoDetails?.thumbnail || "",
              duration: videoDetails?.duration || 0,
            },
            progress: {
              completionPercentage: 0,
              lastPosition: 0,
              totalWatched: 0,
              playCount: 0,
              isCompleted: false,
              firstPlayedAt: null,
              lastPlayedAt: null,
            },
            location: {
              standard: null,
              subject: null,
              chapter: null,
              page: null,
            },
            watchedRanges: [],
          },
        });
      }
    }

    // ✅ STEP 5: If pageId requested - get all videos for that page
    if (pageId) {
      const pageVideos = watchProgress.map((v) => ({
        videoId: v.videoId?._id,
        title: v.videoId?.title,
        thumbnail: v.videoId?.thumbnail,
        duration: v.videoId?.duration || v.duration,
        progress: {
          completionPercentage: v.completionPercentage || 0,
          lastPosition: v.lastPosition || 0,
          isCompleted: v.isCompleted || false,
        },
        lastWatched: v.lastPlayedAt,
      }));

      // Calculate page stats
      const completedCount = pageVideos.filter(
        (v) => v.progress.isCompleted,
      ).length;

      const avgProgress = pageVideos.length
        ? pageVideos.reduce(
            (sum, v) => sum + (v.progress.completionPercentage || 0),
            0,
          ) / pageVideos.length
        : 0;

      return res.json({
        success: true,
        data: {
          pageId,
          totalVideos: pageVideos.length,
          completedVideos: completedCount,
          averageProgress: avgProgress,
          videos: pageVideos,
        },
      });
    }

    // ✅ STEP 6: If no specific filters - return all progress (minimal)
    res.json({
      success: true,
      data: {
        total: watchProgress.length,
        items: watchProgress.map((p) => ({
          videoId: p.videoId?._id,
          title: p.videoId?.title,
          completionPercentage: p.completionPercentage || 0,
          isCompleted: p.isCompleted || false,
          lastPlayedAt: p.lastPlayedAt,
          pageId: p.pageId?._id,
          pageTitle: p.pageId?.title,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch progress data",
    });
  }
};
// 📚 Get all user's watch progress (for dashboard)

// exports.getUserAllProgress = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { standardId, subjectId, chapterId, pageId } = req.query;

//     // Build filter with standard support
//     let filter = { userId };
//     if (standardId) filter.standard = standardId;
//     if (subjectId) filter.subject = subjectId;
//     if (chapterId) filter.chapter = chapterId;
//     if (pageId) filter.page = pageId;

//     const watchTimes = await WatchTime.find(filter)
//       .populate("videoId", "title media duration")
//       .populate("page", "title")
//       .populate("chapter", "name")
//       .populate("subject", "name")
//       .populate("standard", "name grade")
//       .sort("-lastWatchedAt");
//     c;
//     // Group by completion status
//     const completed = watchTimes.filter((w) => w.completed);
//     const inProgress = watchTimes.filter((w) => !w.completed && w.progress > 0);
//     const notStarted = watchTimes.filter((w) => w.progress === 0);

//     // Safe calculations
//     const totalWatchTime = watchTimes.reduce(
//       (sum, w) => sum + (w.totalWatchedSeconds || 0),
//       0,
//     );

//     const averageProgress = watchTimes.length
//       ? watchTimes.reduce((sum, w) => sum + (w.progress || 0), 0) /
//         watchTimes.length
//       : 0;

//     // 🔥 FIXED: byStandard with correct averageProgress (using progress %, not watchTime)
//     const byStandard = Object.values(
//       watchTimes.reduce((acc, curr) => {
//         const stdId = curr.standard?._id?.toString() || "unknown";

//         if (!acc[stdId]) {
//           acc[stdId] = {
//             standardId: stdId,
//             standard: curr.standard || { name: "Unknown", grade: "" },
//             total: 0,
//             completed: 0,
//             inProgress: 0,
//             notStarted: 0,
//             watchTime: 0,
//             totalProgress: 0, // ✅ New field to sum up progress %
//           };
//         }

//         // Count statistics
//         acc[stdId].total++;

//         if (curr.completed) acc[stdId].completed++;
//         else if (curr.progress > 0) acc[stdId].inProgress++;
//         else acc[stdId].notStarted++;

//         // Time and progress (both stored separately)
//         acc[stdId].watchTime += curr.totalWatchedSeconds || 0;
//         acc[stdId].totalProgress += curr.progress || 0; // ✅ Sum progress % values

//         return acc;
//       }, {}),
//     ).map((std) => ({
//       ...std,
//       // ✅ Correct: average of progress percentages
//       averageProgress: std.total
//         ? std.totalProgress / std.total // Now this gives % average
//         : 0,

//       // Also keep average watch time if needed
//       averageWatchTime: std.total ? std.watchTime / std.total : 0,
//     }));

//     res.json({
//       success: true,
//       data: {
//         total: watchTimes.length,
//         completed: {
//           count: completed.length,
//           items: completed,
//         },
//         inProgress: {
//           count: inProgress.length,
//           items: inProgress,
//         },
//         notStarted: {
//           count: notStarted.length,
//           items: notStarted,
//         },
//         // Overall stats
//         totalWatchTime,
//         averageProgress, // ✅ This is correct % average now

//         // Standard-wise breakdown with correct averages
//         byStandard,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching all progress:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch progress data",
//     });
//   }
// };
// ========== MISSING HELPER FUNCTIONS ==========

/**
 * Calculate subject progress percentage
 */
const calculateSubjectProgress = (user, subjectId, chapters) => {
  if (!user?.completedChapters || !chapters?.length) return 0;

  const chapterIds = chapters.map((c) => c._id.toString());
  const completedCount = user.completedChapters.filter((cId) =>
    chapterIds.includes(cId.toString()),
  ).length;

  return Math.round((completedCount / chapters.length) * 100) || 0;
};

/**
 * Get completed pages count for a chapter
 */
const getCompletedPagesCount = (user, chapterId, pages) => {
  if (!user?.completedPages || !pages?.length) return 0;

  const pageIds = pages.map((p) => p._id.toString());
  return (
    user.completedPages.filter((pId) => pageIds.includes(pId.toString()))
      .length || 0
  );
};

/**
 * Calculate chapter progress percentage
 */
const calculateChapterProgress = (user, chapterId, pages) => {
  if (!user?.completedPages || !pages?.length) return 0;

  const pageIds = pages.map((p) => p._id.toString());
  const completedCount = user.completedPages.filter((pId) =>
    pageIds.includes(pId.toString()),
  ).length;

  return Math.round((completedCount / pages.length) * 100) || 0;
};

/**
 * Calculate overall score (used in calculateUnifiedStats)
 */
const calculateOverallScore = (data) => {
  const {
    avgQuizScore = 0,
    videoCompletionRate = 0,
    consistencyScore = 0,
    currentStreak = 0,
    totalWatchTime = 0,
    badgeCount = 0,
  } = data;

  const weights = {
    quizScore: 0.4,
    videoCompletion: 0.3,
    consistency: 0.2,
    streak: 0.05,
    badges: 0.05,
  };

  const streakScore = Math.min(currentStreak || 0, 30) * 3.33;
  const watchTimeScore = Math.min(totalWatchTime || 0, 10) * 10; // 10 hours = 100
  const badgeScore = Math.min(badgeCount || 0, 10) * 10;

  const totalScore =
    (avgQuizScore || 0) * weights.quizScore +
    (videoCompletionRate || 0) * weights.videoCompletion +
    (consistencyScore || 0) * weights.consistency +
    streakScore * weights.streak +
    badgeScore * weights.badge;

  return Math.round(totalScore) || 0;
};

/**
 * Calculate chapter average score (if needed elsewhere)
 */
const calculateChapterAverageScore = (quizAttempts, chapterId) => {
  if (!quizAttempts?.length) return 0;

  const chapterQuizzes = quizAttempts.filter(
    (qa) => qa.contextIds?.chapterId?.toString() === chapterId.toString(),
  );

  const scores = chapterQuizzes.map((q) => q.score || 0);
  return scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
};

/**
 * Calculate chapter watch time (if needed elsewhere)
 */
const calculateChapterWatchTime = (videoProgress, chapterId) => {
  if (!videoProgress?.length) return 0;

  const chapterVideos = videoProgress.filter(
    (vp) => vp.chapterId?.toString() === chapterId.toString(),
  );

  return (
    Math.round(
      chapterVideos.reduce((acc, v) => acc + (v.watchTime || 0), 0) / 60,
    ) || 0
  ); // hours
};

// ===== COMPLETE ANALYTICS CONTROLLER =====

/**
 * GET USER ALL PROGRESS WITH CONTENT
 * Unified endpoint that returns user progress with enrolled standard content
 * Supports filtering at multiple levels (standard, subject, chapter, page)
 */
exports.getUserAllProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      standardId,
      subjectId,
      chapterId,
      pageId,
      search,
      contentType,
      completionStatus,
      fromDate,
      toDate,
      limit = 50,
      page = 1,
      sortBy = "lastAccessed",
      sortOrder = "desc",
    } = req.query;

    // ===== 1️⃣ VALIDATE AND BUILD BASE FILTERS =====
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    // Build progress filter
    let progressFilter = { userId };
    if (standardId) progressFilter.standardId = standardId;
    if (subjectId) progressFilter.subjectId = subjectId;
    if (chapterId) progressFilter.chapterId = chapterId;
    if (pageId) progressFilter.pageId = pageId;

    // Date range filter
    if (fromDate || toDate) {
      progressFilter.lastAccessed = {};
      if (fromDate) progressFilter.lastAccessed.$gte = new Date(fromDate);
      if (toDate) progressFilter.lastAccessed.$lte = new Date(toDate);
    }

    // ===== 2️⃣ GET USER ENROLLMENT & VERIFY ACCESS =====
    const enrollment = await Enrollment.findOne({
      student: userId,
      isActive: true,
      paymentStatus: "paid",
      status: "active",
    })
      .populate("standard", "standard name description")
      .lean();

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to any standard",
      });
    }

    const enrolledStandardId = enrollment.standard._id;

    // If standardId provided, verify user has access
    if (standardId && standardId !== enrolledStandardId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this standard",
      });
    }

    // ===== 3️⃣ FETCH ALL CONTENT WITH OPTIMIZED QUERIES =====
    const [subjects, chapters, pages, videos] = await Promise.all([
      // Get subjects
      StandardSubject.find({
        standardId: enrolledStandardId,
        ...(subjectId && { _id: subjectId }),
      })
        .select("_id subject name description icon order")
        .lean(),

      // Get chapters with optional filtering
      StandardChapter.find({
        standardId: enrolledStandardId,
        ...(subjectId && { subjectId }),
        ...(chapterId && { _id: chapterId }),
      })
        .select("_id subjectId chapterNumber title description")
        .lean(),

      // Get pages with optional filtering
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
        .lean(),

      // Get videos with optional filtering
      Video.find({
        standardId: enrolledStandardId,
        ...(subjectId && { subjectId }),
        ...(chapterId && { chapterId }),
        ...(pageId && { pageId }),
      })
        .select("_id pageId title description duration thumbnailUrl order")
        .lean(),
    ]);

    // ===== 4️⃣ FETCH USER PROGRESS DATA =====
    const [watchTimeProgress, quizAttempts, userProgress, user] =
      await Promise.all([
        // Watch time progress
        WatchTime.find(progressFilter)
          .populate("videoId", "title duration")
          .populate("page", "title contentType")
          .populate("chapter", "title chapterNumber")
          .populate("subject", "subject name")
          .populate("standard", "standard")
          .sort({
            [sortBy === "lastAccessed" ? "lastWatchedAt" : sortBy]:
              sortDirection,
          })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),

        // Quiz attempts
        QuizAttempt.find({
          userId,
          ...(subjectId && { "contextIds.subjectId": subjectId }),
          ...(chapterId && { "contextIds.chapterId": chapterId }),
          ...(pageId && { "contextIds.pageId": pageId }),
          ...(fromDate && { createdAt: { $gte: new Date(fromDate) } }),
          ...(toDate && { createdAt: { $lte: new Date(toDate) } }),
        })
          .sort("-createdAt")
          .lean(),

        // General user progress (completed pages, chapters, etc.)
        UserProgress.find(progressFilter).sort("-date").lean(),

        // User data for streaks and badges
        User.findById(userId)
          .select(
            "currentStreak maxStreak badges completedChapters completedSubjects completedPages lastActiveDate",
          )
          .lean(),
      ]);

    // ===== 5️⃣ APPLY SEARCH FILTER =====
    let filteredWatchTime = watchTimeProgress;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filteredWatchTime = watchTimeProgress.filter(
        (w) =>
          w.videoId?.title?.match(searchRegex) ||
          w.page?.title?.match(searchRegex) ||
          w.chapter?.title?.match(searchRegex) ||
          w.subject?.name?.match(searchRegex),
      );
    }

    // Apply completion status filter
    if (completionStatus) {
      filteredWatchTime = filteredWatchTime.filter((w) => {
        if (completionStatus === "completed") return w.completed;
        if (completionStatus === "inProgress")
          return !w.completed && w.progress > 0;
        if (completionStatus === "notStarted") return w.progress === 0;
        return true;
      });
    }

    // ===== 6️⃣ BUILD CONTENT HIERARCHY WITH PROGRESS =====
    const contentWithProgress = subjects.map((subject) => {
      const subjectChapters = chapters.filter(
        (ch) => ch.subjectId.toString() === subject._id.toString(),
      );

      const subjectWatchTime = filteredWatchTime.filter(
        (w) => w.subject?._id?.toString() === subject._id.toString(),
      );

      const subjectQuizzes = quizAttempts.filter(
        (q) => q.contextIds?.subjectId?.toString() === subject._id.toString(),
      );

      return {
        subjectId: subject._id,
        subjectName: subject.subject || subject.name,
        description: subject.description,
        icon: subject.icon,
        order: subject.order,

        // Subject-level progress stats
        progress: {
          totalWatchTime: subjectWatchTime.reduce(
            (sum, w) => sum + (w.totalWatchedSeconds || 0),
            0,
          ),
          averageProgress: subjectWatchTime.length
            ? subjectWatchTime.reduce((sum, w) => sum + (w.progress || 0), 0) /
              subjectWatchTime.length
            : 0,
          completedVideos: subjectWatchTime.filter((w) => w.completed).length,
          totalVideos: subjectWatchTime.length,
          quizAttempts: subjectQuizzes.length,
          averageQuizScore: subjectQuizzes.length
            ? Math.round(
                subjectQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
                  subjectQuizzes.length,
              )
            : 0,
          progressPercentage: calculateSubjectProgress(
            user,
            subject._id,
            subjectChapters,
          ),
        },

        chapters: subjectChapters.map((chapter) => {
          const chapterPages = pages.filter(
            (p) => p.chapterId.toString() === chapter._id.toString(),
          );

          const chapterVideos = videos.filter(
            (v) => v.chapterId?.toString() === chapter._id.toString(),
          );

          const chapterWatchTime = filteredWatchTime.filter(
            (w) => w.chapter?._id?.toString() === chapter._id.toString(),
          );

          const chapterQuizzes = quizAttempts.filter(
            (q) =>
              q.contextIds?.chapterId?.toString() === chapter._id.toString(),
          );

          return {
            chapterId: chapter._id,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            description: chapter.description,

            // Chapter-level progress
            progress: {
              totalWatchTime: chapterWatchTime.reduce(
                (sum, w) => sum + (w.totalWatchedSeconds || 0),
                0,
              ),
              averageProgress: chapterWatchTime.length
                ? chapterWatchTime.reduce(
                    (sum, w) => sum + (w.progress || 0),
                    0,
                  ) / chapterWatchTime.length
                : 0,
              completedVideos: chapterWatchTime.filter((w) => w.completed)
                .length,
              totalVideos: chapterWatchTime.length,
              quizAttempts: chapterQuizzes.length,
              averageQuizScore: chapterQuizzes.length
                ? Math.round(
                    chapterQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
                      chapterQuizzes.length,
                  )
                : 0,
              pagesCompleted: getCompletedPagesCount(
                user,
                chapter._id,
                chapterPages,
              ),
              totalPages: chapterPages.length,
              progressPercentage: calculateChapterProgress(
                user,
                chapter._id,
                chapterPages,
              ),
            },

            pages: chapterPages.map((page) => {
              const pageVideos = videos.filter(
                (v) => v.pageId?.toString() === page._id.toString(),
              );

              const pageWatchTime = filteredWatchTime.filter(
                (w) => w.page?._id?.toString() === page._id.toString(),
              );

              const pageQuizzes = quizAttempts.filter(
                (q) => q.contextIds?.pageId?.toString() === page._id.toString(),
              );

              return {
                pageId: page._id,
                title: page.title,
                description: page.description,
                contentType: page.contentType,
                order: page.order,
                metadata: page.metadata,

                // Page-level progress
                progress: {
                  totalWatchTime: pageWatchTime.reduce(
                    (sum, w) => sum + (w.totalWatchedSeconds || 0),
                    0,
                  ),
                  averageProgress: pageWatchTime.length
                    ? pageWatchTime.reduce(
                        (sum, w) => sum + (w.progress || 0),
                        0,
                      ) / pageWatchTime.length
                    : 0,
                  completedVideos: pageWatchTime.filter((w) => w.completed)
                    .length,
                  totalVideos: pageWatchTime.length,
                  quizAttempts: pageQuizzes.length,
                  lastQuizScore: pageQuizzes[0]?.score || null,
                  bestQuizScore: Math.max(
                    ...pageQuizzes.map((q) => q.score || 0),
                    0,
                  ),
                  isCompleted:
                    user?.completedPages?.includes(page._id) || false,
                  lastAccessed: pageWatchTime[0]?.lastWatchedAt || null,
                },

                videos: pageVideos.map((video) => {
                  const videoWatchTime = filteredWatchTime.find(
                    (w) => w.videoId?._id?.toString() === video._id.toString(),
                  );

                  return {
                    videoId: video._id,
                    title: video.title,
                    description: video.description,
                    duration: video.duration,
                    thumbnailUrl: video.thumbnailUrl,
                    order: video.order,

                    // Video-specific progress
                    progress: videoWatchTime
                      ? {
                          watchedSeconds:
                            videoWatchTime.totalWatchedSeconds || 0,
                          progress: videoWatchTime.progress || 0,
                          completed: videoWatchTime.completed || false,
                          lastWatchedAt: videoWatchTime.lastWatchedAt,
                          watchTimePercentage: video.duration
                            ? Math.min(
                                100,
                                Math.round(
                                  (videoWatchTime.totalWatchedSeconds /
                                    video.duration) *
                                    100,
                                ),
                              )
                            : 0,
                        }
                      : {
                          watchedSeconds: 0,
                          progress: 0,
                          completed: false,
                          lastWatchedAt: null,
                          watchTimePercentage: 0,
                        },
                  };
                }),
              };
            }),
          };
        }),
      };
    });

    // ===== 7️⃣ CALCULATE OVERALL STATS =====
    const overallStats = calculateUnifiedStats({
      watchTime: filteredWatchTime,
      quizAttempts,
      userProgress,
      user,
      totalContent: {
        subjects: subjects.length,
        chapters: chapters.length,
        pages: pages.length,
        videos: videos.length,
      },
    });

    // ===== 8️⃣ GET PAGINATION METADATA =====
    const totalCount = await WatchTime.countDocuments(progressFilter);

    // ===== 9️⃣ FINAL RESPONSE =====
    res.json({
      success: true,
      data: {
        metadata: {
          standard: {
            id: enrolledStandardId,
            name: enrollment.standard.standard,
            description: enrollment.standard.description,
          },
          user: {
            id: userId,
            name: req.user.name,
            username: req.user.username,
            currentStreak: user?.currentStreak || 0,
            maxStreak: user?.maxStreak || 0,
            badges: user?.badges?.length || 0,
          },
          filters: {
            applied: {
              standardId,
              subjectId,
              chapterId,
              pageId,
              search,
              contentType,
              completionStatus,
              fromDate,
              toDate,
            },
            available: {
              subjects: subjects.map((s) => ({
                id: s._id,
                name: s.subject || s.name,
              })),
              contentTypes: ["video", "quiz", "article", "interactive"],
            },
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalItems: totalCount,
            itemsPerPage: parseInt(limit),
            hasNextPage: skip + parseInt(limit) < totalCount,
            hasPrevPage: page > 1,
          },
        },

        overallStats,

        watchTimeProgress: {
          summary: {
            total: filteredWatchTime.length,
            completed: filteredWatchTime.filter((w) => w.completed).length,
            inProgress: filteredWatchTime.filter(
              (w) => !w.completed && w.progress > 0,
            ).length,
            notStarted: filteredWatchTime.filter((w) => w.progress === 0)
              .length,
            totalWatchTime: filteredWatchTime.reduce(
              (sum, w) => sum + (w.totalWatchedSeconds || 0),
              0,
            ),
            averageProgress: filteredWatchTime.length
              ? filteredWatchTime.reduce(
                  (sum, w) => sum + (w.progress || 0),
                  0,
                ) / filteredWatchTime.length
              : 0,
          },
          items: filteredWatchTime,
        },

        quizProgress: {
          totalAttempts: quizAttempts.length,
          averageScore: quizAttempts.length
            ? Math.round(
                quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) /
                  quizAttempts.length,
              )
            : 0,
          passRate: quizAttempts.length
            ? Math.round(
                (quizAttempts.filter((q) => q.passed).length /
                  quizAttempts.length) *
                  100,
              )
            : 0,
          recentAttempts: quizAttempts.slice(0, 5),
        },

        contentWithProgress,

        // Timeline activity
        recentActivity: userProgress
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
          .map((activity) => ({
            type: activity.type || "page_view",
            contentId:
              activity.pageId || activity.chapterId || activity.subjectId,
            contentType: activity.contentType,
            timestamp: activity.date,
            details: activity.details || {},
          })),
      },
    });
  } catch (error) {
    console.error("Error in getUserProgressWithContent:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Calculate unified statistics
 */
const calculateUnifiedStats = ({
  watchTime,
  quizAttempts,
  userProgress,
  user,
  totalContent,
}) => {
  // Quiz stats
  const quizScores = quizAttempts.map((q) => q.score || 0);
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0;

  // Video stats
  const completedVideos = watchTime.filter((w) => w.completed).length;
  const totalWatchTimeSeconds = watchTime.reduce(
    (sum, w) => sum + (w.totalWatchedSeconds || 0),
    0,
  );

  // Engagement stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity =
    userProgress?.filter((p) => p.date && new Date(p.date) >= thirtyDaysAgo) ||
    [];
  const activeDays = new Set(
    recentActivity.map((a) => new Date(a.date).toISOString().split("T")[0]),
  ).size;

  // Calculate overall completion
  const completedPages = user?.completedPages?.length || 0;
  const totalPages = totalContent.pages || 0;
  const overallCompletion =
    totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;

  return {
    quiz: {
      totalAttempts: quizAttempts.length,
      averageScore: avgQuizScore,
      passRate: quizAttempts.length
        ? Math.round(
            (quizAttempts.filter((q) => q.passed).length /
              quizAttempts.length) *
              100,
          )
        : 0,
      bestScore: Math.max(...quizScores, 0) || 0,
    },
    video: {
      totalVideos: watchTime.length,
      completedVideos,
      completionRate:
        watchTime.length > 0
          ? Math.round((completedVideos / watchTime.length) * 100)
          : 0,
      totalWatchTime: Math.round(totalWatchTimeSeconds / 3600), // hours
      averageWatchTimePerVideo:
        watchTime.length > 0
          ? Math.round(totalWatchTimeSeconds / watchTime.length)
          : 0,
    },
    engagement: {
      currentStreak: user?.currentStreak || 0,
      maxStreak: user?.maxStreak || 0,
      activeDays,
      consistencyScore:
        activeDays > 0 ? Math.round((activeDays / 30) * 100) : 0,
      lastActive: user?.lastActiveDate || null,
    },
    achievements: {
      badges: user?.badges?.length || 0,
      chaptersCompleted: user?.completedChapters?.length || 0,
      subjectsCompleted: user?.completedSubjects?.length || 0,
      pagesCompleted: completedPages,
      totalPages,
      overallCompletion,
    },
    overallScore: calculateOverallScore({
      avgQuizScore,
      videoCompletionRate:
        watchTime.length > 0 ? (completedVideos / watchTime.length) * 100 : 0,
      consistencyScore: activeDays > 0 ? (activeDays / 30) * 100 : 0,
      currentStreak: user?.currentStreak || 0,
      totalWatchTime: totalWatchTimeSeconds / 3600,
      badgeCount: user?.badges?.length || 0,
    }),
  };
};

// 📊 Get continue watching list (for homepage)
exports.getContinueWatching = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const continueWatching = await WatchTime.find({
      userId,
      completed: false,
      progress: { $gt: 0, $lt: 90 }, // Started but not completed
    })
      .populate("videoId", "title thumbnail duration")
      .populate("page", "title")
      .populate("chapter", "name")
      .sort("-lastWatchedAt")
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: continueWatching.map((item) => ({
        videoId: item.videoId,
        pageId: item.page,
        chapterId: item.chapter,
        subjectId: item.subject,
        progress: item.progress,
        lastPosition: item.lastPosition,
        lastWatchedAt: item.lastWatchedAt,
        // Estimated time left
        timeLeft: item.videoDuration - item.lastPosition,
      })),
    });
  } catch (error) {
    console.error("Error fetching continue watching:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch continue watching",
    });
  }
};
//2️⃣ Analytics Data from WatchSession (For Business/Reports)

// controllers/analyticsController.js

// 📈 Get video analytics (for a specific video)
exports.getVideoAnalytics = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { startDate, endDate, standardId, subjectId, chapterId, pageId } =
      req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Build filter
    let filter = { videoId, ...dateFilter };
    if (standardId) filter.standard = standardId;
    if (subjectId) filter.subject = subjectId;
    if (chapterId) filter.chapter = chapterId;
    if (pageId) filter.page = pageId;

    // Get all sessions for this video
    const sessions = await WatchSession.find(filter);

    // Calculate analytics
    const totalViews = sessions.length;
    const uniqueViewers = new Set(sessions.map((s) => s.userId.toString()))
      .size;

    // Completion rate
    const completedSessions = sessions.filter((s) => s.completed);
    const completionRate = totalViews
      ? ((completedSessions.length / totalViews) * 100).toFixed(1)
      : 0;

    // Average watch time
    const totalWatchTimeMs = sessions.reduce(
      (sum, s) => sum + s.watchTimeMs,
      0,
    );
    const avgWatchTimeMs = totalViews ? totalWatchTimeMs / totalViews : 0;

    // Drop-off analysis
    const dropOffPoints = {};
    sessions.forEach((session) => {
      if (!session.completed && session.endTime) {
        const dropPoint = Math.floor(session.endTime / 30) * 30; // Group by 30s intervals
        dropOffPoints[dropPoint] = (dropOffPoints[dropPoint] || 0) + 1;
      }
    });

    // Device breakdown
    const deviceStats = {};
    sessions.forEach((session) => {
      const device = session.deviceInfo?.isMobile
        ? "mobile"
        : session.deviceInfo?.isTablet
          ? "tablet"
          : "desktop";
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });

    // Engagement score distribution
    const engagementDistribution = {
      low: sessions.filter((s) => s.engagementScore < 30).length,
      medium: sessions.filter(
        (s) => s.engagementScore >= 30 && s.engagementScore < 70,
      ).length,
      high: sessions.filter((s) => s.engagementScore >= 70).length,
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalViews,
          uniqueViewers,
          completionRate: completionRate + "%",
          averageWatchTime: formatDuration(avgWatchTimeMs / 1000),
          totalWatchTime: formatDuration(totalWatchTimeMs / 1000),
        },
        dropOffAnalysis: dropOffPoints,
        deviceBreakdown: deviceStats,
        engagement: engagementDistribution,
        // Timeline data
        viewsOverTime: await getViewsTimeline(filter),
      },
    });
  } catch (error) {
    console.error("Error fetching video analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
    });
  }
};

// 👥 Get user engagement report (for a specific user)
exports.getUserEngagementReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get all sessions for this user in last X days
    const sessions = await WatchSession.find({
      userId,
      createdAt: { $gte: since },
    })
      .populate("videoId", "title duration")
      .populate("subject", "name")
      .populate("chapter", "name")
      .sort("-createdAt");

    // Group by subject
    const subjectWise = {};
    sessions.forEach((session) => {
      const subjectId = session.subject?._id || session.subject;
      if (!subjectWise[subjectId]) {
        subjectWise[subjectId] = {
          subjectName: session.subject?.name || "Unknown",
          totalWatchTime: 0,
          videosWatched: new Set(),
          sessions: 0,
          completions: 0,
        };
      }
      subjectWise[subjectId].totalWatchTime += session.watchTimeMs;
      subjectWise[subjectId].videosWatched.add(session.videoId?.toString());
      subjectWise[subjectId].sessions++;
      if (session.completed) subjectWise[subjectId].completions++;
    });

    // Calculate active days
    const activeDays = new Set(
      sessions.map((s) => s.createdAt.toISOString().split("T")[0]),
    ).size;

    // Calculate streaks
    const streaks = calculateStreaks(sessions);

    res.json({
      success: true,
      data: {
        overview: {
          totalSessions: sessions.length,
          activeDays,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
          totalWatchTime: formatDuration(
            sessions.reduce((sum, s) => sum + s.watchTimeMs, 0) / 1000,
          ),
          averageDailyTime: formatDuration(
            sessions.reduce((sum, s) => sum + s.watchTimeMs, 0) / 1000 / days,
          ),
        },
        subjectBreakdown: Object.values(subjectWise).map((s) => ({
          ...s,
          totalWatchTime: formatDuration(s.totalWatchTime / 1000),
          videosWatched: s.videosWatched.size,
        })),
        recentActivity: sessions.slice(0, 20).map((s) => ({
          date: s.createdAt,
          video: s.videoId?.title,
          subject: s.subject?.name,
          chapter: s.chapter?.name,
          watchTime: formatDuration(s.watchTimeMs / 1000),
          completed: s.completed,
          progress: s.progress,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user engagement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user engagement",
    });
  }
};

// 🔥 Get overall platform analytics (admin only)
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total watch sessions
    const totalSessions = await WatchSession.countDocuments(dateFilter);

    // Unique viewers
    const uniqueViewers = await WatchSession.distinct("userId", dateFilter);

    // Total watch time
    const watchTimeAgg = await WatchSession.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalWatchTime: { $sum: "$watchTimeMs" },
          avgEngagement: { $avg: "$engagementScore" },
          completions: { $sum: { $cond: ["$completed", 1, 0] } },
        },
      },
    ]);

    // Popular content
    const popularVideos = await WatchSession.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$videoId",
          views: { $sum: 1 },
          uniqueViewers: { $addToSet: "$userId" },
          avgWatchTime: { $avg: "$watchTimeMs" },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "video",
        },
      },
    ]);

    // Daily active users
    const dailyActive = await WatchSession.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $addToSet: "$userId" },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalSessions,
          uniqueViewers: uniqueViewers.length,
          totalWatchTime: formatDuration(
            watchTimeAgg[0]?.totalWatchTime / 1000 || 0,
          ),
          averageEngagement: (watchTimeAgg[0]?.avgEngagement || 0).toFixed(1),
          completionRate: totalSessions
            ? (
                ((watchTimeAgg[0]?.completions || 0) / totalSessions) *
                100
              ).toFixed(1)
            : 0,
        },
        popularContent: popularVideos.map((v) => ({
          videoId: v._id,
          title: v.video[0]?.title,
          views: v.views,
          uniqueViewers: v.uniqueViewers.length,
          avgWatchTime: formatDuration(v.avgWatchTime / 1000),
        })),
        dailyActiveUsers: dailyActive.map((d) => ({
          date: d._id,
          users: d.users.length,
          sessions: d.sessions,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching platform analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch platform analytics",
    });
  }
};

// Helper function
function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function calculateStreaks(sessions) {
  if (!sessions.length) return { current: 0, longest: 0 };

  const dates = [
    ...new Set(sessions.map((s) => s.createdAt.toISOString().split("T")[0])),
  ].sort();

  let current = 1;
  let longest = 1;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  // Check current streak
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates.includes(today)) {
    current = 1;
    let i = dates.indexOf(today) - 1;
    while (i >= 0 && new Date(dates[i + 1]) - new Date(dates[i]) === 86400000) {
      current++;
      i--;
    }
  } else if (dates.includes(yesterday)) {
    current = 1;
    let i = dates.indexOf(yesterday) - 1;
    while (i >= 0 && new Date(dates[i + 1]) - new Date(dates[i]) === 86400000) {
      current++;
      i--;
    }
  } else {
    current = 0;
  }

  return { current, longest };
}

async function getViewsTimeline(filter) {
  return await WatchSession.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}
