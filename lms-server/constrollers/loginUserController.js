const catchAsyncError = require("../middlewares/catchAsyncError");
const fs = require("fs");
const ErrorHandler = require("../utilis/errorHandler");
const sendToken = require("../utilis/jwt");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const { uploadFileToCloudinary } = require("../config/cloudinary");
const sendEmail = require("../utilis/email");
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
const Standard = require("../models/standardSchema.js");
exports.register = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    medium,
    schoolName,
    std,
    rollNumber,
    adminSecretCode,
    phoneNumber,
    wishTo,
  } = req.body;
  const ADMIN_EMAIL = "antonykumar27@gmail.com";
  const ADMIN_SECRET_CODE = "ADMIN2024!@#"; // Store this in .env in production
  // 🔍 Check existing student
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new ErrorHandler("Student already exists with this email", 400),
    );
  }
  // Determine role and validate
  let role = null;
  if (email === ADMIN_EMAIL) {
    // Admin email requires secret code
    if (!adminSecretCode) {
      return res.status(400).json({
        success: false,
        message: "Admin secret code is required",
      });
    }

    // Validate secret code
    if (adminSecretCode !== ADMIN_SECRET_CODE) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin secret code",
      });
    }

    role = "admin";
  }
  // 📁 Handle media (optional)
  const mediaFiles = req.files?.media || [];
  const mediaUrls = [];

  for (const file of mediaFiles) {
    const uploaded = await uploadFileToCloudinary(file);
    if (uploaded?.url) {
      mediaUrls.push({
        url: uploaded.url,
        type: "image",
      });
    }
    fs.unlink(file.path, () => {});
  }

  // 🎭 Default avatar (DiceBear) if no media uploaded
  const avatar =
    mediaUrls.length === 0
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          name,
        )}`
      : undefined;

  // 🧾 Student data
  const student = await User.create({
    name,
    email,
    password, // hashed by schema pre-save
    phoneNumber,
    medium,
    schoolName,
    std,
    rollNumber,
    avatar,
    media: mediaUrls,
    role,
    wishTo,
  });

  // 🔐 Send JWT
  sendToken(student, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  // 2️⃣ Find user + include password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // 3️⃣ Compare password
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // 4️⃣ Check active status (optional but recommended)
  if (!user.isActive) {
    return next(
      new ErrorHandler("Your account is deactivated. Contact support.", 403),
    );
  }

  // ❌ remove password before response
  user.password = undefined;

  // 5️⃣ Send token
  sendToken(user, 200, res);
});
// 1. Email Check Endpoint
exports.checkAdminEmail = catchAsyncError(async (req, res) => {
  const { email } = req.body;
  const adminEmail = "antonykumar27@gmail.com";

  // Check if email exists in database
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({
      success: false,
      message: "Email already registered",
      isAvailable: false,
    });
  }

  // Check if it's admin email
  if (email === adminEmail) {
    return res.json({
      success: true,
      message: "this is admin email",
      isAvailable: true,
    });
  }

  // Regular email
  res.json({
    success: true,
    message: "Email is available",
    isAvailable: true,
  });
});

exports.registerAsStudent = catchAsyncError(async (req, res, next) => {
  const {
    email,
    medium,
    name,
    password,
    phone,
    rollNumber,
    schoolName,
    standardId,
  } = req.body;

  // 🔍 Find user - FIX #1: Use req.user._id since route is protected
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 🔐 Check password - This is optional since user is already logged in
  // But if you want to verify password for security:
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // 🎓 Check if user already has a student profile
  const alreadyStudent = await LmsStudentProfile.exists({
    user: user._id, // FIX #2: Use user._id consistently
  });

  if (alreadyStudent) {
    return next(new ErrorHandler("Already registered as student", 400));
  }

  // 🔍 Validate standard - FIX #3: Proper null check
  const standardDoc = await Standard.findOne({ _id: standardId })
    .select("_id standard medium")
    .lean();

  if (!standardDoc) {
    return next(new ErrorHandler("Invalid standard selected", 400));
  }

  console.log("Selected standard:", standardDoc);

  // 📁 Handle media upload (if any)
  const mediaFiles = req.files?.media || [];
  const mediaUrls = [];

  for (const file of mediaFiles) {
    const uploaded = await uploadFileToCloudinary(file);
    if (uploaded?.url) {
      mediaUrls.push({
        url: uploaded.url,
        type: "image",
      });
    }
    fs.unlink(file.path, () => {});
  }

  // 🧑‍🎓 Update user role
  if (user.role !== "student") {
    user.role = "student";
    user.standard = standardDoc.standard;
  }

  // FIX #4: Don't duplicate standard data in User model
  // Remove these lines:
  // user.standard = standardDoc.standard;
  // user.standardId = standardDoc._id;
  // user.medium = standardDoc.medium;

  // 🖼 Add media to user if any
  if (mediaUrls?.length) {
    user.media = mediaUrls;
  }

  // 📌 Create Student Profile (Single source of truth for academic data)
  const studentProfile = await LmsStudentProfile.create({
    user: user._id,
    academicInfo: {
      standardId: standardId, // from req.body
      standardNumber: standardDoc.standard, // Store the standard number
      medium: standardDoc.medium, // Store the medium string
      schoolName: schoolName || "",
      rollNumber: rollNumber || "",
    },
    personalInfo: {
      phoneNumber: phone || "",
      name: name || user.name, // Use provided name or existing
      email: email || user.email, // Use provided email or existing
    },
  });

  // Link profile to user
  user.studentProfile = studentProfile._id;

  // Optionally update user basic info if provided
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  // Remove sensitive data
  user.password = undefined;

  // 🎟 Send token with updated user data
  sendToken(user, 200, res);
});
// authController.js
exports.refreshToken = catchAsyncError(async (req, res, next) => {
  // req.user already set by authenticate middleware
  const userId = req.user?._id;

  if (!userId) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  try {
    // Get FRESH user data from database
    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // CommunityMember role check
    const member = await CommunityMember.findOne({
      email: user.email,
      name: user.name,
    });

    if (member) {
      user.role = member.role;
      user.position = member.position;
      await user.save();
    }

    // Create new token
    const newToken = user.getJwtToken();

    // Cookie options
    const days = parseInt(process.env.COOKIE_EXPIRES_TIME || "2", 10);
    const cookieExpireMs = isNaN(days)
      ? 2 * 24 * 60 * 60 * 1000
      : days * 24 * 60 * 60 * 1000;

    const options = {
      expires: new Date(Date.now() + cookieExpireMs),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    };

    // Calculate boolean flags
    const isTeacher = user.role === "teacher";
    const isStudent = user.role === "student";
    const isAdmin = user.role === "admin";

    // Response
    res
      .status(200)
      .cookie("token", newToken, options)
      .json({
        success: true,
        token: newToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isTeacher, // 👈 Boolean flag
          isStudent, // 👈 Boolean flag
          isAdmin, // 👈 Boolean flag
          position: user.position,
          asACompany: user.asACompany,
        },
      });
  } catch (error) {
    console.error("Refresh token error:", error);
    return next(new ErrorHandler("Failed to refresh token", 500));
  }
});
exports.AdminRelatedSuents = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;

  // 1️⃣ Check logged-in user exists
  const adminUser = await User.findById(userId);
  if (!adminUser) {
    return next(new ErrorHandler("User not found", 401));
  }

  // 2️⃣ Check role is admin
  if (adminUser.role !== "admin") {
    return next(new ErrorHandler("Only admin can access student details", 403));
  }

  // 3️⃣ Fetch students (FIXED)
  const students = await User.find({ role: "student" }).select(
    "name email media isActive createdAt standard medium schoolName",
  );

  // 4️⃣ Shape response
  const formattedStudents = students.map((student) => ({
    name: student.name,
    email: student.email,
    media: student.media,
    active: student.isActive,
    createdAt: student.createdAt,
    standard: student.standard, // ✅ now works
    medium: student.medium,
    schoolName: student.schoolName,
  }));

  // 5️⃣ Send response
  res.status(200).json({
    success: true,
    count: formattedStudents.length,
    data: formattedStudents,
  });
});
// exports.getEnrolledStandardContent = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // 1️⃣ Check enrollment
//     const enrollment = await Enrollment.findOne({
//       student: userId,
//       isActive: true,
//     });

//     if (!enrollment) {
//       return res.status(403).json({
//         success: false,
//         message: "User not enrolled in any standard",
//       });
//     }

//     const standardId = enrollment.standard;

//     // 2️⃣ Subjects
//     const subjects = await StandardSubject.find({
//       standardId: standardId,
//     });

//     const subjectIds = subjects.map((s) => s._id);

//     // 3️⃣ Chapters
//     const chapters = await StandardChapter.find({
//       subjectId: { $in: subjectIds },
//     });

//     const chapterIds = chapters.map((c) => c._id);

//     // 4️⃣ Lessons / Pages
//     const lessons = await MathsLesson.find({
//       chapterId: { $in: chapterIds },
//     });

//     res.json({
//       success: true,
//       data: {
//         standardId,
//         subjects,
//         chapters,
//         lessons,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
// exports.getEnrolledStandardContent = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const enrollment = await Enrollment.findOne({
//       student: userId,
//       isActive: true,
//     })
//       .populate("standard", "standard")
//       .lean();

//     if (!enrollment) {
//       return res.status(403).json({
//         success: false,
//         message: "Not enrolled",
//       });
//     }

//     const standardId = enrollment.standard._id; // ✅ ID
//     const standard = enrollment.standard.standard; // ✅ 6

//     // Subjects
//     const subjects = await StandardSubject.find({
//       standardId,
//     })
//       .select("_id subject")
//       .lean();

//     const subjectIds = subjects.map((s) => s._id);

//     // Chapters
//     const chapters = await StandardChapter.find({
//       subjectId: { $in: subjectIds },
//     })
//       .select("_id subjectId chapterNumber")
//       .lean();

//     const chapterIds = chapters.map((c) => c._id);

//     // Lessons
//     const lessons = await StandardPage.find({
//       chapterId: { $in: chapterIds },
//     })
//       .select("_id chapterId title")
//       .lean();

//     // Structure build
//     const structuredData = subjects.map((subject) => ({
//       subjectId: subject._id,
//       subjectName: subject.subject,
//       chapters: chapters
//         .filter((ch) => ch.subjectId.toString() === subject._id.toString())
//         .map((chapter) => ({
//           chapterId: chapter._id,
//           chapterNumber: chapter.chapterNumber,
//           pages: lessons
//             .filter(
//               (lesson) =>
//                 lesson.chapterId.toString() === chapter._id.toString(),
//             )
//             .map((lesson) => ({
//               pageId: lesson._id,
//               title: lesson.title,
//             })),
//         })),
//     }));

//     res.json({
//       success: true,
//       data: {
//         standardId,
//         standard, // 🔥 Added
//         subjects: structuredData,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
exports.getEnrolledStandardContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subjectId } = req.query; // Optional: filter by subject

    // ===== 1️⃣ GET ENROLLMENT DETAILS =====
    const enrollment = await Enrollment.findOne({
      student: userId,

      isActive: true,
      paymentStatus: "paid",
      status: "active",
    })
      .populate("standard", "standard")
      .lean();

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this standard",
      });
    }

    const standardId = enrollment.standard._id;
    const standard = enrollment.standard.standard;

    // ===== 2️⃣ GET ALL SUBJECTS =====
    let subjectsQuery = { standardId };
    if (subjectId) {
      subjectsQuery._id = subjectId;
    }

    const subjects = await StandardSubject.find(subjectsQuery)
      .select("_id subject")
      .lean();

    const subjectIds = subjects.map((s) => s._id);

    // ===== 3️⃣ GET ALL CHAPTERS =====
    const chapters = await StandardChapter.find({
      subjectId: { $in: subjectIds },
    })
      .select("_id subjectId chapterNumber title description")
      .lean();

    const chapterIds = chapters.map((c) => c._id);

    // ===== 4️⃣ GET ALL PAGES =====
    const pages = await StandardPage.find({
      chapterId: { $in: chapterIds },
    })
      .select("_id chapterId title description contentType order")
      .lean();

    // ===== 5️⃣ COLLECT STUDENT PROGRESS DATA =====

    // Get quiz attempts
    const quizAttempts = await QuizAttempt.find({
      userId,
      ...(subjectId && { "contextIds.subjectId": subjectId }),
    }).lean();

    // Get video progress
    const videoProgress = await UserProgress.find({
      userId,
      ...(subjectId && { subjectId }),
    }).lean();

    // Get page time spent
    const pageTimeSpent = await UserProgress.find({
      userId,
      ...(subjectId && { subjectId }),
    }).lean();

    // Get user streak data
    const user = await User.findById(userId)
      .select(
        "currentStreak maxStreak badges completedChapters completedSubjects completedPages lastActiveDate",
      )
      .lean();

    // ===== 6️⃣ CALCULATE OVERALL STATS =====
    const overallStats = calculateOverallStats({
      quizAttempts,
      videoProgress,
      pageTimeSpent,
      user,
    });

    // ===== 7️⃣ BUILD STRUCTURED DATA WITH PROGRESS =====
    const structuredData = subjects.map((subject) => {
      const subjectChapters = chapters.filter(
        (ch) => ch.subjectId.toString() === subject._id.toString(),
      );

      return {
        subjectId: subject._id,
        subjectName: subject.subject,

        // Subject level stats
        stats: {
          totalChapters: subjectChapters.length,
          completedChapters: getCompletedChaptersCount(
            user,
            subject._id,
            subjectChapters,
          ),
          averageScore: calculateSubjectAverageScore(quizAttempts, subject._id),
          totalWatchTime: calculateSubjectWatchTime(videoProgress, subject._id),
          progressPercentage: calculateSubjectProgress(
            user,
            subject._id,
            subjectChapters,
          ),
        },

        chapters: subjectChapters?.map((chapter) => {
          const chapterPages = pages.filter(
            (p) => p.chapterId.toString() === chapter._id.toString(),
          );

          return {
            chapterId: chapter._id,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            description: chapter.description,

            // Chapter level stats
            stats: {
              totalPages: chapterPages.length,
              completedPages: getCompletedPagesCount(
                user,
                chapter._id,
                chapterPages,
              ),
              averageScore: calculateChapterAverageScore(
                quizAttempts,
                chapter._id,
              ),
              watchTime: calculateChapterWatchTime(videoProgress, chapter._id),
              progressPercentage: calculateChapterProgress(
                user,
                chapter._id,
                chapterPages,
              ),
            },

            pages: chapterPages?.map((page) => {
              // Get page specific progress
              const pageQuizAttempts = quizAttempts.filter(
                (qa) =>
                  qa.quizCategory === "PAGE" &&
                  qa.contextIds?.pageId?.toString() === page._id.toString(),
              );

              const pageVideoProgress = videoProgress.find(
                (vp) => vp.pageId?.toString() === page._id.toString(),
              );

              const pageTime = pageTimeSpent?.find(
                (pt) => pt.pageId?.toString() === page._id.toString(),
              );

              return {
                pageId: page._id,
                title: page.title,
                description: page.description,
                contentType: page.contentType,
                order: page.order,

                // Page level progress
                progress: {
                  isCompleted:
                    user?.completedPages?.includes(page._id) || false,
                  quizAttempts: pageQuizAttempts.length || 0,
                  lastQuizScore: pageQuizAttempts[0]?.score || null,
                  bestQuizScore:
                    Math.max(...pageQuizAttempts.map((q) => q.score || 0), 0) ||
                    0,
                  videoWatched: pageVideoProgress?.completed || false,
                  watchTime: pageVideoProgress?.watchTime || 0,
                  timeSpent: pageTime?.timeSpent || 0,
                  lastAccessed: pageTime?.date || null,
                },
              };
            }),
          };
        }),
      };
    });

    // ===== 8️⃣ CALCULATE LEADERBOARD METRICS =====
    const leaderboardMetrics = calculateLeaderboardMetrics(overallStats);

    // ===== 9️⃣ FINAL RESPONSE =====
    res.json({
      success: true,
      data: {
        standardId,
        standard,

        // Student overall stats
        studentStats: {
          name: req.user.name,
          username: req.user.username,
          lastActiveDate: user?.lastActiveDate || null,
          overall: overallStats,
          leaderboard: leaderboardMetrics,
        },

        // Subjects with progress
        subjects: structuredData,
      },
    });
  } catch (error) {
    console.error("Error in getEnrolledStandardContent:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate overall student statistics
 */
const calculateOverallStats = ({
  quizAttempts,
  videoProgress,
  pageTimeSpent,
  user,
}) => {
  // Quiz stats
  const quizScores = quizAttempts.map((q) => q.score || 0);
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0;

  const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
  const passRate =
    quizAttempts.length > 0
      ? Math.round((passedQuizzes / quizAttempts.length) * 100)
      : 0;

  // Video stats
  const completedVideos = videoProgress.filter((v) => v.completed).length;
  const totalWatchTime = videoProgress.reduce(
    (acc, v) => acc + (v.watchTime || 0),
    0,
  );

  // Engagement stats
  const totalPageTime =
    pageTimeSpent?.reduce((acc, p) => acc + (p.timeSpent || 0), 0) || 0;

  // Activity in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity =
    pageTimeSpent?.filter((p) => p.date && new Date(p.date) >= thirtyDaysAgo) ||
    [];

  const activeDays = new Set(
    recentActivity.map((a) => new Date(a.date).toISOString().split("T")[0]),
  ).size;

  const consistencyScore =
    activeDays > 0 ? Math.round((activeDays / 30) * 100) : 0;

  return {
    quiz: {
      totalAttempts: quizAttempts.length || 0,
      averageScore: avgQuizScore,
      passRate: passRate,
      bestScore: Math.max(...quizScores, 0) || 0,
    },
    video: {
      totalVideos: videoProgress.length || 0,
      completedVideos: completedVideos || 0,
      completionRate:
        videoProgress.length > 0
          ? Math.round((completedVideos / videoProgress.length) * 100)
          : 0,
      totalWatchTime: Math.round(totalWatchTime / 60) || 0, // in hours
    },
    engagement: {
      totalPageTime: Math.round(totalPageTime / 60) || 0, // in minutes
      currentStreak: user?.currentStreak || 0,
      maxStreak: user?.maxStreak || 0,
      consistencyScore: consistencyScore,
      activeDays: activeDays || 0,
    },
    achievements: {
      badges: user?.badges?.length || 0,
      chaptersCompleted: user?.completedChapters?.length || 0,
      subjectsCompleted: user?.completedSubjects?.length || 0,
    },
    totalScore: calculateOverallScore({
      avgQuizScore: avgQuizScore || 0,
      videoCompletionRate:
        videoProgress.length > 0
          ? (completedVideos / videoProgress.length) * 100
          : 0,
      consistencyScore: consistencyScore || 0,
      currentStreak: user?.currentStreak || 0,
      totalWatchTime: (totalWatchTime || 0) / 60, // convert to hours
      badgeCount: user?.badges?.length || 0,
    }),
  };
};

/**
 * Calculate leaderboard metrics
 */
const calculateLeaderboardMetrics = (stats) => {
  const { quiz, video, engagement, achievements, totalScore } = stats;

  // Ensure totalScore is a number
  const currentScore = totalScore || 0;
  const level = currentScore > 0 ? Math.floor(currentScore / 1000) + 1 : 1;
  const nextLevelScore = level * 1000;
  const pointsToNextLevel = Math.max(nextLevelScore - currentScore, 0);

  return {
    currentScore: currentScore,
    level: level,
    nextLevelScore: nextLevelScore,
    pointsToNextLevel: pointsToNextLevel,

    breakdown: {
      quizContribution: Math.round((quiz.averageScore || 0) * 0.4),
      videoContribution: Math.round((video.completionRate || 0) * 0.3),
      consistencyContribution: Math.round(
        (engagement.consistencyScore || 0) * 0.2,
      ),
      streakBonus: Math.min((engagement.currentStreak || 0) * 3.33, 100) * 0.05,
      badgeBonus: Math.min((achievements.badges || 0) * 10, 100) * 0.05,
    },

    rank: null, // Will be filled by leaderboard service
    percentile: null, // Will be filled by leaderboard service
  };
};

/**
 * Calculate overall score (same as in leaderboard collector)
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
 * Get completed chapters count for a subject
 */
const getCompletedChaptersCount = (user, subjectId, chapters) => {
  if (!user?.completedChapters || !chapters?.length) return 0;

  const chapterIds = chapters.map((c) => c._id.toString());
  return (
    user.completedChapters.filter((cId) => chapterIds.includes(cId.toString()))
      .length || 0
  );
};

/**
 * Calculate subject average score
 */
const calculateSubjectAverageScore = (quizAttempts, subjectId) => {
  if (!quizAttempts?.length) return 0;

  const subjectQuizzes = quizAttempts.filter(
    (qa) => qa.contextIds?.subjectId?.toString() === subjectId.toString(),
  );

  const scores = subjectQuizzes.map((q) => q.score || 0);
  return scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
};

/**
 * Calculate subject watch time
 */
const calculateSubjectWatchTime = (videoProgress, subjectId) => {
  if (!videoProgress?.length) return 0;

  const subjectVideos = videoProgress.filter(
    (vp) => vp.subjectId?.toString() === subjectId.toString(),
  );

  return (
    Math.round(
      subjectVideos.reduce((acc, v) => acc + (v.watchTime || 0), 0) / 60,
    ) || 0
  ); // hours
};

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
 * Calculate chapter average score
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
 * Calculate chapter watch time
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
