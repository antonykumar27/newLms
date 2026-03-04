const Infrastructure = require("../models/infrastructure.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateCloudTotals,
  calculateStorageTotals,
  calculateThirdPartyTotals,
  calculateGrandTotals,
  suggestOptimizations,
  compareProviders,
  estimateScaling,
} = require("../utils/infraCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new infrastructure cost estimate
 * @route   POST /api/infrastructure
 * @access  Private (Admin/Tech Lead)
 */
exports.createInfrastructure = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if infrastructure already exists
  const existingInfra = await Infrastructure.findOne({ projectId });
  if (existingInfra) {
    return next(
      new AppError("Infrastructure already exists for this project", 400),
    );
  }

  // Calculate all totals before saving
  const cloudTotals = calculateCloudTotals(req.body.cloudHosting);
  const storageTotals = calculateStorageTotals(req.body.storageAndCDN);
  const thirdPartyTotals = calculateThirdPartyTotals(
    req.body.thirdPartyServices,
  );
  const grandTotals = calculateGrandTotals(
    cloudTotals,
    storageTotals,
    thirdPartyTotals,
  );

  const infraData = {
    ...req.body,
    cloudHosting: {
      ...req.body.cloudHosting,
      totalCloudMonthly: cloudTotals.monthly,
      totalCloudYearly: cloudTotals.yearly,
      totalCloudThreeYear: cloudTotals.threeYear,
    },
    storageAndCDN: {
      ...req.body.storageAndCDN,
      totalStorageMonthly: storageTotals.monthly,
      totalStorageThreeYear: storageTotals.threeYear,
    },
    thirdPartyServices: {
      ...req.body.thirdPartyServices,
      totalThirdPartyMonthly: thirdPartyTotals.monthly,
      totalThirdPartyThreeYear: thirdPartyTotals.threeYear,
    },
    totalInfrastructureMonthly: grandTotals.monthly,
    totalInfrastructureYearly: grandTotals.yearly,
    totalInfrastructureThreeYear: grandTotals.threeYear,
  };

  const infrastructure = await Infrastructure.create(infraData);

  res.status(201).json({
    success: true,
    message: "Infrastructure cost estimate created successfully",
    data: {
      infrastructure,
    },
  });
});

/**
 * @desc    Get all infrastructure estimates
 * @route   GET /api/infrastructure
 * @access  Private
 */
exports.getAllInfrastructure = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = Infrastructure.find(queryObj);

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
  const infrastructure = await query;
  const total = await Infrastructure.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: infrastructure.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      infrastructure,
    },
  });
});

/**
 * @desc    Get single infrastructure estimate by ID
 * @route   GET /api/infrastructure/:id
 * @access  Private
 */
exports.getInfrastructure = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      infrastructure,
    },
  });
});

/**
 * @desc    Get infrastructure by project ID
 * @route   GET /api/infrastructure/project/:projectId
 * @access  Private
 */
exports.getInfrastructureByProjectId = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findOne({
    projectId: req.params.projectId,
  });

  if (!infrastructure) {
    return next(new AppError("No infrastructure found for this project", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      infrastructure,
    },
  });
});

/**
 * @desc    Update infrastructure estimate
 * @route   PATCH /api/infrastructure/:id
 * @access  Private (Admin/Tech Lead)
 */
exports.updateInfrastructure = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  // Merge existing data with updates
  const mergedData = {
    ...infrastructure.toObject(),
    ...req.body,
  };

  // Recalculate totals
  const cloudTotals = calculateCloudTotals(mergedData.cloudHosting);
  const storageTotals = calculateStorageTotals(mergedData.storageAndCDN);
  const thirdPartyTotals = calculateThirdPartyTotals(
    mergedData.thirdPartyServices,
  );
  const grandTotals = calculateGrandTotals(
    cloudTotals,
    storageTotals,
    thirdPartyTotals,
  );

  const updateData = {
    ...req.body,
    cloudHosting: {
      ...mergedData.cloudHosting,
      totalCloudMonthly: cloudTotals.monthly,
      totalCloudYearly: cloudTotals.yearly,
      totalCloudThreeYear: cloudTotals.threeYear,
    },
    storageAndCDN: {
      ...mergedData.storageAndCDN,
      totalStorageMonthly: storageTotals.monthly,
      totalStorageThreeYear: storageTotals.threeYear,
    },
    thirdPartyServices: {
      ...mergedData.thirdPartyServices,
      totalThirdPartyMonthly: thirdPartyTotals.monthly,
      totalThirdPartyThreeYear: thirdPartyTotals.threeYear,
    },
    totalInfrastructureMonthly: grandTotals.monthly,
    totalInfrastructureYearly: grandTotals.yearly,
    totalInfrastructureThreeYear: grandTotals.threeYear,
    updatedAt: Date.now(),
  };

  const updatedInfra = await Infrastructure.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Infrastructure updated successfully",
    data: {
      infrastructure: updatedInfra,
    },
  });
});

/**
 * @desc    Delete infrastructure estimate
 * @route   DELETE /api/infrastructure/:id
 * @access  Private (Admin only)
 */
exports.deleteInfrastructure = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findByIdAndDelete(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Infrastructure deleted successfully",
    data: null,
  });
});

// ============================================
// 💰 COST ANALYSIS & OPTIMIZATION
// ============================================

/**
 * @desc    Get cost breakdown and optimization suggestions
 * @route   GET /api/infrastructure/:id/optimize
 * @access  Private (Tech Lead)
 */
exports.getOptimizationSuggestions = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  const suggestions = suggestOptimizations(infrastructure);

  // Calculate potential savings
  const totalSavings = suggestions.reduce(
    (sum, s) => sum + (s.savings || 0),
    0,
  );
  const savingsPercentage = (
    (totalSavings / infrastructure.totalInfrastructureThreeYear) *
    100
  ).toFixed(2);

  res.status(200).json({
    success: true,
    data: {
      currentTotal: infrastructure.totalInfrastructureThreeYear,
      potentialSavings: totalSavings,
      savingsPercentage,
      suggestions,
      quickWins: suggestions.filter((s) => s.difficulty === "easy"),
      longTerm: suggestions.filter((s) => s.difficulty === "hard"),
    },
  });
});

/**
 * @desc    Compare with different providers
 * @route   POST /api/infrastructure/compare-providers
 * @access  Private
 */
exports.compareProviders = catchAsync(async (req, res, next) => {
  const { requirements } = req.body;

  const comparison = compareProviders(requirements);

  res.status(200).json({
    success: true,
    data: comparison,
  });
});

/**
 * @desc    Estimate scaling costs
 * @route   POST /api/infrastructure/estimate-scaling
 * @access  Private
 */
exports.estimateScaling = catchAsync(async (req, res, next) => {
  const { currentInfra, targetUsers } = req.body;

  const scalingEstimate = estimateScaling(currentInfra, targetUsers);

  res.status(200).json({
    success: true,
    data: scalingEstimate,
  });
});

/**
 * @desc    Get monthly cost breakdown
 * @route   GET /api/infrastructure/:id/monthly-breakdown
 * @access  Private
 */
exports.getMonthlyBreakdown = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  const breakdown = {
    monthly: {
      total: infrastructure.totalInfrastructureMonthly,
      cloud: infrastructure.cloudHosting.totalCloudMonthly,
      storage: infrastructure.storageAndCDN.totalStorageMonthly,
      thirdParty: infrastructure.thirdPartyServices.totalThirdPartyMonthly,
    },
    yearly: {
      total: infrastructure.totalInfrastructureYearly,
      cloud: infrastructure.cloudHosting.totalCloudYearly,
    },
    threeYear: {
      total: infrastructure.totalInfrastructureThreeYear,
      cloud: infrastructure.cloudHosting.totalCloudThreeYear,
      storage: infrastructure.storageAndCDN.totalStorageThreeYear,
      thirdParty: infrastructure.thirdPartyServices.totalThirdPartyThreeYear,
    },
    percentage: {
      cloud:
        (
          (infrastructure.cloudHosting.totalCloudThreeYear /
            infrastructure.totalInfrastructureThreeYear) *
          100
        ).toFixed(2) + "%",
      storage:
        (
          (infrastructure.storageAndCDN.totalStorageThreeYear /
            infrastructure.totalInfrastructureThreeYear) *
          100
        ).toFixed(2) + "%",
      thirdParty:
        (
          (infrastructure.thirdPartyServices.totalThirdPartyThreeYear /
            infrastructure.totalInfrastructureThreeYear) *
          100
        ).toFixed(2) + "%",
    },
  };

  res.status(200).json({
    success: true,
    data: breakdown,
  });
});

// ============================================
// 📊 USAGE MONITORING & FORECASTING
// ============================================

/**
 * @desc    Get usage forecast based on growth
 * @route   POST /api/infrastructure/forecast
 * @access  Private
 */
exports.getUsageForecast = catchAsync(async (req, res, next) => {
  const { currentUsage, growthRate, months = 12 } = req.body;

  const forecast = [];
  let usage = currentUsage;

  for (let i = 1; i <= months; i++) {
    usage = usage * (1 + growthRate / 100);
    forecast.push({
      month: i,
      usage: Math.round(usage),
      cost: Math.round(usage * 0.1), // Assume ₹0.10 per unit
    });
  }

  const totalCost = forecast.reduce((sum, m) => sum + m.cost, 0);

  res.status(200).json({
    success: true,
    data: {
      currentUsage,
      growthRate: growthRate + "%",
      months,
      forecast,
      totalProjectedCost: totalCost,
      averageMonthlyCost: totalCost / months,
    },
  });
});

/**
 * @desc    Get resource utilization
 * @route   GET /api/infrastructure/:id/utilization
 * @access  Private (Tech Lead)
 */
exports.getResourceUtilization = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  const utilization = {
    backend: {
      tier: infrastructure.cloudHosting.backendServers.tier,
      specs: infrastructure.cloudHosting.backendServers.specs,
      estimatedUtilization: "65%", // This would come from actual monitoring in production
      recommendation:
        infrastructure.cloudHosting.backendServers.specs.cpu > 4
          ? "Consider scaling down"
          : "Optimal",
    },
    database: {
      tier: infrastructure.cloudHosting.databaseServers.tier,
      storage: infrastructure.cloudHosting.databaseServers.specs.storage,
      connections:
        infrastructure.cloudHosting.databaseServers.specs.connections,
      estimatedUtilization: "45%",
      recommendation: "Good for current load",
    },
    storage: {
      current: infrastructure.storageAndCDN.videoStorage.monthlyStorage,
      used: Math.round(
        infrastructure.storageAndCDN.videoStorage.monthlyStorage * 0.6,
      ),
      free: Math.round(
        infrastructure.storageAndCDN.videoStorage.monthlyStorage * 0.4,
      ),
      utilization: "60%",
    },
  };

  res.status(200).json({
    success: true,
    data: utilization,
  });
});

// ============================================
// 🎯 TIER MANAGEMENT
// ============================================

/**
 * @desc    Upgrade backend server tier
 * @route   PATCH /api/infrastructure/:id/upgrade-backend
 * @access  Private (Tech Lead)
 */
exports.upgradeBackendTier = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  const { newTier } = req.body;
  const tierMultipliers = {
    small: { monthly: 3700, cpu: 2, ram: 4, storage: 80 },
    medium: { monthly: 7500, cpu: 4, ram: 8, storage: 160 },
    large: { monthly: 15000, cpu: 8, ram: 16, storage: 320 },
  };

  const newSpecs = tierMultipliers[newTier];

  infrastructure.cloudHosting.backendServers.tier = newTier;
  infrastructure.cloudHosting.backendServers.monthly = newSpecs.monthly;
  infrastructure.cloudHosting.backendServers.yearly = newSpecs.monthly * 12;
  infrastructure.cloudHosting.backendServers.threeYear = newSpecs.monthly * 36;
  infrastructure.cloudHosting.backendServers.specs = {
    cpu: newSpecs.cpu,
    ram: newSpecs.ram,
    storage: newSpecs.storage,
    bandwidth: 1000, // Default
  };

  // Recalculate totals
  const cloudTotals = calculateCloudTotals(infrastructure.cloudHosting);
  infrastructure.cloudHosting.totalCloudMonthly = cloudTotals.monthly;
  infrastructure.cloudHosting.totalCloudYearly = cloudTotals.yearly;
  infrastructure.cloudHosting.totalCloudThreeYear = cloudTotals.threeYear;

  // Update grand totals
  infrastructure.totalInfrastructureMonthly =
    cloudTotals.monthly +
    infrastructure.storageAndCDN.totalStorageMonthly +
    infrastructure.thirdPartyServices.totalThirdPartyMonthly;

  infrastructure.totalInfrastructureYearly =
    infrastructure.totalInfrastructureMonthly * 12;
  infrastructure.totalInfrastructureThreeYear =
    infrastructure.totalInfrastructureMonthly * 36;

  await infrastructure.save();

  res.status(200).json({
    success: true,
    message: `Backend tier upgraded to ${newTier}`,
    data: {
      infrastructure,
    },
  });
});

/**
 * @desc    Upgrade database tier
 * @route   PATCH /api/infrastructure/:id/upgrade-database
 * @access  Private (Tech Lead)
 */
exports.upgradeDatabaseTier = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  const { newTier } = req.body;
  const tierSpecs = {
    free: { monthly: 0, storage: 0.5, connections: 100 },
    m10: { monthly: 4100, storage: 1, connections: 500 },
    m20: { monthly: 8200, storage: 2, connections: 1000 },
    m30: { monthly: 16400, storage: 4, connections: 2000 },
  };

  const newSpecs = tierSpecs[newTier];

  infrastructure.cloudHosting.databaseServers.tier = newTier;
  infrastructure.cloudHosting.databaseServers.monthly = newSpecs.monthly;
  infrastructure.cloudHosting.databaseServers.yearly = newSpecs.monthly * 12;
  infrastructure.cloudHosting.databaseServers.threeYear = newSpecs.monthly * 36;
  infrastructure.cloudHosting.databaseServers.specs = {
    storage: newSpecs.storage,
    connections: newSpecs.connections,
  };

  // Recalculate totals
  const cloudTotals = calculateCloudTotals(infrastructure.cloudHosting);
  infrastructure.cloudHosting.totalCloudMonthly = cloudTotals.monthly;
  infrastructure.cloudHosting.totalCloudYearly = cloudTotals.yearly;
  infrastructure.cloudHosting.totalCloudThreeYear = cloudTotals.threeYear;

  // Update grand totals
  infrastructure.totalInfrastructureMonthly =
    cloudTotals.monthly +
    infrastructure.storageAndCDN.totalStorageMonthly +
    infrastructure.thirdPartyServices.totalThirdPartyMonthly;

  infrastructure.totalInfrastructureYearly =
    infrastructure.totalInfrastructureMonthly * 12;
  infrastructure.totalInfrastructureThreeYear =
    infrastructure.totalInfrastructureMonthly * 36;

  await infrastructure.save();

  res.status(200).json({
    success: true,
    message: `Database tier upgraded to ${newTier}`,
    data: {
      infrastructure,
    },
  });
});

// ============================================
// 📈 ANALYTICS & REPORTS
// ============================================

/**
 * @desc    Get infrastructure statistics
 * @route   GET /api/infrastructure/stats/overview
 * @access  Private (Admin/Business Head)
 */
exports.getInfrastructureStats = catchAsync(async (req, res, next) => {
  const stats = await Infrastructure.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        averageMonthlyCost: { $avg: "$totalInfrastructureMonthly" },
        averageYearlyCost: { $avg: "$totalInfrastructureYearly" },
        averageThreeYearCost: { $avg: "$totalInfrastructureThreeYear" },
        minMonthlyCost: { $min: "$totalInfrastructureMonthly" },
        maxMonthlyCost: { $max: "$totalInfrastructureMonthly" },
        totalCloudCost: { $sum: "$cloudHosting.totalCloudThreeYear" },
        totalStorageCost: { $sum: "$storageAndCDN.totalStorageThreeYear" },
        totalThirdPartyCost: {
          $sum: "$thirdPartyServices.totalThirdPartyThreeYear",
        },
      },
    },
  ]);

  // Get tier distribution
  const tierDistribution = await Infrastructure.aggregate([
    {
      $group: {
        _id: "$cloudHosting.backendServers.tier",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get provider preferences
  const providerStats = await Infrastructure.aggregate([
    {
      $group: {
        _id: "$storageAndCDN.videoStorage.provider",
        count: { $sum: 1 },
        totalCost: { $sum: "$storageAndCDN.videoStorage.threeYearCost" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      tierDistribution,
      providerStats,
    },
  });
});

/**
 * @desc    Export infrastructure data
 * @route   GET /api/infrastructure/export/:id
 * @access  Private
 */
exports.exportInfrastructure = catchAsync(async (req, res, next) => {
  const infrastructure = await Infrastructure.findById(req.params.id);

  if (!infrastructure) {
    return next(new AppError("No infrastructure found with that ID", 404));
  }

  const exportData = {
    projectId: infrastructure.projectId,
    summary: {
      totalMonthly: infrastructure.totalInfrastructureMonthly,
      totalYearly: infrastructure.totalInfrastructureYearly,
      totalThreeYear: infrastructure.totalInfrastructureThreeYear,
    },
    cloudHosting: {
      backend: {
        tier: infrastructure.cloudHosting.backendServers.tier,
        monthly: infrastructure.cloudHosting.backendServers.monthly,
        specs: infrastructure.cloudHosting.backendServers.specs,
      },
      database: {
        tier: infrastructure.cloudHosting.databaseServers.tier,
        monthly: infrastructure.cloudHosting.databaseServers.monthly,
        specs: infrastructure.cloudHosting.databaseServers.specs,
      },
      redis: {
        tier: infrastructure.cloudHosting.redisServers.tier,
        monthly: infrastructure.cloudHosting.redisServers.monthly,
      },
      totalCloud: infrastructure.cloudHosting.totalCloudThreeYear,
    },
    storageAndCDN: {
      video: {
        provider: infrastructure.storageAndCDN.videoStorage.provider,
        monthlyStorage:
          infrastructure.storageAndCDN.videoStorage.monthlyStorage,
        monthlyCost: infrastructure.storageAndCDN.videoStorage.monthlyCost,
      },
      cdn: {
        provider: infrastructure.storageAndCDN.cdn.provider,
        monthlyBandwidth: infrastructure.storageAndCDN.cdn.monthlyBandwidth,
        monthlyCost: infrastructure.storageAndCDN.cdn.monthlyCost,
      },
      backups: {
        monthly: infrastructure.storageAndCDN.backups.totalMonthly,
        threeYear: infrastructure.storageAndCDN.backups.totalThreeYear,
      },
      totalStorage: infrastructure.storageAndCDN.totalStorageThreeYear,
    },
    thirdParty: {
      email: infrastructure.thirdPartyServices.emailService,
      sms: infrastructure.thirdPartyServices.smsService,
      paymentGateway: infrastructure.thirdPartyServices.paymentGateway,
      videoConferencing: infrastructure.thirdPartyServices.videoConferencing,
      monitoring: infrastructure.thirdPartyServices.monitoring,
      totalThirdParty:
        infrastructure.thirdPartyServices.totalThirdPartyThreeYear,
    },
    createdAt: infrastructure.createdAt,
    updatedAt: infrastructure.updatedAt,
  };

  res.status(200).json({
    success: true,
    data: exportData,
  });
});

// ============================================
// 🔄 BULK OPERATIONS
// ============================================

/**
 * @desc    Bulk create infrastructure estimates
 * @route   POST /api/infrastructure/bulk
 * @access  Private (Admin only)
 */
exports.bulkCreateInfrastructure = catchAsync(async (req, res, next) => {
  const { projects } = req.body;

  if (!Array.isArray(projects) || projects.length === 0) {
    return next(new AppError("Please provide an array of projects", 400));
  }

  // Process each project with calculations
  const processedProjects = projects.map((project) => {
    const cloudTotals = calculateCloudTotals(project.cloudHosting);
    const storageTotals = calculateStorageTotals(project.storageAndCDN);
    const thirdPartyTotals = calculateThirdPartyTotals(
      project.thirdPartyServices,
    );
    const grandTotals = calculateGrandTotals(
      cloudTotals,
      storageTotals,
      thirdPartyTotals,
    );

    return {
      ...project,
      cloudHosting: {
        ...project.cloudHosting,
        totalCloudMonthly: cloudTotals.monthly,
        totalCloudYearly: cloudTotals.yearly,
        totalCloudThreeYear: cloudTotals.threeYear,
      },
      storageAndCDN: {
        ...project.storageAndCDN,
        totalStorageMonthly: storageTotals.monthly,
        totalStorageThreeYear: storageTotals.threeYear,
      },
      thirdPartyServices: {
        ...project.thirdPartyServices,
        totalThirdPartyMonthly: thirdPartyTotals.monthly,
        totalThirdPartyThreeYear: thirdPartyTotals.threeYear,
      },
      totalInfrastructureMonthly: grandTotals.monthly,
      totalInfrastructureYearly: grandTotals.yearly,
      totalInfrastructureThreeYear: grandTotals.threeYear,
    };
  });

  const createdProjects = await Infrastructure.insertMany(processedProjects);

  res.status(201).json({
    success: true,
    message: `Successfully created ${createdProjects.length} infrastructure estimates`,
    data: {
      count: createdProjects.length,
      projects: createdProjects,
    },
  });
});

module.exports = exports;
