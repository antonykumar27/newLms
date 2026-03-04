// helpers/calculations.js

const { formatDuration } = require("./formatters");

/**
 * Calculate overall statistics
 */
exports.calculateOverallStats = ({
  watchTime,
  quizAttempts,
  userProgress,
  user,
  streak,
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

  // Calculate overall score
  const overallScore = this.calculateLeaderboardScore({
    watchTime,
    quizAttempts,
    streak: streak?.currentStreak || 0,
    badges: user?.badges?.length || 0,
  });

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
      formattedTotalTime: formatDuration(totalWatchTimeSeconds),
      averageWatchTimePerVideo:
        watchTime.length > 0
          ? Math.round(totalWatchTimeSeconds / watchTime.length / 60) // minutes
          : 0,
    },
    engagement: {
      currentStreak: streak?.currentStreak || 0,
      maxStreak: streak?.longestStreak || 0,
      activeDays,
      consistencyScore:
        activeDays > 0 ? Math.round((activeDays / 30) * 100) : 0,
      lastActive: user?.lastActiveDate,
    },
    achievements: {
      badges: user?.badges?.length || 0,
      chaptersCompleted: user?.completedChapters?.length || 0,
      subjectsCompleted: user?.completedSubjects?.length || 0,
      pagesCompleted: completedPages,
      totalPages,
      overallCompletion,
    },
    overallScore,
    level: Math.floor(overallScore / 1000) + 1,
    nextLevelScore: (Math.floor(overallScore / 1000) + 1) * 1000,
    pointsToNextLevel:
      (Math.floor(overallScore / 1000) + 1) * 1000 - overallScore,
  };
};

/**
 * Calculate leaderboard score
 */
exports.calculateLeaderboardScore = ({
  watchTime,
  quizAttempts,
  streak,
  badges,
}) => {
  const videoScore = watchTime.reduce(
    (sum, w) => sum + (w.completed ? 10 : w.progress * 0.1),
    0,
  );
  const quizScore =
    quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) * 0.5;
  const streakBonus = streak * 5;
  const badgeBonus = badges * 20;

  return Math.round(videoScore + quizScore + streakBonus + badgeBonus);
};

/**
 * Calculate percentile
 */
exports.calculatePercentile = (rank, total) => {
  if (!rank || !total) return 0;
  return Math.round(((total - rank) / total) * 100);
};

/**
 * Calculate most productive hour
 */
exports.calculateMostProductiveHour = (userProgress) => {
  const hourCounts = Array(24).fill(0);

  userProgress.forEach((p) => {
    if (p.date) {
      const hour = new Date(p.date).getHours();
      hourCounts[hour] += p.timeSpent || 0;
    }
  });

  const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
  return maxHour !== -1 ? maxHour : 12;
};

/**
 * Get heatmap intensity
 */
exports.getHeatmapIntensity = (watchTime) => {
  if (watchTime === 0) return 0;
  if (watchTime < 900) return 1; // < 15 min
  if (watchTime < 1800) return 2; // 15-30 min
  if (watchTime < 3600) return 3; // 30-60 min
  return 4; // > 60 min
};
