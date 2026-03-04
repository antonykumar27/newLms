// controllers/progressController.js - FIXED FOR EMBEDDED LECTURES
const mongoose = require("mongoose");
const UserVideoProgress = require("../models/UserVideoProgressModel.js");
const Course = require("../models/course.js");
const Enrollment = require("../models/enrollment.js");
const UserProgress = require("../models/userProgressSchema.js");
const StandardSubject = require("../models/standardSubjectSchema.js");
const ProgressService = require("../services/progressService.js");
const Video = require("../models/videoModel.js");
// 📊 Get course progress - FIXED for embedded lectures
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Get course with all sections and lectures
    const course = await Course.findById(courseId)
      .select(
        "title thumbnail sections totalDuration totalLectures instructor status",
      )
      .populate("instructor", "name avatar");

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // 2️⃣ Check enrollment
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    if (!enrollment && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not enrolled in this course",
      });
    }

    // 3️⃣ Get all progress records for this course
    const progressRecords = await UserVideoProgress.find({
      user: userId,
      course: courseId,
    }).lean();

    // Create map for quick lookup - using lectureRef
    const progressMap = new Map();
    progressRecords.forEach((p) => {
      const key = `${p.sectionIndex}-${p.lectureIndex}`;
      progressMap.set(key, p);
    });

    // 4️⃣ Extract ALL lectures from course sections
    const allLectures = [];
    course.sections.forEach((section, sectionIndex) => {
      section.lectures.forEach((lecture, lectureIndex) => {
        allLectures.push({
          _id: lecture._id || `${section._id}-${lectureIndex}`,
          title: lecture.title,
          duration: lecture.duration || 0,
          order: lectureIndex + 1,
          sectionId: section._id,
          sectionIndex: sectionIndex,
          lectureIndex: lectureIndex,
          isPreview: lecture.isPreview || false,
          type: lecture.type || "video",
          thumbnail: lecture.thumbnail || "",
          resources: lecture.resources || [],
        });
      });
    });

    // 5️⃣ Calculate section progress
    const sectionProgress = course.sections.map((section, sectionIndex) => {
      const sectionLectures = allLectures.filter(
        (lecture) => lecture.sectionIndex === sectionIndex,
      );

      // Get progress for each lecture in this section
      const sectionLectureProgress = sectionLectures
        .map((lecture) => {
          const key = `${lecture.sectionIndex}-${lecture.lectureIndex}`;
          return progressMap.get(key);
        })
        .filter(Boolean);

      const completedInSection = sectionLectureProgress.filter(
        (p) => p.completed,
      ).length;
      const totalInSection = sectionLectures.length;

      return {
        sectionId: section._id,
        title: section.title || `Section ${sectionIndex + 1}`,
        order: section.order || sectionIndex + 1,
        totalLectures: totalInSection,
        completedLectures: completedInSection,
        progress:
          totalInSection > 0
            ? Math.round((completedInSection / totalInSection) * 100)
            : 0,
        lectures: sectionLectures
          .map((lecture) => {
            const key = `${lecture.sectionIndex}-${lecture.lectureIndex}`;
            const progress = progressMap.get(key);

            return {
              lectureId: lecture._id,
              lectureRef: `${lecture.sectionIndex}-${lecture.lectureIndex}`,
              title: lecture.title,
              duration: lecture.duration,
              order: lecture.order,
              isPreview: lecture.isPreview,
              type: lecture.type,
              thumbnail: lecture.thumbnail,
              resources: lecture.resources,
              completed: progress?.completed || false,
              lastPosition: progress?.lastPositionSeconds || 0,
              totalWatchTime: progress?.totalWatchSeconds || 0,
              lastWatchedAt: progress?.lastWatchedAt,
            };
          })
          .sort((a, b) => a.order - b.order),
      };
    });

    // 6️⃣ Calculate overall statistics
    const totalLectures = allLectures.length;
    const completedLectures = progressRecords.filter((p) => p.completed).length;
    const totalWatchTime = progressRecords.reduce(
      (sum, p) => sum + (p.totalWatchSeconds || 0),
      0,
    );

    const overallProgress =
      totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;

    // 7️⃣ Find next lecture
    const incompleteLectures = allLectures
      .map((lecture) => {
        const key = `${lecture.sectionIndex}-${lecture.lectureIndex}`;
        return {
          lecture,
          progress: progressMap.get(key),
        };
      })
      .filter((item) => !item.progress?.completed)
      .sort((a, b) => {
        // Sort by section order, then lecture order
        if (a.lecture.sectionIndex !== b.lecture.sectionIndex) {
          return a.lecture.sectionIndex - b.lecture.sectionIndex;
        }
        return a.lecture.order - b.lecture.order;
      });

    const nextLecture = incompleteLectures[0];

    // 8️⃣ Get last watched
    const lastWatchedRecord = progressRecords
      .filter((p) => p.lastWatchedAt)
      .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)[0];

    // 9️⃣ Response
    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          instructor: course.instructor,
          totalDuration: course.totalDuration,
          totalLectures: totalLectures,
        },
        progress: {
          overall: overallProgress,
          completedLectures,
          totalLectures,
          remainingLectures: totalLectures - completedLectures,
          totalWatchTimeSeconds: totalWatchTime,
          totalWatchTimeFormatted: formatTime(totalWatchTime),
          isCompleted:
            overallProgress >= 90 || enrollment?.status === "completed",
        },
        sections: sectionProgress,
        nextLecture: nextLecture
          ? {
              lectureId: nextLecture.lecture._id,
              lectureRef: `${nextLecture.lecture.sectionIndex}-${nextLecture.lecture.lectureIndex}`,
              title: nextLecture.lecture.title,
              resumeAt: nextLecture.progress?.lastPositionSeconds || 0,
              sectionTitle:
                course.sections[nextLecture.lecture.sectionIndex]?.title ||
                `Section ${nextLecture.lecture.sectionIndex + 1}`,
              sectionIndex: nextLecture.lecture.sectionIndex,
              lectureIndex: nextLecture.lecture.lectureIndex,
            }
          : null,
        lastWatched: lastWatchedRecord
          ? {
              lectureRef: `${lastWatchedRecord.sectionIndex}-${lastWatchedRecord.lectureIndex}`,
              lastPosition: lastWatchedRecord.lastPositionSeconds,
              lastWatchedAt: lastWatchedRecord.lastWatchedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get course progress error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch progress",
    });
  }
};

// 📈 Get all courses progress - OPTIMIZED
const getAllCoursesProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Get enrollments with courses
    const enrollments = await Enrollment.find({
      student: userId,
      paymentStatus: "paid",
    })
      .populate({
        path: "course",
        select:
          "title thumbnail category instructor totalDuration totalLectures",
        populate: {
          path: "instructor",
          select: "name avatar",
        },
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ enrolledAt: -1 })
      .lean();

    // Get total count
    const totalCount = await Enrollment.countDocuments({
      student: userId,
      paymentStatus: "paid",
    });

    // Get all progress
    const allProgress = await UserVideoProgress.find({ user: userId }).lean();

    // Create progress map by course
    const progressByCourse = new Map();
    allProgress.forEach((p) => {
      if (!progressByCourse.has(p.course.toString())) {
        progressByCourse.set(p.course.toString(), []);
      }
      progressByCourse.get(p.course.toString()).push(p);
    });

    // Process each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseId = enrollment.course._id.toString();
        const courseProgress = progressByCourse.get(courseId) || [];

        // Get fresh course to count lectures
        const freshCourse = await Course.findById(courseId)
          .select("sections totalLectures")
          .lean();

        // Count total lectures in course
        let totalLectures = 0;
        if (freshCourse && freshCourse.sections) {
          freshCourse.sections.forEach((section) => {
            totalLectures += section.lectures?.length || 0;
          });
        }

        const completedLectures = courseProgress.filter(
          (p) => p.completed,
        ).length;
        const progress =
          totalLectures > 0
            ? Math.round((completedLectures / totalLectures) * 100)
            : 0;

        const totalWatchTime = courseProgress.reduce(
          (sum, p) => sum + (p.totalWatchSeconds || 0),
          0,
        );

        const lastWatched = courseProgress
          .filter((p) => p.lastWatchedAt)
          .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)[0];

        return {
          course: {
            _id: enrollment.course._id,
            title: enrollment.course.title,
            thumbnail: enrollment.course.thumbnail,
            category: enrollment.course.category,
            instructor: enrollment.course.instructor,
            totalDuration: enrollment.course.totalDuration,
            totalLectures: totalLectures,
          },
          progress,
          completedLectures,
          totalLectures,
          totalWatchTimeSeconds: totalWatchTime,
          totalWatchTimeFormatted: formatTime(totalWatchTime),
          isCompleted: progress >= 90 || enrollment.status === "completed",
          enrolledAt: enrollment.enrolledAt,
          lastWatched: lastWatched?.lastWatchedAt,
        };
      }),
    );

    // Filter by status
    let filteredCourses = coursesWithProgress;
    if (status === "completed") {
      filteredCourses = coursesWithProgress.filter((c) => c.isCompleted);
    } else if (status === "in-progress") {
      filteredCourses = coursesWithProgress.filter(
        (c) => !c.isCompleted && c.progress > 0,
      );
    } else if (status === "not-started") {
      filteredCourses = coursesWithProgress.filter((c) => c.progress === 0);
    }

    // Calculate stats
    const stats = {
      total: filteredCourses.length,
      completed: filteredCourses.filter((c) => c.isCompleted).length,
      inProgress: filteredCourses.filter(
        (c) => !c.isCompleted && c.progress > 0,
      ).length,
      notStarted: filteredCourses.filter((c) => c.progress === 0).length,
      totalWatchTimeSeconds: filteredCourses.reduce(
        (sum, c) => sum + c.totalWatchTimeSeconds,
        0,
      ),
    };

    res.json({
      success: true,
      data: {
        courses: filteredCourses,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all courses progress error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses progress",
    });
  }
};
// 📁 controllers/progressController.js - ADD THIS FUNCTION

// 👤 Get user's complete learning progress (ALL courses)
const getUserOverallProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      timeRange = "all", // 'today', 'week', 'month', 'year', 'all'
      sortBy = "recent", // 'recent', 'progress', 'watchTime'
      limit = 20,
    } = req.query;

    // ✅ Calculate date range
    let startDate;
    const now = new Date();

    switch (timeRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null; // All time
    }
    console.log(
      "progressFilterprogressFilteruserId2222222222222222222222222222222222",
      userId,
    );
    // ✅ 1. Get user's enrollments with course details
    const enrollments = await Enrollment.find({
      student: userId,
      paymentStatus: "paid",
    })
      .populate({
        path: "course",
        select:
          "title thumbnail category instructor level totalDuration totalLectures ratings averageRating enrolledCount",
        populate: {
          path: "instructor",
          select: "name parishImage",
        },
      })
      .lean();

    if (!enrollments.length) {
      return res.json({
        success: true,
        data: {
          overallStats: getEmptyStats(),
          courses: [],
          dailyActivity: [],
          recentActivity: [],
          recommendations: [],
        },
      });
    }
    console.log("progressFilterprogressFilteruserId", userId);
    // ✅ 2. Get ALL progress records for this user
    const progressFilter = { userId: userId };
    if (startDate) {
      progressFilter.lastPlayedAt = { $gte: startDate };
    }
    console.log("progressFilterprogressFilter", progressFilter);
    const allProgress = await UserProgress.find(progressFilter)
      .populate("courseId", "title thumbnail")
      .populate({
        path: "lectures.lectureId",
        model: "Course", // 👈 your Lecture model name
        select: "title duration thumbnail contentUrl",
      })
      .lean();
    console.log("allProgress", allProgress);

    // ✅ 3. Organize progress by course
    const progressByCourse = new Map();
    allProgress.forEach((p) => {
      const courseId = p.courseId?._id?.toString();
      if (courseId) {
        if (!progressByCourse.has(courseId)) {
          progressByCourse.set(courseId, []);
        }
        progressByCourse.get(courseId).push(p);
      }
    });

    // ✅ 4. Calculate progress for each enrolled course
    const coursesWithProgress = [];
    let totalWatchTimeAll = 0;
    let totalCompletedLecturesAll = 0;
    let totalLecturesAll = 0;

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const courseId = course._id.toString();
      const courseProgress = progressByCourse.get(courseId) || [];

      // Get fresh course to count lectures
      const freshCourse = await Course.findById(courseId)
        .select("sections totalLectures")
        .lean();

      // Count total lectures in course
      let totalLecturesInCourse = 0;
      let lectureDurationSum = 0;

      if (freshCourse?.sections) {
        freshCourse.sections.forEach((section) => {
          const lectures = section.lectures || [];
          totalLecturesInCourse += lectures.length;

          lectures.forEach((lecture) => {
            lectureDurationSum += (lecture.duration || 0) * 60; // Convert minutes to seconds
          });
        });
      }

      // Calculate completed lectures
      const completedLectures = courseProgress.filter(
        (p) => p.isCompleted,
      ).length;
      const progressPercentage =
        totalLecturesInCourse > 0
          ? Math.round((completedLectures / totalLecturesInCourse) * 100)
          : 0;

      // Calculate total watch time for this course
      const courseWatchTime = courseProgress.reduce(
        (sum, p) => sum + (p.totalWatched || 0),
        0,
      );

      // Get last activity in this course
      const lastActivity = courseProgress
        .filter((p) => p.lastPlayedAt)
        .sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt))[0];

      // Calculate engagement score
      const engagementScore = calculateCourseEngagement(
        courseProgress,
        totalLecturesInCourse,
        courseWatchTime,
        lectureDurationSum,
      );

      // Add to totals
      totalWatchTimeAll += courseWatchTime;
      totalCompletedLecturesAll += completedLectures;
      totalLecturesAll += totalLecturesInCourse;

      coursesWithProgress.push({
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          category: course.category,
          instructor: course.instructor,
          level: course.level,
          ratings: course.ratings,
          averageRating: course.averageRating,
          enrolledCount: course.enrolledCount,
          totalDuration: course.totalDuration,
          totalLectures: totalLecturesInCourse,
          estimatedDuration: Math.round(lectureDurationSum / 60), // in minutes
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          lastAccessed: enrollment.lastAccessed,
          status: enrollment.status,
          completionPercentage: enrollment.completionPercentage || 0,
        },
        progress: {
          percentage: progressPercentage,
          completedLectures,
          totalLectures: totalLecturesInCourse,
          remainingLectures: totalLecturesInCourse - completedLectures,
          watchTimeSeconds: courseWatchTime,
          watchTimeFormatted: formatTime(courseWatchTime),
          lastActivity: lastActivity?.lastPlayedAt,
          engagementScore,
          isCompleted:
            progressPercentage >= 90 || enrollment.status === "completed",
          daysSinceEnrollment: Math.floor(
            (new Date() - new Date(enrollment.enrolledAt)) /
              (1000 * 60 * 60 * 24),
          ),
        },
      });
    }

    // ✅ 5. Sort courses
    coursesWithProgress.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.progress.percentage - a.progress.percentage;
        case "watchTime":
          return b.progress.watchTimeSeconds - a.progress.watchTimeSeconds;
        case "recent":
        default:
          return (
            new Date(b.progress.lastActivity || 0) -
            new Date(a.progress.lastActivity || 0)
          );
      }
    });

    // ✅ 6. Get recent activity (last 10 interactions)
    const recentActivity = await UserVideoProgress.find({ userId })
      .sort({ lastPlayedAt: -1 })
      .limit(10)
      .populate("courseId", "title thumbnail")
      .populate("videoId", "title duration")
      .lean()
      .then((activities) =>
        activities.map((a) => ({
          type: "video_watched",
          course: a.courseId?.title,
          video: a.videoId?.title,
          duration: a.videoId?.duration,
          watched: a.totalWatched,
          percentage: a.completionPercentage,
          timestamp: a.lastPlayedAt,
        })),
      );

    // ✅ 7. Calculate daily activity for the last 7 days
    const dailyActivity = await UserVideoProgress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          lastPlayedAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastPlayedAt" },
          },
          watchTime: { $sum: "$totalWatched" },
          lecturesWatched: { $sum: 1 },
          completedLectures: {
            $sum: { $cond: [{ $gte: ["$completionPercentage", 90] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ✅ 8. Calculate overall statistics
    const overallProgressPercentage =
      totalLecturesAll > 0
        ? Math.round((totalCompletedLecturesAll / totalLecturesAll) * 100)
        : 0;

    const overallStats = {
      totalCourses: coursesWithProgress.length,
      completedCourses: coursesWithProgress.filter(
        (c) => c.progress.isCompleted,
      ).length,
      inProgressCourses: coursesWithProgress.filter(
        (c) => !c.progress.isCompleted && c.progress.percentage > 0,
      ).length,
      notStartedCourses: coursesWithProgress.filter(
        (c) => c.progress.percentage === 0,
      ).length,
      totalWatchTimeSeconds: totalWatchTimeAll,
      totalWatchTimeFormatted: formatTime(totalWatchTimeAll),
      totalLecturesWatched: allProgress.length,
      totalCompletedLectures: totalCompletedLecturesAll,
      averageDailyWatchTime: calculateDailyAverage(dailyActivity),
      currentStreak: calculateLearningStreak(dailyActivity),
      learningConsistency: calculateConsistency(dailyActivity),
      overallProgressPercentage,
      learningLevel: getLearningLevel(
        overallProgressPercentage,
        totalWatchTimeAll,
      ),
    };

    // ✅ 9. Generate recommendations
    const recommendations = generatePersonalizedRecommendations(
      coursesWithProgress,
      overallStats,
    );

    // ✅ 10. Prepare final response
    const response = {
      success: true,
      data: {
        user: {
          _id: userId,
          // Add user details if needed
        },
        overallStats,
        courses: coursesWithProgress.slice(0, limit),
        dailyActivity,
        recentActivity,
        recommendations,
        timeRange: {
          type: timeRange,
          start: startDate,
          end: new Date(),
        },
        pagination: {
          total: coursesWithProgress.length,
          showing: Math.min(limit, coursesWithProgress.length),
          hasMore: coursesWithProgress.length > limit,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get user overall progress error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user progress",
    });
  }
};

// 🔧 HELPER FUNCTIONS

function getEmptyStats() {
  return {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    notStartedCourses: 0,
    totalWatchTimeSeconds: 0,
    totalWatchTimeFormatted: "0h 0m",
    totalLecturesWatched: 0,
    totalCompletedLectures: 0,
    averageDailyWatchTime: 0,
    currentStreak: 0,
    learningConsistency: 0,
    overallProgressPercentage: 0,
    learningLevel: "Beginner",
  };
}

function calculateCourseEngagement(
  progress,
  totalLectures,
  watchTime,
  totalDuration,
) {
  if (!progress.length || totalLectures === 0 || totalDuration === 0) {
    return 0;
  }

  // Factors: completion rate, watch time ratio, lecture distribution
  const completionRate =
    progress.filter((p) => p.isCompleted).length / totalLectures;
  const watchTimeRatio = Math.min(watchTime / totalDuration, 1);
  const averageCompletion =
    progress.reduce((sum, p) => sum + p.completionPercentage, 0) /
    progress.length /
    100;

  // Weighted score
  const score =
    completionRate * 0.4 + watchTimeRatio * 0.3 + averageCompletion * 0.3;
  return Math.round(score * 100);
}

function calculateDailyAverage(dailyActivity) {
  if (!dailyActivity.length) return 0;

  const totalWatchTime = dailyActivity.reduce(
    (sum, day) => sum + day.watchTime,
    0,
  );
  return Math.round(totalWatchTime / dailyActivity.length);
}

function calculateLearningStreak(dailyActivity) {
  if (!dailyActivity.length) return 0;

  const dates = dailyActivity.map((d) => new Date(d._id)).sort((a, b) => b - a);
  let streak = 0;
  let currentDate = new Date();

  // Reset time for accurate date comparison
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const activityDate = new Date(dates[i]);
    activityDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate - activityDate) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateConsistency(dailyActivity) {
  if (!dailyActivity.length) return 0;

  const daysWithActivity = dailyActivity.filter((d) => d.watchTime > 0).length;
  return Math.round((daysWithActivity / dailyActivity.length) * 100);
}

function getLearningLevel(progress, watchTime) {
  const hours = watchTime / 3600;

  if (hours > 100 && progress > 80) return "Expert";
  if (hours > 50 && progress > 60) return "Advanced";
  if (hours > 20 && progress > 40) return "Intermediate";
  if (hours > 5 && progress > 20) return "Beginner+";
  return "Beginner";
}

function generatePersonalizedRecommendations(courses, stats) {
  const recommendations = [];

  // If user has no completed courses
  if (stats.completedCourses === 0) {
    recommendations.push({
      type: "start_learning",
      message:
        "Start your learning journey! Pick one course and complete your first lecture.",
      priority: "high",
    });
  }

  // If user has courses with low progress
  const lowProgressCourses = courses.filter(
    (c) => c.progress.percentage > 0 && c.progress.percentage < 30,
  );

  if (lowProgressCourses.length > 0) {
    recommendations.push({
      type: "continue_learning",
      message: `Continue with "${lowProgressCourses[0].course.title}" - you're ${lowProgressCourses[0].progress.percentage}% done!`,
      priority: "medium",
    });
  }

  // If user has good consistency
  if (stats.learningConsistency > 70) {
    recommendations.push({
      type: "streak_encouragement",
      message: `Great consistency! You've been learning for ${stats.currentStreak} days in a row. Keep it up!`,
      priority: "low",
    });
  }

  // If user has many not-started courses
  if (stats.notStartedCourses > 3) {
    recommendations.push({
      type: "focus_suggestion",
      message: `You have ${stats.notStartedCourses} courses not started yet. Focus on 1-2 at a time.`,
      priority: "medium",
    });
  }

  return recommendations;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

const updatetrackSpentTimeProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const { chapterId, pageId, endTime, startTime, subjectId, timeSpent } =
      req.body;

    // 1️⃣ Validate input
    if (!chapterId || !pageId || !subjectId || !timeSpent) {
      return res.status(400).json({
        success: false,
        error: "chapterId, pageId, subjectId and timeSpent are required",
      });
    }

    // 2️⃣ Validate subject
    const subject = await StandardSubject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    const standardId = subject.standardId;

    // 3️⃣ Update Progress
    const updatedProgress = await UserProgress.findOneAndUpdate(
      {
        userId,
        standardId,
        subjectId,
        chapterId,
        pageId,
      },
      {
        $push: {
          pageSessions: {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            timeSpent: timeSpent,
          },
        },
        $inc: {
          totalTimeSpent: timeSpent,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Time tracked successfully",
      data: updatedProgress,
    });
  } catch (error) {
    console.error("Track Time Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Export all functions
module.exports = {
  updatetrackSpentTimeProgress,
  getCourseProgress,
  getAllCoursesProgress,

  getUserOverallProgress,
};
