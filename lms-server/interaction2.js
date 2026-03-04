const UserProgress = require("../models/userProgressSchema");
const WatchTime = require("../models/watchTimeSchema");
const QuizAttempt = require("../models/quizAttempt");
const StudentStreak = require("../models/StudentStreak");
const StudentHeatmap = require("../models/StudentHeatmap");
const StudentInsight = require("../models/StudentInsight");
const StudentBadge = require("../models/StudentBadge");
const BadgeDefinition = require("../models/StudentBadge").BadgeDefinition;
const DailyActivity = require("../models/StudentActivity");
const Leaderboard = require("../models/Leaderboard");
const User = require("../models/loginUserModel");
const Page = require("../models/pageModel");
const Chapter = require("../models/chapterModel");
const StandardSubject = require("../models/standardSubjectSchema");
const mongoose = require("mongoose");

// ==============================================
// CONSTANTS & CONFIGURATION
// ==============================================

const PROGRESS_THRESHOLDS = {
  PAGE_COMPLETE_VIDEO: 80, // Video watch ≥ 80%
  PAGE_COMPLETE_QUIZ: 60, // Page quiz score ≥ 60%
  CHAPTER_COMPLETE_QUIZ: 60, // Chapter quiz ≥ 60%
  SUBJECT_COMPLETE_QUIZ: 70, // Subject quiz ≥ 70%
  SUBJECT_COMPLETE_ACCURACY: 65, // Overall subject accuracy ≥ 65%
  STANDARD_COMPLETE_ACCURACY: 65, // Overall standard accuracy ≥ 65%
};

const WEIGHTS = {
  STANDARD_SCORE: {
    SUBJECT_COMPLETION: 0.5, // 50%
    OVERALL_ACCURACY: 0.3, // 30%
    CONSISTENCY: 0.2, // 20%
  },
  PERFORMANCE_INDEX: {
    PAGE_PROGRESS: 0.2, // 20%
    CHAPTER_PROGRESS: 0.3, // 30%
    SUBJECT_PROGRESS: 0.3, // 30%
    STANDARD_SCORE: 0.2, // 20%
  },
  LEADERBOARD: {
    PAGE_COMPLETED: 10,
    QUIZ_PASSED: 20,
    STREAK_DAY: 5,
    WATCH_MINUTE: 1,
  },
};

const ACTIVITY_SCORING = {
  PAGE_VISIT: 5,
  QUIZ_ATTEMPT: 10,
  WATCH_MINUTE: 2,
};

const HEATMAP_COLORS = {
  0: "#ffffff", // White - No activity
  1: "#90EE90", // Light Green - Low activity (1-25%)
  2: "#32CD32", // Medium Green - Medium activity (26-50%)
  3: "#228B22", // Dark Green - High activity (51-75%)
  4: "#006400", // Very Dark Green - Very high activity (76-100%)
};

// ==============================================
// CORE PROGRESS CALCULATION FUNCTIONS
// ==============================================

/**
 * 1️⃣ PAGE BASED PROGRESS - Content Coverage Layer
 * Tracks individual page completion with video and quiz criteria
 */
exports.calculatePageProgress = async (userId, pageId) => {
  try {
    const page = await Page.findById(pageId)
      .populate("chapterId")
      .populate("subjectId");

    if (!page) {
      return { error: "Page not found" };
    }

    // Get video progress
    const videoProgress = await UserProgress.findOne({
      userId,
      pageId,
    });

    // Get quiz attempts for this page
    const quizAttempts = await QuizAttempt.find({
      userId,
      pageId,
      status: "completed",
    }).sort("-score");

    const bestQuizScore = quizAttempts.length > 0 ? quizAttempts[0].score : 0;
    const latestQuizAttempt = quizAttempts[0];
    const totalAttempts = quizAttempts.length;

    // Calculate video completion status
    const videoCompletionPercentage = videoProgress?.completionPercentage || 0;
    const isVideoCompleted =
      videoCompletionPercentage >= PROGRESS_THRESHOLDS.PAGE_COMPLETE_VIDEO;

    // Calculate quiz completion status
    const isQuizCompleted =
      bestQuizScore >= PROGRESS_THRESHOLDS.PAGE_COMPLETE_QUIZ;

    // Page is complete ONLY if both conditions are met
    const isPageComplete = isVideoCompleted && isQuizCompleted;

    // Calculate page progress percentage (weighted: 50% video, 50% quiz)
    const videoContribution = videoCompletionPercentage * 0.5;
    const quizContribution = bestQuizScore * 0.5;
    const pageProgressPercentage = Math.min(
      100,
      videoContribution + quizContribution,
    );

    // Get watch time details
    const watchTime = await WatchTime.findOne({
      userId,
      pageId,
      videoId: page.videoId,
    });

    return {
      pageId: page._id,
      pageName: page.title,
      chapterId: page.chapterId?._id,
      chapterName: page.chapterId?.name,
      subjectId: page.subjectId?._id,
      subjectName: page.subjectId?.name,

      // Video metrics
      videoProgress: {
        completionPercentage: videoCompletionPercentage,
        isCompleted: isVideoCompleted,
        lastPosition: videoProgress?.lastPosition || 0,
        totalWatched: videoProgress?.totalWatched || 0,
        uniqueWatchedSeconds: watchTime?.uniqueWatchedSeconds || 0,
        totalWatchedSeconds: watchTime?.totalWatchedSeconds || 0,
        lastWatchedAt: watchTime?.lastWatchedAt,
      },

      // Quiz metrics
      quizProgress: {
        bestScore: bestQuizScore,
        latestScore: latestQuizAttempt?.score || 0,
        isCompleted: isQuizCompleted,
        totalAttempts,
        lastAttemptedAt: latestQuizAttempt?.createdAt,
        timeSpent: quizAttempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0),
        averageScore:
          totalAttempts > 0
            ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
            : 0,
      },

      // Overall page status
      isComplete: isPageComplete,
      progressPercentage: pageProgressPercentage,
      status: isPageComplete
        ? "completed"
        : videoProgress
          ? "in-progress"
          : "not-started",

      // Metadata
      lastActivity:
        videoProgress?.lastWatchedAt || latestQuizAttempt?.createdAt,
      timeSpent:
        (videoProgress?.totalTimeSpent || 0) +
        quizAttempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / 60,
    };
  } catch (error) {
    console.error("Error calculating page progress:", error);
    return { error: error.message };
  }
};

/**
 * 2️⃣ CHAPTER BASED PROGRESS - Concept Understanding Layer
 * Calculates chapter completion based on all pages and chapter quiz
 */
exports.calculateChapterProgress = async (userId, chapterId) => {
  try {
    const chapter = await Chapter.findById(chapterId)
      .populate("pages")
      .populate("subjectId");

    if (!chapter) {
      return { error: "Chapter not found" };
    }

    const pages = chapter.pages || [];

    // Get progress for all pages in this chapter
    const pageProgresses = await Promise.all(
      pages.map((page) => exports.calculatePageProgress(userId, page._id)),
    );

    // Filter out errors
    const validPageProgresses = pageProgresses.filter((p) => !p.error);

    // Calculate page completion metrics
    const totalPages = validPageProgresses.length;
    const completedPages = validPageProgresses.filter(
      (p) => p.isComplete,
    ).length;
    const pageCompletionPercentage =
      totalPages > 0 ? (completedPages / totalPages) * 100 : 0;

    // Get chapter quiz attempts
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

    // Chapter is complete ONLY if all pages completed AND chapter quiz passed
    const isChapterComplete =
      completedPages === totalPages && isChapterQuizPassed && totalPages > 0;

    // Calculate average accuracy across all page quizzes in this chapter
    let totalQuizScore = 0;
    let totalQuizAttempts = 0;

    validPageProgresses.forEach((page) => {
      if (page.quizProgress?.bestScore) {
        totalQuizScore += page.quizProgress.bestScore;
        totalQuizAttempts++;
      }
    });

    const averagePageQuizScore =
      totalQuizAttempts > 0 ? totalQuizScore / totalQuizAttempts : 0;

    // Identify weak pages (pages with low quiz scores)
    const weakPages = validPageProgresses
      .filter((p) => p.quizProgress?.bestScore < 50)
      .map((p) => ({
        pageId: p.pageId,
        pageName: p.pageName,
        score: p.quizProgress?.bestScore,
      }));

    return {
      chapterId: chapter._id,
      chapterName: chapter.name,
      subjectId: chapter.subjectId?._id,
      subjectName: chapter.subjectId?.name,

      // Page metrics
      pages: validPageProgresses.map((p) => ({
        pageId: p.pageId,
        pageName: p.pageName,
        isComplete: p.isComplete,
        progressPercentage: p.progressPercentage,
        quizScore: p.quizProgress?.bestScore,
        status: p.status,
      })),
      pageStats: {
        total: totalPages,
        completed: completedPages,
        inProgress: validPageProgresses.filter(
          (p) => p.status === "in-progress",
        ).length,
        notStarted: validPageProgresses.filter(
          (p) => p.status === "not-started",
        ).length,
        completionPercentage: pageCompletionPercentage,
      },

      // Chapter quiz metrics
      chapterQuiz: {
        bestScore: bestChapterQuizScore,
        isPassed: isChapterQuizPassed,
        totalAttempts: chapterQuizAttempts.length,
        lastAttemptedAt: chapterQuizAttempts[0]?.createdAt,
      },

      // Overall chapter status
      isComplete: isChapterComplete,
      averagePageQuizScore,
      weakPages,

      // Concept understanding score (weighted: 70% page completion, 30% chapter quiz)
      conceptUnderstandingScore:
        totalPages > 0
          ? pageCompletionPercentage * 0.7 + bestChapterQuizScore * 0.3
          : 0,

      // Metadata
      lastActivity: validPageProgresses
        .map((p) => p.lastActivity)
        .filter((d) => d)
        .sort((a, b) => b - a)[0],
    };
  } catch (error) {
    console.error("Error calculating chapter progress:", error);
    return { error: error.message };
  }
};

/**
 * 3️⃣ SUBJECT BASED PROGRESS - Subject Mastery Layer
 * Calculates subject completion based on chapters and subject quiz
 */
exports.calculateSubjectProgress = async (userId, subjectId) => {
  try {
    const subject = await StandardSubject.findById(subjectId).populate({
      path: "chapters",
      populate: { path: "pages" },
    });

    if (!subject) {
      return { error: "Subject not found" };
    }

    const chapters = subject.chapters || [];

    // Get progress for all chapters in this subject
    const chapterProgresses = await Promise.all(
      chapters.map((chapter) =>
        exports.calculateChapterProgress(userId, chapter._id),
      ),
    );

    // Filter out errors
    const validChapterProgresses = chapterProgresses.filter((c) => !c.error);

    // Calculate chapter completion metrics
    const totalChapters = validChapterProgresses.length;
    const completedChapters = validChapterProgresses.filter(
      (c) => c.isComplete,
    ).length;
    const chapterCompletionPercentage =
      totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    // Get subject quiz attempts
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

    // Calculate overall accuracy across all quizzes in this subject
    let totalAccuracy = 0;
    let quizCount = 0;

    // Collect all quiz attempts in this subject
    for (const chapter of validChapterProgresses) {
      for (const page of chapter.pages || []) {
        if (page.quizScore) {
          totalAccuracy += page.quizScore;
          quizCount++;
        }
      }
      if (chapter.chapterQuiz?.bestScore) {
        totalAccuracy += chapter.chapterQuiz.bestScore;
        quizCount++;
      }
    }

    if (bestSubjectQuizScore) {
      totalAccuracy += bestSubjectQuizScore;
      quizCount++;
    }

    const overallAccuracy = quizCount > 0 ? totalAccuracy / quizCount : 0;
    const isAccuracyMet =
      overallAccuracy >= PROGRESS_THRESHOLDS.SUBJECT_COMPLETE_ACCURACY;

    // Subject is complete ONLY if all chapters completed AND subject quiz passed AND accuracy met
    const isSubjectComplete =
      completedChapters === totalChapters &&
      isSubjectQuizPassed &&
      isAccuracyMet &&
      totalChapters > 0;

    // Calculate total pages in subject
    const totalPages = validChapterProgresses.reduce(
      (sum, chapter) => sum + (chapter.pageStats?.total || 0),
      0,
    );

    const completedPages = validChapterProgresses.reduce(
      (sum, chapter) => sum + (chapter.pageStats?.completed || 0),
      0,
    );

    // Identify weak chapters (chapters with low concept understanding)
    const weakChapters = validChapterProgresses
      .filter((c) => c.conceptUnderstandingScore < 50)
      .map((c) => ({
        chapterId: c.chapterId,
        chapterName: c.chapterName,
        score: c.conceptUnderstandingScore,
        weakPages: c.weakPages,
      }));

    return {
      subjectId: subject._id,
      subjectName: subject.name,
      standardId: subject.standardId,

      // Chapter metrics
      chapters: validChapterProgresses.map((c) => ({
        chapterId: c.chapterId,
        chapterName: c.chapterName,
        isComplete: c.isComplete,
        completionPercentage: c.pageStats?.completionPercentage || 0,
        conceptScore: c.conceptUnderstandingScore,
        pagesCompleted: c.pageStats?.completed,
        totalPages: c.pageStats?.total,
      })),
      chapterStats: {
        total: totalChapters,
        completed: completedChapters,
        completionPercentage: chapterCompletionPercentage,
      },

      // Page metrics
      pageStats: {
        total: totalPages,
        completed: completedPages,
        completionPercentage:
          totalPages > 0 ? (completedPages / totalPages) * 100 : 0,
      },

      // Quiz metrics
      subjectQuiz: {
        bestScore: bestSubjectQuizScore,
        isPassed: isSubjectQuizPassed,
        totalAttempts: subjectQuizAttempts.length,
        lastAttemptedAt: subjectQuizAttempts[0]?.createdAt,
      },
      overallAccuracy,

      // Subject mastery score (weighted: 40% chapters, 30% accuracy, 30% subject quiz)
      masteryScore:
        totalChapters > 0
          ? chapterCompletionPercentage * 0.4 +
            overallAccuracy * 0.3 +
            bestSubjectQuizScore * 0.3
          : 0,

      // Overall subject status
      isComplete: isSubjectComplete,
      weakChapters,

      // Metadata
      lastActivity: validChapterProgresses
        .map((c) => c.lastActivity)
        .filter((d) => d)
        .sort((a, b) => b - a)[0],
    };
  } catch (error) {
    console.error("Error calculating subject progress:", error);
    return { error: error.message };
  }
};

/**
 * 4️⃣ STANDARD BASED PROGRESS - Academic Performance Layer
 * Calculates overall standard performance
 */
exports.calculateStandardProgress = async (userId, standardId) => {
  try {
    // Get all subjects under this standard
    const subjects = await StandardSubject.find({ standardId });

    // Get progress for all subjects
    const subjectProgresses = await Promise.all(
      subjects.map((subject) =>
        exports.calculateSubjectProgress(userId, subject._id),
      ),
    );

    const validSubjectProgresses = subjectProgresses.filter((s) => !s.error);

    // Calculate subject completion metrics
    const totalSubjects = validSubjectProgresses.length;
    const completedSubjects = validSubjectProgresses.filter(
      (s) => s.isComplete,
    ).length;
    const subjectCompletionPercentage =
      totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;

    // Calculate overall accuracy across all subjects
    const overallAccuracy =
      validSubjectProgresses.length > 0
        ? validSubjectProgresses.reduce(
            (sum, s) => sum + (s.overallAccuracy || 0),
            0,
          ) / validSubjectProgresses.length
        : 0;

    // Get consistency score from streak and heatmap
    const streak = await StudentStreak.findOne({ studentId: userId });
    const consistency = await exports.calculateConsistencyScore(userId);

    // Calculate Standard Score using weighted formula
    const standardScore =
      subjectCompletionPercentage * WEIGHTS.STANDARD_SCORE.SUBJECT_COMPLETION +
      overallAccuracy * WEIGHTS.STANDARD_SCORE.OVERALL_ACCURACY +
      consistency * WEIGHTS.STANDARD_SCORE.CONSISTENCY;

    // Check if standard is complete
    const isStandardComplete =
      completedSubjects === totalSubjects &&
      overallAccuracy >= PROGRESS_THRESHOLDS.STANDARD_COMPLETE_ACCURACY &&
      consistency >= 60 &&
      totalSubjects > 0;

    return {
      standardId,
      subjects: validSubjectProgresses.map((s) => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        isComplete: s.isComplete,
        masteryScore: s.masteryScore,
        accuracy: s.overallAccuracy,
        chaptersCompleted: s.chapterStats?.completed,
        totalChapters: s.chapterStats?.total,
      })),
      subjectStats: {
        total: totalSubjects,
        completed: completedSubjects,
        completionPercentage: subjectCompletionPercentage,
      },
      overallAccuracy,
      consistency,
      standardScore,
      isComplete: isStandardComplete,
      performanceLevel: exports.getPerformanceLevel(standardScore),
      recommendations: await exports.generateRecommendations(
        userId,
        validSubjectProgresses,
      ),
    };
  } catch (error) {
    console.error("Error calculating standard progress:", error);
    return { error: error.message };
  }
};

/**
 * 5️⃣ CONSISTENCY SCORE CALCULATION
 * Calculates consistency based on streak and heatmap
 */
exports.calculateConsistencyScore = async (userId) => {
  try {
    // Get streak data
    const streak = await StudentStreak.findOne({ studentId: userId });

    // Get heatmap data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivities = await DailyActivity.find({
      userId,
      date: { $gte: thirtyDaysAgo.toISOString().split("T")[0] },
    });

    // Calculate active days in last 30 days
    const activeDays = dailyActivities.filter(
      (d) => d.isValidLearningDay,
    ).length;
    const activityRatio = (activeDays / 30) * 100;

    // Streak contribution (max 40%)
    const streakScore = streak ? Math.min(40, streak.currentStreak * 2) : 0;

    // Activity consistency (max 60%)
    const activityScore = Math.min(60, activityRatio * 0.6);

    return Math.min(100, streakScore + activityScore);
  } catch (error) {
    console.error("Error calculating consistency:", error);
    return 0;
  }
};

/**
 * 6️⃣ FINAL PERFORMANCE INDEX (API)
 * Complete picture of student performance
 */
exports.calculatePerformanceIndex = async (userId, standardId) => {
  try {
    // Get all required progress data
    const standardProgress = await exports.calculateStandardProgress(
      userId,
      standardId,
    );

    // Calculate average page progress
    let totalPageProgress = 0;
    let pageCount = 0;

    for (const subject of standardProgress.subjects || []) {
      const subjectProgress = await exports.calculateSubjectProgress(
        userId,
        subject.subjectId,
      );

      for (const chapter of subjectProgress.chapters || []) {
        for (const page of chapter.pages || []) {
          totalPageProgress += page.progressPercentage || 0;
          pageCount++;
        }
      }
    }

    const avgPageProgress = pageCount > 0 ? totalPageProgress / pageCount : 0;

    // Calculate average chapter progress
    let totalChapterProgress = 0;
    let chapterCount = 0;

    for (const subject of standardProgress.subjects || []) {
      const subjectProgress = await exports.calculateSubjectProgress(
        userId,
        subject.subjectId,
      );

      for (const chapter of subjectProgress.chapters || []) {
        totalChapterProgress += chapter.completionPercentage || 0;
        chapterCount++;
      }
    }

    const avgChapterProgress =
      chapterCount > 0 ? totalChapterProgress / chapterCount : 0;

    // Calculate API using weighted formula
    const api =
      avgPageProgress * WEIGHTS.PERFORMANCE_INDEX.PAGE_PROGRESS +
      avgChapterProgress * WEIGHTS.PERFORMANCE_INDEX.CHAPTER_PROGRESS +
      standardProgress.subjectStats?.completionPercentage *
        WEIGHTS.PERFORMANCE_INDEX.SUBJECT_PROGRESS +
      standardProgress.standardScore * WEIGHTS.PERFORMANCE_INDEX.STANDARD_SCORE;

    return {
      userId,
      standardId,
      api: Math.round(api * 100) / 100,
      components: {
        pageProgress: avgPageProgress,
        chapterProgress: avgChapterProgress,
        subjectProgress: standardProgress.subjectStats?.completionPercentage,
        standardScore: standardProgress.standardScore,
      },
      performanceLevel: exports.getPerformanceLevel(api),
      lastCalculated: new Date(),
    };
  } catch (error) {
    console.error("Error calculating performance index:", error);
    return { error: error.message };
  }
};

/**
 * 7️⃣ PERFORMANCE LEVEL DETERMINATION
 */
exports.getPerformanceLevel = (score) => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "average";
  if (score >= 40) return "below-average";
  return "needs-improvement";
};

/**
 * 8️⃣ INTELLIGENT RECOMMENDATION GENERATOR
 */
exports.generateRecommendations = async (userId, subjectProgresses) => {
  const recommendations = [];

  for (const subject of subjectProgresses) {
    // Check for weak chapters
    if (subject.weakChapters && subject.weakChapters.length > 0) {
      recommendations.push({
        type: "weak_chapter",
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        message: `Focus on improving ${subject.weakChapters.length} weak chapter(s) in ${subject.subjectName}`,
        priority: "high",
        chapters: subject.weakChapters.map((c) => c.chapterName),
      });
    }

    // Check for low accuracy
    if (subject.overallAccuracy < 50) {
      recommendations.push({
        type: "low_accuracy",
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        message: `Practice more quizzes in ${subject.subjectName} to improve accuracy`,
        priority: "high",
      });
    }

    // Check for incomplete chapters with high potential
    const incompleteChapters = subject.chapters?.filter(
      (c) => !c.isComplete && c.completionPercentage > 50,
    );
    if (incompleteChapters && incompleteChapters.length > 0) {
      recommendations.push({
        type: "near_completion",
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        message: `Complete ${incompleteChapters.length} chapter(s) in ${subject.subjectName} that are near completion`,
        priority: "medium",
        chapters: incompleteChapters.map((c) => c.chapterName),
      });
    }
  }

  return recommendations;
};

/**
 * 9️⃣ DAILY HEATMAP UPDATE
 */
exports.updateStudentHeatmap = async (userId, activityData) => {
  try {
    const { date, type, subjectId, timeSpent, pagesVisited, quizzesAttempted } =
      activityData;

    // Calculate daily activity score
    const activityScore =
      pagesVisited * ACTIVITY_SCORING.PAGE_VISIT +
      quizzesAttempted * ACTIVITY_SCORING.QUIZ_ATTEMPT +
      Math.floor(timeSpent / 60) * ACTIVITY_SCORING.WATCH_MINUTE;

    // Determine intensity level (0-4)
    let intensity = 0;
    if (activityScore > 0) {
      if (activityScore <= 25) intensity = 1;
      else if (activityScore <= 50) intensity = 2;
      else if (activityScore <= 100) intensity = 3;
      else intensity = 4;
    }

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

      // Initialize all days of the month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        heatmap.data.push({
          day: d,
          intensity: 0,
          activities: [],
          subjects: [],
          note: "",
          activityScore: 0,
        });
      }
    }

    const day = currentDate.getDate();
    const dayData = heatmap.data.find((d) => d.day === day);

    if (dayData) {
      dayData.intensity = Math.max(dayData.intensity, intensity);
      dayData.activityScore = activityScore;

      if (!dayData.activities.includes(type)) {
        dayData.activities.push(type);
      }

      if (subjectId && !dayData.subjects.includes(subjectId.toString())) {
        dayData.subjects.push(subjectId.toString());
      }

      // Update color based on intensity
      dayData.color = HEATMAP_COLORS[intensity] || HEATMAP_COLORS[0];
    }

    // Update summary
    heatmap.summary.totalInteractions += 1;
    heatmap.summary.maxIntensity = Math.max(
      heatmap.summary.maxIntensity,
      intensity,
    );
    heatmap.summary.totalActiveDays = heatmap.data.filter(
      (d) => d.intensity > 0,
    ).length;

    if (subjectId) {
      const subjectKey = subjectId.toString();
      if (!heatmap.summary.subjectBreakdown[subjectKey]) {
        heatmap.summary.subjectBreakdown[subjectKey] = {
          count: 0,
          totalIntensity: 0,
        };
      }
      heatmap.summary.subjectBreakdown[subjectKey].count += 1;
      heatmap.summary.subjectBreakdown[subjectKey].totalIntensity += intensity;
    }

    await heatmap.save();
    return heatmap;
  } catch (error) {
    console.error("Heatmap update failed:", error);
  }
};

/**
 * 🔟 ADVANCED STUDENT INSIGHT GENERATION
 */
exports.generateStudentInsights = async (userId) => {
  try {
    let insights = await StudentInsight.findOne({ userId });

    if (!insights) {
      insights = new StudentInsight({
        userId,
        learningPatterns: {},
        recentActivity: [],
        weeklySummary: {},
        recommendations: [],
        lastUpdated: new Date(),
      });
    }

    // Get all subjects
    const subjects = await StandardSubject.find({});

    // Analyze each subject
    const subjectAnalyses = await Promise.all(
      subjects.map(async (subject) => {
        const progress = await exports.calculateSubjectProgress(
          userId,
          subject._id,
        );

        return {
          subjectId: subject._id,
          subjectName: subject.name,
          masteryScore: progress.masteryScore || 0,
          accuracy: progress.overallAccuracy || 0,
          weakChapters: progress.weakChapters || [],
          isComplete: progress.isComplete || false,
        };
      }),
    );

    // Identify weak subjects
    const weakSubjects = subjectAnalyses.filter((s) => s.masteryScore < 50);

    // Identify strong subjects
    const strongSubjects = subjectAnalyses.filter((s) => s.masteryScore >= 75);

    // Get quiz attempt patterns
    const quizAttempts = await QuizAttempt.find({ userId })
      .sort("-createdAt")
      .limit(50);

    // Analyze quiz patterns
    let repeatedFailures = [];
    let improvementPatterns = [];

    if (quizAttempts.length > 0) {
      // Group by quiz
      const quizGroups = {};
      quizAttempts.forEach((attempt) => {
        const key = attempt.quizId.toString();
        if (!quizGroups[key]) {
          quizGroups[key] = [];
        }
        quizGroups[key].push(attempt);
      });

      // Check for repeated failures (same quiz failed 3+ times)
      Object.values(quizGroups).forEach((attempts) => {
        if (attempts.length >= 3) {
          const allFailed = attempts.every((a) => a.score < 50);
          if (allFailed) {
            repeatedFailures.push({
              quizId: attempts[0].quizId,
              quizType: attempts[0].quizType,
              attempts: attempts.length,
              latestScore: attempts[0].score,
            });
          }
        }
      });

      // Check for improvement patterns
      Object.values(quizGroups).forEach((attempts) => {
        if (attempts.length >= 2) {
          const firstScore = attempts[attempts.length - 1].score;
          const lastScore = attempts[0].score;
          const improvement = lastScore - firstScore;

          if (improvement > 20) {
            improvementPatterns.push({
              quizId: attempts[0].quizId,
              improvement,
              fromScore: firstScore,
              toScore: lastScore,
            });
          }
        }
      });
    }

    // Get watch time patterns
    const watchTimes = await WatchTime.find({ userId })
      .sort("-lastWatchedAt")
      .limit(100);

    // Analyze engagement patterns
    let lowEngagementVideos = [];
    let highEngagementVideos = [];

    watchTimes.forEach((wt) => {
      if (wt.totalWatchedSeconds && wt.videoDuration) {
        const watchRatio = wt.totalWatchedSeconds / wt.videoDuration;

        if (watchRatio < 0.3) {
          lowEngagementVideos.push({
            videoId: wt.videoId,
            watchRatio,
            progress: wt.progress,
          });
        } else if (watchRatio > 0.8 && wt.progress < 40) {
          // Surface learning: high watch time but low quiz score
          highEngagementVideos.push({
            videoId: wt.videoId,
            watchRatio,
            progress: wt.progress,
          });
        }
      }
    });

    // Get streak data
    const streak = await StudentStreak.findOne({ studentId: userId });

    // Generate insights based on patterns
    const newInsights = [];

    // Weak subject insight
    if (weakSubjects.length > 0) {
      newInsights.push({
        type: "weak_subject",
        message: `${weakSubjects.map((s) => s.subjectName).join(", ")} need${weakSubjects.length === 1 ? "s" : ""} improvement`,
        subjects: weakSubjects.map((s) => s.subjectId),
        priority: "high",
        generatedAt: new Date(),
      });
    }

    // Strong subject insight
    if (strongSubjects.length > 0) {
      newInsights.push({
        type: "strong_subject",
        message: `You're excelling in ${strongSubjects.map((s) => s.subjectName).join(", ")}`,
        subjects: strongSubjects.map((s) => s.subjectId),
        priority: "low",
        generatedAt: new Date(),
      });
    }

    // Repeated failure insight
    if (repeatedFailures.length > 0) {
      newInsights.push({
        type: "repeated_failure",
        message: `You've attempted ${repeatedFailures.length} quiz(zes) multiple times without passing. Consider reviewing these topics.`,
        details: repeatedFailures,
        priority: "high",
        generatedAt: new Date(),
      });
    }

    // Improvement insight
    if (improvementPatterns.length > 0) {
      newInsights.push({
        type: "improvement",
        message: `Great progress! You've shown significant improvement in ${improvementPatterns.length} quiz(zes)`,
        details: improvementPatterns,
        priority: "medium",
        generatedAt: new Date(),
      });
    }

    // Low engagement insight
    if (lowEngagementVideos.length > 5) {
      newInsights.push({
        type: "low_engagement",
        message:
          "Your video watch time is low. Try to focus more on video content.",
        priority: "medium",
        generatedAt: new Date(),
      });
    }

    // Surface learning insight
    if (highEngagementVideos.length > 3) {
      newInsights.push({
        type: "surface_learning",
        message:
          "You're watching videos but not performing well in quizzes. Try to understand concepts deeply.",
        priority: "high",
        generatedAt: new Date(),
      });
    }

    // Consistency insight
    if (streak) {
      if (streak.currentStreak >= 7) {
        newInsights.push({
          type: "consistency",
          message: `Amazing! You've maintained a ${streak.currentStreak}-day learning streak!`,
          priority: "low",
          generatedAt: new Date(),
        });
      } else if (streak.currentStreak === 0 && streak.streakFreeze?.isActive) {
        newInsights.push({
          type: "streak_freeze",
          message:
            "You missed a day but your streak is protected. Don't break the chain!",
          priority: "medium",
          generatedAt: new Date(),
        });
      }
    }

    // Update insights document
    insights.learningPatterns = {
      ...insights.learningPatterns,
      weakSubjects: weakSubjects.map((s) => s.subjectId),
      strongSubjects: strongSubjects.map((s) => s.subjectId),
      repeatedFailures,
      improvementPatterns,
      lowEngagementVideos: lowEngagementVideos.length,
      surfaceLearning: highEngagementVideos.length > 3,
      lastAnalyzed: new Date(),
    };

    insights.recommendations = newInsights;
    insights.lastUpdated = new Date();

    await insights.save();
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    return { error: error.message };
  }
};

/**
 * 1️⃣1️⃣ LEADERBOARD UPDATE
 */
exports.updateLeaderboard = async (standardId) => {
  try {
    // Get all students in this standard
    const students = await User.find({
      standard: standardId,
      role: "student",
      isActive: true,
    }).select("_id name");

    const leaderboardEntries = [];

    for (const student of students) {
      // Calculate performance index
      const performance = await exports.calculatePerformanceIndex(
        student._id,
        standardId,
      );

      // Get streak
      const streak = await StudentStreak.findOne({ studentId: student._id });

      // Get watch time
      const watchTimeAgg = await WatchTime.aggregate([
        { $match: { userId: student._id } },
        { $group: { _id: null, total: { $sum: "$totalWatchedSeconds" } } },
      ]);

      const totalWatchMinutes = Math.floor((watchTimeAgg[0]?.total || 0) / 60);

      // Get completed pages
      const completedPages = await UserProgress.countDocuments({
        userId: student._id,
        isCompleted: true,
      });

      // Get passed quizzes
      const passedQuizzes = await QuizAttempt.countDocuments({
        userId: student._id,
        score: { $gte: 60 },
        status: "completed",
      });

      // Calculate leaderboard score
      const leaderboardScore =
        completedPages * WEIGHTS.LEADERBOARD.PAGE_COMPLETED +
        passedQuizzes * WEIGHTS.LEADERBOARD.QUIZ_PASSED +
        (streak?.currentStreak || 0) * WEIGHTS.LEADERBOARD.STREAK_DAY +
        totalWatchMinutes * WEIGHTS.LEADERBOARD.WATCH_MINUTE;

      leaderboardEntries.push({
        userId: student._id,
        name: student.name,
        score: leaderboardScore,
        performanceIndex: performance.api || 0,
        streak: streak?.currentStreak || 0,
        pagesCompleted: completedPages,
        quizzesPassed: passedQuizzes,
        watchMinutes: totalWatchMinutes,
        lastActive: streak?.lastActiveDate,
      });
    }

    // Sort by score descending
    leaderboardEntries.sort((a, b) => b.score - a.score);

    // Assign ranks and calculate percentiles
    const totalStudents = leaderboardEntries.length;

    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
      entry.percentile =
        totalStudents > 0
          ? ((totalStudents - index) / totalStudents) * 100
          : 100;
    });

    // Save to leaderboard collection
    await Leaderboard.findOneAndUpdate(
      { standardId, date: new Date().toISOString().split("T")[0] },
      {
        standardId,
        entries: leaderboardEntries,
        totalStudents,
        updatedAt: new Date(),
      },
      { upsert: true },
    );

    return leaderboardEntries;
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return { error: error.message };
  }
};

/**
 * 1️⃣2️⃣ COMPLETE STUDENT DASHBOARD DATA
 */
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const standardId = req.user.standard;

    // Get all progress data in parallel
    const [
      standardProgress,
      performanceIndex,
      streak,
      insights,
      heatmap,
      recentActivity,
      leaderboard,
      badges,
    ] = await Promise.all([
      exports.calculateStandardProgress(userId, standardId),
      exports.calculatePerformanceIndex(userId, standardId),
      StudentStreak.findOne({ studentId: userId }),
      StudentInsight.findOne({ userId }),
      StudentHeatmap.find({ userId }).sort("-year -month").limit(3),
      DailyActivity.find({ userId }).sort("-date").limit(7),
      Leaderboard.findOne({
        standardId,
        date: new Date().toISOString().split("T")[0],
      }),
      StudentBadge.find({ userId })
        .populate("badgeId")
        .sort("-earnedAt")
        .limit(10),
    ]);

    // Get today's activity
    const today = new Date().toISOString().split("T")[0];
    const todayActivity = await DailyActivity.findOne({ userId, date: today });

    // Calculate today's stats
    const todayStats = todayActivity
      ? {
          watchTime: todayActivity.metrics?.totalWatchTime || 0,
          pagesVisited: todayActivity.metrics?.pagesVisited || 0,
          quizzesTaken: todayActivity.metrics?.quizzesTaken || 0,
          interactions: todayActivity.metrics?.interactions || 0,
          isValidDay: todayActivity.isValidLearningDay || false,
        }
      : {
          watchTime: 0,
          pagesVisited: 0,
          quizzesTaken: 0,
          interactions: 0,
          isValidDay: false,
        };

    // Get user's rank from leaderboard
    const userRank = leaderboard?.entries?.find(
      (e) => e.userId.toString() === userId.toString(),
    );

    return res.status(200).json({
      success: true,
      data: {
        // Core progress
        standardProgress: standardProgress.error ? null : standardProgress,
        performanceIndex: performanceIndex.error ? null : performanceIndex,

        // Today's activity
        today: todayStats,

        // Streak information
        streak: streak
          ? {
              current: streak.currentStreak,
              longest: streak.longestStreak,
              lastActive: streak.lastActiveDate,
              freezeActive: streak.streakFreeze?.isActive || false,
              freezeCount: streak.streakFreeze?.freezeCount || 0,
              milestones: streak.milestones || [],
            }
          : null,

        // Insights and recommendations
        insights: insights?.recommendations || [],

        // Heatmap data
        heatmap: heatmap.map((h) => ({
          month: h.month,
          year: h.year,
          data: h.data.map((d) => ({
            day: d.day,
            intensity: d.intensity,
            color: d.color,
            activities: d.activities,
          })),
          summary: h.summary,
        })),

        // Recent activity
        recentActivity: recentActivity.map((a) => ({
          date: a.date,
          type: a.activities?.[0]?.type,
          watchTime: a.metrics?.totalWatchTime,
          pagesVisited: a.metrics?.pagesVisited,
          quizzesTaken: a.metrics?.quizzesTaken,
        })),

        // Leaderboard position
        leaderboard: userRank
          ? {
              rank: userRank.rank,
              score: userRank.score,
              percentile: userRank.percentile,
              totalStudents: leaderboard.totalStudents,
            }
          : null,

        // Recent badges
        badges: badges.map((b) => ({
          id: b.badgeId?._id,
          name: b.badgeId?.name,
          description: b.badgeId?.description,
          icon: b.badgeId?.icon,
          category: b.badgeId?.category,
          earnedAt: b.earnedAt,
        })),

        // Weekly summary
        weeklySummary: insights?.weeklySummary || null,

        // Learning patterns
        learningPatterns: insights?.learningPatterns || null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
    });
  }
};

/**
 * 1️⃣3️⃣ MIDNIGHT AUTOMATION TASK
 * Run this at midnight every day
 */
exports.runMidnightAutomation = async () => {
  try {
    console.log("🚀 Starting midnight automation tasks...");

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Get all active students
    const students = await User.find({
      role: "student",
      isActive: true,
    }).select("_id standard");

    for (const student of students) {
      try {
        // 1. Update streak
        const yesterdayActivity = await DailyActivity.findOne({
          userId: student._id,
          date: yesterdayStr,
          isValidLearningDay: true,
        });

        await exports.checkAndUpdateStreak(student._id, {
          date: yesterdayStr,
          wasActive: !!yesterdayActivity,
        });

        // 2. Generate insights
        await exports.generateStudentInsights(student._id);

        // 3. Update heatmap (already updated in real-time, but ensure consistency)
        // 4. Check badge conditions
        await exports.checkAllBadgeConditions(student._id);

        console.log(`✅ Automation completed for student ${student._id}`);
      } catch (studentError) {
        console.error(
          `❌ Error processing student ${student._id}:`,
          studentError,
        );
      }
    }

    // 5. Update leaderboards for each standard
    const standards = [
      ...new Set(students.map((s) => s.standard?.toString()).filter(Boolean)),
    ];

    for (const standardId of standards) {
      await exports.updateLeaderboard(standardId);
    }

    // 6. Generate weekly reports (if today is Sunday)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0) {
      // Sunday
      await exports.generateWeeklyReports();
    }

    console.log("✅ Midnight automation completed successfully");
  } catch (error) {
    console.error("❌ Midnight automation failed:", error);
  }
};

/**
 * 1️⃣4️⃣ CHECK ALL BADGE CONDITIONS
 */
exports.checkAllBadgeConditions = async (userId) => {
  try {
    const badges = await BadgeDefinition.find({ isActive: true });
    const streak = await StudentStreak.findOne({ studentId: userId });
    const performance = await exports.calculatePerformanceIndex(
      userId,
      userId.standard,
    );

    for (const badge of badges) {
      const alreadyEarned = await StudentBadge.findOne({
        userId,
        badgeId: badge._id,
      });
      if (alreadyEarned) continue;

      let earned = false;
      let progress = 0;

      switch (badge.criteria.type) {
        case "streak_milestone":
          if (streak && streak.currentStreak >= badge.criteria.threshold) {
            earned = true;
            progress = 100;
          } else if (streak) {
            progress = (streak.currentStreak / badge.criteria.threshold) * 100;
          }
          break;

        case "subject_mastery":
          const subjectProgress = await exports.calculateSubjectProgress(
            userId,
            badge.criteria.subjectId,
          );
          if (subjectProgress.masteryScore >= badge.criteria.threshold) {
            earned = true;
            progress = 100;
          } else {
            progress = subjectProgress.masteryScore;
          }
          break;

        case "accuracy_achievement":
          if (performance?.overallAccuracy >= badge.criteria.threshold) {
            earned = true;
            progress = 100;
          } else if (performance) {
            progress = performance.overallAccuracy;
          }
          break;

        case "quiz_completion":
          const quizCount = await QuizAttempt.countDocuments({
            userId,
            status: "completed",
            score: { $gte: 60 },
          });
          if (quizCount >= badge.criteria.threshold) {
            earned = true;
            progress = 100;
          } else {
            progress = (quizCount / badge.criteria.threshold) * 100;
          }
          break;

        case "perfect_week":
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);

          const weekActivities = await DailyActivity.find({
            userId,
            date: { $gte: lastWeek.toISOString().split("T")[0] },
            isValidLearningDay: true,
          });

          if (weekActivities.length >= 7) {
            earned = true;
            progress = 100;
          } else {
            progress = (weekActivities.length / 7) * 100;
          }
          break;
      }

      if (earned) {
        await StudentBadge.create({
          userId,
          badgeId: badge._id,
          earnedAt: new Date(),
          progress: 100,
        });
      } else {
        await BadgeProgress.findOneAndUpdate(
          { userId, badgeId: badge._id },
          { progress, lastUpdated: new Date() },
          { upsert: true },
        );
      }
    }
  } catch (error) {
    console.error("Error checking badges:", error);
  }
};

/**
 * 1️⃣5️⃣ GENERATE WEEKLY REPORTS
 */
exports.generateWeeklyReports = async () => {
  try {
    const students = await User.find({ role: "student", isActive: true });

    for (const student of students) {
      const performance = await exports.calculatePerformanceIndex(
        student._id,
        student.standard,
      );

      const insights = await StudentInsight.findOne({ userId: student._id });

      const weeklyReport = {
        userId: student._id,
        weekStart: new Date(new Date().setDate(new Date().getDate() - 7)),
        weekEnd: new Date(),
        performance: performance.api,
        improvements: insights?.learningPatterns?.improvementPatterns || [],
        weakAreas: insights?.learningPatterns?.weakSubjects || [],
        recommendations: insights?.recommendations || [],
      };

      // Store weekly report (you can create a WeeklyReport model)
      console.log(`Weekly report generated for ${student._id}`);
    }
  } catch (error) {
    console.error("Error generating weekly reports:", error);
  }
};

/**
 * 1️⃣6️⃣ CHECK AND UPDATE STREAK
 */
exports.checkAndUpdateStreak = async (userId, data) => {
  try {
    const { date, wasActive } = data;
    if (!wasActive) return null;

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
          isActive: true,
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

      // Check for milestone badges
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

          // Award streak milestone badge
          await exports.awardStreakBadge(userId, streak.currentStreak);
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
        if (streak.streakFreeze.freezeCount === 0) {
          streak.streakFreeze.isActive = false;
        }
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
    return streak;
  } catch (error) {
    console.error("Streak update failed:", error);
    return null;
  }
};

/**
 * 1️⃣7️⃣ AWARD STREAK BADGE
 */
exports.awardStreakBadge = async (userId, streakDays) => {
  try {
    const streakBadge = await BadgeDefinition.findOne({
      "criteria.type": "streak_milestone",
      "criteria.threshold": streakDays,
    });

    if (streakBadge) {
      const alreadyEarned = await StudentBadge.findOne({
        userId,
        badgeId: streakBadge._id,
      });

      if (!alreadyEarned) {
        await StudentBadge.create({
          userId,
          badgeId: streakBadge._id,
          earnedAt: new Date(),
          progress: 100,
          metadata: {
            streakAtEarn: streakDays,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error awarding streak badge:", error);
  }
};

module.exports = exports;
