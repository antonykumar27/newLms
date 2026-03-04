const DevelopmentCost = require("../models/developmentCost.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateWebTotal,
  calculateMobileTotal,
  calculateDesignTotal,
  calculateQATotal,
  calculateDeploymentTotal,
  calculateGrandTotal,
  calculateHourlyCost,
} = require("../utils/devCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new development cost estimate
 * @route   POST /api/development-cost
 * @access  Private (Admin/Project Manager)
 */
exports.createDevelopmentCost = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if project already exists
  const existingProject = await DevelopmentCost.findOne({ projectId });
  if (existingProject) {
    return next(
      new AppError("Development cost already exists for this project", 400),
    );
  }

  // Calculate all totals before saving
  const costData = {
    ...req.body,
    webApp: {
      ...req.body.webApp,
      totalWeb: calculateWebTotal(req.body.webApp),
    },
    mobileApp: {
      ...req.body.mobileApp,
      totalMobile: calculateMobileTotal(req.body.mobileApp),
    },
    design: {
      ...req.body.design,
      totalDesign: calculateDesignTotal(req.body.design),
    },
    qaTesting: {
      ...req.body.qaTesting,
      totalQA: calculateQATotal(req.body.qaTesting),
    },
    deployment: {
      ...req.body.deployment,
      totalDeployment: calculateDeploymentTotal(req.body.deployment),
    },
    totalDevelopmentInvestment: calculateGrandTotal(req.body),
    currency: req.body.currency || "INR",
  };

  const developmentCost = await DevelopmentCost.create(costData);

  res.status(201).json({
    success: true,
    message: "Development cost estimate created successfully",
    data: {
      developmentCost,
    },
  });
});

/**
 * @desc    Get all development cost estimates
 * @route   GET /api/development-cost
 * @access  Private
 */
exports.getAllDevelopmentCosts = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = DevelopmentCost.find(queryObj);

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
  const developmentCosts = await query;
  const total = await DevelopmentCost.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: developmentCosts.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      developmentCosts,
    },
  });
});

/**
 * @desc    Get single development cost estimate by ID
 * @route   GET /api/development-cost/:id
 * @access  Private
 */
exports.getDevelopmentCost = catchAsync(async (req, res, next) => {
  const developmentCost = await DevelopmentCost.findById(req.params.id);

  if (!developmentCost) {
    return next(new AppError("No development cost found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      developmentCost,
    },
  });
});

/**
 * @desc    Get development cost by project ID
 * @route   GET /api/development-cost/project/:projectId
 * @access  Private
 */
exports.getDevelopmentCostByProjectId = catchAsync(async (req, res, next) => {
  const developmentCost = await DevelopmentCost.findOne({
    projectId: req.params.projectId,
  });

  if (!developmentCost) {
    return next(
      new AppError("No development cost found for this project", 404),
    );
  }

  res.status(200).json({
    success: true,
    data: {
      developmentCost,
    },
  });
});

/**
 * @desc    Update development cost estimate
 * @route   PATCH /api/development-cost/:id
 * @access  Private (Admin/Project Manager)
 */
exports.updateDevelopmentCost = catchAsync(async (req, res, next) => {
  // Recalculate totals if related fields are updated
  const updateData = { ...req.body, updatedAt: Date.now() };

  // Get existing document for base data
  const existingCost = await DevelopmentCost.findById(req.params.id);
  if (!existingCost) {
    return next(new AppError("No development cost found with that ID", 404));
  }

  // Merge existing data with updates
  const mergedData = {
    ...existingCost.toObject(),
    ...req.body,
  };

  // Recalculate section totals if that section was updated
  if (req.body.webApp) {
    updateData.webApp = {
      ...mergedData.webApp,
      totalWeb: calculateWebTotal(mergedData.webApp),
    };
  }

  if (req.body.mobileApp) {
    updateData.mobileApp = {
      ...mergedData.mobileApp,
      totalMobile: calculateMobileTotal(mergedData.mobileApp),
    };
  }

  if (req.body.design) {
    updateData.design = {
      ...mergedData.design,
      totalDesign: calculateDesignTotal(mergedData.design),
    };
  }

  if (req.body.qaTesting) {
    updateData.qaTesting = {
      ...mergedData.qaTesting,
      totalQA: calculateQATotal(mergedData.qaTesting),
    };
  }

  if (req.body.deployment) {
    updateData.deployment = {
      ...mergedData.deployment,
      totalDeployment: calculateDeploymentTotal(mergedData.deployment),
    };
  }

  // Recalculate grand total
  updateData.totalDevelopmentInvestment = calculateGrandTotal(mergedData);

  const developmentCost = await DevelopmentCost.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Development cost updated successfully",
    data: {
      developmentCost,
    },
  });
});

/**
 * @desc    Delete development cost estimate
 * @route   DELETE /api/development-cost/:id
 * @access  Private (Admin only)
 */
exports.deleteDevelopmentCost = catchAsync(async (req, res, next) => {
  const developmentCost = await DevelopmentCost.findByIdAndDelete(
    req.params.id,
  );

  if (!developmentCost) {
    return next(new AppError("No development cost found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Development cost deleted successfully",
    data: null,
  });
});

// ============================================
// 💰 COST CALCULATION & MANAGEMENT
// ============================================

/**
 * @desc    Calculate estimated cost based on hours and rates
 * @route   POST /api/development-cost/calculate
 * @access  Private
 */
exports.calculateEstimate = catchAsync(async (req, res, next) => {
  const {
    webHours,
    mobileHours,
    designHours,
    qaHours,
    avgRatePerHour = 2000, // Default rate in INR
  } = req.body;

  const estimate = {
    web: calculateHourlyCost(webHours || 0, avgRatePerHour),
    mobile: calculateHourlyCost(mobileHours || 0, avgRatePerHour),
    design: calculateHourlyCost(designHours || 0, avgRatePerHour),
    qa: calculateHourlyCost(qaHours || 0, avgRatePerHour),
    total: calculateHourlyCost(
      (webHours || 0) +
        (mobileHours || 0) +
        (designHours || 0) +
        (qaHours || 0),
      avgRatePerHour,
    ),
    avgRatePerHour,
    breakdown: {
      webHours: webHours || 0,
      mobileHours: mobileHours || 0,
      designHours: designHours || 0,
      qaHours: qaHours || 0,
      totalHours:
        (webHours || 0) +
        (mobileHours || 0) +
        (designHours || 0) +
        (qaHours || 0),
    },
  };

  res.status(200).json({
    success: true,
    data: estimate,
  });
});

/**
 * @desc    Update hourly rates for a section
 * @route   PATCH /api/development-cost/:id/rates
 * @access  Private (Project Manager)
 */
exports.updateHourlyRates = catchAsync(async (req, res, next) => {
  const developmentCost = await DevelopmentCost.findById(req.params.id);

  if (!developmentCost) {
    return next(new AppError("No development cost found with that ID", 404));
  }

  const { section, ratePerHour } = req.body;

  switch (section) {
    case "frontend":
      developmentCost.webApp.frontend.ratePerHour = ratePerHour;
      developmentCost.webApp.frontend.total =
        developmentCost.webApp.frontend.hours * ratePerHour;
      break;
    case "backend":
      developmentCost.webApp.backend.ratePerHour = ratePerHour;
      developmentCost.webApp.backend.total =
        developmentCost.webApp.backend.hours * ratePerHour;
      break;
    case "reactNative":
      developmentCost.mobileApp.crossPlatform.reactNative.ratePerHour =
        ratePerHour;
      developmentCost.mobileApp.crossPlatform.reactNative.total =
        developmentCost.mobileApp.crossPlatform.reactNative.hours * ratePerHour;
      break;
    default:
      return next(new AppError("Invalid section specified", 400));
  }

  // Recalculate totals
  developmentCost.webApp.totalWeb = calculateWebTotal(developmentCost.webApp);
  developmentCost.mobileApp.totalMobile = calculateMobileTotal(
    developmentCost.mobileApp,
  );
  developmentCost.totalDevelopmentInvestment =
    calculateGrandTotal(developmentCost);

  await developmentCost.save();

  res.status(200).json({
    success: true,
    message: "Hourly rates updated successfully",
    data: {
      developmentCost,
    },
  });
});

// ============================================
// 📊 ANALYTICS & REPORTS
// ============================================

/**
 * @desc    Get development cost statistics
 * @route   GET /api/development-cost/stats/overview
 * @access  Private (Admin/Business Head)
 */
exports.getDevelopmentStats = catchAsync(async (req, res, next) => {
  const stats = await DevelopmentCost.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        averageCost: { $avg: "$totalDevelopmentInvestment" },
        minCost: { $min: "$totalDevelopmentInvestment" },
        maxCost: { $max: "$totalDevelopmentInvestment" },
        totalInvestment: { $sum: "$totalDevelopmentInvestment" },
        averageWebCost: { $avg: "$webApp.totalWeb" },
        averageMobileCost: { $avg: "$mobileApp.totalMobile" },
        averageDesignCost: { $avg: "$design.totalDesign" },
        averageQACost: { $avg: "$qaTesting.totalQA" },
        averageDeploymentCost: { $avg: "$deployment.totalDeployment" },
      },
    },
  ]);

  // Get monthly trends
  const monthlyTrends = await DevelopmentCost.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        totalCost: { $sum: "$totalDevelopmentInvestment" },
        avgCost: { $avg: "$totalDevelopmentInvestment" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  // Get cost distribution by type
  const costDistribution = await DevelopmentCost.aggregate([
    {
      $project: {
        web: "$webApp.totalWeb",
        mobile: "$mobileApp.totalMobile",
        design: "$design.totalDesign",
        qa: "$qaTesting.totalQA",
        deployment: "$deployment.totalDeployment",
      },
    },
    {
      $group: {
        _id: null,
        totalWeb: { $sum: "$web" },
        totalMobile: { $sum: "$mobile" },
        totalDesign: { $sum: "$design" },
        totalQA: { $sum: "$qa" },
        totalDeployment: { $sum: "$deployment" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      monthlyTrends,
      costDistribution: costDistribution[0] || {},
    },
  });
});

/**
 * @desc    Compare multiple development projects
 * @route   GET /api/development-cost/compare/:ids
 * @access  Private (Admin/Business Head)
 */
exports.compareProjects = catchAsync(async (req, res, next) => {
  const ids = req.params.ids.split(",");

  const projects = await DevelopmentCost.find({
    _id: { $in: ids },
  });

  if (projects.length === 0) {
    return next(new AppError("No projects found", 404));
  }

  const comparison = projects.map((project) => ({
    projectId: project.projectId,
    totalCost: project.totalDevelopmentInvestment,
    webCost: project.webApp.totalWeb,
    mobileCost: project.mobileApp.totalMobile,
    designCost: project.design.totalDesign,
    qaCost: project.qaTesting.totalQA,
    deploymentCost: project.deployment.totalDeployment,
    currency: project.currency,
    createdAt: project.createdAt,
    breakdown: {
      web: {
        frontend: project.webApp.frontend.subTotal,
        backend: project.webApp.backend.subTotal,
        database: project.webApp.database.subTotal,
        thirdParty: project.webApp.thirdParty.subTotal,
      },
      mobile: {
        crossPlatform: project.mobileApp.crossPlatform.subTotal,
        ios: project.mobileApp.iosSpecific.subTotal,
        android: project.mobileApp.androidSpecific.subTotal,
        features: project.mobileApp.mobileFeatures.subTotal,
      },
    },
  }));

  // Calculate averages
  const averages = {
    totalCost:
      comparison.reduce((sum, p) => sum + p.totalCost, 0) / comparison.length,
    webCost:
      comparison.reduce((sum, p) => sum + p.webCost, 0) / comparison.length,
    mobileCost:
      comparison.reduce((sum, p) => sum + p.mobileCost, 0) / comparison.length,
  };

  res.status(200).json({
    success: true,
    data: {
      comparison,
      averages,
      totalProjects: comparison.length,
    },
  });
});

/**
 * @desc    Get cost breakdown for a project
 * @route   GET /api/development-cost/:id/breakdown
 * @access  Private
 */
exports.getCostBreakdown = catchAsync(async (req, res, next) => {
  const developmentCost = await DevelopmentCost.findById(req.params.id);

  if (!developmentCost) {
    return next(new AppError("No development cost found with that ID", 404));
  }

  const breakdown = {
    total: developmentCost.totalDevelopmentInvestment,
    currency: developmentCost.currency,
    categories: [
      {
        name: "Web Development",
        cost: developmentCost.webApp.totalWeb || 0,
        percentage: (
          (developmentCost.webApp.totalWeb /
            developmentCost.totalDevelopmentInvestment) *
          100
        ).toFixed(2),
        subCategories: {
          frontend: developmentCost.webApp.frontend.subTotal,
          backend: developmentCost.webApp.backend.subTotal,
          database: developmentCost.webApp.database.subTotal,
          thirdParty: developmentCost.webApp.thirdParty.subTotal,
        },
      },
      {
        name: "Mobile Development",
        cost: developmentCost.mobileApp.totalMobile || 0,
        percentage: (
          (developmentCost.mobileApp.totalMobile /
            developmentCost.totalDevelopmentInvestment) *
          100
        ).toFixed(2),
        subCategories: {
          crossPlatform: developmentCost.mobileApp.crossPlatform.subTotal,
          iosSpecific: developmentCost.mobileApp.iosSpecific.subTotal,
          androidSpecific: developmentCost.mobileApp.androidSpecific.subTotal,
          features: developmentCost.mobileApp.mobileFeatures.subTotal,
        },
      },
      {
        name: "Design",
        cost: developmentCost.design.totalDesign || 0,
        percentage: (
          (developmentCost.design.totalDesign /
            developmentCost.totalDevelopmentInvestment) *
          100
        ).toFixed(2),
        subCategories: {
          webDesign: developmentCost.design.webDesign.subTotal,
          mobileDesign: developmentCost.design.mobileDesign.subTotal,
          branding: developmentCost.design.branding.subTotal,
        },
      },
      {
        name: "QA & Testing",
        cost: developmentCost.qaTesting.totalQA || 0,
        percentage: (
          (developmentCost.qaTesting.totalQA /
            developmentCost.totalDevelopmentInvestment) *
          100
        ).toFixed(2),
        subCategories: {
          manual: developmentCost.qaTesting.manualTesting.subTotal,
          automated: developmentCost.qaTesting.automatedTesting.subTotal,
          device: developmentCost.qaTesting.deviceTesting.subTotal,
          security: developmentCost.qaTesting.securityAudit.subTotal,
        },
      },
      {
        name: "Deployment",
        cost: developmentCost.deployment.totalDeployment || 0,
        percentage: (
          (developmentCost.deployment.totalDeployment /
            developmentCost.totalDevelopmentInvestment) *
          100
        ).toFixed(2),
        subCategories: {
          appStore: developmentCost.deployment.appStoreAccounts.subTotal,
          domain: developmentCost.deployment.domainAndSSL.subTotal,
          server: developmentCost.deployment.serverSetup.subTotal,
        },
      },
    ],
    hourlyBreakdown: {
      frontend: {
        hours: developmentCost.webApp.frontend.hours,
        rate: developmentCost.webApp.frontend.ratePerHour,
      },
      backend: {
        hours: developmentCost.webApp.backend.hours,
        rate: developmentCost.webApp.backend.ratePerHour,
      },
      reactNative: {
        hours: developmentCost.mobileApp.crossPlatform.reactNative.hours,
        rate: developmentCost.mobileApp.crossPlatform.reactNative.ratePerHour,
      },
    },
  };

  res.status(200).json({
    success: true,
    data: breakdown,
  });
});

// ============================================
// 📈 PROJECT PLANNING
// ============================================

/**
 * @desc    Get timeline estimate based on hours
 * @route   POST /api/development-cost/timeline
 * @access  Private
 */
exports.estimateTimeline = catchAsync(async (req, res, next) => {
  const {
    totalHours,
    teamSize = 5,
    workingDaysPerWeek = 5,
    hoursPerDay = 8,
  } = req.body;

  const totalDays = Math.ceil(totalHours / (teamSize * hoursPerDay));
  const totalWeeks = Math.ceil(totalDays / workingDaysPerWeek);
  const totalMonths = Math.ceil(totalWeeks / 4);

  const timeline = {
    totalHours,
    teamSize,
    workingDaysPerWeek,
    hoursPerDay,
    estimatedDays: totalDays,
    estimatedWeeks: totalWeeks,
    estimatedMonths: totalMonths,
    breakdown: {
      perPersonHours: Math.ceil(totalHours / teamSize),
      perPersonDays: Math.ceil(totalDays / teamSize),
      dailyProgress: teamSize * hoursPerDay,
      weeklyProgress: teamSize * hoursPerDay * workingDaysPerWeek,
    },
    milestones: generateMilestones(
      totalWeeks,
      totalHours,
      teamSize,
      hoursPerDay,
    ),
  };

  res.status(200).json({
    success: true,
    data: timeline,
  });
});

// Helper function to generate milestones
function generateMilestones(totalWeeks, totalHours, teamSize, hoursPerDay) {
  const milestones = [];
  const weeklyProgress = teamSize * hoursPerDay * 5; // 5 working days

  for (let week = 1; week <= totalWeeks; week++) {
    const progress = Math.min(week * weeklyProgress, totalHours);
    const percentage = (progress / totalHours) * 100;

    milestones.push({
      week,
      hoursCompleted: progress,
      percentage: Math.round(percentage),
      remainingHours: totalHours - progress,
    });
  }

  return milestones;
}

/**
 * @desc    Get resource allocation suggestion
 * @route   POST /api/development-cost/resources
 * @access  Private
 */
exports.suggestResources = catchAsync(async (req, res, next) => {
  const { projectScope, timeline } = req.body;

  // Define resource requirements based on project scope
  const resourceMatrix = {
    small: {
      frontend: 1,
      backend: 1,
      mobile: 1,
      designer: 1,
      qa: 1,
      projectManager: 0.5,
    },
    medium: {
      frontend: 2,
      backend: 2,
      mobile: 2,
      designer: 1,
      qa: 2,
      projectManager: 1,
    },
    large: {
      frontend: 3,
      backend: 3,
      mobile: 3,
      designer: 2,
      qa: 3,
      projectManager: 1,
      devOps: 1,
    },
  };

  const resources = resourceMatrix[projectScope] || resourceMatrix.medium;

  // Calculate costs
  const monthlyRates = {
    frontend: 60000,
    backend: 65000,
    mobile: 65000,
    designer: 55000,
    qa: 50000,
    projectManager: 80000,
    devOps: 70000,
  };

  const monthlyCost = Object.entries(resources).reduce((sum, [role, count]) => {
    return sum + (monthlyRates[role] || 0) * count;
  }, 0);

  const totalCost = monthlyCost * (timeline || 6);

  res.status(200).json({
    success: true,
    data: {
      projectScope,
      timelineMonths: timeline || 6,
      resourceAllocation: resources,
      monthlyRates,
      monthlyCost,
      totalCost,
      teamSize: Object.values(resources).reduce((sum, count) => sum + count, 0),
    },
  });
});

// ============================================
// 📋 BULK OPERATIONS
// ============================================

/**
 * @desc    Bulk create development costs
 * @route   POST /api/development-cost/bulk
 * @access  Private (Admin only)
 */
exports.bulkCreateDevelopmentCosts = catchAsync(async (req, res, next) => {
  const { projects } = req.body;

  if (!Array.isArray(projects) || projects.length === 0) {
    return next(new AppError("Please provide an array of projects", 400));
  }

  // Process each project with calculations
  const processedProjects = projects.map((project) => ({
    ...project,
    webApp: {
      ...project.webApp,
      totalWeb: calculateWebTotal(project.webApp),
    },
    mobileApp: {
      ...project.mobileApp,
      totalMobile: calculateMobileTotal(project.mobileApp),
    },
    design: {
      ...project.design,
      totalDesign: calculateDesignTotal(project.design),
    },
    qaTesting: {
      ...project.qaTesting,
      totalQA: calculateQATotal(project.qaTesting),
    },
    deployment: {
      ...project.deployment,
      totalDeployment: calculateDeploymentTotal(project.deployment),
    },
    totalDevelopmentInvestment: calculateGrandTotal(project),
  }));

  const createdProjects = await DevelopmentCost.insertMany(processedProjects);

  res.status(201).json({
    success: true,
    message: `Successfully created ${createdProjects.length} development cost estimates`,
    data: {
      count: createdProjects.length,
      projects: createdProjects,
    },
  });
});

/**
 * @desc    Bulk update hourly rates
 * @route   PATCH /api/development-cost/bulk/rates
 * @access  Private (Admin only)
 */
exports.bulkUpdateRates = catchAsync(async (req, res, next) => {
  const { projectIds, section, newRate } = req.body;

  if (!Array.isArray(projectIds) || projectIds.length === 0) {
    return next(new AppError("Please provide an array of project IDs", 400));
  }

  const updateField = {};
  switch (section) {
    case "frontend":
      updateField["webApp.frontend.ratePerHour"] = newRate;
      break;
    case "backend":
      updateField["webApp.backend.ratePerHour"] = newRate;
      break;
    case "reactNative":
      updateField["mobileApp.crossPlatform.reactNative.ratePerHour"] = newRate;
      break;
    default:
      return next(new AppError("Invalid section specified", 400));
  }

  const result = await DevelopmentCost.updateMany(
    { _id: { $in: projectIds } },
    { $set: updateField },
  );

  // Recalculate totals for all affected projects
  const updatedProjects = await DevelopmentCost.find({
    _id: { $in: projectIds },
  });

  for (const project of updatedProjects) {
    project.webApp.totalWeb = calculateWebTotal(project.webApp);
    project.mobileApp.totalMobile = calculateMobileTotal(project.mobileApp);
    project.totalDevelopmentInvestment = calculateGrandTotal(project);
    await project.save();
  }

  res.status(200).json({
    success: true,
    message: `Updated rates for ${result.modifiedCount} projects`,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

module.exports = exports;
