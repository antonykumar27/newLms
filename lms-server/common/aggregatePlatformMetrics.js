const User = require("../models/User");
const Interaction = require("../models/interaction");

// ==================== AGGREGATED PLATFORM METRICS ====================
async function aggregatePlatformMetrics(baseFilter) {
  // ✅ FIXED: Date mutation bug - create new Date objects for each
  const now = new Date();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Get all users count
  const totalUsers = await User.countDocuments();

  // Get active users (users with interactions in period)
  const activeUsers = await Interaction.distinct("userId", baseFilter);
  const activeUsersCount = activeUsers.length;

  // Get DAU, WAU, MAU
  const dau = await getDailyActiveUsers(baseFilter);
  const wau = await getWeeklyActiveUsers(baseFilter);
  const mau = await getMonthlyActiveUsers(baseFilter);

  // Calculate retention rate
  const retentionRate = await calculateRetentionRate(baseFilter);

  // Get average session time
  const avgSessionTime = await calculateAvgSessionTime(baseFilter);

  // Calculate interactions per user
  const totalInteractions = await Interaction.countDocuments(baseFilter);
  const interactionsPerUser =
    activeUsersCount > 0
      ? (totalInteractions / activeUsersCount).toFixed(2)
      : 0;

  // Monetization metrics
  const payingUsers = await User.countDocuments({
    ...(baseFilter.userId ? { _id: { $in: baseFilter.userId.$in } } : {}),
    subscriptionStatus: "active",
  });

  const conversionRate =
    totalUsers > 0 ? ((payingUsers / totalUsers) * 100).toFixed(1) : 0;

  // Churn rate calculation
  const churnRate = await calculateChurnRate(baseFilter);

  // LTV (Lifetime Value) calculation
  const ltv = await calculateLTV(baseFilter);

  // Tier usage breakdown
  const tierUsage = await getTierUsage(baseFilter);

  // New users in period
  const newUsers = await User.countDocuments({
    createdAt: { $gte: baseFilter.eventTime.$gte },
  });

  // Growth rate
  const previousPeriodUsers = await User.countDocuments({
    createdAt: {
      $gte: sixtyDaysAgo,
      $lt: baseFilter.eventTime.$gte,
    },
  });
  const growthRate =
    previousPeriodUsers > 0
      ? (
          ((newUsers - previousPeriodUsers) / previousPeriodUsers) *
          100
        ).toFixed(1)
      : 0;

  // Churn by tier
  const churnByTier = await getChurnByTier(baseFilter);

  // Churn reasons
  const churnReasons = await getChurnReasons(baseFilter);

  // Trends
  const dailyTrend = await getDailyTrend(baseFilter);
  const weeklyTrend = await getWeeklyTrend(baseFilter);
  const monthlyTrend = await getMonthlyTrend(baseFilter);

  // YoY comparison
  const yoyMetrics = await getYearOverYearMetrics(baseFilter);

  return {
    totalUsers,
    activeUsers: activeUsersCount,
    retentionRate,
    dau,
    wau,
    mau,
    avgSessionTime,
    interactionsPerUser,
    payingUsers,
    conversionRate,
    churnRate,
    ltv,
    tierUsage,
    newUsers,
    growthRate,
    churnByTier,
    churnByBehavior: await getChurnByBehavior(baseFilter),
    churnReasons,
    dailyTrend,
    weeklyTrend,
    monthlyTrend,
    yoyGrowth: yoyMetrics.growth,
    yoyEngagement: yoyMetrics.engagement,
  };
}

// ==================== HELPER FUNCTIONS ====================

async function getDailyActiveUsers(filter) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyFilter = {
    ...filter,
    eventTime: { $gte: today },
  };

  const users = await Interaction.distinct("userId", dailyFilter);
  return users.length;
}

async function getWeeklyActiveUsers(filter) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyFilter = {
    ...filter,
    eventTime: { $gte: weekAgo },
  };

  const users = await Interaction.distinct("userId", weeklyFilter);
  return users.length;
}

async function getMonthlyActiveUsers(filter) {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const monthlyFilter = {
    ...filter,
    eventTime: { $gte: monthAgo },
  };

  const users = await Interaction.distinct("userId", monthlyFilter);
  return users.length;
}

async function calculateRetentionRate(filter) {
  // Get users who were active in first week of period
  const periodStart = filter.eventTime.$gte;
  const firstWeekEnd = new Date(periodStart);
  firstWeekEnd.setDate(firstWeekEnd.getDate() + 7);

  const firstWeekUsers = await Interaction.distinct("userId", {
    eventTime: { $gte: periodStart, $lt: firstWeekEnd },
  });

  if (firstWeekUsers.length === 0) return 0;

  // Get users who remained active in last week
  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const retainedUsers = await Interaction.distinct("userId", {
    userId: { $in: firstWeekUsers },
    eventTime: { $gte: lastWeekStart },
  });

  return ((retainedUsers.length / firstWeekUsers.length) * 100).toFixed(1);
}

async function calculateAvgSessionTime(filter) {
  // ✅ FIXED: Removed sessionId dependency
  // Instead, group by user and approximate session time
  const sessions = await Interaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$userId",
        firstInteraction: { $min: "$eventTime" },
        lastInteraction: { $max: "$eventTime" },
        interactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        // Approximate session time as time between first and last interaction
        // Only count if they have more than 1 interaction
        duration: {
          $cond: [
            { $gt: ["$interactionCount", 1] },
            {
              $divide: [
                { $subtract: ["$lastInteraction", "$firstInteraction"] },
                60000, // Convert to minutes
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: "$duration" },
      },
    },
  ]);

  return sessions.length > 0 ? sessions[0].avgDuration.toFixed(1) : 0;
}

async function calculateChurnRate(filter) {
  const periodStart = filter.eventTime.$gte;
  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

  // Users active in previous period
  const previousActiveUsers = await Interaction.distinct("userId", {
    eventTime: { $gte: previousPeriodStart, $lt: periodStart },
  });

  if (previousActiveUsers.length === 0) return 0;

  // Users from previous period who are NOT active in current period
  // ✅ FIXED: Use array of IDs from current period
  const currentActiveUsers = await Interaction.distinct("userId", {
    eventTime: { $gte: periodStart },
  });

  const churnedUsers = previousActiveUsers.filter(
    (userId) => !currentActiveUsers.includes(userId),
  );

  return ((churnedUsers.length / previousActiveUsers.length) * 100).toFixed(1);
}

async function calculateLTV(filter) {
  const result = await User.aggregate([
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "userId",
        as: "payments",
      },
    },
    {
      $project: {
        lifetimeValue: { $sum: "$payments.amount" },
      },
    },
    {
      $group: {
        _id: null,
        avgLTV: { $avg: "$lifetimeValue" },
      },
    },
  ]);

  return result.length > 0 ? result[0].avgLTV.toFixed(2) : 0;
}

async function getTierUsage(filter) {
  const users = filter.userId?.$in || [];

  const tierUsage = await User.aggregate([
    {
      $match: users.length > 0 ? { _id: { $in: users } } : {},
    },
    {
      $lookup: {
        from: "interactions",
        localField: "_id",
        foreignField: "userId",
        as: "interactions",
      },
    },
    {
      $group: {
        _id: "$tier",
        userCount: { $sum: 1 },
        totalInteractions: { $sum: { $size: "$interactions" } },
      },
    },
    {
      $project: {
        tier: "$_id",
        userCount: 1,
        avgInteractions: {
          $cond: [
            { $eq: ["$userCount", 0] },
            0,
            { $divide: ["$totalInteractions", "$userCount"] },
          ],
        },
      },
    },
  ]);

  return tierUsage.reduce((acc, tier) => {
    acc[tier._id || "unknown"] = {
      users: tier.userCount,
      avgInteractions: tier.avgInteractions.toFixed(1),
    };
    return acc;
  }, {});
}

async function getChurnByTier(filter) {
  const periodStart = filter.eventTime.$gte;
  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

  const churnByTier = await User.aggregate([
    {
      $lookup: {
        from: "interactions",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              eventTime: { $gte: previousPeriodStart, $lt: periodStart },
            },
          },
        ],
        as: "previousInteractions",
      },
    },
    {
      $lookup: {
        from: "interactions",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              eventTime: { $gte: periodStart },
            },
          },
        ],
        as: "currentInteractions",
      },
    },
    {
      $group: {
        _id: "$tier",
        total: { $sum: 1 },
        churned: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: [{ $size: "$previousInteractions" }, 0] },
                  { $eq: [{ $size: "$currentInteractions" }, 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        tier: "$_id",
        churnRate: {
          $cond: [
            { $eq: ["$total", 0] },
            0,
            { $multiply: [{ $divide: ["$churned", "$total"] }, 100] },
          ],
        },
      },
    },
  ]);

  return churnByTier.reduce((acc, tier) => {
    acc[tier._id || "unknown"] = tier.churnRate.toFixed(1);
    return acc;
  }, {});
}

async function getChurnByBehavior(filter) {
  const periodStart = filter.eventTime.$gte;
  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

  // Categorize users by their behavior patterns
  const behaviorAnalysis = await Interaction.aggregate([
    {
      $match: {
        eventTime: { $gte: previousPeriodStart },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalInteractions: { $sum: 1 },
        uniqueDays: { $addToSet: { $dayOfYear: "$eventTime" } },
        // ✅ FIXED: Use data.currentTime instead of watchTime
        avgWatchTime: { $avg: "$data.currentTime" },
        lastActive: { $max: "$eventTime" },
      },
    },
    {
      $project: {
        behavior: {
          $switch: {
            branches: [
              {
                case: { $gte: ["$totalInteractions", 100] },
                then: "power",
              },
              {
                case: { $gte: ["$totalInteractions", 30] },
                then: "regular",
              },
              {
                case: { $gte: ["$totalInteractions", 5] },
                then: "casual",
              },
            ],
            default: "minimal",
          },
        },
      },
    },
    {
      $group: {
        _id: "$behavior",
        users: { $addToSet: "$_id" },
      },
    },
  ]);

  // ✅ FIXED: Use for...of loop instead of filter with async
  const churnByBehavior = {};
  for (const behavior of behaviorAnalysis) {
    const churnedInCategory = [];

    for (const userId of behavior.users) {
      const hasCurrentActivity = await Interaction.exists({
        userId,
        eventTime: { $gte: periodStart },
      });

      if (!hasCurrentActivity) {
        churnedInCategory.push(userId);
      }
    }

    churnByBehavior[behavior._id] =
      behavior.users.length > 0
        ? ((churnedInCategory.length / behavior.users.length) * 100).toFixed(1)
        : 0;
  }

  return churnByBehavior;
}

async function getChurnReasons(filter) {
  const periodStart = filter.eventTime.$gte;
  const thirtyDaysBefore = new Date(periodStart);
  thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);

  // Analyze patterns of churned users
  const churnedUsers = await User.aggregate([
    {
      $lookup: {
        from: "interactions",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              eventTime: { $gte: thirtyDaysBefore, $lt: periodStart },
            },
          },
        ],
        as: "previousInteractions",
      },
    },
    {
      $lookup: {
        from: "interactions",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              eventTime: { $gte: periodStart },
            },
          },
        ],
        as: "currentInteractions",
      },
    },
    {
      $match: {
        "previousInteractions.0": { $exists: true },
        currentInteractions: { $size: 0 },
      },
    },
    {
      $project: {
        userId: 1,
        tier: 1,
        lastInteractions: { $slice: ["$previousInteractions", -10] },
      },
    },
  ]);

  // Analyze patterns to determine churn reasons
  const reasons = [];

  if (churnedUsers.length > 0) {
    // Check for decline in engagement
    const declinedEngagement = churnedUsers.filter((user) => {
      const interactions = user.lastInteractions;
      if (interactions.length < 5) return false;

      const firstHalf = interactions.slice(0, 3);
      const lastHalf = interactions.slice(-3);
      // ✅ FIXED: Use data.currentTime instead of watchTime
      const firstAvg =
        firstHalf.reduce((sum, i) => sum + (i.data?.currentTime || 0), 0) / 3;
      const lastAvg =
        lastHalf.reduce((sum, i) => sum + (i.data?.currentTime || 0), 0) / 3;

      return lastAvg < firstAvg * 0.5;
    });

    if (declinedEngagement.length > 0) {
      reasons.push({
        reason: "Declining engagement",
        percentage: (
          (declinedEngagement.length / churnedUsers.length) *
          100
        ).toFixed(1),
        preventionStrategy:
          "Implement re-engagement campaigns and personalized content recommendations",
      });
    }

    // Check for feature fatigue or issues - ✅ FIXED: Use type instead of eventType
    const negativeInteractions = churnedUsers.filter((user) => {
      return user.lastInteractions.some(
        (i) => i.type === "error" || i.type === "exit",
      );
    });

    if (negativeInteractions.length > 0) {
      reasons.push({
        reason: "Technical issues or poor UX",
        percentage: (
          (negativeInteractions.length / churnedUsers.length) *
          100
        ).toFixed(1),
        preventionStrategy: "Improve error handling and gather UX feedback",
      });
    }
  }

  return reasons;
}

async function getDailyTrend(filter) {
  const trend = await Interaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: "$eventTime" },
          month: { $month: "$eventTime" },
          day: { $dayOfMonth: "$eventTime" },
        },
        interactions: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        interactions: 1,
        users: { $size: "$uniqueUsers" },
      },
    },
  ]);

  return trend;
}

async function getWeeklyTrend(filter) {
  const trend = await Interaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: "$eventTime" },
          week: { $week: "$eventTime" },
        },
        interactions: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
    {
      $project: {
        week: "$_id.week",
        year: "$_id.year",
        interactions: 1,
        users: { $size: "$uniqueUsers" },
      },
    },
  ]);

  return trend;
}

async function getMonthlyTrend(filter) {
  const trend = await Interaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: "$eventTime" },
          month: { $month: "$eventTime" },
        },
        interactions: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        month: "$_id.month",
        year: "$_id.year",
        interactions: 1,
        users: { $size: "$uniqueUsers" },
      },
    },
  ]);

  return trend;
}

async function getYearOverYearMetrics(filter) {
  const currentPeriodStart = filter.eventTime.$gte;
  const currentPeriodEnd = new Date();

  const lastYearStart = new Date(currentPeriodStart);
  lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
  const lastYearEnd = new Date(currentPeriodEnd);
  lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);

  // Current period metrics
  const currentUsers = await Interaction.distinct("userId", filter);
  const currentInteractions = await Interaction.countDocuments(filter);

  // Last year metrics
  const lastYearFilter = {
    eventTime: { $gte: lastYearStart, $lte: lastYearEnd },
  };
  const lastYearUsers = await Interaction.distinct("userId", lastYearFilter);
  const lastYearInteractions = await Interaction.countDocuments(lastYearFilter);

  const growth =
    lastYearUsers.length > 0
      ? (
          ((currentUsers.length - lastYearUsers.length) /
            lastYearUsers.length) *
          100
        ).toFixed(1)
      : 0;

  const engagement =
    lastYearInteractions > 0
      ? (
          ((currentInteractions - lastYearInteractions) /
            lastYearInteractions) *
          100
        ).toFixed(1)
      : 0;

  return { growth, engagement };
}

// ✅ CORRECT EXPORT
module.exports = {
  aggregatePlatformMetrics,
};
