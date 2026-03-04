// controllers/analyticsController.js
import StudentAnalytics from "../models/dummyStudentAnalytics.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import Video from "../models/Video.js";
import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import mongoose from "mongoose";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Leaderboard, StudentLeaderboardStats } from "../models/Leaderboard.js";
import User from "../models/User.js";
import DailyActivity from "../models/StudentActivity.js";
import StudentStreak from "../models/StudentStreak.js";
import { StudentBadge } from "../models/StudentBadge.js";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
// ==================== STREAK CONTROLLERS ====================

/**
 * Get student streak
 * @route GET /api/analytics/streak
 */
export const getStudentStreak = async (req, res) => {
  try {
    const studentId = req.user._id;

    let analytics = await StudentAnalytics.findOne({ studentId });

    if (!analytics) {
      // Create initial analytics for new student
      analytics = await StudentAnalytics.create({
        studentId,
        streak: {
          current: 0,
          longest: 0,
          lastActiveDate: null,
          freezeDays: 0,
        },
      });
    }

    // Calculate next milestone
    const nextMilestone = getNextMilestone(analytics.streak.current);
    const daysToNextMilestone = nextMilestone - analytics.streak.current;

    res.status(200).json({
      success: true,
      data: {
        current: analytics.streak.current,
        longest: analytics.streak.longest,
        lastActiveDate: analytics.streak.lastActiveDate,
        freezeDays: analytics.streak.freezeDays,
        nextMilestone,
        daysToNextMilestone,
      },
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch streak data",
    });
  }
};

/**
 * Update student streak (call this when student watches video)
 * @route POST /api/analytics/streak/update
 */
export const updateStreak = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const studentId = req.user._id;
    const today = startOfDay(new Date());

    let analytics = await StudentAnalytics.findOne({ studentId }).session(
      session,
    );

    if (!analytics) {
      analytics = new StudentAnalytics({
        studentId,
        streak: {
          current: 1,
          longest: 1,
          lastActiveDate: today,
          freezeDays: 0,
        },
      });
      await analytics.save({ session });
    } else {
      const lastActive = analytics.streak.lastActiveDate;
      const yesterday = startOfDay(subDays(new Date(), 1));

      // If last active was yesterday → increment streak
      if (
        lastActive &&
        startOfDay(lastActive).getTime() === yesterday.getTime()
      ) {
        analytics.streak.current += 1;

        // Update longest streak if current exceeds it
        if (analytics.streak.current > analytics.streak.longest) {
          analytics.streak.longest = analytics.streak.current;
        }
      }
      // If last active was today → no change (already counted)
      else if (
        lastActive &&
        startOfDay(lastActive).getTime() === today.getTime()
      ) {
        // Do nothing, already active today
      }
      // If gap > 1 day → reset streak
      else {
        analytics.streak.current = 1;
        // Reset freeze days on streak break
        analytics.streak.freezeDays = 0;
      }

      analytics.streak.lastActiveDate = new Date();
      await analytics.save({ session });
    }

    // Award streak badges
    await checkAndAwardStreakBadges(analytics, session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        current: analytics.streak.current,
        longest: analytics.streak.longest,
        message: getStreakMessage(analytics.streak.current),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Update streak error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update streak",
    });
  } finally {
    session.endSession();
  }
};

// ==================== WEEKLY ACTIVITY CONTROLLERS ====================

/**
 * Get weekly activity data
 * @route GET /api/analytics/weekly
 */
export const getWeeklyActivity = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { weekOffset = 0 } = req.query; // 0 = current week, -1 = last week, etc.

    const startDate = startOfWeek(subDays(new Date(), weekOffset * 7));
    const endDate = endOfWeek(subDays(new Date(), weekOffset * 7));

    // Get daily activity for the week
    const analytics = await StudentAnalytics.findOne({ studentId });

    if (!analytics) {
      return res.status(200).json({
        success: true,
        data: Array(7).fill(0),
      });
    }

    // Filter daily activity for the week
    const weeklyData = Array(7).fill(0);

    analytics.dailyActivity.forEach((day) => {
      const dayDate = startOfDay(day.date);
      if (dayDate >= startDate && dayDate <= endDate) {
        const dayIndex = dayDate.getDay(); // 0 = Sunday, adjust as needed
        // Convert to Monday = 0 format if needed
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        weeklyData[adjustedIndex] = Math.round(day.watchTime / 60); // Convert to minutes
      }
    });

    res.status(200).json({
      success: true,
      data: weeklyData,
      weekStart: startDate,
      weekEnd: endDate,
    });
  } catch (error) {
    console.error("Get weekly activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch weekly activity",
    });
  }
};

/**
 * Get monthly activity data
 * @route GET /api/analytics/monthly
 */
export const getMonthlyActivity = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { month = new Date().getMonth(), year = new Date().getFullYear() } =
      req.query;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0);

    const analytics = await StudentAnalytics.findOne({ studentId });

    if (!analytics) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get daily activity for the month
    const monthlyData = [];
    const daysInMonth = endDate.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dayActivity = analytics.dailyActivity.find(
        (day) =>
          startOfDay(day.date).getTime() === startOfDay(currentDate).getTime(),
      );

      monthlyData.push({
        day: i,
        watchTime: dayActivity ? Math.round(dayActivity.watchTime / 60) : 0,
        videosCompleted: dayActivity?.videosCompleted || 0,
      });
    }

    res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error("Get monthly activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch monthly activity",
    });
  }
};

// ==================== HEATMAP CONTROLLER ====================

/**
 * Get yearly heatmap data
 * @route GET /api/analytics/heatmap
 */

export const getYearlyHeatmap = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { year = new Date().getFullYear() } = req.query;

    const analytics = await StudentAnalytics.findOne({ studentId });

    if (!analytics) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Generate heatmap data for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const heatmapData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayActivity = analytics.dailyActivity.find(
        (day) =>
          startOfDay(day.date).getTime() === startOfDay(currentDate).getTime(),
      );

      heatmapData.push({
        date: new Date(currentDate),
        count: dayActivity ? Math.round(dayActivity.watchTime / 60) : 0, // minutes
        intensity: getIntensityLevel(dayActivity?.watchTime || 0),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: heatmapData,
    });
  } catch (error) {
    console.error("Get heatmap error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch heatmap data",
    });
  }
};

// ==================== BADGES CONTROLLERS ====================

/**
 * Get earned badges
 * @route GET /api/analytics/badges
 */

export const getEarnedBadges = async (req, res) => {
  try {
    const studentId = req.user._id;

    const analytics = await StudentAnalytics.findOne({ studentId }).populate(
      "badges.badgeId",
    );

    if (!analytics) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Format badges for frontend
    const badges = analytics.badges.map((badge) => ({
      id: badge.badgeId,
      name: getBadgeName(badge.category, badge.level),
      description: getBadgeDescription(badge.category, badge.level),
      category: badge.category,
      level: badge.level,
      earnedAt: badge.earnedAt,
      icon: getBadgeIcon(badge.category),
    }));

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch badges",
    });
  }
};

/**
 * Get next achievable badges
 * @route GET /api/analytics/badges/next
 */

export const getNextBadges = async (req, res) => {
  try {
    const studentId = req.user._id;

    const analytics = await StudentAnalytics.findOne({ studentId });

    if (!analytics) {
      return res.status(200).json({
        success: true,
        data: getInitialNextBadges(),
      });
    }

    const nextBadges = [];

    // Check next streak badge
    const currentStreak = analytics.streak.current;
    const nextStreakMilestone = getNextStreakMilestone(currentStreak);
    if (nextStreakMilestone) {
      nextBadges.push({
        category: "streak",
        name: `${nextStreakMilestone} Day Streak`,
        description: `Maintain streak for ${nextStreakMilestone} days`,
        progress: currentStreak,
        target: nextStreakMilestone,
        percentage: (currentStreak / nextStreakMilestone) * 100,
      });
    }

    // Check next completion badge
    const completedCount = analytics.badges.filter(
      (b) => b.category === "completion",
    ).length;
    const nextCompletionBadge = getNextCompletionBadge(completedCount);
    if (nextCompletionBadge) {
      nextBadges.push({
        category: "completion",
        name: nextCompletionBadge.name,
        description: nextCompletionBadge.description,
        progress: completedCount,
        target: nextCompletionBadge.target,
        percentage: (completedCount / nextCompletionBadge.target) * 100,
      });
    }

    res.status(200).json({
      success: true,
      data: nextBadges,
    });
  } catch (error) {
    console.error("Get next badges error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch next badges",
    });
  }
};

// ==================== SMART INSIGHTS CONTROLLERS ====================

/**
 * Get smart insights
 * @route GET /api/analytics/insights
 */
export const getSmartInsights = async (req, res) => {
  try {
    const studentId = req.user._id;

    let analytics = await StudentAnalytics.findOne({ studentId })
      .populate("insights.strongestSubject")
      .populate("insights.weakestSubject");

    if (!analytics) {
      analytics = await StudentAnalytics.create({
        studentId,
        insights: {
          preferredStudyTime: "Evening",
          strongestSubject: null,
          weakestSubject: null,
          averageDailyWatchTime: 0,
          consistencyScore: 0,
        },
      });
    }

    // Generate fresh insights
    await generateFreshInsights(studentId, analytics);

    res.status(200).json({
      success: true,
      data: {
        preferredStudyTime: analytics.insights.preferredStudyTime,
        strongestSubject: analytics.insights.strongestSubject,
        weakestSubject: analytics.insights.weakestSubject,
        averageDailyWatchTime: analytics.insights.averageDailyWatchTime,
        consistencyScore: analytics.insights.consistencyScore,
        studyPattern: getStudyPattern(analytics.dailyActivity),
        recommendations: await getPersonalizedRecommendations(
          studentId,
          analytics,
        ),
      },
    });
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch insights",
    });
  }
};

/**
 * Generate insights manually
 * @route POST /api/analytics/insights/generate
 */
export const generateInsights = async (req, res) => {
  try {
    const studentId = req.user._id;

    const analytics = await StudentAnalytics.findOne({ studentId });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: "Analytics not found",
      });
    }

    await generateFreshInsights(studentId, analytics);

    res.status(200).json({
      success: true,
      message: "Insights generated successfully",
    });
  } catch (error) {
    console.error("Generate insights error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate insights",
    });
  }
};

// ==================== LEADERBOARD CONTROLLERS ====================

/**
 * Get class leaderboard
 * @route GET /api/analytics/leaderboard/class
 */
export const getClassLeaderboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { standardId, limit = 10 } = req.query;

    // Get all students in the same class
    const students = await User.find({
      standard: standardId,
      role: "student",
    }).select("_id name");

    const studentIds = students.map((s) => s._id);

    // Aggregate progress data
    const leaderboard = await Progress.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          progress: { $gte: 90 }, // Count as completed
        },
      },
      {
        $group: {
          _id: "$userId",
          completedCount: { $sum: 1 },
          totalWatchTime: { $sum: "$watchTime" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          completedCount: 1,
          totalWatchTime: 1,
          score: {
            $add: [
              { $multiply: ["$completedCount", 10] },
              { $divide: ["$totalWatchTime", 3600] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Find current user's rank
    const userRank =
      leaderboard.findIndex(
        (item) => item._id.toString() === studentId.toString(),
      ) + 1;

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        userRank: userRank || "Not in top " + limit,
      },
    });
  } catch (error) {
    console.error("Get class leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leaderboard",
    });
  }
};

/**
 * Get subject leaderboard
 * @route GET /api/analytics/leaderboard/subject/:subjectId
 */
export const getSubjectLeaderboard = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user._id;
    const { limit = 10 } = req.query;

    // Get videos for this subject
    const videos = await Video.find({ subjectId }).select("_id");
    const videoIds = videos.map((v) => v._id);

    // Get all students with progress on these videos
    const leaderboard = await Progress.aggregate([
      {
        $match: {
          videoId: { $in: videoIds },
        },
      },
      {
        $group: {
          _id: "$userId",
          completedCount: {
            $sum: { $cond: [{ $gte: ["$progress", 90] }, 1, 0] },
          },
          totalWatchTime: { $sum: "$watchTime" },
          averageProgress: { $avg: "$progress" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          completedCount: 1,
          averageProgress: 1,
          score: {
            $add: [
              { $multiply: ["$completedCount", 10] },
              { $multiply: ["$averageProgress", 0.5] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get subject leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subject leaderboard",
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate fresh insights for student
 */
const generateFreshInsights = async (studentId, analytics) => {
  try {
    // Calculate preferred study time
    const hourlyDistribution = Array(24).fill(0);
    let totalEntries = 0;

    analytics.dailyActivity.forEach((day) => {
      if (day.hourlyBreakdown) {
        day.hourlyBreakdown.forEach((count, hour) => {
          hourlyDistribution[hour] += count;
          totalEntries += count;
        });
      }
    });

    if (totalEntries > 0) {
      const preferredHour = hourlyDistribution.indexOf(
        Math.max(...hourlyDistribution),
      );

      if (preferredHour >= 5 && preferredHour < 12) {
        analytics.insights.preferredStudyTime = "Morning 🌅";
      } else if (preferredHour >= 12 && preferredHour < 17) {
        analytics.insights.preferredStudyTime = "Afternoon ☀️";
      } else if (preferredHour >= 17 && preferredHour < 20) {
        analytics.insights.preferredStudyTime = "Evening 🌆";
      } else {
        analytics.insights.preferredStudyTime = "Night 🌙";
      }
    }

    // Calculate subject performance
    const subjectPerformance = await Progress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(studentId),
          progress: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videoId",
          foreignField: "_id",
          as: "video",
        },
      },
      { $unwind: "$video" },
      {
        $group: {
          _id: "$video.subjectId",
          averageProgress: { $avg: "$progress" },
          totalWatchTime: { $sum: "$watchTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { averageProgress: -1 } },
    ]);

    if (subjectPerformance.length > 0) {
      analytics.insights.strongestSubject = subjectPerformance[0]._id;
      analytics.insights.weakestSubject =
        subjectPerformance[subjectPerformance.length - 1]._id;
    }

    // Calculate average daily watch time (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentActivity = analytics.dailyActivity.filter(
      (day) => day.date >= thirtyDaysAgo,
    );

    if (recentActivity.length > 0) {
      const totalWatchTime = recentActivity.reduce(
        (sum, day) => sum + day.watchTime,
        0,
      );
      analytics.insights.averageDailyWatchTime = Math.round(
        totalWatchTime / 30 / 60,
      ); // minutes
    }

    // Calculate consistency score
    const activeDays = analytics.dailyActivity.filter(
      (day) => day.watchTime > 0,
    ).length;
    const totalDays = analytics.dailyActivity.length || 1;
    analytics.insights.consistencyScore = Math.round(
      (activeDays / totalDays) * 100,
    );

    await analytics.save();
  } catch (error) {
    console.error("Generate insights error:", error);
  }
};

/**
 * Get personalized recommendations
 */
const getPersonalizedRecommendations = async (studentId, analytics) => {
  const recommendations = [];

  // Streak recommendation
  if (analytics.streak.current > 0 && analytics.streak.current < 7) {
    recommendations.push({
      type: "streak",
      message: `You're on a ${analytics.streak.current}-day streak! Watch one video today to maintain it. 🔥`,
    });
  }

  // Weak subject recommendation
  if (analytics.insights.weakestSubject) {
    recommendations.push({
      type: "subject",
      message: `Focus on your weakest subject to improve overall performance. 📚`,
    });
  }

  // Time management
  if (analytics.insights.averageDailyWatchTime < 30) {
    recommendations.push({
      type: "time",
      message: `Try to study at least 30 minutes daily for better progress. ⏰`,
    });
  }

  return recommendations;
};

/**
 * Get next streak milestone
 */
const getNextStreakMilestone = (currentStreak) => {
  const milestones = [3, 7, 15, 30, 50, 100, 365];
  return milestones.find((m) => m > currentStreak) || null;
};

/**
 * Get next completion badge
 */
const getNextCompletionBadge = (completedCount) => {
  const badges = [
    {
      target: 10,
      name: "Bronze Learner 🥉",
      description: "Complete 10 videos",
    },
    {
      target: 25,
      name: "Silver Learner 🥈",
      description: "Complete 25 videos",
    },
    { target: 50, name: "Gold Learner 🥇", description: "Complete 50 videos" },
    {
      target: 100,
      name: "Platinum Learner 💎",
      description: "Complete 100 videos",
    },
    {
      target: 250,
      name: "Diamond Learner 💎💎",
      description: "Complete 250 videos",
    },
    {
      target: 500,
      name: "Master Learner 👑",
      description: "Complete 500 videos",
    },
  ];

  return (
    badges.find((b) => b.target > completedCount) || badges[badges.length - 1]
  );
};

/**
 * Get streak message
 */
const getStreakMessage = (streak) => {
  if (streak === 0) return "Start your learning journey today! 🔥";
  if (streak < 3) return `${streak} day streak! Keep going! 💪`;
  if (streak < 7) return `${streak} days! You're on fire! 🔥🔥`;
  if (streak < 30) return `${streak} day streak! Unstoppable! 🚀`;
  return `${streak} days! LEGENDARY! 👑`;
};

/**
 * Get next milestone
 */
const getNextMilestone = (current) => {
  if (current < 3) return 3;
  if (current < 7) return 7;
  if (current < 15) return 15;
  if (current < 30) return 30;
  if (current < 50) return 50;
  if (current < 100) return 100;
  return 365;
};

/**
 * Get intensity level for heatmap
 */
const getIntensityLevel = (watchTime) => {
  if (watchTime === 0) return 0;
  if (watchTime < 900) return 1; // < 15 minutes
  if (watchTime < 1800) return 2; // 15-30 minutes
  if (watchTime < 3600) return 3; // 30-60 minutes
  return 4; // > 60 minutes
};

/**
 * Get study pattern
 */
const getStudyPattern = (dailyActivity) => {
  const last7Days = dailyActivity.slice(-7);
  const activeDays = last7Days.filter((day) => day.watchTime > 0).length;

  if (activeDays >= 6) return "Very Consistent 🌟";
  if (activeDays >= 4) return "Consistent 👍";
  if (activeDays >= 2) return "Irregular ⚠️";
  return "Need Improvement 🎯";
};

/**
 * Check and award streak badges
 */
const checkAndAwardStreakBadges = async (analytics, session) => {
  const streakMilestones = [3, 7, 15, 30, 50, 100, 365];

  for (const milestone of streakMilestones) {
    if (analytics.streak.current === milestone) {
      // Check if badge already awarded
      const existingBadge = analytics.badges.find(
        (b) => b.category === "streak" && b.level === milestone,
      );

      if (!existingBadge) {
        analytics.badges.push({
          category: "streak",
          level: milestone,
          earnedAt: new Date(),
        });
      }
    }
  }

  await analytics.save({ session });
};

/**
 * Get badge name
 */
const getBadgeName = (category, level) => {
  if (category === "streak") {
    return `${level} Day Streak 🔥`;
  } else if (category === "completion") {
    const badges = {
      10: "Bronze Learner 🥉",
      25: "Silver Learner 🥈",
      50: "Gold Learner 🥇",
      100: "Platinum Learner 💎",
      250: "Diamond Learner 💎💎",
      500: "Master Learner 👑",
    };
    return badges[level] || "Achievement Unlocked 🏆";
  }
  return "Special Achievement 🌟";
};

/**
 * Get badge description
 */
const getBadgeDescription = (category, level) => {
  if (category === "streak") {
    return `Maintained a ${level}-day learning streak!`;
  } else if (category === "completion") {
    return `Completed ${level} videos! Keep up the great work!`;
  }
  return "Exceptional learning achievement!";
};

/**
 * Get badge icon
 */
const getBadgeIcon = (category) => {
  switch (category) {
    case "streak":
      return "🔥";
    case "completion":
      return "🏆";
    default:
      return "⭐";
  }
};

/**
 * Get initial next badges
 */
const getInitialNextBadges = () => {
  return [
    {
      category: "streak",
      name: "3 Day Streak",
      description: "Maintain streak for 3 days",
      progress: 0,
      target: 3,
      percentage: 0,
    },
    {
      category: "completion",
      name: "Bronze Learner 🥉",
      description: "Complete 10 videos",
      progress: 0,
      target: 10,
      percentage: 0,
    },
  ];
};

// ==================== DAILY ACTIVITY TRACKER ====================

/**
 * Update daily activity (call this when student watches video)
 */
export const updateDailyActivity = async (
  userId,
  watchTimeSeconds,
  videoCompleted = false,
) => {
  try {
    const today = startOfDay(new Date());
    const currentHour = new Date().getHours();

    let analytics = await StudentAnalytics.findOne({ studentId: userId });

    if (!analytics) {
      analytics = new StudentAnalytics({
        studentId: userId,
        dailyActivity: [],
      });
    }

    // Find today's activity
    let todayActivity = analytics.dailyActivity.find(
      (day) => startOfDay(day.date).getTime() === today.getTime(),
    );

    if (!todayActivity) {
      // Initialize hourly breakdown
      const hourlyBreakdown = Array(24).fill(0);
      hourlyBreakdown[currentHour] = watchTimeSeconds;

      todayActivity = {
        date: today,
        watchTime: watchTimeSeconds,
        videosCompleted: videoCompleted ? 1 : 0,
        videosStarted: 1,
        hourlyBreakdown,
      };
      analytics.dailyActivity.push(todayActivity);
    } else {
      todayActivity.watchTime += watchTimeSeconds;
      if (videoCompleted) {
        todayActivity.videosCompleted += 1;
      }
      todayActivity.videosStarted += 1;

      // Update hourly breakdown
      if (!todayActivity.hourlyBreakdown) {
        todayActivity.hourlyBreakdown = Array(24).fill(0);
      }
      todayActivity.hourlyBreakdown[currentHour] =
        (todayActivity.hourlyBreakdown[currentHour] || 0) + watchTimeSeconds;
    }

    // Keep only last 365 days
    if (analytics.dailyActivity.length > 365) {
      analytics.dailyActivity = analytics.dailyActivity.slice(-365);
    }

    await analytics.save();
  } catch (error) {
    console.error("Update daily activity error:", error);
  }
};
// controllers/studentAnalyticsController.js
import StudentAnalytics from "../models/StudentAnalytics.js";
import mongoose from "mongoose";

// @desc    Create new student analytics
// @route   POST /api/student-analytics
// @access  Private
export const createStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Check if analytics already exists for this student
    const existingAnalytics = await StudentAnalytics.findOne({ studentId });
    if (existingAnalytics) {
      return res.status(400).json({
        success: false,
        message: "Analytics already exist for this student",
      });
    }

    const analytics = await StudentAnalytics.create(req.body);
    res.status(201).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all student analytics
// @route   GET /api/student-analytics
// @access  Private/Admin
export const getAllStudentAnalytics = async (req, res) => {
  try {
    const analytics = await StudentAnalytics.find()
      .populate("studentId", "name email")
      .populate("insights.strongestSubject", "name")
      .populate("insights.weakestSubject", "name")
      .populate("subjectPerformance.subjectId", "name");

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single student analytics by student ID
// @route   GET /api/student-analytics/:studentId
// @access  Private
export const getStudentAnalytics = async (req, res) => {
  try {
    const analytics = await StudentAnalytics.findOne({
      studentId: req.params.studentId,
    })
      .populate("studentId", "name email")
      .populate("insights.strongestSubject", "name")
      .populate("insights.weakestSubject", "name")
      .populate("subjectPerformance.subjectId", "name");

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update student analytics
// @route   PUT /api/student-analytics/:studentId
// @access  Private
export const updateStudentAnalytics = async (req, res) => {
  try {
    const analytics = await StudentAnalytics.findOneAndUpdate(
      { studentId: req.params.studentId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete student analytics
// @route   DELETE /api/student-analytics/:studentId
// @access  Private/Admin
export const deleteStudentAnalytics = async (req, res) => {
  try {
    const analytics = await StudentAnalytics.findOneAndDelete({
      studentId: req.params.studentId,
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update daily activity
// @route   POST /api/student-analytics/:studentId/daily-activity
// @access  Private
export const updateDailyActivitys = async (req, res) => {
  try {
    const { date, watchTime, videosCompleted, videosStarted, hourlyBreakdown } =
      req.body;

    const analytics = await StudentAnalytics.findOne({
      studentId: req.params.studentId,
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    // Find if activity for this date exists
    const activityIndex = analytics.dailyActivity.findIndex(
      (activity) =>
        activity.date.toDateString() === new Date(date).toDateString(),
    );

    if (activityIndex > -1) {
      // Update existing activity
      analytics.dailyActivity[activityIndex] = {
        ...analytics.dailyActivity[activityIndex].toObject(),
        watchTime:
          watchTime || analytics.dailyActivity[activityIndex].watchTime,
        videosCompleted:
          videosCompleted ||
          analytics.dailyActivity[activityIndex].videosCompleted,
        videosStarted:
          videosStarted || analytics.dailyActivity[activityIndex].videosStarted,
        hourlyBreakdown:
          hourlyBreakdown ||
          analytics.dailyActivity[activityIndex].hourlyBreakdown,
      };
    } else {
      // Add new activity
      analytics.dailyActivity.push({
        date: new Date(date),
        watchTime: watchTime || 0,
        videosCompleted: videosCompleted || 0,
        videosStarted: videosStarted || 0,
        hourlyBreakdown: hourlyBreakdown || new Array(24).fill(0),
      });
    }

    // Update streak based on activity
    await updateStreak(analytics, new Date(date));

    analytics.lastUpdated = Date.now();
    await analytics.save();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add badge to student
// @route   POST /api/student-analytics/:studentId/badges
// @access  Private
export const addBadge = async (req, res) => {
  try {
    const analytics = await StudentAnalytics.findOne({
      studentId: req.params.studentId,
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    analytics.badges.push(req.body);
    analytics.lastUpdated = Date.now();
    await analytics.save();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update subject performance
// @route   POST /api/student-analytics/:studentId/subject-performance
// @access  Private
export const updateSubjectPerformance = async (req, res) => {
  try {
    const { subjectId, totalWatchTime, completionRate, lastAccessed } =
      req.body;

    const analytics = await StudentAnalytics.findOne({
      studentId: req.params.studentId,
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    const subjectIndex = analytics.subjectPerformance.findIndex(
      (subject) => subject.subjectId.toString() === subjectId,
    );

    if (subjectIndex > -1) {
      // Update existing subject performance
      analytics.subjectPerformance[subjectIndex] = {
        ...analytics.subjectPerformance[subjectIndex].toObject(),
        totalWatchTime:
          totalWatchTime ||
          analytics.subjectPerformance[subjectIndex].totalWatchTime,
        completionRate:
          completionRate ||
          analytics.subjectPerformance[subjectIndex].completionRate,
        lastAccessed: lastAccessed ? new Date(lastAccessed) : new Date(),
      };
    } else {
      // Add new subject performance
      analytics.subjectPerformance.push({
        subjectId,
        totalWatchTime: totalWatchTime || 0,
        completionRate: completionRate || 0,
        lastAccessed: lastAccessed ? new Date(lastAccessed) : new Date(),
      });
    }

    // Update strongest and weakest subjects
    await updateSubjectInsights(analytics);

    analytics.lastUpdated = Date.now();
    await analytics.save();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate weekly summary
// @route   POST /api/student-analytics/:studentId/weekly-summary
// @access  Private
export const generateWeeklySummary = async (req, res) => {
  try {
    const analytics = await StudentAnalytics.findOne({
      studentId: req.params.studentId,
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this student",
      });
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Calculate weekly statistics from daily activities
    const weekActivities = analytics.dailyActivity.filter(
      (activity) => activity.date >= weekStart && activity.date <= weekEnd,
    );

    const totalWatchTime = weekActivities.reduce(
      (sum, activity) => sum + activity.watchTime,
      0,
    );
    const videosCompleted = weekActivities.reduce(
      (sum, activity) => sum + activity.videosCompleted,
      0,
    );
    const averageDailyTime =
      weekActivities.length > 0 ? totalWatchTime / weekActivities.length : 0;

    analytics.weeklySummaries.push({
      weekStart,
      weekEnd,
      totalWatchTime,
      videosCompleted,
      averageDailyTime,
    });

    // Update average daily watch time insight
    const last30DaysActivities = analytics.dailyActivity.filter((activity) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return activity.date >= thirtyDaysAgo;
    });

    if (last30DaysActivities.length > 0) {
      const totalWatchTime30Days = last30DaysActivities.reduce(
        (sum, activity) => sum + activity.watchTime,
        0,
      );
      analytics.insights.averageDailyWatchTime = Math.round(
        totalWatchTime30Days / 30 / 60,
      ); // Convert to minutes
    }

    // Update preferred study time based on hourly breakdown
    await updatePreferredStudyTime(analytics);

    analytics.lastUpdated = Date.now();
    await analytics.save();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper functions
const updateStreak = async (analytics, activityDate) => {
  const lastActive = analytics.streak.lastActiveDate;
  const today = new Date(activityDate);
  today.setHours(0, 0, 0, 0);

  if (!lastActive) {
    // First activity
    analytics.streak.current = 1;
    analytics.streak.longest = 1;
  } else {
    const lastActiveDate = new Date(lastActive);
    lastActiveDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.floor(
      (today - lastActiveDate) / (1000 * 60 * 60 * 24),
    );

    if (dayDifference === 1) {
      // Consecutive day
      analytics.streak.current += 1;
      if (analytics.streak.current > analytics.streak.longest) {
        analytics.streak.longest = analytics.streak.current;
      }
    } else if (dayDifference > 1) {
      // Streak broken
      analytics.streak.current = 1;
    }
    // If dayDifference === 0, same day, don't change streak
  }

  analytics.streak.lastActiveDate = today;
};

const updateSubjectInsights = async (analytics) => {
  if (analytics.subjectPerformance.length === 0) return;

  let strongest = null;
  let weakest = null;
  let highestCompletion = -1;
  let lowestCompletion = 101;

  for (const subject of analytics.subjectPerformance) {
    if (subject.completionRate > highestCompletion) {
      highestCompletion = subject.completionRate;
      strongest = subject.subjectId;
    }
    if (subject.completionRate < lowestCompletion) {
      lowestCompletion = subject.completionRate;
      weakest = subject.subjectId;
    }
  }

  analytics.insights.strongestSubject = strongest;
  analytics.insights.weakestSubject = weakest;

  // Calculate consistency score
  if (analytics.dailyActivity.length > 0) {
    const last30Days = analytics.dailyActivity.slice(-30);
    const activeDays = last30Days.filter((day) => day.watchTime > 0).length;
    analytics.insights.consistencyScore = Math.round((activeDays / 30) * 100);
  }
};

const updatePreferredStudyTime = async (analytics) => {
  if (analytics.dailyActivity.length === 0) return;

  const hourlyTotals = new Array(24).fill(0);
  let totalActivities = 0;

  analytics.dailyActivity.forEach((activity) => {
    if (activity.hourlyBreakdown) {
      activity.hourlyBreakdown.forEach((value, hour) => {
        hourlyTotals[hour] += value;
        totalActivities += value;
      });
    }
  });

  if (totalActivities === 0) return;

  // Find peak hour
  let peakHour = 0;
  let maxActivity = 0;

  hourlyTotals.forEach((value, hour) => {
    if (value > maxActivity) {
      maxActivity = value;
      peakHour = hour;
    }
  });

  // Determine time of day based on peak hour
  if (peakHour >= 5 && peakHour < 12) {
    analytics.insights.preferredStudyTime = "Morning 🌅";
  } else if (peakHour >= 12 && peakHour < 17) {
    analytics.insights.preferredStudyTime = "Afternoon ☀️";
  } else if (peakHour >= 17 && peakHour < 20) {
    analytics.insights.preferredStudyTime = "Evening 🌆";
  } else {
    analytics.insights.preferredStudyTime = "Night 🌙";
  }
};

// ==================== LEADERBOARD CONTROLLERS ====================

/**
 * Get class leaderboard
 * @route GET /api/analytics/leaderboard/class
 * @access Private
 */
export const getClassLeaderboards = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { standardId, limit = 20, period = "all" } = req.query;

    // Get student's class if not provided
    let targetStandardId = standardId;
    if (!targetStandardId) {
      const user = await User.findById(studentId);
      targetStandardId = user.standard;
    }

    // Determine date range based on period
    let dateFilter = {};
    if (period === "weekly") {
      dateFilter = {
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
      };
    } else if (period === "monthly") {
      dateFilter = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
    }

    // Find or generate leaderboard
    let leaderboard = await Leaderboard.findOne({
      type: "class",
      "context.standardId": targetStandardId,
      ...(period !== "all" && {
        "context.period.startDate": dateFilter.startDate,
        "context.period.endDate": dateFilter.endDate,
      }),
    }).populate("entries.studentId", "name email avatar");

    if (!leaderboard) {
      // Generate new leaderboard
      leaderboard = await generateClassLeaderboard(
        targetStandardId,
        period,
        dateFilter,
      );
    }

    // Find current user's rank
    const userEntry = leaderboard.entries.find(
      (entry) => entry.studentId._id.toString() === studentId.toString(),
    );

    // Get top 10
    const topEntries = leaderboard.entries.slice(0, 10);

    // Get nearby entries (5 above and below current user)
    let nearbyEntries = [];
    if (userEntry) {
      const userIndex = leaderboard.entries.findIndex(
        (e) => e.studentId._id.toString() === studentId.toString(),
      );

      const start = Math.max(0, userIndex - 5);
      const end = Math.min(leaderboard.entries.length, userIndex + 6);
      nearbyEntries = leaderboard.entries.slice(start, end);
    }

    res.status(200).json({
      success: true,
      data: {
        leaderboardId: leaderboard._id,
        type: leaderboard.type,
        context: leaderboard.context,
        lastUpdated: leaderboard.lastUpdated,
        totalParticipants: leaderboard.totalParticipants,
        topPerformers: topEntries,
        userRank: userEntry || null,
        nearbyPeers: nearbyEntries,
        userStats: userEntry
          ? {
              rank: userEntry.rank,
              score: userEntry.score,
              previousRank: userEntry.previousRank,
              trend: userEntry.trend,
              breakdown: userEntry.breakdown,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get class leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch class leaderboard",
    });
  }
};

/**
 * Get subject leaderboard
 * @route GET /api/analytics/leaderboard/subject/:subjectId
 * @access Private
 */
export const getSubjectLeaderboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { subjectId } = req.params;
    const { limit = 20, period = "all" } = req.query;

    // Determine date range
    let dateFilter = {};
    if (period === "weekly") {
      dateFilter = {
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
      };
    } else if (period === "monthly") {
      dateFilter = {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      };
    }

    // Find or generate subject leaderboard
    let leaderboard = await Leaderboard.findOne({
      type: "subject",
      "context.subjectId": subjectId,
      ...(period !== "all" && {
        "context.period.startDate": dateFilter.startDate,
        "context.period.endDate": dateFilter.endDate,
      }),
    }).populate("entries.studentId", "name email avatar");

    if (!leaderboard) {
      // Generate new subject leaderboard
      leaderboard = await generateSubjectLeaderboard(
        subjectId,
        period,
        dateFilter,
      );
    }

    // Find current user's rank
    const userEntry = leaderboard.entries.find(
      (entry) => entry.studentId._id.toString() === studentId.toString(),
    );

    res.status(200).json({
      success: true,
      data: {
        leaderboardId: leaderboard._id,
        subjectId,
        lastUpdated: leaderboard.lastUpdated,
        totalParticipants: leaderboard.totalParticipants,
        topPerformers: leaderboard.entries.slice(0, 10),
        userRank: userEntry || null,
        rewards: leaderboard.rewards,
      },
    });
  } catch (error) {
    console.error("Get subject leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subject leaderboard",
    });
  }
};

/**
 * Get global leaderboard
 * @route GET /api/analytics/leaderboard/global
 * @access Private
 */
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Aggregate all students' stats
    const leaderboard = await StudentLeaderboardStats.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.role": "student",
          "user.isActive": true,
        },
      },
      {
        $project: {
          studentId: 1,
          name: "$user.name",
          avatar: "$user.avatar",
          totalPoints: "$overall.totalPoints",
          level: "$overall.level",
          rank: "$overall.rank",
          badges: { $size: "$badges" },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    // Get total count
    const total = await StudentLeaderboardStats.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get global leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch global leaderboard",
    });
  }
};

/**
 * Get student's leaderboard stats
 * @route GET /api/analytics/leaderboard/my-stats
 * @access Private
 */
export const getMyLeaderboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    let stats = await StudentLeaderboardStats.findOne({ studentId })
      .populate("subjectRanks.subjectId", "name")
      .populate("bestRank.contextId");

    if (!stats) {
      // Generate initial stats
      stats = await generateStudentLeaderboardStats(studentId);
    }

    // Get current class rank
    const classLeaderboard = await Leaderboard.findOne({
      type: "class",
      "context.standardId": req.user.standard,
    }).sort({ lastUpdated: -1 });

    const classRank = classLeaderboard?.entries.find(
      (e) => e.studentId.toString() === studentId.toString(),
    );

    res.status(200).json({
      success: true,
      data: {
        overall: stats.overall,
        classRank: classRank || stats.classRank,
        subjectRanks: stats.subjectRanks,
        bestRank: stats.bestRank,
        rankHistory: stats.rankHistory.slice(-10), // Last 10 entries
        nextMilestone: calculateNextRankMilestone(stats.overall.rank),
      },
    });
  } catch (error) {
    console.error("Get my leaderboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leaderboard stats",
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

const generateClassLeaderboard = async (standardId, period, dateFilter) => {
  // Get all students in the class
  const students = await User.find({
    standard: standardId,
    role: "student",
    isActive: true,
  }).select("_id name");

  const entries = [];

  for (const student of students) {
    // Calculate score based on period
    const score = await calculateStudentScore(student._id, period, dateFilter);

    if (score.total > 0) {
      entries.push({
        studentId: student._id,
        score: score.total,
        breakdown: score.breakdown,
        metrics: score.metrics,
        trend: "stable", // Will be calculated later
      });
    }
  }

  // Sort by score and assign ranks
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const leaderboard = await Leaderboard.create({
    type: "class",
    context: {
      standardId,
      period: dateFilter.startDate
        ? {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
          }
        : null,
    },
    entries,
    totalParticipants: entries.length,
    lastUpdated: new Date(),
  });

  return leaderboard;
};

const generateSubjectLeaderboard = async (subjectId, period, dateFilter) => {
  // Get all students who have activity in this subject
  const activities = await DailyActivity.aggregate([
    {
      $match: {
        "subjectBreakdown.subjectId": mongoose.Types.ObjectId(subjectId),
        ...(dateFilter.startDate && {
          date: { $gte: dateFilter.startDate, $lte: dateFilter.endDate },
        }),
      },
    },
    {
      $group: {
        _id: "$studentId",
        totalWatchTime: { $sum: "$totalWatchTime" },
        videosCompleted: { $sum: "$videosCompleted" },
        sessions: { $sum: { $size: "$sessions" } },
      },
    },
  ]);

  const entries = [];

  for (const activity of activities) {
    // Get student details
    const student = await User.findById(activity._id).select("name");

    if (student) {
      // Calculate subject score
      const score =
        activity.videosCompleted * 10 + activity.totalWatchTime / 3600;

      entries.push({
        studentId: activity._id,
        score,
        breakdown: {
          videosCompleted: activity.videosCompleted,
          watchTime: Math.round(activity.totalWatchTime / 3600), // hours
          consistency: activity.sessions,
        },
        metrics: {
          totalVideos: activity.videosCompleted,
          totalWatchTime: activity.totalWatchTime,
        },
      });
    }
  }

  // Sort and rank
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const leaderboard = await Leaderboard.create({
    type: "subject",
    context: {
      subjectId,
      period: dateFilter.startDate
        ? {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
          }
        : null,
    },
    entries,
    totalParticipants: entries.length,
    rewards: generateSubjectRewards(subjectId),
  });

  return leaderboard;
};

const calculateStudentScore = async (studentId, period, dateFilter) => {
  // Get activities
  const activities = await DailyActivity.find({
    studentId,
    ...(dateFilter.startDate && {
      date: { $gte: dateFilter.startDate, $lte: dateFilter.endDate },
    }),
  });

  // Get streak
  const streak = await StudentStreak.findOne({ studentId });

  // Get badges
  const badges = await StudentBadge.find({ studentId });

  // Calculate metrics
  const totalWatchTime = activities.reduce(
    (sum, a) => sum + a.totalWatchTime,
    0,
  );
  const videosCompleted = activities.reduce(
    (sum, a) => sum + a.videosCompleted,
    0,
  );
  const activeDays = activities.filter((a) => a.totalWatchTime > 0).length;

  // Calculate score (customize based on your scoring system)
  const score =
    videosCompleted * 10 +
    (totalWatchTime / 3600) * 5 +
    (streak?.currentStreak || 0) * 2 +
    badges.length * 20 +
    activeDays * 3;

  return {
    total: Math.round(score),
    breakdown: {
      videosCompleted,
      watchTime: Math.round(totalWatchTime / 3600),
      streak: streak?.currentStreak || 0,
      badges: badges.length,
      consistency: activeDays,
    },
    metrics: {
      totalVideos: videosCompleted,
      totalWatchTime,
      currentStreak: streak?.currentStreak || 0,
      badgeCount: badges.length,
      completionRate: activeDays > 0 ? (videosCompleted / activeDays) * 100 : 0,
    },
  };
};

const generateStudentLeaderboardStats = async (studentId) => {
  const stats = await StudentLeaderboardStats.create({
    studentId,
    overall: {
      rank: null,
      percentile: 0,
      totalPoints: 0,
      level: 1,
    },
    subjectRanks: [],
    classRank: {
      rank: null,
      totalStudents: 0,
      percentile: 0,
    },
    rankHistory: [],
  });

  return stats;
};

const generateSubjectRewards = (subjectId) => {
  return [
    {
      rank: 1,
      badgeId: `subject_master_${subjectId}_gold`,
      points: 100,
      description: "Gold Medal - Subject Topper",
    },
    {
      rank: 2,
      badgeId: `subject_master_${subjectId}_silver`,
      points: 75,
      description: "Silver Medal - Subject Excellence",
    },
    {
      rank: 3,
      badgeId: `subject_master_${subjectId}_bronze`,
      points: 50,
      description: "Bronze Medal - Subject Achievement",
    },
  ];
};

const calculateNextRankMilestone = (currentRank) => {
  if (!currentRank) return { nextRank: 10, pointsNeeded: 100 };

  const milestones = [1, 3, 5, 10, 25, 50, 100];
  const nextMilestone = milestones.find((m) => m < currentRank) || 1;

  return {
    nextRank: nextMilestone,
    pointsNeeded: Math.ceil((currentRank - nextMilestone) * 10),
  };
};

import StudentStreak from "../models/StudentStreak.js";
import User from "../models/User.js";
import { startOfDay, subDays } from "date-fns";

// ==================== STREAK CONTROLLERS ====================

/**
 * Get student streak
 * @route GET /api/analytics/streak
 * @access Private
 */
export const getStudentStreak = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find streak for student
    let streak = await StudentStreak.findOne({ studentId });

    // If no streak exists, create one
    if (!streak) {
      streak = await StudentStreak.create({
        studentId,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakHistory: [],
        milestones: [],
      });
    }

    // Calculate current streak
    const calculatedStreak = streak.calculateStreak();

    // Update if needed
    if (calculatedStreak !== streak.currentStreak) {
      streak.currentStreak = calculatedStreak;
      await streak.save();
    }

    // Get next milestone
    const nextMilestone = getNextMilestone(streak.currentStreak);
    const daysToNextMilestone = nextMilestone
      ? nextMilestone - streak.currentStreak
      : 0;

    // Get streak message
    const streakMessage = getStreakMessage(streak.currentStreak);

    res.status(200).json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
        streakFreeze: streak.streakFreeze,
        milestones: streak.milestones,
        nextMilestone,
        daysToNextMilestone,
        streakMessage,
        streakHistory: streak.streakHistory.slice(-10), // Last 10 streaks
      },
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch streak data",
      message: error.message,
    });
  }
};

/**
 * Update student streak (call when student watches video)
 * @route POST /api/analytics/streak/update
 * @access Private
 */
export const updateStreak = async (req, res) => {
  try {
    const studentId = req.user._id;
    const today = startOfDay(new Date());

    // Find or create streak
    let streak = await StudentStreak.findOne({ studentId });

    if (!streak) {
      streak = new StudentStreak({
        studentId,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      });
    }

    const lastActive = streak.lastActiveDate
      ? startOfDay(streak.lastActiveDate)
      : null;
    const yesterday = startOfDay(subDays(new Date(), 1));

    // Store previous streak for history
    const previousStreak = streak.currentStreak;

    // Streak calculation logic
    if (!lastActive) {
      // First time activity
      streak.currentStreak = 1;

      // Add to streak history
      streak.streakHistory.push({
        startDate: today,
        endDate: today,
        streakLength: 1,
        isActive: true,
      });
    } else if (lastActive.getTime() === yesterday.getTime()) {
      // Active yesterday → increment streak
      streak.currentStreak += 1;

      // Update current streak in history
      const activeStreak = streak.streakHistory.find((s) => s.isActive);
      if (activeStreak) {
        activeStreak.endDate = today;
        activeStreak.streakLength = streak.currentStreak;
      }
    } else if (lastActive.getTime() === today.getTime()) {
      // Already active today → no change
      // Do nothing
    } else {
      // Streak broken
      // Close previous streak
      const activeStreak = streak.streakHistory.find((s) => s.isActive);
      if (activeStreak) {
        activeStreak.isActive = false;
      }

      // Start new streak
      streak.currentStreak = 1;
      streak.streakHistory.push({
        startDate: today,
        endDate: today,
        streakLength: 1,
        isActive: true,
      });
    }

    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    // Update last active date
    streak.lastActiveDate = new Date();

    // Check and add milestones
    await checkAndAddMilestones(streak);

    // Keep only last 20 streak history entries
    if (streak.streakHistory.length > 20) {
      streak.streakHistory = streak.streakHistory.slice(-20);
    }

    await streak.save();

    // Prepare response
    const response = {
      success: true,
      data: {
        previousStreak,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
        streakIncreased: streak.currentStreak > previousStreak,
        streakBroken: streak.currentStreak === 1 && previousStreak > 1,
        message: getStreakMessage(streak.currentStreak),
        newMilestones: streak.milestones.filter(
          (m) => m.achievedAt > new Date(Date.now() - 1000), // Achieved in last second
        ),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Update streak error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update streak",
      message: error.message,
    });
  }
};

/**
 * Reset streak (admin only)
 * @route POST /api/analytics/streak/reset
 * @access Private/Admin
 */
export const resetStreak = async (req, res) => {
  try {
    const { studentId } = req.body;

    const streak = await StudentStreak.findOne({ studentId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        error: "Streak not found",
      });
    }

    // Close active streak
    const activeStreak = streak.streakHistory.find((s) => s.isActive);
    if (activeStreak) {
      activeStreak.isActive = false;
    }

    // Reset values
    streak.currentStreak = 0;
    streak.lastActiveDate = null;

    await streak.save();

    res.status(200).json({
      success: true,
      message: "Streak reset successfully",
      data: streak,
    });
  } catch (error) {
    console.error("Reset streak error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset streak",
    });
  }
};

/**
 * Update streak freeze (premium feature)
 * @route POST /api/analytics/streak/freeze
 * @access Private
 */
export const updateStreakFreeze = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { activate } = req.body;

    const streak = await StudentStreak.findOne({ studentId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        error: "Streak not found",
      });
    }

    if (activate) {
      // Activate freeze
      streak.streakFreeze.isActive = true;
      streak.streakFreeze.freezeCount += 1;
      streak.streakFreeze.lastFrozenDate = new Date();

      // Expires in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      streak.streakFreeze.expiresAt = expiresAt;
    } else {
      // Deactivate freeze
      streak.streakFreeze.isActive = false;
      streak.streakFreeze.expiresAt = null;
    }

    await streak.save();

    res.status(200).json({
      success: true,
      data: streak.streakFreeze,
    });
  } catch (error) {
    console.error("Update streak freeze error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update streak freeze",
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

const getNextMilestone = (currentStreak) => {
  const milestones = [3, 7, 15, 30, 50, 100, 200, 365];
  return milestones.find((m) => m > currentStreak) || null;
};

const getStreakMessage = (streak) => {
  if (streak === 0) return "Start your learning journey today! 🔥";
  if (streak === 1) return "Great start! Come back tomorrow! 💪";
  if (streak < 3) return `${streak} day streak! Keep going! 🔥`;
  if (streak < 7) return `${streak} days! You're on fire! 🔥🔥`;
  if (streak < 15) return `${streak} day streak! Amazing consistency! 🚀`;
  if (streak < 30) return `${streak} days! You're unstoppable! 🌟`;
  if (streak < 50) return `${streak} days! Legendary status! 👑`;
  if (streak < 100) return `${streak} days! You're a learning machine! 🤖`;
  if (streak < 365) return `${streak} days! Elite learner! ⭐`;
  return `${streak} days! ULTIMATE CHAMPION! 🏆`;
};

const checkAndAddMilestones = async (streak) => {
  const milestoneDays = [3, 7, 15, 30, 50, 100, 200, 365];

  for (const days of milestoneDays) {
    if (streak.currentStreak === days) {
      // Check if milestone already exists
      const existingMilestone = streak.milestones.find((m) => m.days === days);

      if (!existingMilestone) {
        streak.milestones.push({
          days,
          achievedAt: new Date(),
          badgeAwarded: true,
        });
      }
    }
  }
};
