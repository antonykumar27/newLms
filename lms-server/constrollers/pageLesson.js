const mongoose = require("mongoose");
const UserProgress = require("../models/userProgressSchema");
const Video = require("../models/videoModel");
const MathsLesson = require("../models/mathsLesson");
const {
  sanitizeLessonContent,
  sanitizeText,
  validateMathContent,
  convertInlineToBlockMath,
} = require("../models/sanitize.js"); // Adjust path as needed
const { multerMiddleware } = require("../config/cloudinary.js");
const { isAuthenticatedUser } = require("../middlewares/authenticate.js");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const StandardChapter = require("../models/standardChapterScheema.js");
const StandardPage = require("../models/StandardPageScheema.js");
const StandardSubject = require("../models/standardSubjectSchema.js");
const fs = require("fs");
const Enrollment = require("../models/enrollment.js");
const QuizAttempt = require("../models/quizAttempt.js");
exports.getUserAllProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;

    /* ---------- 1. FIND CHAPTER ---------- */
    const chapter = await StandardChapter.findById(chapterId).populate({
      path: "subjectId",
      select: "subject standard part standardId",
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    /* ---------- 2. FIND PAGES (OPTIONAL) ---------- */
    const pages = await StandardPage.find({
      chapterId: chapter._id,
    }).sort({ pageNumber: 1 });

    let hasSubscription = false;

    // 👇 Check only if logged in
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        standard: chapter.subjectId.standardId,
        paymentStatus: "paid",
        isActive: true,
      }).populate("order");

      if (enrollment) {
        const now = new Date();
        const endDate = enrollment.order.subscription.endDate;

        if (now <= endDate) {
          hasSubscription = true;
        }
      }
    }

    // 👇 Preview Logic

    let visiblePages = pages.map((page, index) => {
      return {
        ...page._doc,
        isLocked: !hasSubscription && index >= 2, // lock from 3rd page
      };
    });

    let locked = !hasSubscription && pages.length > 2;

    /* ---------- 3. RESPONSE (ALWAYS SUCCESS) ---------- */
    res.status(200).json({
      success: true,
      data: {
        chapter,
        subject: chapter.subjectId,
        pages: visiblePages,
        subscription: {
          hasSubscription,
          locked,
          totalPages: pages.length,
          previewPages: hasSubscription ? pages.length : 2,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// ==============================================
// GET USER PROGRESS API
// Complete data retrieval with all analytics
// ==============================================
exports.getStudentChapters = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // 1️⃣ Get lesson
    const lesson = await StandardPage.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // 2️⃣ Get subjectId from chapter
    const chapter = await StandardChapter.findById(lesson.chapterId).select(
      "subjectId",
    );

    // 3️⃣ Get course media using pageId === lessonId
    const video = await Video.findOne({ pageId: lessonId }).select(
      "title url type totalDuration",
    );

    res.json({
      success: true,
      lesson,
      subjectId: chapter?.subjectId || null,
      media: video, // 👈 THIS IS WHAT YOU WANT
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/user/progress/:userId/:pageId
 * Retrieve complete user progress data
 */

// controllers/pageLesson.js

/**
 * GET /api/chapter/progress/:chapterId
 * Get complete chapter progress with all pages
 */
exports.getChapterProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;

    if (!chapterId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID and authentication required",
      });
    }

    // ========== 1. GET ALL PAGES IN THIS CHAPTER ==========
    const pages = await StandardPage.find({ chapterId })
      .select("_id pageNumber title") // Only select needed fields
      .sort({ pageNumber: 1 })
      .lean();

    if (!pages || pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pages found in this chapter",
      });
    }

    // ========== 2. GET ALL PROGRESS FOR THIS USER ==========
    const pageIds = pages.map((page) => page._id);

    const allProgress = await UserProgress.find({
      userId,
      pageId: { $in: pageIds },
    })
      .select("pageId completionPercentage")
      .lean();

    // Create progress map
    const progressMap = {};
    allProgress.forEach((progress) => {
      progressMap[progress.pageId.toString()] =
        progress.completionPercentage || 0;
    });
    console.log("all progressMap :", progressMap);
    // ========== 3. BUILD PAGES WITH PROGRESS ==========
    const pagesWithProgress = pages.map((page) => ({
      pageId: page._id,
      pageNumber: page.pageNumber,
      title: page.title,
      progress: progressMap[page._id.toString()] || 0,
    }));
    console.log("all pagesWithProgress :", pagesWithProgress);
    // ========== 4. CALCULATE TOTAL CHAPTER PROGRESS ==========
    const totalProgressSum = pagesWithProgress.reduce(
      (sum, page) => sum + page.progress,
      0,
    );
    const averageProgress = (totalProgressSum / pages.length).toFixed(1);

    // Calculate total chapter progress (sum of all page progress)
    const totalChapterProgress = totalProgressSum; // This is the total you want

    // ========== 5. FINAL RESPONSE WITH TOTAL PROGRESS ==========
    res.json({
      success: true,
      data: {
        chapterId,
        totalPages: pages.length,
        averageProgress: parseFloat(averageProgress),
        totalChapterProgress: parseFloat(totalChapterProgress.toFixed(1)), // 👈 Total progress
        pages: pagesWithProgress,
      },
    });
  } catch (error) {
    console.error("Error in getChapterProgress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chapter progress",
      error: error.message,
    });
  }
};

/**
 * GET /api/quiz/progress/chapter/:chapterId
 * Get quiz progress for chapter and its pages
 */
// controllers/quizProgressController.js

/**
 * GET /api/quiz/progress/chapter/:chapterId
 * Get simple quiz progress for chapter progress bar
 */
// controllers/quizProgressController.js

/**
 * GET /api/quiz/progress/chapter/:chapterId
 * Get quiz progress with correct percentages (0-100 only)
 */
exports.getChapterQuizProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;

    if (!chapterId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID and authentication required",
      });
    }

    // ========== 1. GET ALL PAGES IN THIS CHAPTER ==========
    const pages = await StandardPage.find({ chapterId })
      .select("_id pageNumber title")
      .sort({ pageNumber: 1 })
      .lean();

    if (!pages || pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pages found in this chapter",
      });
    }

    // ========== 2. GET ALL QUIZ ATTEMPTS ==========
    const pageIds = pages.map((page) => page._id);

    const quizAttempts = await QuizAttempt.find({
      userId,
      quizId: { $in: pageIds },
      quizCategory: "PAGE",
    }).lean();

    // ========== 3. GET BEST SCORE FOR EACH PAGE (0-100) ==========
    const bestScores = {};

    quizAttempts.forEach((attempt) => {
      const pageId = attempt.quizId.toString();
      const score = attempt.score || 0; // Score is already percentage (0-100)

      // Store highest score only
      if (!bestScores[pageId] || score > bestScores[pageId]) {
        bestScores[pageId] = score;
      }
    });

    // ========== 4. BUILD PAGE DATA WITH SCORES ==========
    let totalScoreSum = 0;

    const pagesWithScores = pages.map((page) => {
      const pageId = page._id.toString();
      const score = bestScores[pageId] || 0; // 0-100 only

      totalScoreSum += score;

      return {
        pageId: page._id,
        pageNumber: page.pageNumber,
        title: page.title,
        quizScore: score, // Always between 0-100
      };
    });

    // ========== 5. CORRECT CHAPTER AVERAGE ==========
    // Average of percentages is still a percentage (0-100)
    const chapterAverageScore =
      pages.length > 0 ? (totalScoreSum / pages.length).toFixed(1) : 0;

    // ========== 6. FINAL RESPONSE (NO TOTAL SCORE) ==========
    res.json({
      success: true,
      data: {
        chapterId,
        totalPages: pages.length,
        averageScore: parseFloat(chapterAverageScore), // ✅ Always 0-100
        pages: pagesWithScores,
      },
    });
  } catch (error) {
    console.error("Error in getChapterQuizProgress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz progress",
      error: error.message,
    });
  }
};
// ========== HELPER FUNCTIONS ==========

/**
 * Get page status based on progress
 */
const getPageStatus = (progress) => {
  if (!progress) return "not_started";
  if (progress.isCompleted) return "completed";
  if (progress.completionPercentage > 0) return "in_progress";
  if (progress.engagementScore > 1) return "revised";
  return "not_started";
};

/**
 * Get last active time across all progress
 */
const getLastActive = (allProgress) => {
  if (!allProgress || allProgress.length === 0) return null;

  const dates = allProgress
    .map((p) => p.lastActiveAt)
    .filter((d) => d)
    .sort((a, b) => b - a);

  return dates.length > 0 ? dates[0] : null;
};

/**
 * Format seconds to readable time
 */

// ========== HELPER FUNCTIONS ==========

/**
 * Format seconds to readable time
 */

/**
 * Calculate average session duration
 */
const calculateAverageSessionDuration = (sessions) => {
  const completedSessions = sessions.filter((s) => s.status === "completed");
  if (completedSessions.length === 0) return "0 sec";

  const total = completedSessions.reduce((sum, s) => sum + s.duration, 0);
  const avg = total / completedSessions.length;
  return formatTime(avg);
};

/**
 * Find gaps in watch coverage
 */
const findWatchGaps = (ranges, duration) => {
  if (!ranges || ranges.length === 0) {
    return [
      {
        gap: `0 → ${formatTime(duration)}`,
        duration: formatTime(duration),
      },
    ];
  }

  const gaps = [];
  let lastEnd = 0;

  for (const range of ranges.sort((a, b) => a.start - b.start)) {
    if (range.start > lastEnd + 2) {
      // Gap > 2 seconds
      gaps.push({
        gap: `${formatTime(lastEnd)} → ${formatTime(range.start)}`,
        duration: formatTime(range.start - lastEnd),
      });
    }
    lastEnd = Math.max(lastEnd, range.end);
  }

  if (lastEnd < duration) {
    gaps.push({
      gap: `${formatTime(lastEnd)} → ${formatTime(duration)}`,
      duration: formatTime(duration - lastEnd),
    });
  }

  return gaps;
};

/**
 * Get engagement level description
 */
const getEngagementLevel = (score) => {
  if (score === 0) return "Not started";
  if (score < 0.5) return "Low engagement";
  if (score < 1) return "Partial watch";
  if (score === 1) return "Completed once";
  if (score < 2) return "Revision started";
  if (score < 3) return "Regular learner";
  return "Highly engaged";
};
/**
 * Format seconds to readable time
 */
const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return "0 sec";
  if (seconds < 60) return `${seconds.toFixed(1)} sec`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};
