const User = require("../models/loginUserModel");
const Interaction = require("../models/interaction");

// ==================== AGGREGATED PLATFORM METRICS ====================
async function aggregatePlatformMetrics(baseFilter) {
  // ✅ FIXED: Date mutation bug - create new Date objects for each

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
// ==================== USER SEGMENTATION BY BEHAVIOR ====================
async function segmentUsersByBehavior(baseFilter) {
  const periodStart = baseFilter.eventTime.$gte;
  const now = new Date();

  // Get all users with their interaction patterns
  const userBehavior = await Interaction.aggregate([
    {
      $match: baseFilter,
    },
    {
      $group: {
        _id: "$userId",
        totalInteractions: { $sum: 1 },
        uniqueDays: { $addToSet: { $dayOfYear: "$eventTime" } },
        avgWatchTime: { $avg: "$data.currentTime" },
        lastActive: { $max: "$eventTime" },
        firstActive: { $min: "$eventTime" },
        interactionTypes: { $addToSet: "$type" },
        // Track specific behaviors
        bookmarks: {
          $sum: { $cond: [{ $eq: ["$type", "bookmark"] }, 1, 0] },
        },
        shares: {
          $sum: { $cond: [{ $eq: ["$type", "share"] }, 1, 0] },
        },
        comments: {
          $sum: { $cond: [{ $eq: ["$type", "comment"] }, 1, 0] },
        },
        // Track completion rate (assuming 'complete' type exists)
        completions: {
          $sum: { $cond: [{ $eq: ["$type", "complete"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        userId: "$_id",
        totalInteractions: 1,
        interactionFrequency: {
          $divide: [
            "$totalInteractions",
            { $max: [1, { $size: "$uniqueDays" }] },
          ],
        },
        activeDaysCount: { $size: "$uniqueDays" },
        avgWatchTime: 1,
        lastActive: 1,
        daysSinceLastActive: {
          $divide: [
            { $subtract: [now, "$lastActive"] },
            1000 * 60 * 60 * 24, // Convert to days
          ],
        },
        accountAge: {
          $divide: [
            { $subtract: [now, "$userInfo.createdAt"] },
            1000 * 60 * 60 * 24, // Convert to days
          ],
        },
        interactionTypes: 1,
        engagementScore: {
          $add: [
            { $multiply: ["$totalInteractions", 0.3] },
            { $multiply: [{ $size: "$uniqueDays" }, 0.4] },
            { $multiply: [{ $divide: ["$avgWatchTime", 60] }, 0.3] }, // Normalize watch time
          ],
        },
        socialScore: {
          $add: [
            { $multiply: ["$bookmarks", 0.2] },
            { $multiply: ["$shares", 0.4] },
            { $multiply: ["$comments", 0.4] },
          ],
        },
        completionRate: {
          $cond: [
            { $eq: ["$totalInteractions", 0] },
            0,
            { $divide: ["$completions", "$totalInteractions"] },
          ],
        },
        tier: "$userInfo.tier",
      },
    },
  ]);

  // Calculate thresholds for segmentation
  const allScores = userBehavior.map((u) => u.engagementScore || 0);
  const avgEngagement =
    allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;
  const stdDev = calculateStandardDeviation(allScores);

  // Segment users
  const segments = {
    powerUsers: [],
    atRisk: [],
    casual: [],
    dormant: [],

    powerUsersCount: 0,
    powerUsersPercent: 0,
    powerUsersTraits: {
      avgInteractions: 0,
      avgWatchTime: 0,
      commonBehaviors: [],
      preferredTiers: {},
    },

    atRiskCount: 0,
    atRiskPercent: 0,
    riskFactors: [],
    recoveryActions: [],
  };

  // Categorize each user
  for (const user of userBehavior) {
    // Determine segment
    let segment = "casual"; // default

    // Power users: High engagement (above avg + 1 std dev)
    if (user.engagementScore > avgEngagement + stdDev) {
      segment = "power";
      segments.powerUsers.push({
        userId: user.userId,
        engagementScore: user.engagementScore,
        tier: user.tier,
        behaviors: {
          interactions: user.totalInteractions,
          frequency: user.interactionFrequency,
          avgWatchTime: user.avgWatchTime,
          socialScore: user.socialScore,
        },
      });
    }
    // At risk: Used to be active but declining
    else if (user.daysSinceLastActive > 7 && user.daysSinceLastActive < 30) {
      segment = "atRisk";
      segments.atRisk.push({
        userId: user.userId,
        daysInactive: Math.round(user.daysSinceLastActive),
        previousEngagement: user.engagementScore,
        lastActive: user.lastActive,
        tier: user.tier,
      });
    }
    // Dormant: No activity for 30+ days
    else if (user.daysSinceLastActive >= 30) {
      segment = "dormant";
      segments.dormant.push({
        userId: user.userId,
        daysInactive: Math.round(user.daysSinceLastActive),
        lastActive: user.lastActive,
        tier: user.tier,
        accountAge: Math.round(user.accountAge),
      });
    }
    // Casual: Everyone else
    else {
      segments.casual.push({
        userId: user.userId,
        engagementScore: user.engagementScore,
        tier: user.tier,
      });
    }
  }

  // Calculate counts and percentages
  const totalUsers = userBehavior.length;

  segments.powerUsersCount = segments.powerUsers.length;
  segments.powerUsersPercent =
    totalUsers > 0
      ? ((segments.powerUsersCount / totalUsers) * 100).toFixed(1)
      : 0;

  segments.atRiskCount = segments.atRisk.length;
  segments.atRiskPercent =
    totalUsers > 0 ? ((segments.atRiskCount / totalUsers) * 100).toFixed(1) : 0;

  // Analyze power user traits
  if (segments.powerUsers.length > 0) {
    const powerUserIds = segments.powerUsers.map((u) => u.userId);

    // Get detailed power user characteristics
    const powerUserDetails = await Interaction.aggregate([
      {
        $match: {
          userId: { $in: powerUserIds },
          eventTime: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    segments.powerUsersTraits = {
      avgInteractions: (
        segments.powerUsers.reduce(
          (sum, u) => sum + (u.behaviors?.interactions || 0),
          0,
        ) / segments.powerUsersCount
      ).toFixed(1),
      avgWatchTime: (
        segments.powerUsers.reduce(
          (sum, u) => sum + (u.behaviors?.avgWatchTime || 0),
          0,
        ) / segments.powerUsersCount
      ).toFixed(1),
      commonBehaviors: powerUserDetails.slice(0, 3).map((b) => ({
        type: b._id,
        count: b.count,
        percentage:
          ((b.count / segments.powerUsersCount) * 100).toFixed(1) + "%",
      })),
      preferredTiers: segments.powerUsers.reduce((acc, user) => {
        const tier = user.tier || "unknown";
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // Analyze risk factors and create recovery actions
  if (segments.atRisk.length > 0) {
    const atRiskUserIds = segments.atRisk.map((u) => u.userId);

    // Analyze why they're at risk
    const riskAnalysis = await Interaction.aggregate([
      {
        $match: {
          userId: { $in: atRiskUserIds },
          eventTime: { $gte: periodStart },
        },
      },
      {
        $group: {
          _id: "$userId",
          lastInteractions: { $push: "$$ROOT" },
          interactionTypes: { $addToSet: "$type" },
        },
      },
      {
        $project: {
          hadNegativeEvents: {
            $in: ["error", { $literal: "$interactionTypes" }],
          },
          interactionCount: { $size: "$lastInteractions" },
          lastInteractionDate: { $max: "$lastInteractions.eventTime" },
        },
      },
    ]);

    // Identify risk patterns
    const riskPatterns = {
      lowEngagement: 0,
      negativeEvents: 0,
      featureUnderuse: 0,
    };

    for (const user of riskAnalysis) {
      if (user.interactionCount < 5) riskPatterns.lowEngagement++;
      if (user.hadNegativeEvents) riskPatterns.negativeEvents++;
      if (user.interactionTypes.length < 3) riskPatterns.featureUnderuse++;
    }

    // Generate risk factors
    segments.riskFactors = [
      {
        factor: "Low engagement",
        affectedUsers: riskPatterns.lowEngagement,
        percentage:
          ((riskPatterns.lowEngagement / segments.atRiskCount) * 100).toFixed(
            1,
          ) + "%",
      },
      {
        factor: "Experienced errors/issues",
        affectedUsers: riskPatterns.negativeEvents,
        percentage:
          ((riskPatterns.negativeEvents / segments.atRiskCount) * 100).toFixed(
            1,
          ) + "%",
      },
      {
        factor: "Limited feature usage",
        affectedUsers: riskPatterns.featureUnderuse,
        percentage:
          ((riskPatterns.featureUnderuse / segments.atRiskCount) * 100).toFixed(
            1,
          ) + "%",
      },
    ].filter((f) => f.affectedUsers > 0);

    // Generate recovery actions based on risk factors
    segments.recoveryActions = [];

    if (riskPatterns.lowEngagement > 0) {
      segments.recoveryActions.push({
        action:
          "Send re-engagement email with personalized content recommendations",
        targetUsers: riskPatterns.lowEngagement,
        expectedImpact: "Medium",
      });
    }

    if (riskPatterns.negativeEvents > 0) {
      segments.recoveryActions.push({
        action: "Reach out with support and offer assistance",
        targetUsers: riskPatterns.negativeEvents,
        expectedImpact: "High",
      });
    }

    if (riskPatterns.featureUnderuse > 0) {
      segments.recoveryActions.push({
        action: "Feature tutorial campaign highlighting underused features",
        targetUsers: riskPatterns.featureUnderuse,
        expectedImpact: "Medium",
      });
    }

    // Add push notification strategy
    segments.recoveryActions.push({
      action: "Push notification with exclusive content or offer",
      targetUsers: segments.atRiskCount,
      expectedImpact: "Low to Medium",
    });
  }

  return segments;
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values) {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}
// ==================== FEATURE ADOPTION ANALYSIS ====================
async function analyzeFeatureAdoption(baseFilter) {
  const periodStart = baseFilter.eventTime.$gte;

  // Get all users with their tier information
  const usersByTier = await User.aggregate([
    {
      $match: baseFilter.userId ? { _id: { $in: baseFilter.userId.$in } } : {},
    },
    {
      $project: {
        _id: 1,
        tier: 1,
      },
    },
  ]);

  const userIds = usersByTier.map((u) => u._id);
  const userTierMap = usersByTier.reduce((acc, user) => {
    acc[user._id.toString()] = user.tier || "free";
    return acc;
  }, {});

  // Analyze feature usage
  const featureUsage = await Interaction.aggregate([
    {
      $match: {
        ...baseFilter,
        userId: { $in: userIds },
      },
    },
    {
      $group: {
        _id: {
          feature: "$type",
          userId: "$userId",
        },
        usageCount: { $sum: 1 },
        firstUsed: { $min: "$eventTime" },
        lastUsed: { $max: "$eventTime" },
      },
    },
    {
      $group: {
        _id: "$_id.feature",
        totalUsers: { $sum: 1 },
        totalUsage: { $sum: "$usageCount" },
        users: {
          $push: {
            userId: "$_id.userId",
            usageCount: "$usageCount",
            firstUsed: "$firstUsed",
            lastUsed: "$lastUsed",
          },
        },
        avgUsagePerUser: { $avg: "$usageCount" },
      },
    },
    {
      $project: {
        feature: "$_id",
        totalUsers: 1,
        totalUsage: 1,
        avgUsagePerUser: { $round: ["$avgUsagePerUser", 1] },
        adoptionRate: {
          $multiply: [{ $divide: ["$totalUsers", userIds.length] }, 100],
        },
        users: 1,
      },
    },
    {
      $sort: { totalUsers: -1 },
    },
  ]);

  // Calculate retention impact per feature
  const retentionImpact = await calculateFeatureRetentionImpact(
    featureUsage,
    baseFilter,
    userIds,
  );

  // Categorize features by adoption rate
  const features = featureUsage.map((f) => ({
    name: f.feature,
    usersCount: f.totalUsers,
    totalUsage: f.totalUsage,
    avgUsagePerUser: f.avgUsagePerUser,
    adoptionRate: f.adoptionRate.toFixed(1),
    retentionRate:
      retentionImpact.find((r) => r.feature === f.feature)?.retentionRate || 0,
    impact:
      retentionImpact.find((r) => r.feature === f.feature)?.impact || "Low",
  }));

  // Sort features
  const topFeatures = [...features]
    .sort((a, b) => b.adoptionRate - a.adoptionRate)
    .slice(0, 5);

  const bottomFeatures = [...features]
    .sort((a, b) => a.adoptionRate - b.adoptionRate)
    .slice(0, 5);

  // Analyze adoption by tier
  const adoptionByTier = {
    free: {},
    premium: {},
    enterprise: {},
  };

  for (const feature of featureUsage) {
    // Group users by tier for this feature
    const tierGroups = {
      free: 0,
      premium: 0,
      enterprise: 0,
    };

    for (const userData of feature.users) {
      const tier = userTierMap[userData.userId.toString()] || "free";
      if (tierGroups.hasOwnProperty(tier)) {
        tierGroups[tier]++;
      }
    }

    // Calculate total users per tier
    const totalUsersByTier = usersByTier.reduce(
      (acc, user) => {
        const tier = user.tier || "free";
        if (acc.hasOwnProperty(tier)) {
          acc[tier]++;
        } else {
          acc[tier] = 1;
        }
        return acc;
      },
      { free: 0, premium: 0, enterprise: 0 },
    );

    // Calculate adoption rates per tier
    for (const tier of ["free", "premium", "enterprise"]) {
      if (totalUsersByTier[tier] > 0) {
        adoptionByTier[tier][feature._id] = {
          users: tierGroups[tier],
          adoptionRate:
            ((tierGroups[tier] / totalUsersByTier[tier]) * 100).toFixed(1) +
            "%",
          percentage:
            ((tierGroups[tier] / feature.totalUsers) * 100).toFixed(1) + "%",
        };
      }
    }
  }

  // Get feature adoption trends over time
  const featureTrends = await getFeatureAdoptionTrends(
    baseFilter,
    features.slice(0, 10).map((f) => f.name),
  );

  return {
    // Most adopted features
    topFeatures: topFeatures.map((f) => ({
      name: f.name,
      usersCount: f.usersCount,
      adoptionRate: f.adoptionRate + "%",
      avgUsagePerUser: f.avgUsagePerUser,
      trend: featureTrends[f.name] || "stable",
    })),

    // Least adopted features
    bottomFeatures: bottomFeatures.map((f) => ({
      name: f.name,
      usersCount: f.usersCount,
      adoptionRate: f.adoptionRate + "%",
      avgUsagePerUser: f.avgUsagePerUser,
      potentialReason: getLowAdoptionReason(f),
    })),

    // Adoption by tier
    adoptionByTier: {
      free: adoptionByTier.free,
      premium: adoptionByTier.premium,
      enterprise: adoptionByTier.enterprise,
    },

    // Feature correlation with retention
    featureImpact: retentionImpact.map((f) => ({
      feature: f.feature,
      usersCount: f.usersCount,
      retentionRate: f.retentionRate + "%",
      impact: f.impact,
      recommendation: getFeatureRecommendation(f),
    })),

    // Additional insights
    insights: {
      mostEngagingFeature: features.sort(
        (a, b) => b.avgUsagePerUser - a.avgUsagePerUser,
      )[0],
      fastestGrowing: featureTrends.fastestGrowing || null,
      decliningFeatures: featureTrends.declining || [],
      tierDisparity: calculateTierDisparity(adoptionByTier),
    },
  };
}

// ==================== HELPER FUNCTIONS ====================

async function calculateFeatureRetentionImpact(
  featureUsage,
  baseFilter,
  userIds,
) {
  const periodStart = baseFilter.eventTime.$gte;
  const retentionPeriodEnd = new Date(periodStart);
  retentionPeriodEnd.setDate(retentionPeriodEnd.getDate() + 30); // Look 30 days ahead

  const retentionImpact = [];

  for (const feature of featureUsage) {
    const featureUsers = feature.users.map((u) => u.userId);

    // Check if these users remained active
    const retainedUsers = await Interaction.distinct("userId", {
      userId: { $in: featureUsers },
      eventTime: { $gte: periodStart, $lte: retentionPeriodEnd },
    });

    const retentionRate =
      featureUsers.length > 0
        ? (retainedUsers.length / featureUsers.length) * 100
        : 0;

    // Calculate impact level
    let impact = "Low";
    const avgRetention = 50; // Benchmark - adjust based on your data

    if (retentionRate > avgRetention + 20) {
      impact = "High";
    } else if (retentionRate > avgRetention) {
      impact = "Medium";
    }

    retentionImpact.push({
      feature: feature._id,
      usersCount: featureUsers.length,
      retentionRate: retentionRate.toFixed(1),
      impact,
    });
  }

  return retentionImpact;
}

async function getFeatureAdoptionTrends(baseFilter, features) {
  const periodStart = baseFilter.eventTime.$gte;
  const midPoint = new Date(periodStart);
  midPoint.setDate(midPoint.getDate() + 15); // Half way through period

  const trends = {};

  for (const feature of features) {
    // Usage in first half
    const firstHalfUsage = await Interaction.countDocuments({
      ...baseFilter,
      type: feature,
      eventTime: { $gte: periodStart, $lt: midPoint },
    });

    // Usage in second half
    const secondHalfUsage = await Interaction.countDocuments({
      ...baseFilter,
      type: feature,
      eventTime: { $gte: midPoint },
    });

    if (firstHalfUsage > 0) {
      const growthRate =
        ((secondHalfUsage - firstHalfUsage) / firstHalfUsage) * 100;

      if (growthRate > 20) {
        trends[feature] = "growing";
      } else if (growthRate < -20) {
        trends[feature] = "declining";
      } else {
        trends[feature] = "stable";
      }
    } else {
      trends[feature] = "new";
    }
  }

  // Find fastest growing and declining
  const growthRates = [];
  for (const feature of features) {
    const firstHalf = await Interaction.countDocuments({
      ...baseFilter,
      type: feature,
      eventTime: { $gte: periodStart, $lt: midPoint },
    });
    const secondHalf = await Interaction.countDocuments({
      ...baseFilter,
      type: feature,
      eventTime: { $gte: midPoint },
    });

    if (firstHalf > 0) {
      growthRates.push({
        feature,
        rate: ((secondHalf - firstHalf) / firstHalf) * 100,
      });
    }
  }

  growthRates.sort((a, b) => b.rate - a.rate);

  trends.fastestGrowing = growthRates[0]?.feature;
  trends.declining = growthRates
    .filter((g) => g.rate < -20)
    .map((g) => g.feature);

  return trends;
}

function getLowAdoptionReason(feature) {
  if (feature.avgUsagePerUser < 2) {
    return "Users try it once but dont return";
  }
  if (feature.adoptionRate < 10) {
    return "Feature might be hard to discover";
  }
  if (feature.adoptionRate < 20) {
    return "May need better onboarding or education";
  }
  return "Could benefit from more promotion";
}

function getFeatureRecommendation(feature) {
  if (feature.impact === "High") {
    return "Promote this feature more - it drives retention";
  }
  if (feature.impact === "Medium") {
    return "Consider enhancing this feature to increase engagement";
  }
  if (feature.retentionRate < 30) {
    return "Investigate why users dont stick after using this feature";
  }
  return "Monitor usage patterns to identify improvements";
}

function calculateTierDisparity(adoptionByTier) {
  const disparity = {};

  // Find features with biggest gap between free and premium
  const allFeatures = new Set();
  for (const tier of ["free", "premium", "enterprise"]) {
    Object.keys(adoptionByTier[tier]).forEach((f) => allFeatures.add(f));
  }

  for (const feature of allFeatures) {
    const freeRate = parseFloat(
      adoptionByTier.free[feature]?.adoptionRate || "0",
    );
    const premiumRate = parseFloat(
      adoptionByTier.premium[feature]?.adoptionRate || "0",
    );

    if (premiumRate > freeRate + 30) {
      disparity[feature] = "Premium users adopt much more";
    } else if (freeRate > premiumRate + 30) {
      disparity[feature] =
        "Free users adopt more - potential upgrade opportunity";
    }
  }

  return disparity;
}

// Export the function
module.exports = {
  aggregatePlatformMetrics,
  segmentUsersByBehavior,
  analyzeFeatureAdoption,
};
