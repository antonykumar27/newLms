/**
 * Calculate LTV/CAC Ratio
 */
exports.calculateLTVCACRatio = (ltv, cac) => {
  if (!ltv || !cac || cac === 0) return 0;
  return ltv / cac;
};

/**
 * Calculate ARR from MRR
 */
exports.calculateARR = (mrr) => {
  return (mrr || 0) * 12;
};

/**
 * Calculate engagement score
 */
exports.calculateEngagementScore = (engagementMetrics) => {
  const weights = {
    watchTime: 0.3,
    completionRate: 0.3,
    quizPassRate: 0.2,
    discussionPosts: 0.2,
  };

  const watchTimeScore = Math.min(
    (engagementMetrics.averageWatchTime / 30) * 100,
    100,
  );
  const completionScore = engagementMetrics.completionRate;
  const quizScore = engagementMetrics.quizPassRate;
  const discussionScore = Math.min(
    (engagementMetrics.discussionPosts / 1000) * 100,
    100,
  );

  return (
    watchTimeScore * weights.watchTime +
    completionScore * weights.completionRate +
    quizScore * weights.quizPassRate +
    discussionScore * weights.discussionPosts
  ).toFixed(1);
};

/**
 * Generate KPI trends from historical data
 */
exports.generateKPITrends = (historicalKPI) => {
  if (!historicalKPI || historicalKPI.length === 0) {
    return {
      users: [],
      revenue: [],
      engagement: [],
    };
  }

  const trends = {
    users: historicalKPI.map((k) => ({
      date: k.createdAt,
      total: k.userMetrics.totalRegisteredUsers,
      active: k.userMetrics.activeUsersMonthly,
    })),
    revenue: historicalKPI.map((k) => ({
      date: k.createdAt,
      mrr: k.financialMetrics.mrr,
      arr: k.financialMetrics.arr,
    })),
    engagement: historicalKPI.map((k) => ({
      date: k.createdAt,
      completionRate: k.engagementMetrics.completionRate,
      watchTime: k.engagementMetrics.averageWatchTime,
    })),
  };

  // Calculate growth rates
  if (historicalKPI.length > 1) {
    const first = historicalKPI[0];
    const last = historicalKPI[historicalKPI.length - 1];

    trends.growthRates = {
      users:
        (
          ((last.userMetrics.totalRegisteredUsers -
            first.userMetrics.totalRegisteredUsers) /
            first.userMetrics.totalRegisteredUsers) *
          100
        ).toFixed(1) + "%",
      revenue:
        (
          ((last.financialMetrics.mrr - first.financialMetrics.mrr) /
            first.financialMetrics.mrr) *
          100
        ).toFixed(1) + "%",
      engagement:
        (
          ((last.engagementMetrics.completionRate -
            first.engagementMetrics.completionRate) /
            first.engagementMetrics.completionRate) *
          100
        ).toFixed(1) + "%",
    };
  }

  return trends;
};

/**
 * Benchmark comparison against industry standards
 */
exports.benchmarkComparison = (kpi) => {
  const benchmarks = {
    userMetrics: {
      activeRate: {
        value:
          (
            (kpi.userMetrics.activeUsersMonthly /
              kpi.userMetrics.totalRegisteredUsers) *
            100
          ).toFixed(1) + "%",
        benchmark: "40%",
        status:
          (kpi.userMetrics.activeUsersMonthly /
            kpi.userMetrics.totalRegisteredUsers) *
            100 >=
          40
            ? "Above"
            : "Below",
      },
      sessionDuration: {
        value: kpi.userMetrics.averageSessionDuration + " mins",
        benchmark: "20 mins",
        status:
          kpi.userMetrics.averageSessionDuration >= 20 ? "Above" : "Below",
      },
    },
    financialMetrics: {
      ltvCacRatio: {
        value: kpi.financialMetrics.ltvCacRatio.toFixed(2),
        benchmark: "3.0",
        status: kpi.financialMetrics.ltvCacRatio >= 3 ? "Above" : "Below",
      },
      churnRate: {
        value: kpi.financialMetrics.churnRate + "%",
        benchmark: "5%",
        status: kpi.financialMetrics.churnRate <= 5 ? "Good" : "High",
      },
      arpu: {
        value: "₹" + kpi.financialMetrics.arpu,
        benchmark: "₹500",
        status: kpi.financialMetrics.arpu >= 500 ? "Above" : "Below",
      },
    },
    engagementMetrics: {
      completionRate: {
        value: kpi.engagementMetrics.completionRate + "%",
        benchmark: "60%",
        status: kpi.engagementMetrics.completionRate >= 60 ? "Above" : "Below",
      },
      quizPassRate: {
        value: kpi.engagementMetrics.quizPassRate + "%",
        benchmark: "70%",
        status: kpi.engagementMetrics.quizPassRate >= 70 ? "Above" : "Below",
      },
    },
  };

  return benchmarks;
};

/**
 * Calculate customer health score
 */
exports.calculateCustomerHealthScore = (kpi) => {
  const factors = {
    engagement: kpi.engagementMetrics.completionRate / 100,
    retention: (100 - kpi.financialMetrics.churnRate) / 100,
    satisfaction: kpi.engagementMetrics.quizPassRate / 100,
  };

  const score =
    ((factors.engagement + factors.retention + factors.satisfaction) / 3) * 100;

  return {
    score: score.toFixed(1),
    factors,
    grade: score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D",
  };
};

/**
 * Calculate viral coefficient
 */
exports.calculateViralCoefficient = (kpi, invitesSent, conversionRate) => {
  // K = i * conversion rate
  // where i = number of invites sent per user
  const invitesPerUser = invitesSent / kpi.userMetrics.totalRegisteredUsers;
  const kFactor = invitesPerUser * conversionRate;

  return {
    kFactor: kFactor.toFixed(2),
    invitesPerUser: invitesPerUser.toFixed(2),
    interpretation: kFactor >= 1 ? "Viral" : "Not viral",
  };
};

/**
 * Calculate revenue efficiency metrics
 */
exports.calculateRevenueEfficiency = (kpi) => {
  const magicNumber = kpi.financialMetrics.mrr / kpi.financialMetrics.cac;
  const paybackPeriod = kpi.financialMetrics.cac / kpi.financialMetrics.arpu;

  return {
    magicNumber: magicNumber.toFixed(2),
    paybackPeriod: paybackPeriod.toFixed(1) + " months",
    efficiency: magicNumber >= 1 ? "Good" : "Needs improvement",
  };
};

/**
 * Format percentage
 */
exports.formatPercentage = (value) => {
  return value.toFixed(1) + "%";
};

/**
 * Format currency
 */
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};
