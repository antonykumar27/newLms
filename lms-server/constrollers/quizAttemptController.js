// controllers/quizAttemptController.js

const QuizAttempt = require("../models/quizAttempt");
const StandardSubject = require("../models/standardSubjectSchema");
const UserProgress = require("../models/userProgressSchema");
const StudentCompleteprogress = require("../models/studentCompleteProgress");
const progressService = require("../services/progressServiceStudentQuiz");
const LmsStudentProfile = require("../models/lmsStudent");
const StudentProgress = require("../models/studentProgressScheema");
const QuziAttemptCounter = require("../models/quizAttemptCounter");
const ErrorHandler = require("../utilis/errorHandler");
const mongoose = require("mongoose");

// CREATE QUIZ ATTEMPT
// exports.createQuizAttempt = async (req, res) => {
//   try {
//     const {
//       quizId,
//       quizTitle,
//       standard,
//       subject,
//       chapter,
//       topic,
//       language,
//       difficulty,
//       totalQuestions,
//       correctAnswers,
//       totalMarks,
//       marksObtained,
//       timeTaken,
//       //quizrelated
//       quizEnum,
//       quizType,
//     } = req.body;

//     const userId = req.user._id;
//     const { username, email } = req.user;

//     // VALIDATE REQUIRED FIELDS
//     if (!quizId || !totalQuestions || marksObtained === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Quiz ID, total questions, and marks obtained are required",
//       });
//     }

//     // FIND PREVIOUS ATTEMPTS COUNT
//     const previousAttempts = await QuizAttempt.countDocuments({
//       quizId,
//       userId,
//     });

//     const attemptNumber = previousAttempts + 1;

//     // CALCULATE SCORE
//     const score =
//       totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

//     // CREATE NEW ATTEMPT
//     const newAttempt = new QuizAttempt({
//       quizId,
//       userId,
//       attemptNumber,
//       quizTitle,
//       standard,
//       subject,
//       chapter,
//       topic,
//       language,
//       difficulty,
//       totalQuestions,
//       correctAnswers,
//       totalMarks,
//       marksObtained,
//       score,
//       timeTaken,
//       username,
//       email,
//       date: new Date(),
//       passed: score >= 40, // Assuming 40% passing
//       isBestAttempt: false, // Will update after saving
//     });

//     const savedAttempt = await newAttempt.save();

//     // UPDATE BEST ATTEMPT FLAG
//     await updateBestAttemptFlag(quizId, userId);

//     res.status(201).json({
//       success: true,
//       message: "Quiz attempt saved successfully",
//       data: savedAttempt,
//     });
//   } catch (error) {
//     console.error("Create quiz attempt error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
// GET ALL QUIZ ATTEMPTS OF LOGGED-IN USER (ALL QUIZZES)

// controllers/quizAttemptController.js
// controllers/quizAttemptController.js

exports.createQuizAttempt = async (req, res, next) => {
  // ========== 🏁 START TRANSACTION ==========
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      correctAnswers,
      marksObtained,
      quizCategory,
      quizType, // contextId
      quizId,
      totalQuestions,
      totalMarks,
      timeTaken,
      subjectId,
      chapterId,
    } = req.body;

    const userId = req.user._id;
    const { username, email } = req.user;

    // ========== 🎯 GET STANDARD ID ==========
    const studentProfile = await LmsStudentProfile.findOne({
      user: userId,
    })
      .select("academicInfo.standardId")
      .session(session);

    if (!studentProfile) {
      await session.abortTransaction();
      return next(new ErrorHandler("Student profile not found", 404));
    }

    const standardId = studentProfile.academicInfo.standardId;
    if (!standardId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "User standard not found",
      });
    }

    // ========== 🔍 VALIDATION ==========
    if (!quizId || !totalQuestions || marksObtained === undefined) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Quiz ID, total questions, and marks obtained are required",
      });
    }

    if (!["SUBJECT", "CHAPTER", "PAGE"].includes(quizCategory)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Valid quizCategory (SUBJECT/CHAPTER/PAGE) is required",
      });
    }

    if (!quizType) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "quizType (context ID) is required",
      });
    }

    // ========== 🛡 SCORE CALCULATION ==========
    const safeMarks = Math.min(marksObtained, totalMarks);
    const score =
      totalMarks > 0 ? Math.round((safeMarks / totalMarks) * 100) : 0;
    const passed = score >= 40;

    // ========== 🔢 GET ATTEMPT NUMBER ==========
    // Use AttemptCounter model for atomic increment
    const counter = await QuziAttemptCounter.findOneAndUpdate(
      { quizId, userId },
      { $inc: { attemptCounter: 1 } },
      {
        upsert: true,
        new: true,
        session,
        setDefaultsOnInsert: { attemptCounter: 0 },
      },
    );

    const attemptNumber = counter.attemptCounter;

    // ========== 📍 BUILD CONTEXT IDS ==========
    const contextIds = {
      standardId,
      subjectId: null,
      chapterId: null,
      pageId: null,
    };

    switch (quizCategory) {
      case "SUBJECT":
        contextIds.subjectId = quizType;
        break;
      case "CHAPTER":
        contextIds.chapterId = quizType;
        contextIds.subjectId = subjectId || null;
        break;
      case "PAGE":
        contextIds.pageId = quizType;
        contextIds.chapterId = chapterId || null;
        contextIds.subjectId = subjectId || null;
        break;
    }

    // ========== 📝 CREATE ATTEMPT ==========
    const [savedAttempt] = await QuizAttempt.create(
      [
        {
          quizId,
          userId,
          attemptNumber,
          quizCategory,
          contextIds,
          totalQuestions,
          correctAnswers: correctAnswers || 0,
          totalMarks,
          marksObtained: safeMarks,
          score,
          timeTaken: timeTaken || 0,
          username,
          email,
          date: new Date(),
          passed,
          isBestAttempt: false,
          isBestForContext: false,
        },
      ],
      { session },
    );

    console.log(`✅ Attempt #${attemptNumber} saved: ${score}%`);

    // ========== 🏆 UPDATE BEST ATTEMPTS ==========
    await QuizAttempt.updateBestAttempts(quizId, userId, contextIds, session);

    // ========== 🚀 UPDATE STUDENT PROGRESS (FIXED) ==========
    const progress = await StudentProgress.updateProgress(
      {
        userId,
        category: quizCategory,
        contextId: quizType,
        score,
        timeTaken: timeTaken || 0,
        attemptId: savedAttempt._id,
        passed,
        attemptNumber,
      },
      session,
    );

    // ========== 📊 GET ANALYTICS ==========
    let pageAnalytics = null;
    if (quizCategory === "PAGE" && contextIds.pageId) {
      pageAnalytics = await progressService.getProgressTrend(
        userId,
        "PAGE",
        contextIds.pageId,
      );
    }

    // ========== 📈 GET DASHBOARD ==========
    const dashboardOverview = await StudentProgress.getStudentDashboard(userId);

    // ========== ✅ COMMIT TRANSACTION ==========
    await session.commitTransaction();

    // ========== 🎉 SUCCESS RESPONSE ==========
    res.status(201).json({
      success: true,
      message: "Quiz attempt saved successfully",
      data: {
        attempt: savedAttempt,
        progress: {
          bestScore: progress.bestScore,
          averageScore: progress.averageScore,
          totalAttempts: progress.totalAttempts,
          masteryLevel: progress.masteryLevel,
          isCompleted: progress.isCompleted,
          improvementRate: progress.improvementRate,
        },
        analytics: pageAnalytics,
        dashboard: dashboardOverview,
      },
    });
  } catch (error) {
    // ========== ❌ ROLLBACK TRANSACTION ==========
    await session.abortTransaction();

    console.error("❌ Create quiz attempt error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      if (error.message.includes("attemptNumber")) {
        return res.status(409).json({
          success: false,
          message: "Concurrent attempt detected. Please try again.",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // ========== 🏁 END SESSION ==========
    session.endSession();
  }
};

// exports.createQuizAttempt = async (req, res) => {
//   try {
//     const {
//       correctAnswers,
//       marksObtained,
//       // ===== നിങ്ങൾ പറഞ്ഞത് പോലെ =====
//       quizCategory, // "SUBJECT" or "CHAPTER" or "PAGE"
//       quizType, // This is the ID (subjectId / chapterId / pageId)

//       quizId,
//       totalQuestions,

//       totalMarks,

//       timeTaken,

//       // Extra context info
//     } = req.body;

//     const userId = req.user._id;
//     const { username, email } = req.user;
//     const standardId = await StandardSubject.findOne({
//       standard: userId.standard,
//     }).select("standardId");

//     // VALIDATION
//     if (!quizId || !totalQuestions || marksObtained === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Quiz ID, total questions, and marks obtained are required",
//       });
//     }

//     // Validate quizCategory
//     if (
//       !quizCategory ||
//       !["SUBJECT", "CHAPTER", "PAGE"].includes(quizCategory)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid quizCategory (SUBJECT/CHAPTER/PAGE) is required",
//       });
//     }

//     // Validate quizType (ID)
//     if (!quizType) {
//       return res.status(400).json({
//         success: false,
//         message: "quizType (ID) is required",
//       });
//     }

//     // Get attempt number
//     const previousAttempts = await QuizAttempt.countDocuments({
//       quizId,
//       userId,
//     });

//     const attemptNumber = previousAttempts + 1;

//     // Calculate score
//     const score =
//       totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

//     // ===== 🎯 Set context based on quizCategory =====
//     let contextIds = {
//       standardId: standardId,
//     };

//     // quizCategory അനുസരിച്ച് contextIds set ചെയ്യുക
//     if (quizCategory === "SUBJECT") {
//       contextIds.subjectId = quizType; // quizType is subjectId
//     } else if (quizCategory === "CHAPTER") {
//       contextIds.chapterId = quizType; // quizType is chapterId
//       // Also try to get subjectId from somewhere if available
//       if (req.body.subjectId) {
//         contextIds.subjectId = req.body.subjectId;
//       }
//     } else if (quizCategory === "PAGE") {
//       contextIds.pageId = quizType; // quizType is pageId
//       if (req.body.chapterId) {
//         contextIds.chapterId = req.body.chapterId;
//       }
//       if (req.body.subjectId) {
//         contextIds.subjectId = req.body.subjectId;
//       }
//     }

//     // Create attempt
//     const newAttempt = new QuizAttempt({
//       // References
//       quizId,
//       userId,
//       attemptNumber,

//       // ===== Category and Context =====
//       quizCategory, // "SUBJECT", "CHAPTER", or "PAGE"
//       contextIds, // Contains the correct IDs

//       // Results
//       totalQuestions,
//       correctAnswers,
//       totalMarks,
//       marksObtained,
//       score,
//       timeTaken,

//       // User info
//       username,
//       email,

//       // Flags
//       date: new Date(),
//       passed: score >= 40,
//       isBestAttempt: false,
//     });

//     const savedAttempt = await newAttempt.save();

//     // Update best attempt flag
//     await QuizAttempt.updateBestAttempt(quizId, userId);
//     pageAnalytics = await getStudentThisPageAnalytics(
//       savedAttempt.userId,
//       contextIds.pageId,
//     );

//     console.log("📊 Page Analytics:", pageAnalytics);
//     res.status(201).json({
//       success: true,
//       message: "Quiz attempt saved successfully",
//       data: savedAttempt,
//     });
//   } catch (error) {
//     console.error("Create quiz attempt error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
exports.getAllQuizAttemptsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await QuizAttempt.find({ userId })
      .sort({ createdAt: -1 }) // latest first
      .select("-__v");

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No quiz attempts found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "All quiz attempts fetched successfully",
      totalAttempts: attempts.length,
      data: attempts,
    });
  } catch (error) {
    console.error("Get all quiz attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// GET ALL ATTEMPTS BY USER FOR A QUIZ
exports.getQuizAttemptsByUser = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const attempts = await QuizAttempt.find({
      quizId,
      userId,
    })
      .sort({ attemptNumber: 1 })
      .select("-__v");

    if (!attempts || attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attempts found for this quiz",
      });
    }

    // CALCULATE IMPROVEMENT METRICS
    const improvementMetrics = calculateImprovementMetrics(attempts);

    res.status(200).json({
      success: true,
      data: attempts,
      metrics: improvementMetrics,
    });
  } catch (error) {
    console.error("Get quiz attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET STUDENT IMPROVEMENT ANALYTICS
exports.getStudentImprovementAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject, standard } = req.query;

    const filter = { userId };
    if (subject) filter.subject = subject;
    if (standard) filter.standard = standard;

    const attempts = await QuizAttempt.find(filter)
      .sort({ date: 1 })
      .select("quizTitle subject standard score attemptNumber date");

    if (!attempts || attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No quiz attempts found",
      });
    }

    const analytics = {
      totalAttempts: attempts.length,
      averageScore: calculateAverage(attempts.map((a) => a.score)),
      bestScore: Math.max(...attempts.map((a) => a.score)),
      firstAttemptScore: attempts[0]?.score || 0,
      lastAttemptScore: attempts[attempts.length - 1]?.score || 0,
      improvementPercentage: calculateImprovementPercentage(attempts),
      subjectWisePerformance: groupBySubject(attempts),
      timelineData: attempts.map((attempt) => ({
        date: attempt.date,
        score: attempt.score,
        quiz: attempt.quizTitle,
      })),
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get improvement analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL ATTEMPTS (ADMIN/REPORTS)
exports.getAllQuizAttempts = async (req, res) => {
  try {
    const {
      quizId,
      userId,
      subject,
      standard,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (quizId) filter.quizId = quizId;
    if (userId) filter.userId = userId;
    if (subject) filter.subject = subject;
    if (standard) filter.standard = standard;

    // DATE RANGE FILTER
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const attempts = await QuizAttempt.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("quizId", "title")
      .populate("userId", "name email");

    const total = await QuizAttempt.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// HELPER FUNCTIONS
const updateBestAttemptFlag = async (quizId, userId) => {
  try {
    // Find the attempt with highest score for this user+quiz
    const bestAttempt = await QuizAttempt.findOne({
      quizId,
      userId,
    }).sort("-score");

    if (bestAttempt) {
      // Remove best flag from all attempts
      await QuizAttempt.updateMany(
        { quizId, userId },
        { $set: { isBestAttempt: false } },
      );

      // Set best flag for highest score attempt
      await QuizAttempt.findByIdAndUpdate(bestAttempt._id, {
        isBestAttempt: true,
      });
    }
  } catch (error) {
    console.error("Update best attempt error:", error);
  }
};

const calculateImprovementMetrics = (attempts) => {
  if (attempts.length < 2) return null;

  const firstAttempt = attempts[0];
  const lastAttempt = attempts[attempts.length - 1];
  const bestAttempt = attempts.reduce((best, current) =>
    current.score > best.score ? current : best,
  );

  return {
    firstAttemptScore: firstAttempt.score,
    lastAttemptScore: lastAttempt.score,
    bestAttemptScore: bestAttempt.score,
    improvement: lastAttempt.score - firstAttempt.score,
    improvementPercentage: (
      ((lastAttempt.score - firstAttempt.score) / firstAttempt.score) *
      100
    ).toFixed(1),
    totalAttempts: attempts.length,
    averageScore: calculateAverage(attempts.map((a) => a.score)),
    progressTrend: attempts.map((a) => ({
      attempt: a.attemptNumber,
      score: a.score,
      date: a.date,
    })),
  };
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return (sum / numbers.length).toFixed(1);
};

const calculateImprovementPercentage = (attempts) => {
  if (attempts.length < 2) return 0;
  const first = attempts[0].score;
  const last = attempts[attempts.length - 1].score;
  return (((last - first) / first) * 100).toFixed(1);
};

const groupBySubject = (attempts) => {
  const subjectMap = {};

  attempts.forEach((attempt) => {
    const subject = attempt.subject || "Unknown";
    if (!subjectMap[subject]) {
      subjectMap[subject] = {
        subject,
        attempts: 0,
        totalScore: 0,
        bestScore: 0,
      };
    }

    subjectMap[subject].attempts++;
    subjectMap[subject].totalScore += attempt.score;
    if (attempt.score > subjectMap[subject].bestScore) {
      subjectMap[subject].bestScore = attempt.score;
    }
  });

  // Calculate averages
  Object.keys(subjectMap).forEach((subject) => {
    subjectMap[subject].averageScore = (
      subjectMap[subject].totalScore / subjectMap[subject].attempts
    ).toFixed(1);
  });

  return Object.values(subjectMap);
};

const getStudentThisPageAnalytics = async (userId, pageId) => {
  try {
    console.log(
      `🔍 Fetching page analytics for user: ${userId}, page: ${pageId}`,
    );

    // Filter for this page only
    const filter = {
      userId,
      "contextIds.pageId": pageId,
      quizCategory: "PAGE",
    };

    // ✅ Sort by date (oldest first) - CORRECT
    const attempts = await QuizAttempt.find(filter)
      .sort({ date: 1 }) // 1 = ascending (oldest first)
      .select("score attemptNumber date");

    console.log(`📊 Found ${attempts.length} page attempts`);

    if (!attempts || attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        firstAttemptScore: 0,
        lastAttemptScore: 0,
        improvementPercentage: 0,
        timelineData: [],
        message: "No attempts found for this page",
      };
    }

    const scores = attempts.map((a) => a.score);
    const firstScore = attempts[0]?.score || 0;
    const lastScore = attempts[attempts.length - 1]?.score || 0;

    // Calculate improvement percentage safely
    let improvementPercentage = 0;
    if (attempts.length >= 2 && firstScore !== 0) {
      improvementPercentage =
        Math.round(((lastScore - firstScore) / firstScore) * 100 * 10) / 10;
    }

    // Check consistency (low variance)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) /
      scores.length;
    const isConsistent = variance < 200; // Threshold adjusted

    const analytics = {
      // Basic stats
      totalAttempts: attempts.length,
      averageScore:
        Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10,
      bestScore: Math.max(...scores),
      firstAttemptScore: firstScore,
      lastAttemptScore: lastScore,
      improvementPercentage: improvementPercentage,

      // Detailed timeline (already sorted by date)
      timelineData: attempts.map((attempt) => ({
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        date: attempt.date,
      })),

      // Performance insights
      insights: {
        isImproving: lastScore > firstScore,
        isDeclining: lastScore < firstScore,
        needsPractice: avg < 50,
        goodPerformer: avg >= 70,
        mastered: avg >= 85,
        perfectScore: Math.max(...scores) === 100,
        consistentPerformer: isConsistent,
        attemptsCount: attempts.length,
      },
    };

    // ===== 💾 SAVE THE DOCUMENT =====

    let result = await StudentCompleteprogress.findOneAndUpdate(
      {
        studentId: userId,
        pageId,
      },
      {
        $set: {
          pageId,
          studentId: userId,
          updatedAt: new Date(),

          quizProgress: {
            // question: progress.questionId,
            // quizCategory: progress.quizCategory,

            averageScore: analytics.averageScore,
            totalAttempts: analytics.totalAttempts,
            bestScore: analytics.bestScore,
            firstAttemptScore: analytics.firstAttemptScore,
            lastAttemptScore: analytics.lastAttemptScore,
            improvementPercentage: analytics.improvementPercentage,
            timelineData: analytics.timelineData,
            insights: analytics.insights,
            lastAttempt: new Date(),
          },
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log("✅ Quiz progress updated:", result);
    //  const progress = new StudentCompleteprogress(analytics);
    //  await progress.save();
    console.log("✅ Analytics saved to StudentCompleteprogress");
    return analytics;
  } catch (error) {
    console.error("❌ Error in getStudentThisPageAnalytics:", error);
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      firstAttemptScore: 0,
      lastAttemptScore: 0,
      improvementPercentage: 0,
      timelineData: [],
      error: error.message,
    };
  }
};
// ============================================
// 🎯 UPDATE STUDENT COMPLETE PROGRESS - Quiz Performance
// ============================================
