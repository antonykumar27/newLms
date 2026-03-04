// controllers/analytics/studentProgressGet/helpers/streakHelpers.js

const {
  STREAK_MILESTONES,
  STREAK_MESSAGES,
  STUDY_TIMES,
} = require("./analyticsConstants");

/**
 * Get next streak milestone
 * @param {number} currentStreak - Current streak count
 * @returns {number} Next milestone value
 */
exports.getNextMilestone = (currentStreak) => {
  const milestones = STREAK_MILESTONES || [3, 7, 15, 30, 50, 100, 200, 365];

  // Find the next milestone greater than current streak
  const nextMilestone = milestones.find((m) => m > currentStreak);

  // If no next milestone found (beyond max), return the last milestone
  return nextMilestone || milestones[milestones.length - 1];
};

/**
 * Get streak message based on current streak
 * @param {number} streak - Current streak count
 * @returns {string} Motivational streak message
 */
exports.getStreakMessage = (streak) => {
  // Specific messages for certain streak values
  if (streak === 0) return "Start your learning journey today! 🔥";
  if (streak === 1) return "Great start! Come back tomorrow! 💪";
  if (streak === 2) return "2 day streak! Keep the momentum! 🔥";

  // Dynamic messages based on streak ranges
  if (streak < 3) return `${streak} day streak! Keep going! 🔥`;
  if (streak < 7) return `${streak} days! You're on fire! 🔥🔥`;
  if (streak < 15) return `${streak} day streak! Amazing consistency! 🚀`;
  if (streak < 30) return `${streak} days! You're unstoppable! 🌟`;
  if (streak < 50) return `${streak} days! Legendary status! 👑`;
  if (streak < 100) return `${streak} days! You're a learning machine! 🤖`;
  if (streak < 200) return `${streak} days! Elite learner! ⭐`;
  if (streak < 365) return `${streak} days! approaching the year mark! 📆`;

  return `${streak} days! ULTIMATE CHAMPION! 🏆`;
};

/**
 * Get preferred study time based on user activity
 * @param {Array} userProgress - User progress data with timestamps
 * @returns {string} Preferred time of day
 */
exports.getPreferredStudyTime = (userProgress) => {
  if (!userProgress || userProgress.length === 0) return "Not enough data 📊";

  const hourCounts = Array(24).fill(0);

  // Count activities per hour
  userProgress.forEach((p) => {
    if (p.date) {
      const hour = new Date(p.date).getHours();
      hourCounts[hour] += 1;
    }
  });

  // Find the hour with most activity
  const maxHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Determine time of day based on peak hour
  if (maxHour >= 5 && maxHour < 12) return "Morning 🌅";
  if (maxHour >= 12 && maxHour < 17) return "Afternoon ☀️";
  if (maxHour >= 17 && maxHour < 20) return "Evening 🌆";
  if (maxHour >= 20 || maxHour < 5) return "Night 🌙";

  return "Anytime Learner ⏰";
};

/**
 * Get next milestones for user
 * @param {Object} user - User object with progress data
 * @param {number} totalPages - Total pages available
 * @returns {Array} Next milestone objects
 */
exports.getNextMilestones = (user, totalPages) => {
  const milestones = [];
  const completedPages = user?.completedPages?.length || 0;
  const currentStreak = user?.currentStreak || 0;

  // Page completion milestones
  const pageMilestones = [10, 25, 50, 100, 250, 500];
  for (const target of pageMilestones) {
    if (completedPages < target) {
      milestones.push({
        type: "pages",
        target,
        current: completedPages,
        remaining: target - completedPages,
        progress: Math.min(100, Math.round((completedPages / target) * 100)),
        title: `Complete ${target} Pages`,
        description: `You've completed ${completedPages} out of ${target} pages`,
        icon: "📄",
      });
      break; // Only show the next page milestone
    }
  }

  // Streak milestones
  const streakMilestones = [3, 7, 15, 30, 50, 100, 200, 365];
  for (const target of streakMilestones) {
    if (currentStreak < target) {
      milestones.push({
        type: "streak",
        target,
        current: currentStreak,
        remaining: target - currentStreak,
        progress: Math.min(100, Math.round((currentStreak / target) * 100)),
        title: `${target}-Day Streak`,
        description: `You're on a ${currentStreak}-day streak! ${target - currentStreak} more days to go!`,
        icon: "🔥",
      });
      break; // Only show the next streak milestone
    }
  }

  // Quiz score milestone (if user has quiz attempts)
  const quizScoreMilestones = [50, 60, 70, 80, 90, 100];
  // This would need quiz data passed in - can be enhanced later

  return milestones;
};

/**
 * Calculate streak freeze status
 * @param {Object} streak - Streak object
 * @returns {Object} Streak freeze information
 */
exports.getStreakFreezeInfo = (streak) => {
  if (!streak || !streak.streakFreeze) {
    return {
      isActive: false,
      freezesAvailable: 0,
      nextFreezeAvailable: null,
    };
  }

  return {
    isActive: streak.streakFreeze.isActive || false,
    freezesAvailable: streak.streakFreeze.count || 0,
    expiresAt: streak.streakFreeze.expiresAt,
    daysRemaining: streak.streakFreeze.expiresAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(streak.streakFreeze.expiresAt) - new Date()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0,
  };
};

/**
 * Calculate streak history for chart
 * @param {Array} streakHistory - Streak history data
 * @returns {Object} Formatted streak history
 */
exports.formatStreakHistory = (streakHistory) => {
  if (!streakHistory || streakHistory.length === 0) {
    return { labels: [], data: [] };
  }

  const last30Days = streakHistory.slice(-30);

  return {
    labels: last30Days.map((day) =>
      new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    ),
    data: last30Days.map((day) => day.streak),
    milestones: last30Days
      .filter((day) => STREAK_MILESTONES.includes(day.streak))
      .map((day) => ({
        date: day.date,
        streak: day.streak,
      })),
  };
};

/**
 * Get streak statistics
 * @param {Object} streak - Streak object
 * @returns {Object} Streak statistics
 */
exports.getStreakStats = (streak) => {
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const nextMilestone = this.getNextMilestone(currentStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    nextMilestone,
    daysToNextMilestone: nextMilestone - currentStreak,
    percentageToNextMilestone: Math.min(
      100,
      Math.round((currentStreak / nextMilestone) * 100),
    ),
    isAtRisk: streak?.lastActiveDate
      ? new Date() - new Date(streak.lastActiveDate) > 48 * 60 * 60 * 1000
      : false, // 48 hours
    freezeInfo: this.getStreakFreezeInfo(streak),
  };
};

/**
 * Calculate study consistency over time
 * @param {Array} userProgress - User progress data
 * @param {number} days - Number of days to analyze
 * @returns {Object} Consistency metrics
 */
exports.calculateStudyConsistency = (userProgress, days = 30) => {
  if (!userProgress || userProgress.length === 0) {
    return {
      dailyAverage: 0,
      weeklyAverage: 0,
      mostConsistentDay: null,
      leastConsistentDay: null,
    };
  }

  const now = new Date();
  const dayOfWeekCount = Array(7).fill(0);
  const dayOfWeekActive = Array(7).fill(0);

  userProgress.forEach((p) => {
    if (p.date) {
      const date = new Date(p.date);
      const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (daysAgo <= days) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        dayOfWeekCount[dayOfWeek]++;
        if (p.timeSpent > 0) {
          dayOfWeekActive[dayOfWeek]++;
        }
      }
    }
  });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const consistencyByDay = dayOfWeekActive.map((active, index) => ({
    day: daysOfWeek[index],
    active: active,
    total: dayOfWeekCount[index],
    percentage:
      dayOfWeekCount[index] > 0
        ? Math.round((active / dayOfWeekCount[index]) * 100)
        : 0,
  }));

  const sortedByPercentage = [...consistencyByDay].sort(
    (a, b) => b.percentage - a.percentage,
  );

  return {
    dailyAverage: userProgress.length / days,
    weeklyAverage: userProgress.length / (days / 7),
    mostConsistentDay: sortedByPercentage[0],
    leastConsistentDay: sortedByPercentage[sortedByPercentage.length - 1],
    consistencyByDay,
  };
};

/**
 * Get motivational message based on streak and progress
 * @param {number} streak - Current streak
 * @param {number} completedPages - Completed pages
 * @param {number} totalPages - Total pages
 * @returns {string} Personalized motivational message
 */
exports.getPersonalizedMotivation = (streak, completedPages, totalPages) => {
  const completionPercentage =
    totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;

  if (streak === 0) {
    return "Ready to start your learning journey? Watch your first video today! 🎬";
  }

  if (streak === 1) {
    return "Great start! Come back tomorrow to build your streak! 🔥";
  }

  if (streak >= 30 && completionPercentage < 20) {
    return "You're consistent! Time to dive deeper into the content? 📚";
  }

  if (streak >= 7 && completionPercentage >= 50) {
    return "You're on fire! Halfway there! Keep going! 🚀";
  }

  if (completionPercentage >= 90) {
    return "Almost done! The finish line is in sight! 🏁";
  }

  if (streak >= 100) {
    return "You're a legend! Your dedication is inspiring! 👑";
  }

  return this.getStreakMessage(streak);
};
