const Revenue = require("../models/revenue.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateB2CTotals,
  calculateB2BTotals,
  calculateOtherTotals,
  calculateGrandTotals,
  calculateGrowthRate,
  analyzeRevenueStreams,
  generateForecast,
} = require("../utils/revenueCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new revenue record
 * @route   POST /api/revenue
 * @access  Private (Admin/Finance Manager)
 */
exports.createRevenue = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if revenue record already exists
  const existingRevenue = await Revenue.findOne({ projectId });
  if (existingRevenue) {
    return next(
      new AppError("Revenue record already exists for this project", 400),
    );
  }

  // Calculate all totals
  const b2cTotals = calculateB2CTotals(req.body.b2cRevenue);
  const b2bTotals = calculateB2BTotals(req.body.b2bRevenue);
  const otherTotals = calculateOtherTotals(req.body.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  const revenueData = {
    ...req.body,
    b2cRevenue: {
      ...req.body.b2cRevenue,
      totalB2CYear1: b2cTotals.year1,
      totalB2CYear2: b2cTotals.year2,
      totalB2CYear3: b2cTotals.year3,
      totalB2CThreeYear: b2cTotals.threeYear,
    },
    b2bRevenue: {
      ...req.body.b2bRevenue,
      totalB2BYear1: b2bTotals.year1,
      totalB2BYear2: b2bTotals.year2,
      totalB2BYear3: b2bTotals.year3,
      totalB2BThreeYear: b2bTotals.threeYear,
    },
    otherRevenue: {
      ...req.body.otherRevenue,
      totalOtherYear1: otherTotals.year1,
      totalOtherYear2: otherTotals.year2,
      totalOtherYear3: otherTotals.year3,
    },
    totalRevenueYear1: grandTotals.year1,
    totalRevenueYear2: grandTotals.year2,
    totalRevenueYear3: grandTotals.year3,
    totalRevenueThreeYear: grandTotals.threeYear,
  };

  const revenue = await Revenue.create(revenueData);

  res.status(201).json({
    success: true,
    message: "Revenue record created successfully",
    data: {
      revenue,
    },
  });
});

/**
 * @desc    Get all revenue records
 * @route   GET /api/revenue
 * @access  Private
 */
exports.getAllRevenue = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = Revenue.find(queryObj);

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
  const revenues = await query;
  const total = await Revenue.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: revenues.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      revenues,
    },
  });
});

/**
 * @desc    Get single revenue record by ID
 * @route   GET /api/revenue/:id
 * @access  Private
 */
exports.getRevenue = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      revenue,
    },
  });
});

/**
 * @desc    Get revenue record by project ID
 * @route   GET /api/revenue/project/:projectId
 * @access  Private
 */
exports.getRevenueByProjectId = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findOne({
    projectId: req.params.projectId,
  });

  if (!revenue) {
    return next(new AppError("No revenue record found for this project", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      revenue,
    },
  });
});

/**
 * @desc    Update revenue record
 * @route   PATCH /api/revenue/:id
 * @access  Private (Admin/Finance Manager)
 */
exports.updateRevenue = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  // Merge existing data with updates
  const mergedData = {
    ...revenue.toObject(),
    ...req.body,
  };

  // Recalculate totals
  const b2cTotals = calculateB2CTotals(mergedData.b2cRevenue);
  const b2bTotals = calculateB2BTotals(mergedData.b2bRevenue);
  const otherTotals = calculateOtherTotals(mergedData.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  const updateData = {
    ...req.body,
    b2cRevenue: {
      ...mergedData.b2cRevenue,
      totalB2CYear1: b2cTotals.year1,
      totalB2CYear2: b2cTotals.year2,
      totalB2CYear3: b2cTotals.year3,
      totalB2CThreeYear: b2cTotals.threeYear,
    },
    b2bRevenue: {
      ...mergedData.b2bRevenue,
      totalB2BYear1: b2bTotals.year1,
      totalB2BYear2: b2bTotals.year2,
      totalB2BYear3: b2bTotals.year3,
      totalB2BThreeYear: b2bTotals.threeYear,
    },
    otherRevenue: {
      ...mergedData.otherRevenue,
      totalOtherYear1: otherTotals.year1,
      totalOtherYear2: otherTotals.year2,
      totalOtherYear3: otherTotals.year3,
    },
    totalRevenueYear1: grandTotals.year1,
    totalRevenueYear2: grandTotals.year2,
    totalRevenueYear3: grandTotals.year3,
    totalRevenueThreeYear: grandTotals.threeYear,
    updatedAt: Date.now(),
  };

  const updatedRevenue = await Revenue.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Revenue record updated successfully",
    data: {
      revenue: updatedRevenue,
    },
  });
});

/**
 * @desc    Delete revenue record
 * @route   DELETE /api/revenue/:id
 * @access  Private (Admin only)
 */
exports.deleteRevenue = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findByIdAndDelete(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Revenue record deleted successfully",
    data: null,
  });
});

// ============================================
// 📊 SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * @desc    Add subscription plan
 * @route   POST /api/revenue/:id/subscription-plans
 * @access  Private (Admin)
 */
exports.addSubscriptionPlan = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const {
    tier,
    name,
    monthlyPrice,
    yearlyPrice,
    features,
    projectedSubscribers,
  } = req.body;

  // Calculate projected revenue
  const projectedRevenue = {
    year1:
      monthlyPrice * projectedSubscribers.year1 * 12 +
      yearlyPrice * projectedSubscribers.year1 * 0.2, // Assume 20% take yearly
    year2:
      monthlyPrice * projectedSubscribers.year2 * 12 +
      yearlyPrice * projectedSubscribers.year2 * 0.2,
    year3:
      monthlyPrice * projectedSubscribers.year3 * 12 +
      yearlyPrice * projectedSubscribers.year3 * 0.2,
  };

  revenue.b2cRevenue.subscriptionPlans.push({
    tier,
    name,
    monthlyPrice,
    yearlyPrice,
    features,
    projectedSubscribers,
    projectedRevenue,
  });

  // Recalculate B2C totals
  const b2cTotals = calculateB2CTotals(revenue.b2cRevenue);
  revenue.b2cRevenue.totalB2CYear1 = b2cTotals.year1;
  revenue.b2cRevenue.totalB2CYear2 = b2cTotals.year2;
  revenue.b2cRevenue.totalB2CYear3 = b2cTotals.year3;
  revenue.b2cRevenue.totalB2CThreeYear = b2cTotals.threeYear;

  // Recalculate grand totals
  const b2bTotals = calculateB2BTotals(revenue.b2bRevenue);
  const otherTotals = calculateOtherTotals(revenue.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  revenue.totalRevenueYear1 = grandTotals.year1;
  revenue.totalRevenueYear2 = grandTotals.year2;
  revenue.totalRevenueYear3 = grandTotals.year3;
  revenue.totalRevenueThreeYear = grandTotals.threeYear;

  await revenue.save();

  res.status(201).json({
    success: true,
    message: "Subscription plan added successfully",
    data: {
      plan: req.body,
    },
  });
});

/**
 * @desc    Update subscription plan
 * @route   PATCH /api/revenue/:id/subscription-plans/:planIndex
 * @access  Private (Admin)
 */
exports.updateSubscriptionPlan = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const { planIndex } = req.params;

  if (!revenue.b2cRevenue.subscriptionPlans[planIndex]) {
    return next(new AppError("Subscription plan not found", 404));
  }

  // Update plan fields
  Object.assign(revenue.b2cRevenue.subscriptionPlans[planIndex], req.body);

  // Recalculate projected revenue if needed
  if (
    req.body.monthlyPrice ||
    req.body.yearlyPrice ||
    req.body.projectedSubscribers
  ) {
    const plan = revenue.b2cRevenue.subscriptionPlans[planIndex];
    plan.projectedRevenue = {
      year1:
        plan.monthlyPrice * plan.projectedSubscribers.year1 * 12 +
        plan.yearlyPrice * plan.projectedSubscribers.year1 * 0.2,
      year2:
        plan.monthlyPrice * plan.projectedSubscribers.year2 * 12 +
        plan.yearlyPrice * plan.projectedSubscribers.year2 * 0.2,
      year3:
        plan.monthlyPrice * plan.projectedSubscribers.year3 * 12 +
        plan.yearlyPrice * plan.projectedSubscribers.year3 * 0.2,
    };
  }

  // Recalculate totals
  const b2cTotals = calculateB2CTotals(revenue.b2cRevenue);
  revenue.b2cRevenue.totalB2CYear1 = b2cTotals.year1;
  revenue.b2cRevenue.totalB2CYear2 = b2cTotals.year2;
  revenue.b2cRevenue.totalB2CYear3 = b2cTotals.year3;
  revenue.b2cRevenue.totalB2CThreeYear = b2cTotals.threeYear;

  const b2bTotals = calculateB2BTotals(revenue.b2bRevenue);
  const otherTotals = calculateOtherTotals(revenue.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  revenue.totalRevenueYear1 = grandTotals.year1;
  revenue.totalRevenueYear2 = grandTotals.year2;
  revenue.totalRevenueYear3 = grandTotals.year3;
  revenue.totalRevenueThreeYear = grandTotals.threeYear;

  await revenue.save();

  res.status(200).json({
    success: true,
    message: "Subscription plan updated successfully",
    data: {
      plan: revenue.b2cRevenue.subscriptionPlans[planIndex],
    },
  });
});

/**
 * @desc    Delete subscription plan
 * @route   DELETE /api/revenue/:id/subscription-plans/:planIndex
 * @access  Private (Admin)
 */
exports.deleteSubscriptionPlan = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const { planIndex } = req.params;

  if (!revenue.b2cRevenue.subscriptionPlans[planIndex]) {
    return next(new AppError("Subscription plan not found", 404));
  }

  revenue.b2cRevenue.subscriptionPlans.splice(planIndex, 1);

  // Recalculate totals
  const b2cTotals = calculateB2CTotals(revenue.b2cRevenue);
  revenue.b2cRevenue.totalB2CYear1 = b2cTotals.year1;
  revenue.b2cRevenue.totalB2CYear2 = b2cTotals.year2;
  revenue.b2cRevenue.totalB2CYear3 = b2cTotals.year3;
  revenue.b2cRevenue.totalB2CThreeYear = b2cTotals.threeYear;

  const b2bTotals = calculateB2BTotals(revenue.b2bRevenue);
  const otherTotals = calculateOtherTotals(revenue.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  revenue.totalRevenueYear1 = grandTotals.year1;
  revenue.totalRevenueYear2 = grandTotals.year2;
  revenue.totalRevenueYear3 = grandTotals.year3;
  revenue.totalRevenueThreeYear = grandTotals.threeYear;

  await revenue.save();

  res.status(200).json({
    success: true,
    message: "Subscription plan deleted successfully",
    data: null,
  });
});

// ============================================
// 📈 B2B MANAGEMENT
// ============================================

/**
 * @desc    Add corporate training contract
 * @route   POST /api/revenue/:id/corporate-training
 * @access  Private (Admin/Business Head)
 */
exports.addCorporateTraining = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const { companyName, contractValue, contractDuration } = req.body;

  // Calculate yearly revenue distribution
  const yearlyValue = contractValue / contractDuration;
  const revenueYear1 = contractDuration >= 1 ? yearlyValue : 0;
  const revenueYear2 = contractDuration >= 2 ? yearlyValue : 0;
  const revenueYear3 = contractDuration >= 3 ? yearlyValue : 0;

  revenue.b2bRevenue.corporateTraining.push({
    companyName,
    contractValue,
    contractDuration,
    revenueYear1,
    revenueYear2,
    revenueYear3,
  });

  // Recalculate B2B totals
  const b2bTotals = calculateB2BTotals(revenue.b2bRevenue);
  revenue.b2bRevenue.totalB2BYear1 = b2bTotals.year1;
  revenue.b2bRevenue.totalB2BYear2 = b2bTotals.year2;
  revenue.b2bRevenue.totalB2BYear3 = b2bTotals.year3;
  revenue.b2bRevenue.totalB2BThreeYear = b2bTotals.threeYear;

  // Recalculate grand totals
  const b2cTotals = calculateB2CTotals(revenue.b2cRevenue);
  const otherTotals = calculateOtherTotals(revenue.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  revenue.totalRevenueYear1 = grandTotals.year1;
  revenue.totalRevenueYear2 = grandTotals.year2;
  revenue.totalRevenueYear3 = grandTotals.year3;
  revenue.totalRevenueThreeYear = grandTotals.threeYear;

  await revenue.save();

  res.status(201).json({
    success: true,
    message: "Corporate training contract added successfully",
    data: {
      contract: req.body,
    },
  });
});

/**
 * @desc    Add college partnership
 * @route   POST /api/revenue/:id/college-partnership
 * @access  Private (Admin/Business Head)
 */
exports.addCollegePartnership = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const { collegeName, studentsCount, revenueShare, annualFees } = req.body;

  const yearlyRevenue = studentsCount * annualFees * (revenueShare / 100);

  revenue.b2bRevenue.collegePartnerships.push({
    collegeName,
    studentsCount,
    revenueShare,
    annualFees,
    revenueYear1: yearlyRevenue,
    revenueYear2: yearlyRevenue * 1.1, // Assume 10% growth
    revenueYear3: yearlyRevenue * 1.21, // Assume 21% growth
  });

  // Recalculate B2B totals
  const b2bTotals = calculateB2BTotals(revenue.b2bRevenue);
  revenue.b2bRevenue.totalB2BYear1 = b2bTotals.year1;
  revenue.b2bRevenue.totalB2BYear2 = b2bTotals.year2;
  revenue.b2bRevenue.totalB2BYear3 = b2bTotals.year3;
  revenue.b2bRevenue.totalB2BThreeYear = b2bTotals.threeYear;

  // Recalculate grand totals
  const b2cTotals = calculateB2CTotals(revenue.b2cRevenue);
  const otherTotals = calculateOtherTotals(revenue.otherRevenue);
  const grandTotals = calculateGrandTotals(b2cTotals, b2bTotals, otherTotals);

  revenue.totalRevenueYear1 = grandTotals.year1;
  revenue.totalRevenueYear2 = grandTotals.year2;
  revenue.totalRevenueYear3 = grandTotals.year3;
  revenue.totalRevenueThreeYear = grandTotals.threeYear;

  await revenue.save();

  res.status(201).json({
    success: true,
    message: "College partnership added successfully",
    data: {
      partnership: req.body,
    },
  });
});

// ============================================
// 📊 DASHBOARD & ANALYTICS
// ============================================

/**
 * @desc    Get revenue dashboard
 * @route   GET /api/revenue/dashboard/:projectId
 * @access  Private
 */
exports.getRevenueDashboard = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findOne({ projectId: req.params.projectId });

  if (!revenue) {
    return next(new AppError("No revenue record found for this project", 404));
  }

  // Calculate growth rates
  const growthRates = {
    year2: calculateGrowthRate(
      revenue.totalRevenueYear1,
      revenue.totalRevenueYear2,
    ),
    year3: calculateGrowthRate(
      revenue.totalRevenueYear2,
      revenue.totalRevenueYear3,
    ),
    cagr: calculateGrowthRate(
      revenue.totalRevenueYear1,
      revenue.totalRevenueYear3,
      2,
    ),
  };

  // Analyze revenue streams
  const streamAnalysis = analyzeRevenueStreams(revenue);

  // Generate monthly forecast
  const forecast = generateForecast(revenue);

  const dashboard = {
    overview: {
      totalRevenue: revenue.totalRevenueThreeYear,
      yearly: {
        year1: revenue.totalRevenueYear1,
        year2: revenue.totalRevenueYear2,
        year3: revenue.totalRevenueYear3,
      },
      monthlyAverage: revenue.totalRevenueThreeYear / 36,
    },
    growth: growthRates,
    streams: streamAnalysis,
    breakdown: {
      b2c: {
        total: revenue.b2cRevenue.totalB2CThreeYear,
        percentage:
          (
            (revenue.b2cRevenue.totalB2CThreeYear /
              revenue.totalRevenueThreeYear) *
            100
          ).toFixed(1) + "%",
        subscriptionRevenue: revenue.b2cRevenue.subscriptionPlans.reduce(
          (sum, plan) =>
            sum +
            plan.projectedRevenue.year1 +
            plan.projectedRevenue.year2 +
            plan.projectedRevenue.year3,
          0,
        ),
        oneTimeRevenue:
          revenue.b2cRevenue.oneTimePurchases.individualCourses.reduce(
            (sum, course) =>
              sum +
              course.revenueYear1 +
              course.revenueYear2 +
              course.revenueYear3,
            0,
          ) +
          (revenue.b2cRevenue.oneTimePurchases.certifications?.revenueYear1 ||
            0) +
          (revenue.b2cRevenue.oneTimePurchases.certifications?.revenueYear2 ||
            0) +
          (revenue.b2cRevenue.oneTimePurchases.certifications?.revenueYear3 ||
            0),
      },
      b2b: {
        total: revenue.b2bRevenue.totalB2BThreeYear,
        percentage:
          (
            (revenue.b2bRevenue.totalB2BThreeYear /
              revenue.totalRevenueThreeYear) *
            100
          ).toFixed(1) + "%",
        corporate: revenue.b2bRevenue.corporateTraining.reduce(
          (sum, contract) =>
            sum +
            contract.revenueYear1 +
            contract.revenueYear2 +
            contract.revenueYear3,
          0,
        ),
        college: revenue.b2bRevenue.collegePartnerships.reduce(
          (sum, partnership) =>
            sum +
            partnership.revenueYear1 +
            partnership.revenueYear2 +
            partnership.revenueYear3,
          0,
        ),
        government: revenue.b2bRevenue.governmentContracts.reduce(
          (sum, contract) =>
            sum +
            contract.revenueYear1 +
            contract.revenueYear2 +
            contract.revenueYear3,
          0,
        ),
      },
      other: {
        total:
          revenue.otherRevenue.totalOtherYear1 +
          revenue.otherRevenue.totalOtherYear2 +
          revenue.otherRevenue.totalOtherYear3,
        percentage:
          (
            ((revenue.otherRevenue.totalOtherYear1 +
              revenue.otherRevenue.totalOtherYear2 +
              revenue.otherRevenue.totalOtherYear3) /
              revenue.totalRevenueThreeYear) *
            100
          ).toFixed(1) + "%",
      },
    },
    subscriptionDetails: revenue.b2cRevenue.subscriptionPlans.map((plan) => ({
      tier: plan.tier,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      subscribers: plan.projectedSubscribers,
      revenue: plan.projectedRevenue,
    })),
    forecast: forecast.slice(0, 12), // Next 12 months
  };

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});

/**
 * @desc    Get B2C revenue analysis
 * @route   GET /api/revenue/:id/b2c-analysis
 * @access  Private
 */
exports.getB2CAnalysis = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const analysis = {
    summary: {
      total: revenue.b2cRevenue.totalB2CThreeYear,
      year1: revenue.b2cRevenue.totalB2CYear1,
      year2: revenue.b2cRevenue.totalB2CYear2,
      year3: revenue.b2cRevenue.totalB2CYear3,
    },
    subscriptionPlans: revenue.b2cRevenue.subscriptionPlans.map((plan) => ({
      tier: plan.tier,
      name: plan.name,
      pricing: {
        monthly: plan.monthlyPrice,
        yearly: plan.yearlyPrice,
        yearlyDiscount:
          ((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100).toFixed(0) +
          "%",
      },
      subscribers: plan.projectedSubscribers,
      revenue: plan.projectedRevenue,
      arpu: (
        plan.projectedRevenue.year1 /
        plan.projectedSubscribers.year1 /
        12
      ).toFixed(0),
    })),
    oneTimePurchases: {
      courses: revenue.b2cRevenue.oneTimePurchases.individualCourses.map(
        (course) => ({
          name: course.courseName,
          price: course.price,
          sales: {
            year1: course.salesYear1,
            year2: course.salesYear2,
            year3: course.salesYear3,
          },
          revenue: {
            year1: course.revenueYear1,
            year2: course.revenueYear2,
            year3: course.revenueYear3,
          },
        }),
      ),
      certifications: revenue.b2cRevenue.oneTimePurchases.certifications
        ? {
            pricePerCert:
              revenue.b2cRevenue.oneTimePurchases.certifications.pricePerCert,
            certificates: {
              year1:
                revenue.b2cRevenue.oneTimePurchases.certifications
                  .certificatesYear1,
              year2:
                revenue.b2cRevenue.oneTimePurchases.certifications
                  .certificatesYear2,
              year3:
                revenue.b2cRevenue.oneTimePurchases.certifications
                  .certificatesYear3,
            },
            revenue: {
              year1:
                revenue.b2cRevenue.oneTimePurchases.certifications.revenueYear1,
              year2:
                revenue.b2cRevenue.oneTimePurchases.certifications.revenueYear2,
              year3:
                revenue.b2cRevenue.oneTimePurchases.certifications.revenueYear3,
            },
          }
        : null,
    },
    metrics: {
      averageOrderValue: (
        revenue.b2cRevenue.oneTimePurchases.individualCourses.reduce(
          (sum, c) => sum + c.price,
          0,
        ) / (revenue.b2cRevenue.oneTimePurchases.individualCourses.length || 1)
      ).toFixed(0),
      subscriptionShare:
        (
          (revenue.b2cRevenue.subscriptionPlans.reduce(
            (sum, p) =>
              sum +
              p.projectedRevenue.year1 +
              p.projectedRevenue.year2 +
              p.projectedRevenue.year3,
            0,
          ) /
            revenue.b2cRevenue.totalB2CThreeYear) *
          100
        ).toFixed(1) + "%",
    },
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get B2B revenue analysis
 * @route   GET /api/revenue/:id/b2b-analysis
 * @access  Private
 */
exports.getB2BAnalysis = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const analysis = {
    summary: {
      total: revenue.b2bRevenue.totalB2BThreeYear,
      year1: revenue.b2bRevenue.totalB2BYear1,
      year2: revenue.b2bRevenue.totalB2BYear2,
      year3: revenue.b2bRevenue.totalB2BYear3,
    },
    corporateTraining: revenue.b2bRevenue.corporateTraining.map((contract) => ({
      company: contract.companyName,
      contractValue: contract.contractValue,
      duration: contract.contractDuration + " months",
      revenue: {
        year1: contract.revenueYear1,
        year2: contract.revenueYear2,
        year3: contract.revenueYear3,
      },
    })),
    collegePartnerships: revenue.b2bRevenue.collegePartnerships.map(
      (partnership) => ({
        college: partnership.collegeName,
        students: partnership.studentsCount,
        revenueShare: partnership.revenueShare + "%",
        annualFees: partnership.annualFees,
        revenue: {
          year1: partnership.revenueYear1,
          year2: partnership.revenueYear2,
          year3: partnership.revenueYear3,
        },
      }),
    ),
    governmentContracts: revenue.b2bRevenue.governmentContracts.map(
      (contract) => ({
        department: contract.department,
        value: contract.tenderValue,
        revenue: {
          year1: contract.revenueYear1,
          year2: contract.revenueYear2,
          year3: contract.revenueYear3,
        },
      }),
    ),
    metrics: {
      averageContractValue: (
        revenue.b2bRevenue.corporateTraining.reduce(
          (sum, c) => sum + c.contractValue,
          0,
        ) / (revenue.b2bRevenue.corporateTraining.length || 1)
      ).toFixed(0),
      totalPartnerships: revenue.b2bRevenue.collegePartnerships.length,
      totalStudents: revenue.b2bRevenue.collegePartnerships.reduce(
        (sum, p) => sum + p.studentsCount,
        0,
      ),
    },
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get other revenue analysis
 * @route   GET /api/revenue/:id/other-analysis
 * @access  Private
 */
exports.getOtherAnalysis = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const analysis = {
    placementFees: revenue.otherRevenue.placementFees
      ? {
          perPlacement: revenue.otherRevenue.placementFees.perPlacement,
          placements: {
            year1: revenue.otherRevenue.placementFees.placementsYear1,
            year2: revenue.otherRevenue.placementFees.placementsYear2,
            year3: revenue.otherRevenue.placementFees.placementsYear3,
          },
          revenue: {
            year1: revenue.otherRevenue.placementFees.revenueYear1,
            year2: revenue.otherRevenue.placementFees.revenueYear2,
            year3: revenue.otherRevenue.placementFees.revenueYear3,
          },
        }
      : null,
    advertising: {
      platformAds: revenue.otherRevenue.advertising?.platformAds?.monthly || 0,
      yearlyPlatformRevenue:
        (revenue.otherRevenue.advertising?.platformAds?.monthly || 0) * 12,
      sponsoredContent:
        revenue.otherRevenue.advertising?.sponsoredContent?.map((content) => ({
          sponsor: content.sponsor,
          amount: content.amount,
          duration: content.duration + " months",
          total: content.amount * content.duration,
        })) || [],
    },
    totals: {
      year1: revenue.otherRevenue.totalOtherYear1,
      year2: revenue.otherRevenue.totalOtherYear2,
      year3: revenue.otherRevenue.totalOtherYear3,
      threeYear:
        revenue.otherRevenue.totalOtherYear1 +
        revenue.otherRevenue.totalOtherYear2 +
        revenue.otherRevenue.totalOtherYear3,
    },
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get revenue forecast
 * @route   GET /api/revenue/:id/forecast
 * @access  Private (Finance Manager)
 */
exports.getRevenueForecast = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findById(req.params.id);

  if (!revenue) {
    return next(new AppError("No revenue record found with that ID", 404));
  }

  const { months = 24 } = req.query;
  const forecast = generateForecast(revenue, parseInt(months));

  const summary = {
    currentARR: revenue.totalRevenueYear1,
    projectedARR: forecast[forecast.length - 1]?.cumulative * 12 || 0,
    growthRate: calculateGrowthRate(
      forecast[0]?.revenue || 0,
      forecast[forecast.length - 1]?.revenue || 0,
      months / 12,
    ),
    totalProjected: forecast.reduce((sum, m) => sum + m.revenue, 0),
  };

  res.status(200).json({
    success: true,
    data: {
      summary,
      monthly: forecast,
    },
  });
});

/**
 * @desc    Export revenue report
 * @route   GET /api/revenue/export/:projectId
 * @access  Private
 */
exports.exportRevenueReport = catchAsync(async (req, res, next) => {
  const revenue = await Revenue.findOne({ projectId: req.params.projectId });

  if (!revenue) {
    return next(new AppError("No revenue record found for this project", 404));
  }

  const report = {
    generatedAt: new Date(),
    projectId: revenue.projectId,
    executiveSummary: {
      totalRevenue: revenue.totalRevenueThreeYear,
      byYear: {
        year1: revenue.totalRevenueYear1,
        year2: revenue.totalRevenueYear2,
        year3: revenue.totalRevenueYear3,
      },
      primaryStream:
        revenue.b2cRevenue.totalB2CThreeYear >
        revenue.b2bRevenue.totalB2BThreeYear
          ? "B2C"
          : "B2B",
    },
    detailed: {
      b2c: revenue.b2cRevenue,
      b2b: revenue.b2bRevenue,
      other: revenue.otherRevenue,
    },
    metrics: {
      cagr:
        calculateGrowthRate(
          revenue.totalRevenueYear1,
          revenue.totalRevenueYear3,
          2,
        ).toFixed(1) + "%",
      subscriptionShare:
        (
          (revenue.b2cRevenue.subscriptionPlans.reduce(
            (sum, p) =>
              sum +
              p.projectedRevenue.year1 +
              p.projectedRevenue.year2 +
              p.projectedRevenue.year3,
            0,
          ) /
            revenue.totalRevenueThreeYear) *
          100
        ).toFixed(1) + "%",
      b2bShare:
        (
          (revenue.b2bRevenue.totalB2BThreeYear /
            revenue.totalRevenueThreeYear) *
          100
        ).toFixed(1) + "%",
    },
  };

  res.status(200).json({
    success: true,
    data: report,
  });
});

module.exports = exports;
