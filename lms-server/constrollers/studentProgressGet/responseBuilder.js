// services/responseBuilder.js

const {
  calculateOverallStats,
  calculateMostProductiveHour,
  //   calculatePercentile,
} = require("./calculations");
const { buildContentHierarchy } = require("./hierarchyBuilder");
const { formatDuration, timeAgo } = require("./formatters");

const {
  getHeatmapIntensity,
  getHeatmapColor,
  calculateHeatmapSummary,
} = require("./heatmapHelpers");
// services/responseBuilder.js

const {
  getNextMilestone,
  getStreakMessage,
  getPreferredStudyTime,
  getNextMilestones,
  getStreakStats,
  getPersonalizedMotivation,
} = require("./streakHelpers");
// services/responseBuilder.js

const {
  formatBadgeForDisplay,
  getNextBadge,
  calculateBadgeProgress,
} = require("./badgeHelpers");

exports.buildAchievementsSection = (
  earnedBadges,
  badgeProgress,
  user,
  subjects,
  chapters,
  pages,
) => {
  return {
    badges: {
      total: earnedBadges.length,
      earned: earnedBadges.map((b) => formatBadgeForDisplay(b)),
      inProgress: badgeProgress.map((b) => ({
        ...b,
        progressInfo: calculateBadgeProgress(b.currentValue, b.targetValue),
        nextBadge: getNextBadge(b.category, b.currentValue),
      })),
    },
    completed: {
      subjects: user.completedSubjects?.length || 0,
      chapters: user.completedChapters?.length || 0,
      pages: user.completedPages?.length || 0,
      totalSubjects: subjects.length,
      totalChapters: chapters.length,
      totalPages: pages.length,
      overallCompletion: pages.length
        ? Math.round(((user.completedPages?.length || 0) / pages.length) * 100)
        : 0,
    },
    nextMilestones: getNextMilestones(user, pages.length),
  };
};
exports.buildStreakSection = (streak, user, userProgress, totalPages) => {
  const stats = getStreakStats(streak);
  const preferredTime = getPreferredStudyTime(userProgress);
  const milestones = getNextMilestones(user, totalPages);

  return {
    current: stats.current,
    longest: stats.longest,
    lastActiveDate: streak?.lastActiveDate || user.lastActiveDate,
    freezeActive: streak?.streakFreeze?.isActive || false,
    freezeInfo: stats.freezeInfo,
    milestones: streak?.milestones || [],
    nextMilestone: stats.nextMilestone,
    daysToNextMilestone: stats.daysToNextMilestone,
    percentageToNextMilestone: stats.percentageToNextMilestone,
    message: getStreakMessage(stats.current),
    personalizedMessage: getPersonalizedMotivation(
      stats.current,
      user.completedPages?.length || 0,
      totalPages,
    ),
    preferredStudyTime: preferredTime,
    isAtRisk: stats.isAtRisk,
    stats: {
      ...stats,
      studyTimePreference: preferredTime,
    },
    upcomingMilestones: milestones,
  };
};
/**
 * Builds the complete response object
 */
exports.buildResponse = (data, queryParams, enrollment, sections) => {
  const {
    user,
    streak,
    subjects,
    chapters,
    pages,
    videos,
    watchTimeProgress,
    quizAttempts,
    userProgress,
    dailyUniqueStats,
    earnedBadges,
    badgeProgress,
    classLeaderboard,
    subjectLeaderboard,
    heatmapData,
  } = data;

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
    view = "comprehensive",
    heatmapYear = new Date().getFullYear(),
  } = queryParams;

  // Apply filters
  const filteredWatchTime = this.applyFilters(watchTimeProgress, {
    search,
    completionStatus,
  });

  // Base response
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      joinedAt: user.createdAt,
    },
    standard: {
      id: enrollment.standard._id,
      name: enrollment.standard.standard,
      description: enrollment.standard.description,
    },
    filters: {
      applied: {
        standardId: standardId || enrollment.standard._id,
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
        contentTypes: ["video", "quiz", "article", "interactive", "pdf"],
      },
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalItems: watchTimeProgress.length,
    },
  };

  // Add requested sections
  if (sections.includes("overall")) {
    response.overall = calculateOverallStats({
      watchTime: filteredWatchTime,
      quizAttempts,
      userProgress,
      user,
      streak,
      totalContent: {
        subjects: subjects.length,
        chapters: chapters.length,
        pages: pages.length,
        videos: videos.length,
      },
    });
  }

  if (sections.includes("streak")) {
    response.streak = this.buildStreakSection(streak, user);
  }

  if (sections.includes("watchtime")) {
    response.watchTime = this.buildWatchTimeSection(filteredWatchTime);
  }

  if (sections.includes("quiz")) {
    response.quiz = this.buildQuizSection(quizAttempts);
  }

  if (sections.includes("content")) {
    response.content = buildContentHierarchy({
      subjects,
      chapters,
      pages,
      videos,
      watchTime: filteredWatchTime,
      quizAttempts,
      user,
    });
  }

  if (sections.includes("engagement")) {
    response.engagement = this.buildEngagementSection(
      userProgress,
      streak,
      user,
    );
  }

  if (sections.includes("achievements")) {
    response.achievements = this.buildAchievementsSection(
      earnedBadges,
      badgeProgress,
      user,
      subjects,
      chapters,
      pages,
    );
  }

  if (sections.includes("leaderboard")) {
    response.leaderboard = this.buildLeaderboardSection(
      classLeaderboard,
      subjectLeaderboard,
      user,
      filteredWatchTime,
      quizAttempts,
      streak,
      earnedBadges,
    );
  }

  if (sections.includes("heatmap")) {
    response.heatmap = this.buildHeatmapSection(heatmapData, heatmapYear);
  }

  if (sections.includes("activity")) {
    response.recentActivity = this.buildActivitySection(
      userProgress,
      pages,
      chapters,
      subjects,
    );
  }

  if (sections.includes("analytics")) {
    response.analytics = this.buildAnalyticsSection(dailyUniqueStats);
  }

  // Add view-specific responses
  if (view === "summary") {
    response.summary = this.buildSummaryView(
      user,
      streak,
      filteredWatchTime,
      pages,
      badgeProgress,
      response.recentActivity,
    );
  }

  if (view === "mobile") {
    response.mobile = this.buildMobileView(
      user,
      streak,
      enrollment,
      filteredWatchTime,
      badgeProgress,
    );
  }

  return response;
};

/**
 * Apply search and completion filters
 */
exports.applyFilters = (watchTimeProgress, { search, completionStatus }) => {
  let filtered = [...watchTimeProgress];

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filtered = filtered.filter(
      (w) =>
        w.videoId?.title?.match(searchRegex) ||
        w.page?.title?.match(searchRegex) ||
        w.chapter?.title?.match(searchRegex) ||
        w.subject?.name?.match(searchRegex),
    );
  }

  if (completionStatus) {
    filtered = filtered.filter((w) => {
      if (completionStatus === "completed") return w.completed;
      if (completionStatus === "inProgress")
        return !w.completed && w.progress > 0;
      if (completionStatus === "notStarted") return w.progress === 0;
      return true;
    });
  }

  return filtered;
};

// Section builders (add more as needed)
exports.buildStreakSection = (streak, user) => ({
  current: streak?.currentStreak || 0,
  longest: streak?.longestStreak || 0,
  lastActiveDate: streak?.lastActiveDate || user.lastActiveDate,
  freezeActive: streak?.streakFreeze?.isActive || false,
  milestones: streak?.milestones || [],
  nextMilestone: getNextMilestone(streak?.currentStreak || 0),
  daysToNextMilestone:
    getNextMilestone(streak?.currentStreak || 0) -
      (streak?.currentStreak || 0) || 0,
  message: getStreakMessage(streak?.currentStreak || 0),
});

exports.buildWatchTimeSection = (watchTime) => ({
  summary: {
    total: watchTime.length,
    completed: watchTime.filter((w) => w.completed).length,
    inProgress: watchTime.filter((w) => !w.completed && w.progress > 0).length,
    notStarted: watchTime.filter((w) => w.progress === 0).length,
    totalWatchTime: watchTime.reduce(
      (sum, w) => sum + (w.totalWatchedSeconds || 0),
      0,
    ),
    formattedTotalTime: formatDuration(
      watchTime.reduce((sum, w) => sum + (w.totalWatchedSeconds || 0), 0),
    ),
    averageProgress: watchTime.length
      ? Math.round(
          watchTime.reduce((sum, w) => sum + (w.progress || 0), 0) /
            watchTime.length,
        )
      : 0,
  },
  items: watchTime.slice(0, 20).map((item) => ({
    id: item._id,
    videoId: item.videoId?._id,
    videoTitle: item.videoId?.title,
    pageId: item.page?._id,
    pageTitle: item.page?.title,
    chapterId: item.chapter?._id,
    chapterTitle: item.chapter?.title,
    chapterNumber: item.chapter?.chapterNumber,
    subjectId: item.subject?._id,
    subjectName: item.subject?.name || item.subject?.subject,
    progress: item.progress,
    completed: item.completed,
    watchTime: item.totalWatchedSeconds,
    formattedWatchTime: formatDuration(item.totalWatchedSeconds),
    lastWatchedAt: item.lastWatchedAt,
    lastWatchedFromNow: item.lastWatchedAt ? timeAgo(item.lastWatchedAt) : null,
  })),
});
exports.buildHeatmapSection = (heatmapData, heatmapYear) => {
  const formattedData = heatmapData.map((d) => ({
    date: d._id,
    intensity: d.intensity,
    videosCompleted: d.videosCompleted,
    intensityLevel: getHeatmapIntensity(d.intensity),
    color: getHeatmapColor(getHeatmapIntensity(d.intensity)),
  }));

  const summary = calculateHeatmapSummary(formattedData);

  return {
    year: heatmapYear,
    data: formattedData,
    summary: {
      totalActiveDays: summary.totalActiveDays,
      totalWatchTime: summary.totalWatchTime,
      averageDailyWatchTime: summary.averageDailyWatchTime,
      bestDay: summary.bestDay,
      streaks: summary.streaks,
      consistency: summary.consistency,
    },
  };
};
// services/responseBuilder.js

// ... existing imports ...

/**
 * Build Quiz Section
 */
exports.buildQuizSection = (quizAttempts) => {
  const quizScores = quizAttempts.map((q) => q.score || 0);
  const averageScore = quizAttempts.length
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizAttempts.length)
    : 0;

  const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
  const passRate = quizAttempts.length
    ? Math.round((passedQuizzes / quizAttempts.length) * 100)
    : 0;

  return {
    summary: {
      totalAttempts: quizAttempts.length,
      averageScore,
      passRate,
      bestScore: Math.max(...quizScores, 0) || 0,
      totalQuestions: quizAttempts.reduce(
        (sum, q) => sum + (q.totalQuestions || 0),
        0,
      ),
      correctAnswers: quizAttempts.reduce(
        (sum, q) => sum + (q.correctAnswers || 0),
        0,
      ),
    },
    recentAttempts: quizAttempts.slice(0, 5).map((q) => ({
      id: q._id,
      quizId: q.quizId,
      quizTitle: q.quizTitle,
      score: q.score,
      passed: q.passed,
      totalQuestions: q.totalQuestions,
      correctAnswers: q.correctAnswers,
      timeTaken: q.timeTaken,
      completedAt: q.createdAt,
      percentage: q.totalQuestions
        ? Math.round((q.correctAnswers / q.totalQuestions) * 100)
        : 0,
    })),
    performance: {
      byDifficulty: this.groupQuizzesByDifficulty(quizAttempts),
      bySubject: this.groupQuizzesBySubject(quizAttempts),
      trend: this.calculateQuizTrend(quizAttempts),
    },
  };
};

/**
 * Build Engagement Section
 */
exports.buildEngagementSection = (userProgress, streak, user) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity =
    userProgress?.filter((p) => p.date && new Date(p.date) >= thirtyDaysAgo) ||
    [];

  const activeDays = new Set(
    recentActivity.map((a) => new Date(a.date).toISOString().split("T")[0]),
  ).size;

  const totalTimeSpent = userProgress.reduce(
    (sum, p) => sum + (p.timeSpent || 0),
    0,
  );
  const averageDailyTime =
    activeDays > 0 ? Math.round(totalTimeSpent / activeDays / 60) : 0;

  return {
    currentStreak: streak?.currentStreak || 0,
    maxStreak: streak?.longestStreak || 0,
    activeDays,
    consistencyScore: activeDays > 0 ? Math.round((activeDays / 30) * 100) : 0,
    lastActive: user.lastActiveDate,
    totalSessions: userProgress.length,
    totalTimeSpent: formatDuration(totalTimeSpent),
    averageDailyTime: `${averageDailyTime} min`,
    mostProductiveHour: calculateMostProductiveHour(userProgress),
    preferredStudyTime: getPreferredStudyTime(userProgress),
    weeklyActivity: this.calculateWeeklyActivity(userProgress),
  };
};

/**
 * Build Leaderboard Section
 */
exports.buildLeaderboardSection = (
  classLeaderboard,
  subjectLeaderboard,
  user,
  watchTime,
  quizAttempts,
  streak,
  earnedBadges,
) => {
  const userId = user._id.toString();

  const findUserRank = (leaderboard) => {
    if (!leaderboard) return null;
    const entry = leaderboard.entries?.find(
      (e) => e.studentId?.toString() === userId || e.studentId === userId,
    );
    return entry;
  };

  const classEntry = findUserRank(classLeaderboard);
  const subjectEntry = findUserRank(subjectLeaderboard);

  const calculatePercentile = (rank, total) => {
    if (!rank || !total) return 0;
    return Math.round(((total - rank) / total) * 100);
  };

  return {
    class: classLeaderboard
      ? {
          rank: classEntry?.rank || "N/A",
          score: classEntry?.score || 0,
          totalParticipants: classLeaderboard.totalParticipants || 0,
          percentile: calculatePercentile(
            classEntry?.rank,
            classLeaderboard.totalParticipants,
          ),
          topPerformers:
            classLeaderboard.entries?.slice(0, 5).map((e) => ({
              rank: e.rank,
              name: e.studentId?.name || "Student",
              score: e.score,
            })) || [],
        }
      : null,

    subject: subjectLeaderboard
      ? {
          rank: subjectEntry?.rank || "N/A",
          score: subjectEntry?.score || 0,
          totalParticipants: subjectLeaderboard.totalParticipants || 0,
          percentile: calculatePercentile(
            subjectEntry?.rank,
            subjectLeaderboard.totalParticipants,
          ),
        }
      : null,

    overallScore: this.calculateLeaderboardScore({
      watchTime,
      quizAttempts,
      streak: streak?.currentStreak || 0,
      badges: earnedBadges.length,
    }),

    rankChange: classEntry?.rankChange || 0,
    nextRankTarget: this.calculateNextRankTarget(classEntry, classLeaderboard),
  };
};

/**
 * Build Activity Section
 */
exports.buildActivitySection = (userProgress, pages, chapters, subjects) => {
  return userProgress
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20)
    .map((activity) => ({
      id: activity._id,
      type: activity.type || "page_view",
      contentType: activity.contentType,
      pageId: activity.pageId,
      pageTitle: pages.find(
        (p) => p._id.toString() === activity.pageId?.toString(),
      )?.title,
      chapterId: activity.chapterId,
      chapterTitle: chapters.find(
        (c) => c._id.toString() === activity.chapterId?.toString(),
      )?.title,
      subjectId: activity.subjectId,
      subjectName: subjects.find(
        (s) => s._id.toString() === activity.subjectId?.toString(),
      )?.subject,
      timeSpent: activity.timeSpent,
      formattedTime: formatDuration(activity.timeSpent),
      timestamp: activity.date,
      timeAgo: timeAgo(activity.date),
      details: activity.details,
      icon: this.getActivityIcon(activity.type),
    }));
};

/**
 * Build Analytics Section
 */
exports.buildAnalyticsSection = (dailyUniqueStats) => {
  const totalWatchTime = dailyUniqueStats.reduce(
    (sum, d) => sum + d.totalWatchTime,
    0,
  );
  const totalUniqueVideos = dailyUniqueStats.reduce(
    (sum, d) => sum + d.uniqueVideos,
    0,
  );

  return {
    dailyUnique: dailyUniqueStats.map((d) => ({
      date: d._id,
      uniqueVideos: d.uniqueVideos,
      totalWatchTime: d.totalWatchTime,
      formattedWatchTime: formatDuration(d.totalWatchTime),
      completions: d.completions || 0,
    })),
    summary: {
      totalUniqueVideos,
      averageDailyVideos: dailyUniqueStats.length
        ? Math.round(totalUniqueVideos / dailyUniqueStats.length)
        : 0,
      totalWatchTime: formatDuration(totalWatchTime),
      averageDailyWatchTime: dailyUniqueStats.length
        ? formatDuration(Math.round(totalWatchTime / dailyUniqueStats.length))
        : "0 min",
      mostActiveDay: this.findMostActiveDay(dailyUniqueStats),
    },
  };
};

/**
 * Build Summary View
 */
exports.buildSummaryView = (
  user,
  streak,
  watchTime,
  pages,
  badgeProgress,
  recentActivity,
) => {
  const completedPages = user.completedPages?.length || 0;
  const totalPages = pages.length;

  return {
    streak: streak?.currentStreak || 0,
    completedVideos: watchTime.filter((w) => w.completed).length,
    totalWatchTime: formatDuration(
      watchTime.reduce((sum, w) => sum + (w.totalWatchedSeconds || 0), 0),
    ),
    overallProgress: totalPages
      ? Math.round((completedPages / totalPages) * 100)
      : 0,
    nextBadge: badgeProgress[0] || null,
    recentActivity: recentActivity?.slice(0, 3) || [],
    quickStats: {
      quizzesTaken: 0, // This would come from quiz data
      achievements: user.badges?.length || 0,
      daysActive: streak?.currentStreak || 0,
    },
  };
};

/**
 * Build Mobile View
 */
exports.buildMobileView = (
  user,
  streak,
  enrollment,
  watchTime,
  badgeProgress,
) => {
  const inProgress = watchTime.filter((w) => !w.completed && w.progress > 0);

  return {
    header: {
      name: user.name.split(" ")[0],
      streak: streak?.currentStreak || 0,
      class: enrollment.standard.standard,
      avatar: user.avatar,
    },
    stats: {
      completed: watchTime.filter((w) => w.completed).length,
      inProgress: inProgress.length,
      watchTime: formatDuration(
        watchTime.reduce((sum, w) => sum + (w.totalWatchedSeconds || 0), 0),
      ),
    },
    continueWatching: inProgress.slice(0, 3).map((w) => ({
      id: w._id,
      title: w.videoId?.title || "Untitled",
      progress: w.progress,
      subject: w.subject?.subject || "General",
      thumbnail: w.videoId?.thumbnailUrl,
      lastWatched: timeAgo(w.lastWatchedAt),
    })),
    nextBadge: badgeProgress[0]
      ? {
          name: badgeProgress[0].badgeId?.name,
          progress: badgeProgress[0].progress,
        }
      : null,
    quickActions: [
      { type: "resume", label: "Resume Learning", icon: "play" },
      { type: "quiz", label: "Take Quiz", icon: "quiz" },
      { type: "review", label: "Review", icon: "review" },
      { type: "practice", label: "Practice", icon: "practice" },
    ],
  };
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Group quizzes by difficulty
 */
exports.groupQuizzesByDifficulty = (quizAttempts) => {
  const groups = { easy: 0, medium: 0, hard: 0 };

  quizAttempts.forEach((q) => {
    const difficulty = q.difficulty || "medium";
    groups[difficulty] = (groups[difficulty] || 0) + 1;
  });

  return groups;
};

/**
 * Group quizzes by subject
 */
exports.groupQuizzesBySubject = (quizAttempts) => {
  const groups = {};

  quizAttempts.forEach((q) => {
    const subjectId = q.contextIds?.subjectId;
    if (subjectId) {
      groups[subjectId] = (groups[subjectId] || 0) + 1;
    }
  });

  return groups;
};

/**
 * Calculate quiz trend (last 7 days)
 */
exports.calculateQuizTrend = (quizAttempts) => {
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayQuizzes = quizAttempts.filter((q) => {
      const qDate = new Date(q.createdAt).toISOString().split("T")[0];
      return qDate === dateStr;
    });

    const avgScore = dayQuizzes.length
      ? Math.round(
          dayQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
            dayQuizzes.length,
        )
      : 0;

    last7Days.push({
      date: dateStr,
      count: dayQuizzes.length,
      averageScore: avgScore,
    });
  }

  return last7Days;
};

/**
 * Calculate weekly activity
 */
exports.calculateWeeklyActivity = (userProgress) => {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activity = Array(7).fill(0);

  userProgress.forEach((p) => {
    if (p.date) {
      const day = new Date(p.date).getDay();
      activity[day] += p.timeSpent || 0;
    }
  });

  return weekDays.map((day, index) => ({
    day,
    minutes: Math.round(activity[index] / 60),
    formatted: formatDuration(activity[index]),
  }));
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
 * Calculate next rank target
 */
exports.calculateNextRankTarget = (currentEntry, leaderboard) => {
  if (!currentEntry || !leaderboard?.entries) return null;

  const currentRank = currentEntry.rank;
  const higherRankEntry = leaderboard.entries.find(
    (e) => e.rank === currentRank - 1,
  );

  if (higherRankEntry) {
    return {
      rank: currentRank - 1,
      scoreNeeded: higherRankEntry.score - currentEntry.score,
      currentScore: currentEntry.score,
      targetScore: higherRankEntry.score,
    };
  }

  return null;
};

/**
 * Find most active day
 */
exports.findMostActiveDay = (dailyUniqueStats) => {
  if (!dailyUniqueStats.length) return null;

  const mostActive = dailyUniqueStats.reduce((max, day) =>
    day.totalWatchTime > max.totalWatchTime ? day : max,
  );

  return {
    date: mostActive._id,
    watchTime: formatDuration(mostActive.totalWatchTime),
    videos: mostActive.uniqueVideos,
  };
};

/**
 * Get activity icon
 */
exports.getActivityIcon = (type) => {
  const icons = {
    page_view: "👁️",
    video_watch: "🎬",
    quiz_attempt: "📝",
    quiz_complete: "✅",
    comment: "💬",
    share: "📤",
    download: "⬇️",
    bookmark: "🔖",
  };

  return icons[type] || "📌";
};
// Continue with other section builders...
