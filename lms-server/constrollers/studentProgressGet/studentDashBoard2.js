// ==================== controllers/resumeController.js ====================
const mongoose = require("mongoose");
const StudentCompleteprogress = require("../../models/studentCompleteProgress");
const QuizAttemptRaw = require("../../models/quizAttempt");
const WatchSession = require("../../models/watchSession");
// ❌ DOUBT MODEL REMOVED - No longer needed

// ==================== MAIN RESUME CONTROLLER ====================
exports.getStudentDashboardResume = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userId", userId);
    const startTime = Date.now();

    // ===== PARALLEL QUERIES FOR MAXIMUM PERFORMANCE =====
    const [resumeItems, totalIncomplete, todaysActivity] = await Promise.all([
      // 1. Get top 3 resume items (pre-computed priority)
      getResumeItems(userId, 3),

      // 2. Get total count of incomplete items
      StudentCompleteprogress.countDocuments({
        studentId: userId,
        completionScore: { $lt: 1000 },
      }),

      // 3. Get today's activity summary
      getTodaysActivity(userId),
    ]);

    // ===== IF NO ITEMS FOUND =====
    if (!resumeItems || resumeItems.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          primary: null,
          secondary: [],
          totalIncomplete: 0,
          hasItems: false,
          message: "No incomplete items. Great job! 🎉",
          todaysActivity,
        },
        meta: {
          responseTime: Date.now() - startTime,
        },
      });
    }

    // ===== BUILD RESPONSE =====
    const response = {
      success: true,
      data: {
        primary: resumeItems[0] || null,
        secondary: resumeItems.slice(1),
        totalIncomplete,
        hasItems: true,
        // ❌ pendingDoubts removed
        todaysActivity,
      },
      meta: {
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Resume Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resume data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== GET SPECIFIC PAGE RESUME ====================
exports.getPageResumeData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageId } = req.params;

    // Validate pageId
    if (!mongoose.Types.ObjectId.isValid(pageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid page ID",
      });
    }

    // Get page progress with populated data
    const pageProgress = await StudentCompleteprogress.findOne({
      studentId: userId,
      pageId,
    })
      .populate("subjectId", "name")
      .populate("chapterId", "title")
      .lean();

    if (!pageProgress) {
      return res.status(404).json({
        success: false,
        message: "Page progress not found",
      });
    }

    // Get additional context data
    const [lastWatch, quizAttempts] = await Promise.all([
      WatchSession.findOne({ studentId: userId, pageId })
        .sort({ startTime: -1 })
        .lean(),

      QuizAttemptRaw.find({ studentId: userId, pageId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // ❌ DOUBT QUERY REMOVED
    ]);

    // Build enhanced response
    const response = {
      success: true,
      data: {
        page: {
          id: pageProgress._id,
          title: pageProgress.pageTitle,
          subject: pageProgress.subjectId?.name,
          chapter: pageProgress.chapterId?.title,
          pageNumber: pageProgress.pageNumber,
          thumbnail: pageProgress.pageThumbnail,
        },
        progress: {
          completion: Math.round((pageProgress.completionScore || 0) / 10),
          mastery: Math.round((pageProgress.masteryScore || 0) / 10),
          engagement: Math.round((pageProgress.engagementScore || 0) / 10),
          risk: Math.round((pageProgress.riskScore || 0) / 10),
        },
        resume: {
          priority: pageProgress.resumePriority,
          reason: pageProgress.resumeReason,
          action: pageProgress.resumeAction,
          urgency: pageProgress.resumeUrgency,
        },
        video: pageProgress.videoProgress
          ? {
              percentage: pageProgress.videoProgress.completionPercentage,
              completed: pageProgress.videoProgress.isCompleted,
              totalWatched: Math.round(
                pageProgress.videoProgress.totalWatchedSeconds / 60,
              ),
              totalDuration: Math.round(
                pageProgress.videoProgress.totalDuration / 60,
              ),
              lastWatched: lastWatch?.startTime,
              watchSessions: pageProgress.videoProgress.watchSessions,
            }
          : null,
        quiz: pageProgress.quizProgress
          ? {
              bestScore: pageProgress.quizProgress.bestScore,
              averageScore: pageProgress.quizProgress.averageScore,
              lastScore: pageProgress.quizProgress.lastAttemptScore,
              attempts: pageProgress.quizProgress.totalAttempts,
              failCount: pageProgress.quizProgress.failCount,
              passStatus: pageProgress.quizProgress.passStatus,
              requiredScore: pageProgress.quizProgress.requiredScoreToPass,
              questionsRemaining:
                pageProgress.quizProgress.totalQuestions -
                pageProgress.quizProgress.questionsAttempted,
              recentAttempts: quizAttempts.map((q) => ({
                score: q.score,
                passed: q.passed,
                date: q.createdAt,
              })),
            }
          : null,
        // ❌ DOUBT SECTION REMOVED
        lastAccessed: pageProgress.lastAccessed,
        timeAgo: getTimeAgo(pageProgress.lastAccessed),
        studyTime: {
          total: Math.round((pageProgress.totalStudyTime || 0) / 60),
          lastSession: Math.round((pageProgress.lastSessionDuration || 0) / 60),
          daysStudied: pageProgress.studyDaysCount,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Page Resume Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching page resume data",
    });
  }
};

// ==================== RECALCULATE PRIORITIES ====================
exports.recalculateResumePriorities = async (req, res) => {
  try {
    const userId = req.user.id;

    // Start background recalculation
    recalculateUserPriorities(userId).catch((err) =>
      console.error("Background recalculation error:", err),
    );

    res.status(202).json({
      success: true,
      message: "Recalculation started in background",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error starting recalculation",
    });
  }
};

// ==================== MARK PAGE AS COMPLETED ====================
exports.markPageCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageId } = req.params;

    const pageProgress = await StudentCompleteprogress.findOne({
      studentId: userId,
      pageId,
    });

    if (!pageProgress) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Force complete
    pageProgress.completionScore = 1000;
    pageProgress.resumePriority = 0;
    pageProgress.resumeReason = "Completed";
    pageProgress.resumeAction = "continue";
    pageProgress.resumeUrgency = "low";
    pageProgress.updatedAt = new Date();

    await pageProgress.save();

    res.status(200).json({
      success: true,
      message: "Page marked as completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error completing page",
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

// Get resume items with enhanced data
//getResumeItems = Resume card-ൽ കാണിക്കാൻ വേണ്ട items-നെ കണ്ടുപിടിക്കുന്ന function userId = ഏത് student-ൻ്റെ data വേണം (Sunil)
//limit = 3 = എത്ര items വേണം (സാധാരണ 3: 1 primary + 2 secondary)

async function getResumeItems(userId, limit = 3) {
  const items = await StudentCompleteprogress.find({
    // എന്താണ്?
    //- Sunil-ൻ്റെ (userId) എല്ലാ pages-നെയും കണ്ടുപിടിക്കുക
    //- completionScore 1000-ൽ കുറവുള്ളവ (1000 = 100% complete)
    //- $lt = less than (1000-ൽ താഴെ)
    //ഉദാഹരണം:
    //- Page 1: completionScore = 950 (95% complete) ✅ എടുക്കും
    //- Page 2: completionScore = 1000 (100% complete) ❌ എടുക്കില്ല
    studentId: userId,
    completionScore: { $lt: 1000 },
  })
    //എന്താണ്?
    //- resumePriority അനുസരിച്ച് ആദ്യം കാണിക്കുക
    //- -1 = descending order (high to low)
    //- ഒരേ priority ആണെങ്കിൽ lastAccessed അനുസരിച്ച് (ഏറ്റവും പുതിയത് ആദ്യം)

    //Priority Example:
    //- Maths Quiz (priority 950) → 1st
    //- English Page (priority 720) → 2nd
    //- Science Page (priority 450) → 3rd
    .sort({ resumePriority: -1, lastAccessed: -1 })
    //limit = 3 ആയതിനാൽ മൂന്നെണ്ണം മാത്രം എടുക്കും
    .limit(limit)
    //subjectId-ൻ്റെ പേര് മാത്രം എടുക്കുക
    //Example: "Mathematics", "English"
    .populate("subjectId", "name")
    //chapterId-ൻ്റെ title മാത്രം എടുക്കുക
    //Example: "Algebra Basics", "Nouns and Pronouns"
    .populate("chapterId", "title")
    // Mongoose document-നെ pure JSON ആക്കി മാറ്റും
    //വേഗത കൂട്ടാൻ വേണ്ടി
    .lean();
  //items array-ൽ ഒന്നും ഇല്ലെങ്കിൽ (length = 0)
  //ഉടൻ empty array return ചെയ്യുക

  //Example: Sunil-ന് incomplete ആയി ഒന്നും ഇല്ലെങ്കിൽ []
  if (!items.length) return [];

  // Enhance each item with additional context
  //Promise.all = എല്ലാ items-നും parallel ആയി data എടുക്കും (വേഗത കൂടും)
  const enhancedItems = await Promise.all(
    items.map(async (item) => {
      // ഓരോ item-നും extra data കണ്ടുപിടിക്കുക
      //അവസാന വീഡിയോ കണ്ട വിവരം
      // അവസാന quiz attempt
      const [lastWatch, lastQuiz] = await Promise.all([
        //- Sunil ഈ page-ലെ video എപ്പോഴാണ് അവസാനമായി കണ്ടത്?
        WatchSession.findOne({ studentId: userId, pageId: item.pageId })
          //- ഏറ്റവും പുതിയത് ആദ്യം
          .sort({ startTime: -1 })
          .lean(),
        //- Sunil ഈ page-ൻ്റെ quiz എപ്പോഴാണ് അവസാനമായി എടുത്തത്?
        QuizAttemptRaw.findOne({ studentId: userId, pageId: item.pageId })
          //- ഏറ്റവും പുതിയ attempt ആദ്യം
          //{
          //   score: 80,
          //   passed: true,
          //   createdAt: "2024-02-24T10:35:00"
          // }
          .sort({ createdAt: -1 })
          .lean(),
        // ❌ DOUBT QUERY REMOVED
      ]);
      // id = ഈ progress document-ൻ്റെ unique ID

      // pageId = Page-ൻ്റെ original ID

      // title = Page-ൻ്റെ പേര് (ഇല്ലെങ്കിൽ "Untitled Page")

      // subject = വിഷയത്തിൻ്റെ പേര് (ഇല്ലെങ്കിൽ "Unknown")

      // chapter = അദ്ധ്യായത്തിൻ്റെ പേര്

      // pageNumber = ഏത് page ആണ് (1,2,3...)
      return {
        id: item._id,
        pageId: item.pageId,
        title: item.pageTitle || "Untitled Page",
        subject: item.subjectId?.name || "Unknown",
        subjectId: item.subjectId?._id,
        chapter: item.chapterId?.title || "Unknown Chapter",
        chapterId: item.chapterId?._id,
        pageNumber: item.pageNumber,
        //completionPercentage: Math.round((item.completionScore || 0) / 10),
        //masteryPercentage: Math.round((item.masteryScore || 0) / 10),
        // completionScore 0-1000 scale ആണ് (1000 = 100%)
        //10 കൊണ്ട് divide ചെയ്താൽ 0-100 scale ആകും
        //completionScore = 950 → 950/10 = 95% complete
        //masteryScore = 600 → 600/10 = 60% mastery

        completionPercentage: Math.round((item.completionScore || 0) / 10),
        masteryPercentage: Math.round((item.masteryScore || 0) / 10),
        //         priority = എത്രത്തോളം പ്രധാനമാണ് (higher = more important)

        // reason = എന്തുകൊണ്ട് ഇത് കാണിക്കുന്നു (pre-computed)

        // action = എന്ത് ചെയ്യണം (finish/quiz/review/continue)

        // urgency = എത്ര urgent ആണ് (critical/high/medium/normal)
        //         priority: 720
        // reason: "Almost finished! Just 5% left"
        // action: "finish"
        // urgency: "high"
        priority: item.resumePriority,
        reason: item.resumeReason || getDefaultReason(item),
        action: item.resumeAction,
        //         urgency: item.resumeUrgency,
        //         lastAccessed = അവസാനം എപ്പോഴാണ് ഈ page കണ്ടത് (raw date)

        // timeAgo = "2 hours ago", "Yesterday" പോലെ human-readable format
        lastAccessed: item.lastAccessed,
        timeAgo: getTimeAgo(item.lastAccessed),
        thumbnail: item.pageThumbnail,
        //         hasPendingQuiz = Quiz pass ആയിട്ടില്ലേ? (true/false)

        // bestScore = ഇതുവരെ കിട്ടിയ ഏറ്റവും നല്ല score

        // totalAttempts = എത്ര തവണ ശ്രമിച്ചു

        // failCount = എത്ര തവണ പരാജയപ്പെട്ടു

        // questionsRemaining = ഇനി എത്ര ചോദ്യങ്ങൾ ബാക്കി
        //         hasPendingQuiz: true
        // bestScore: 45
        // totalAttempts: 2
        // failCount: 1
        // questionsRemaining: 3
        hasPendingQuiz: item.quizProgress?.passStatus === false,
        quizProgress: item.quizProgress
          ? {
              bestScore: item.quizProgress.bestScore,
              totalAttempts: item.quizProgress.totalAttempts,
              failCount: item.quizProgress.failCount,
              questionsRemaining:
                item.quizProgress.totalQuestions -
                item.quizProgress.questionsAttempted,
            }
          : null,
        //           percentage = എത്ര ശതമാനം video കണ്ടു

        // timeLeft = ഇനി എത്ര മിനിറ്റ് ബാക്കിയുണ്ട്
        // percentage: 100
        // timeLeft: 0  (പൂർത്തിയായി)

        // അല്ലെങ്കിൽ
        // percentage: 60
        // timeLeft: 4  (4 മിനിറ്റ് ബാക്കി)
        videoProgress: item.videoProgress
          ? {
              percentage: item.videoProgress.completionPercentage,
              timeLeft: item.videoProgress.totalDuration
                ? Math.round(
                    (item.videoProgress.totalDuration -
                      item.videoProgress.totalWatchedSeconds) /
                      60,
                  )
                : null,
            }
          : null,
        // ❌ hasDoubt and doubtText REMOVED
        //         lastSession.watchedAt = അവസാനം എപ്പോഴാണ് video കണ്ടത്

        // lastSession.duration = എത്ര നേരം കണ്ടു (മിനിറ്റിൽ)

        // lastQuizAttempt.score = അവസാന quiz-ൽ കിട്ടിയ score

        // lastQuizAttempt.passed = pass ആയോ?

        // lastQuizAttempt.attemptedAt = എപ്പോഴാണ് attempt ചെയ്തത്
        lastSession: lastWatch
          ? {
              watchedAt: lastWatch.startTime,
              duration: Math.round((lastWatch.duration || 0) / 60),
            }
          : null,
        lastQuizAttempt: lastQuiz
          ? {
              score: lastQuiz.score,
              passed: lastQuiz.passed,
              attemptedAt: lastQuiz.createdAt,
            }
          : null,
        //           ബട്ടണിൽ എന്ത് എഴുതണം എന്ന് decide ചെയ്യുന്നു

        // Based on action:

        // finish → "Finish Now"

        // quiz → "Start Quiz"

        // review → "Review & Retry"

        // continue → "Continue" or "Finish Now" (if >85%)
        ctaText: getCTAText(item.resumeAction, item),
      };
    }),
  );

  return enhancedItems;
}

// Get today's activity summary
async function getTodaysActivity(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [watchSessions, quizAttempts] = await Promise.all([
    WatchSession.find({
      studentId: userId,
      startTime: { $gte: today, $lt: tomorrow },
    }).lean(),
    QuizAttemptRaw.find({
      studentId: userId,
      createdAt: { $gte: today, $lt: tomorrow },
    }).lean(),
  ]);

  const totalWatchMinutes = watchSessions.reduce(
    (sum, session) => sum + (session.duration || 0) / 60,
    0,
  );

  const uniquePages = new Set();
  watchSessions.forEach((s) => uniquePages.add(s.pageId.toString()));
  quizAttempts.forEach((q) => {
    if (q.pageId) uniquePages.add(q.pageId.toString());
  });

  return {
    watchTime: Math.round(totalWatchMinutes),
    quizzesTaken: quizAttempts.length,
    pagesStudied: uniquePages.size,
    sessionsCount: watchSessions.length,
    hasActivity: watchSessions.length > 0 || quizAttempts.length > 0,
  };
}

// Background priority recalculation
async function recalculateUserPriorities(userId) {
  try {
    const pages = await StudentCompleteprogress.find({ studentId: userId });

    for (const page of pages) {
      page.updateResumePriority();
      await page.save();
    }

    console.log(`✓ Recalculated priorities for user ${userId}`);
  } catch (error) {
    console.error("✗ Recalculation error:", error);
  }
}

// Time ago formatter
function getTimeAgo(timestamp) {
  if (!timestamp) return "Never";

  const minutes = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Default reason generator
function getDefaultReason(item) {
  if (item.completionScore > 850) return "Almost finished!";
  if (item.quizProgress?.failCount > 0) return "Needs practice";
  return "Continue learning";
}

// CTA text generator
function getCTAText(action, item) {
  const completion = Math.round((item.completionScore || 0) / 10);

  switch (action) {
    case "finish":
      return "Finish Now";
    case "quiz":
      return "Start Quiz";
    case "review":
      return "Review & Retry";
    case "continue":
    default:
      if (completion > 85) return "Finish Now";
      if (completion > 0) return "Continue";
      return "Start Learning";
  }
}

// 🎯 SUMMARY - ഈ Function എന്ത് ചെയ്യുന്നു?
// Find - Sunil-ൻ്റെ incomplete pages കണ്ടുപിടിക്കുക

// Sort - ഏറ്റവും important items ആദ്യം വരത്തക്കവിധം sort ചെയ്യുക

// Limit - 3 എണ്ണം മാത്രം എടുക്കുക

// Enhance - ഓരോന്നിനും extra data കൂട്ടിച്ചേർക്കുക

// Format - Frontend-ന് വേണ്ട രീതിയിൽ data format ചെയ്യുക

// Return - Enhanced items array return ചെയ്യുക

// Bro, ഇതാണ് resume card-ൻ്റെ heart! ❤️
// ഈ function ആണ് Sunil-ന് ഏറ്റവും പ്രധാനപ്പെട്ട 3 items decide ചെയ്യുന്നത്. 🚀
