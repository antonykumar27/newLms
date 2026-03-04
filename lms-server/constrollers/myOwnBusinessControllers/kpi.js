const KPI = require("../models/kpi.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateLTVCACRatio,
  calculateARR,
  calculateEngagementScore,
  generateKPITrends,
  benchmarkComparison,
} = require("../utils/kpiCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new KPI record
 * @route   POST /api/kpi
 * @access  Private (Admin/Business Head)
 */
exports.createKPI = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if KPI already exists for this project
  const existingKPI = await KPI.findOne({ projectId });
  if (existingKPI) {
    return next(new AppError("KPI already exists for this project", 400));
  }

  // Calculate derived metrics
  const arr = calculateARR(req.body.financialMetrics?.mrr);
  const ltvCacRatio = calculateLTVCACRatio(
    req.body.financialMetrics?.ltv,
    req.body.financialMetrics?.cac,
  );

  const kpiData = {
    ...req.body,
    financialMetrics: {
      ...req.body.financialMetrics,
      arr,
      ltvCacRatio,
    },
  };

  const kpi = await KPI.create(kpiData);

  res.status(201).json({
    success: true,
    message: "KPI record created successfully",
    data: {
      kpi,
    },
  });
});

/**
 * @desc    Get all KPI records
 * @route   GET /api/kpi
 * @access  Private
 */
exports.getAllKPIs = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = KPI.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const kpis = await query;
  const total = await KPI.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: kpis.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      kpis,
    },
  });
});

/**
 * @desc    Get single KPI record by ID
 * @route   GET /api/kpi/:id
 * @access  Private
 */
exports.getKPI = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findById(req.params.id);

  if (!kpi) {
    return next(new AppError("No KPI record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      kpi,
    },
  });
});

/**
 * @desc    Get KPI by project ID
 * @route   GET /api/kpi/project/:projectId
 * @access  Private
 */
exports.getKPIByProjectId = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({
    projectId: req.params.projectId,
  });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      kpi,
    },
  });
});

/**
 * @desc    Update KPI record
 * @route   PATCH /api/kpi/:id
 * @access  Private (Admin/Business Head)
 */
exports.updateKPI = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findById(req.params.id);

  if (!kpi) {
    return next(new AppError("No KPI record found with that ID", 404));
  }

  // Recalculate derived metrics if related fields changed
  const updateData = { ...req.body, updatedAt: Date.now() };

  if (req.body.financialMetrics) {
    const arr = calculateARR(
      req.body.financialMetrics.mrr || kpi.financialMetrics.mrr,
    );
    const ltvCacRatio = calculateLTVCACRatio(
      req.body.financialMetrics.ltv || kpi.financialMetrics.ltv,
      req.body.financialMetrics.cac || kpi.financialMetrics.cac,
    );

    updateData.financialMetrics = {
      ...kpi.financialMetrics.toObject(),
      ...req.body.financialMetrics,
      arr,
      ltvCacRatio,
    };
  }

  const updatedKPI = await KPI.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "KPI record updated successfully",
    data: {
      kpi: updatedKPI,
    },
  });
});

/**
 * @desc    Delete KPI record
 * @route   DELETE /api/kpi/:id
 * @access  Private (Admin only)
 */
exports.deleteKPI = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findByIdAndDelete(req.params.id);

  if (!kpi) {
    return next(new AppError("No KPI record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "KPI record deleted successfully",
    data: null,
  });
});

// ============================================
// 📊 DASHBOARD & ANALYTICS
// ============================================

/**
 * @desc    Get comprehensive KPI dashboard
 * @route   GET /api/kpi/dashboard/:projectId
 * @access  Private
 */
exports.getKPIDashboard = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  // Calculate health score
  const healthScore = calculateHealthScore(kpi);

  // Get benchmarks
  const benchmarks = benchmarkComparison(kpi);

  const dashboard = {
    overview: {
      healthScore,
      status:
        healthScore > 70
          ? "Healthy"
          : healthScore > 40
            ? "Warning"
            : "Critical",
      lastUpdated: kpi.updatedAt,
    },
    userMetrics: {
      total: kpi.userMetrics.totalRegisteredUsers,
      activeMonthly: kpi.userMetrics.activeUsersMonthly,
      activeDaily: kpi.userMetrics.activeUsersDaily,
      newThisMonth: kpi.userMetrics.newUsersThisMonth,
      engagement: {
        avgSessionDuration: kpi.userMetrics.averageSessionDuration,
        completionRate: kpi.userMetrics.courseCompletionRate + "%",
      },
      stickiness:
        (
          (kpi.userMetrics.activeUsersDaily /
            kpi.userMetrics.activeUsersMonthly) *
          100
        ).toFixed(1) + "%",
    },
    financialMetrics: {
      mrr: formatCurrency(kpi.financialMetrics.mrr),
      arr: formatCurrency(kpi.financialMetrics.arr),
      arpu: formatCurrency(kpi.financialMetrics.arpu),
      ltv: formatCurrency(kpi.financialMetrics.ltv),
      cac: formatCurrency(kpi.financialMetrics.cac),
      ltvCacRatio: kpi.financialMetrics.ltvCacRatio.toFixed(2),
      churnRate: kpi.financialMetrics.churnRate + "%",
    },
    contentMetrics: {
      totalCourses: kpi.contentMetrics.totalCourses,
      totalVideoHours: kpi.contentMetrics.totalVideoHours,
      newContentPerMonth: kpi.contentMetrics.newContentPerMonth,
      popularCourses: kpi.contentMetrics.popularCourses.slice(0, 5),
      categoryBreakdown: kpi.contentMetrics.categoryWise,
    },
    engagementMetrics: {
      averageWatchTime: kpi.engagementMetrics.averageWatchTime + " mins",
      completionRate: kpi.engagementMetrics.completionRate + "%",
      quizPassRate: kpi.engagementMetrics.quizPassRate + "%",
      certificatesEarned: kpi.engagementMetrics.certificateEarned,
      discussionPosts: kpi.engagementMetrics.discussionPosts,
      communityHealth: calculateCommunityHealth(kpi.engagementMetrics),
    },
    benchmarks: benchmarks,
  };

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});

/**
 * @desc    Get user metrics with trends
 * @route   GET /api/kpi/:projectId/user-metrics
 * @access  Private
 */
exports.getUserMetrics = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  const metrics = {
    current: {
      totalUsers: kpi.userMetrics.totalRegisteredUsers,
      activeMonthly: kpi.userMetrics.activeUsersMonthly,
      activeDaily: kpi.userMetrics.activeUsersDaily,
      newUsers: kpi.userMetrics.newUsersThisMonth,
      sessionDuration: kpi.userMetrics.averageSessionDuration,
      completionRate: kpi.userMetrics.courseCompletionRate,
    },
    ratios: {
      conversionRate:
        (
          (kpi.userMetrics.newUsersThisMonth /
            kpi.userMetrics.totalRegisteredUsers) *
          100
        ).toFixed(1) + "%",
      retentionRate: 100 - kpi.financialMetrics.churnRate + "%",
      dailyActiveRatio:
        (
          (kpi.userMetrics.activeUsersDaily /
            kpi.userMetrics.activeUsersMonthly) *
          100
        ).toFixed(1) + "%",
    },
    targets: {
      totalUsersTarget: Math.round(kpi.userMetrics.totalRegisteredUsers * 1.2),
      activeMonthlyTarget: Math.round(
        kpi.userMetrics.activeUsersMonthly * 1.15,
      ),
      completionRateTarget: Math.min(
        kpi.userMetrics.courseCompletionRate + 10,
        100,
      ),
    },
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

/**
 * @desc    Get financial metrics with analysis
 * @route   GET /api/kpi/:projectId/financial-metrics
 * @access  Private (Finance Manager)
 */
exports.getFinancialMetrics = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  const analysis = {
    revenue: {
      mrr: formatCurrency(kpi.financialMetrics.mrr),
      arr: formatCurrency(kpi.financialMetrics.arr),
      projectedYearEnd: formatCurrency(kpi.financialMetrics.mrr * 12 * 1.1),
    },
    customerEconomics: {
      arpu: formatCurrency(kpi.financialMetrics.arpu),
      ltv: formatCurrency(kpi.financialMetrics.ltv),
      cac: formatCurrency(kpi.financialMetrics.cac),
      ltvCacRatio: kpi.financialMetrics.ltvCacRatio.toFixed(2),
      paybackPeriod:
        (kpi.financialMetrics.cac / kpi.financialMetrics.arpu).toFixed(1) +
        " months",
    },
    health: {
      churnRate: kpi.financialMetrics.churnRate + "%",
      grossMargin: calculateGrossMargin(kpi),
      burnMultiple: calculateBurnMultiple(kpi),
    },
    recommendations: generateFinancialRecommendations(kpi),
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get content performance metrics
 * @route   GET /api/kpi/:projectId/content-metrics
 * @access  Private
 */
exports.getContentMetrics = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  const metrics = {
    overview: {
      totalCourses: kpi.contentMetrics.totalCourses,
      totalHours: kpi.contentMetrics.totalVideoHours,
      avgCourseLength:
        (
          kpi.contentMetrics.totalVideoHours / kpi.contentMetrics.totalCourses
        ).toFixed(1) + " hours",
      newContentMonthly: kpi.contentMetrics.newContentPerMonth + " hours",
    },
    popularCourses: kpi.contentMetrics.popularCourses.map((course) => ({
      name: course.courseName,
      enrollments: course.enrollments,
      revenue: formatCurrency(course.revenue),
      conversionRate:
        (
          (course.enrollments / kpi.userMetrics.totalRegisteredUsers) *
          100
        ).toFixed(1) + "%",
    })),
    categoryAnalysis: kpi.contentMetrics.categoryWise.map((cat) => ({
      category: cat.category,
      courses: cat.courses,
      enrollments: cat.enrollments,
      avgEnrollmentsPerCourse: (cat.enrollments / cat.courses).toFixed(0),
    })),
    topPerforming: findTopPerformingCategories(kpi.contentMetrics.categoryWise),
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

/**
 * @desc    Get engagement metrics
 * @route   GET /api/kpi/:projectId/engagement-metrics
 * @access  Private
 */
exports.getEngagementMetrics = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  const metrics = {
    watchTime: {
      average: kpi.engagementMetrics.averageWatchTime + " mins",
      total:
        kpi.engagementMetrics.averageWatchTime *
          kpi.userMetrics.activeUsersMonthly +
        " mins",
      target:
        (kpi.engagementMetrics.averageWatchTime * 1.2).toFixed(0) + " mins",
    },
    completion: {
      rate: kpi.engagementMetrics.completionRate + "%",
      target: Math.min(kpi.engagementMetrics.completionRate + 15, 100) + "%",
      certificates: kpi.engagementMetrics.certificateEarned,
    },
    assessment: {
      quizPassRate: kpi.engagementMetrics.quizPassRate + "%",
      avgScore: calculateAverageQuizScore(kpi),
    },
    community: {
      discussionPosts: kpi.engagementMetrics.discussionPosts,
      postsPerUser: (
        kpi.engagementMetrics.discussionPosts /
        kpi.userMetrics.activeUsersMonthly
      ).toFixed(2),
      engagementScore: calculateEngagementScore(kpi.engagementMetrics),
    },
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

// ============================================
// 📈 TRENDS & FORECASTING
// ============================================

/**
 * @desc    Get KPI trends over time
 * @route   GET /api/kpi/trends/:projectId
 * @access  Private
 */
exports.getKPITrends = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { days = 30 } = req.query;

  // Get historical KPI data (you would typically have multiple records over time)
  const historicalKPI = await KPI.find({
    projectId,
    createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
  }).sort("createdAt");

  const trends = generateKPITrends(historicalKPI);

  res.status(200).json({
    success: true,
    data: trends,
  });
});

/**
 * @desc    Get KPI forecasts
 * @route   GET /api/kpi/forecast/:projectId
 * @access  Private (Business Head)
 */
exports.getKPIForecast = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  const { months = 12 } = req.query;

  const forecast = {
    users: generateUserForecast(kpi, months),
    revenue: generateRevenueForecast(kpi, months),
    engagement: generateEngagementForecast(kpi, months),
    summary: {
      projectedUsers: Math.round(
        kpi.userMetrics.totalRegisteredUsers * Math.pow(1.1, months / 12),
      ),
      projectedMRR: formatCurrency(
        kpi.financialMetrics.mrr * Math.pow(1.15, months / 12),
      ),
      projectedARR: formatCurrency(
        kpi.financialMetrics.arr * Math.pow(1.15, months / 12),
      ),
    },
  };

  res.status(200).json({
    success: true,
    data: forecast,
  });
});

// ============================================
// 🎯 TARGETS & GOALS
// ============================================

/**
 * @desc    Set KPI targets
 * @route   PATCH /api/kpi/:id/targets
 * @access  Private (Admin/Business Head)
 */
exports.setTargets = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findById(req.params.id);

  if (!kpi) {
    return next(new AppError("No KPI record found with that ID", 404));
  }

  const { targets } = req.body;

  // Store targets in a separate field (you may want to add this to schema)
  kpi.targets = targets;
  await kpi.save();

  // Calculate progress
  const progress = calculateProgress(kpi, targets);

  res.status(200).json({
    success: true,
    message: "Targets set successfully",
    data: {
      targets,
      progress,
    },
  });
});

/**
 * @desc    Get goal progress
 * @route   GET /api/kpi/:id/progress
 * @access  Private
 */
exports.getGoalProgress = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findById(req.params.id);

  if (!kpi) {
    return next(new AppError("No KPI record found with that ID", 404));
  }

  const goals = {
    userGoals: {
      current: kpi.userMetrics.totalRegisteredUsers,
      target:
        kpi.targets?.totalUsers || kpi.userMetrics.totalRegisteredUsers * 1.2,
      progress:
        (
          (kpi.userMetrics.totalRegisteredUsers /
            (kpi.targets?.totalUsers ||
              kpi.userMetrics.totalRegisteredUsers * 1.2)) *
          100
        ).toFixed(1) + "%",
    },
    revenueGoals: {
      current: formatCurrency(kpi.financialMetrics.mrr),
      target: formatCurrency(
        kpi.targets?.mrr || kpi.financialMetrics.mrr * 1.15,
      ),
      progress:
        (
          (kpi.financialMetrics.mrr /
            (kpi.targets?.mrr || kpi.financialMetrics.mrr * 1.15)) *
          100
        ).toFixed(1) + "%",
    },
    engagementGoals: {
      current: kpi.engagementMetrics.completionRate + "%",
      target:
        (kpi.targets?.completionRate ||
          kpi.engagementMetrics.completionRate + 10) + "%",
      progress:
        (
          (kpi.engagementMetrics.completionRate /
            (kpi.targets?.completionRate ||
              kpi.engagementMetrics.completionRate + 10)) *
          100
        ).toFixed(1) + "%",
    },
  };

  res.status(200).json({
    success: true,
    data: goals,
  });
});

// ============================================
// 📊 EXPORT & REPORTS
// ============================================

/**
 * @desc    Export KPI report
 * @route   GET /api/kpi/export/:projectId
 * @access  Private
 */
exports.exportKPIReport = catchAsync(async (req, res, next) => {
  const kpi = await KPI.findOne({ projectId: req.params.projectId });

  if (!kpi) {
    return next(new AppError("No KPI found for this project", 404));
  }

  const report = {
    generatedAt: new Date(),
    projectId: kpi.projectId,
    summary: {
      overall: calculateHealthScore(kpi) > 70 ? "Good" : "Needs Improvement",
      keyMetrics: {
        users: kpi.userMetrics.totalRegisteredUsers,
        revenue: formatCurrency(kpi.financialMetrics.mrr),
        engagement: kpi.engagementMetrics.completionRate + "%",
      },
    },
    detailed: {
      userMetrics: kpi.userMetrics,
      financialMetrics: kpi.financialMetrics,
      contentMetrics: kpi.contentMetrics,
      engagementMetrics: kpi.engagementMetrics,
    },
    insights: generateInsights(kpi),
    recommendations: generateRecommendations(kpi),
  };

  res.status(200).json({
    success: true,
    data: report,
  });
});

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Calculate overall health score
 */
function calculateHealthScore(kpi) {
  const weights = {
    userGrowth: 0.2,
    revenue: 0.3,
    engagement: 0.25,
    retention: 0.25,
  };

  const userGrowthScore = Math.min(
    (kpi.userMetrics.newUsersThisMonth / kpi.userMetrics.totalRegisteredUsers) *
      100,
    100,
  );
  const revenueScore = Math.min((kpi.financialMetrics.mrr / 100000) * 100, 100); // Assuming ₹1L target
  const engagementScore = kpi.engagementMetrics.completionRate;
  const retentionScore = 100 - kpi.financialMetrics.churnRate;

  return (
    userGrowthScore * weights.userGrowth +
    revenueScore * weights.revenue +
    engagementScore * weights.engagement +
    retentionScore * weights.retention
  );
}

/**
 * Calculate community health
 */
function calculateCommunityHealth(engagementMetrics) {
  const postsPerUser = engagementMetrics.discussionPosts / 1000; // Assume 1000 users
  if (postsPerUser > 5) return "Very Active";
  if (postsPerUser > 2) return "Active";
  if (postsPerUser > 0.5) return "Moderate";
  return "Needs Attention";
}

/**
 * Calculate gross margin
 */
function calculateGrossMargin(kpi) {
  // Simplified - you'd get actual costs from financial summary
  const estimatedCosts = kpi.financialMetrics.mrr * 0.6;
  return (
    (
      ((kpi.financialMetrics.mrr - estimatedCosts) / kpi.financialMetrics.mrr) *
      100
    ).toFixed(1) + "%"
  );
}

/**
 * Calculate burn multiple
 */
function calculateBurnMultiple(kpi) {
  // Simplified burn multiple calculation
  const burnRate = kpi.financialMetrics.mrr * 0.7; // Assume 70% of revenue is burned
  const cashInBank = kpi.financialMetrics.mrr * 12; // Assume 12 months runway
  return (burnRate / cashInBank).toFixed(2);
}

/**
 * Generate financial recommendations
 */
function generateFinancialRecommendations(kpi) {
  const recommendations = [];

  if (kpi.financialMetrics.ltvCacRatio < 3) {
    recommendations.push(
      "Increase LTV/CAC ratio to at least 3 by reducing CAC or increasing LTV",
    );
  }
  if (kpi.financialMetrics.churnRate > 5) {
    recommendations.push(
      "Focus on reducing churn rate - consider engagement campaigns",
    );
  }
  if (kpi.financialMetrics.arpu < 500) {
    recommendations.push("Explore upselling opportunities to increase ARPU");
  }

  return recommendations;
}

/**
 * Find top performing categories
 */
function findTopPerformingCategories(categoryWise) {
  return categoryWise
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 3)
    .map((cat) => cat.category);
}

/**
 * Calculate average quiz score
 */
function calculateAverageQuizScore(kpi) {
  // This would come from actual quiz data
  return "75%";
}

/**
 * Generate user forecast
 */
function generateUserForecast(kpi, months) {
  const forecast = [];
  let users = kpi.userMetrics.totalRegisteredUsers;
  const growthRate = 0.1; // 10% monthly growth

  for (let i = 1; i <= months; i++) {
    users = users * (1 + growthRate);
    forecast.push({
      month: i,
      projectedUsers: Math.round(users),
    });
  }

  return forecast;
}

/**
 * Generate revenue forecast
 */
function generateRevenueForecast(kpi, months) {
  const forecast = [];
  let revenue = kpi.financialMetrics.mrr;
  const growthRate = 0.12; // 12% monthly growth

  for (let i = 1; i <= months; i++) {
    revenue = revenue * (1 + growthRate);
    forecast.push({
      month: i,
      projectedMRR: formatCurrency(revenue),
    });
  }

  return forecast;
}

/**
 * Generate engagement forecast
 */
function generateEngagementForecast(kpi, months) {
  const forecast = [];
  let completionRate = kpi.engagementMetrics.completionRate;

  for (let i = 1; i <= months; i++) {
    completionRate = Math.min(completionRate + 1, 95);
    forecast.push({
      month: i,
      projectedCompletionRate: completionRate.toFixed(1) + "%",
    });
  }

  return forecast;
}

/**
 * Calculate progress towards targets
 */
function calculateProgress(kpi, targets) {
  return {
    users:
      (
        (kpi.userMetrics.totalRegisteredUsers / targets.totalUsers) *
        100
      ).toFixed(1) + "%",
    revenue: ((kpi.financialMetrics.mrr / targets.mrr) * 100).toFixed(1) + "%",
    engagement:
      (
        (kpi.engagementMetrics.completionRate / targets.completionRate) *
        100
      ).toFixed(1) + "%",
  };
}

/**
 * Generate insights
 */
function generateInsights(kpi) {
  const insights = [];

  if (
    kpi.userMetrics.newUsersThisMonth >
    kpi.userMetrics.newUsersThisMonth * 1.1
  ) {
    insights.push(
      "User growth is accelerating - marketing campaigns working well",
    );
  }
  if (kpi.engagementMetrics.completionRate > 70) {
    insights.push("Content quality is high - students are completing courses");
  }
  if (kpi.financialMetrics.churnRate < 3) {
    insights.push(
      "Excellent retention - students are staying with the platform",
    );
  }

  return insights;
}

/**
 * Generate recommendations
 */
function generateRecommendations(kpi) {
  const recommendations = [];

  if (kpi.userMetrics.averageSessionDuration < 15) {
    recommendations.push(
      "Create shorter, more engaging content to increase session duration",
    );
  }
  if (kpi.contentMetrics.popularCourses.length < 3) {
    recommendations.push("Develop more courses in popular categories");
  }
  if (kpi.engagementMetrics.discussionPosts < 100) {
    recommendations.push(
      "Encourage more community interaction through discussion forums",
    );
  }

  return recommendations;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

module.exports = exports;
