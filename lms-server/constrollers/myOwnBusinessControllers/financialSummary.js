const FinancialSummary = require("../models/financialSummary.model");
const DevelopmentCost = require("../models/developmentCost.model");
const Infrastructure = require("../models/infrastructure.model");
const ContentCreation = require("../models/contentCreation.model");
const Marketing = require("../models/marketing.model");
const Operational = require("../models/operational.model");
const Revenue = require("../models/revenue.model");
const Sponsors = require("../models/sponsors.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateTotalCosts,
  calculateTotalRevenue,
  calculateProfitability,
  calculateBreakEven,
  generateCashFlowProjection,
  calculateROI,
  calculatePaybackPeriod,
} = require("../utils/financialCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new financial summary
 * @route   POST /api/financial-summary
 * @access  Private (Admin/Finance Manager)
 */
exports.createFinancialSummary = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if summary already exists
  const existingSummary = await FinancialSummary.findOne({ projectId });
  if (existingSummary) {
    return next(
      new AppError("Financial summary already exists for this project", 400),
    );
  }

  // Fetch all referenced data if IDs are provided
  let referencedData = {};
  if (req.body.refIds) {
    referencedData = await fetchReferencedData(req.body.refIds);
  }

  // Calculate all financial metrics
  const totalCosts = calculateTotalCosts(referencedData, req.body.totalCosts);
  const totalRevenue = calculateTotalRevenue(
    referencedData,
    req.body.totalRevenue,
  );
  const profitability = calculateProfitability(totalCosts, totalRevenue);
  const breakEvenPoint = calculateBreakEven(totalCosts, totalRevenue);
  const cashFlow = generateCashFlowProjection(totalCosts, totalRevenue, 36); // 36 months

  const summaryData = {
    ...req.body,
    totalCosts,
    totalRevenue,
    profitability: {
      ...profitability,
      breakEvenPoint,
    },
    cashFlow,
    yearlyBreakdown: generateYearlyBreakdown(totalCosts, totalRevenue),
  };

  const financialSummary = await FinancialSummary.create(summaryData);

  // Populate references for response
  await financialSummary.populate([
    { path: "refIds.developmentCostId" },
    { path: "refIds.infrastructureId" },
    { path: "refIds.contentId" },
    { path: "refIds.marketingId" },
    { path: "refIds.operationalId" },
    { path: "refIds.revenueId" },
    { path: "refIds.sponsorsId" },
  ]);

  res.status(201).json({
    success: true,
    message: "Financial summary created successfully",
    data: {
      financialSummary,
    },
  });
});

/**
 * @desc    Get all financial summaries
 * @route   GET /api/financial-summary
 * @access  Private
 */
exports.getAllFinancialSummaries = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = FinancialSummary.find(queryObj).populate([
    { path: "refIds.developmentCostId", select: "totalDevelopmentInvestment" },
    { path: "refIds.infrastructureId", select: "totalInfrastructureThreeYear" },
    { path: "refIds.contentId", select: "totalContentThreeYear" },
    { path: "refIds.marketingId", select: "totalMarketingThreeYear" },
    { path: "refIds.operationalId", select: "totalOperationalThreeYear" },
    { path: "refIds.revenueId", select: "totalRevenueThreeYear" },
    { path: "refIds.sponsorsId", select: "totalSponsorshipsThreeYear" },
  ]);

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
  const financialSummaries = await query;
  const total = await FinancialSummary.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: financialSummaries.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      financialSummaries,
    },
  });
});

/**
 * @desc    Get single financial summary by ID
 * @route   GET /api/financial-summary/:id
 * @access  Private
 */
exports.getFinancialSummary = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(
    req.params.id,
  ).populate([
    { path: "refIds.developmentCostId" },
    { path: "refIds.infrastructureId" },
    { path: "refIds.contentId" },
    { path: "refIds.marketingId" },
    { path: "refIds.operationalId" },
    { path: "refIds.revenueId" },
    { path: "refIds.sponsorsId" },
  ]);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      financialSummary,
    },
  });
});

/**
 * @desc    Get financial summary by project ID
 * @route   GET /api/financial-summary/project/:projectId
 * @access  Private
 */
exports.getFinancialSummaryByProjectId = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findOne({
    projectId: req.params.projectId,
  }).populate([
    { path: "refIds.developmentCostId" },
    { path: "refIds.infrastructureId" },
    { path: "refIds.contentId" },
    { path: "refIds.marketingId" },
    { path: "refIds.operationalId" },
    { path: "refIds.revenueId" },
    { path: "refIds.sponsorsId" },
  ]);

  if (!financialSummary) {
    return next(
      new AppError("No financial summary found for this project", 404),
    );
  }

  res.status(200).json({
    success: true,
    data: {
      financialSummary,
    },
  });
});

/**
 * @desc    Update financial summary
 * @route   PATCH /api/financial-summary/:id
 * @access  Private (Admin/Finance Manager)
 */
exports.updateFinancialSummary = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(req.params.id);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  // Fetch referenced data if refIds changed
  let referencedData = {};
  if (req.body.refIds) {
    referencedData = await fetchReferencedData(req.body.refIds);
  }

  // Merge with existing data
  const mergedData = {
    ...financialSummary.toObject(),
    ...req.body,
  };

  // Recalculate financial metrics
  const totalCosts = calculateTotalCosts(referencedData, mergedData.totalCosts);
  const totalRevenue = calculateTotalRevenue(
    referencedData,
    mergedData.totalRevenue,
  );
  const profitability = calculateProfitability(totalCosts, totalRevenue);
  const breakEvenPoint = calculateBreakEven(totalCosts, totalRevenue);

  const updateData = {
    ...req.body,
    totalCosts,
    totalRevenue,
    profitability: {
      ...profitability,
      breakEvenPoint,
    },
    updatedAt: Date.now(),
  };

  const updatedSummary = await FinancialSummary.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).populate([
    { path: "refIds.developmentCostId" },
    { path: "refIds.infrastructureId" },
    { path: "refIds.contentId" },
    { path: "refIds.marketingId" },
    { path: "refIds.operationalId" },
    { path: "refIds.revenueId" },
    { path: "refIds.sponsorsId" },
  ]);

  res.status(200).json({
    success: true,
    message: "Financial summary updated successfully",
    data: {
      financialSummary: updatedSummary,
    },
  });
});

/**
 * @desc    Delete financial summary
 * @route   DELETE /api/financial-summary/:id
 * @access  Private (Admin only)
 */
exports.deleteFinancialSummary = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findByIdAndDelete(
    req.params.id,
  );

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Financial summary deleted successfully",
    data: null,
  });
});

// ============================================
// 📊 FINANCIAL ANALYSIS & REPORTS
// ============================================

/**
 * @desc    Get financial dashboard with key metrics
 * @route   GET /api/financial-summary/dashboard/:id
 * @access  Private
 */
exports.getFinancialDashboard = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(
    req.params.id,
  ).populate([{ path: "refIds.revenueId" }, { path: "refIds.sponsorsId" }]);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  const dashboard = {
    overview: {
      totalInvestment: financialSummary.totalCosts.grandTotalCosts,
      totalRevenue: financialSummary.totalRevenue.grandTotalRevenue,
      netProfit: financialSummary.profitability.netProfit,
      profitMargin: financialSummary.profitability.netMargin,
      roi: financialSummary.profitability.roi,
      paybackPeriod: financialSummary.profitability.paybackPeriod,
    },
    costBreakdown: {
      development: financialSummary.totalCosts.developmentCosts,
      infrastructure: financialSummary.totalCosts.infrastructureCosts,
      content: financialSummary.totalCosts.contentCreationCosts,
      marketing: financialSummary.totalCosts.marketingCosts,
      operational: financialSummary.totalCosts.operationalCosts,
      contingency: financialSummary.totalCosts.contingencyFund,
    },
    revenueBreakdown: {
      b2c: financialSummary.totalRevenue.b2cRevenue,
      b2b: financialSummary.totalRevenue.b2bRevenue,
      other: financialSummary.totalRevenue.otherRevenue,
      sponsorships: financialSummary.totalRevenue.sponsorships,
      investments: financialSummary.totalRevenue.investments,
    },
    breakEven: financialSummary.profitability.breakEvenPoint,
    cashFlow: {
      initialInvestment: financialSummary.cashFlow.initialInvestment,
      monthlyBurnRate: financialSummary.cashFlow.monthlyBurnRate,
      runway: financialSummary.cashFlow.runway,
      currentCash:
        financialSummary.cashFlow.cashFlowMonths.slice(-1)[0]?.cumulativeCash ||
        0,
    },
    yearlyPerformance: financialSummary.yearlyBreakdown,
  };

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});

/**
 * @desc    Get profit & loss statement
 * @route   GET /api/financial-summary/:id/pnl
 * @access  Private (Finance Manager)
 */
exports.getProfitLossStatement = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(req.params.id);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  const pnl = {
    revenue: {
      total: financialSummary.totalRevenue.grandTotalRevenue,
      breakdown: {
        b2c: financialSummary.totalRevenue.b2cRevenue,
        b2b: financialSummary.totalRevenue.b2bRevenue,
        sponsorships: financialSummary.totalRevenue.sponsorships,
        investments: financialSummary.totalRevenue.investments,
        other: financialSummary.totalRevenue.otherRevenue,
      },
    },
    costs: {
      total: financialSummary.totalCosts.grandTotalCosts,
      breakdown: {
        development: financialSummary.totalCosts.developmentCosts,
        infrastructure: financialSummary.totalCosts.infrastructureCosts,
        contentCreation: financialSummary.totalCosts.contentCreationCosts,
        marketing: financialSummary.totalCosts.marketingCosts,
        operational: financialSummary.totalCosts.operationalCosts,
        contingency: financialSummary.totalCosts.contingencyFund,
      },
    },
    profit: {
      gross: financialSummary.profitability.grossProfit,
      grossMargin: financialSummary.profitability.grossMargin,
      net: financialSummary.profitability.netProfit,
      netMargin: financialSummary.profitability.netMargin,
    },
    ratios: {
      roi: financialSummary.profitability.roi,
      paybackPeriod: financialSummary.profitability.paybackPeriod,
      costToRevenueRatio: (
        (financialSummary.totalCosts.grandTotalCosts /
          financialSummary.totalRevenue.grandTotalRevenue) *
        100
      ).toFixed(2),
    },
    yearlyComparison: financialSummary.yearlyBreakdown,
  };

  res.status(200).json({
    success: true,
    data: pnl,
  });
});

/**
 * @desc    Get cash flow statement
 * @route   GET /api/financial-summary/:id/cashflow
 * @access  Private (Finance Manager)
 */
exports.getCashFlowStatement = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(req.params.id);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  const { months } = req.query;
  const limit = parseInt(months) || 12;

  const cashFlowData = {
    summary: {
      initialInvestment: financialSummary.cashFlow.initialInvestment,
      monthlyBurnRate: financialSummary.cashFlow.monthlyBurnRate,
      runway: financialSummary.cashFlow.runway,
      totalInflow: financialSummary.cashFlow.cashFlowMonths.reduce(
        (sum, month) => sum + month.inflow,
        0,
      ),
      totalOutflow: financialSummary.cashFlow.cashFlowMonths.reduce(
        (sum, month) => sum + month.outflow,
        0,
      ),
      netCashFlow: financialSummary.cashFlow.cashFlowMonths.reduce(
        (sum, month) => sum + month.netCashFlow,
        0,
      ),
    },
    monthlyData: financialSummary.cashFlow.cashFlowMonths.slice(0, limit),
    chart: {
      labels: financialSummary.cashFlow.cashFlowMonths
        .slice(0, limit)
        .map((m) => `Month ${m.month}`),
      inflow: financialSummary.cashFlow.cashFlowMonths
        .slice(0, limit)
        .map((m) => m.inflow),
      outflow: financialSummary.cashFlow.cashFlowMonths
        .slice(0, limit)
        .map((m) => m.outflow),
      cumulative: financialSummary.cashFlow.cashFlowMonths
        .slice(0, limit)
        .map((m) => m.cumulativeCash),
    },
  };

  res.status(200).json({
    success: true,
    data: cashFlowData,
  });
});

/**
 * @desc    Get break-even analysis
 * @route   GET /api/financial-summary/:id/breakeven
 * @access  Private
 */
exports.getBreakEvenAnalysis = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(req.params.id);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  const { breakEvenPoint } = financialSummary.profitability;
  const totalCost = financialSummary.totalCosts.grandTotalCosts;
  const totalRevenue = financialSummary.totalRevenue.grandTotalRevenue;

  // Calculate monthly average revenue
  const avgMonthlyRevenue = totalRevenue / 36;
  const avgMonthlyCost = totalCost / 36;

  const analysis = {
    breakEvenPoint,
    currentStatus: {
      totalCost,
      totalRevenue,
      currentProfit: totalRevenue - totalCost,
      monthsToBreakEven: breakEvenPoint.monthsRequired,
      revenueRequired: breakEvenPoint.revenueRequired,
      usersRequired: breakEvenPoint.usersRequired,
    },
    monthlyMetrics: {
      avgRevenue: avgMonthlyRevenue,
      avgCost: avgMonthlyCost,
      avgProfit: avgMonthlyRevenue - avgMonthlyCost,
      monthsToProfit: Math.ceil(
        breakEvenPoint.revenueRequired / avgMonthlyRevenue,
      ),
    },
    scenarios: {
      optimistic: {
        revenueIncrease: 20,
        monthsToBreakEven: Math.ceil(breakEvenPoint.monthsRequired * 0.8),
      },
      pessimistic: {
        revenueDecrease: 20,
        monthsToBreakEven: Math.ceil(breakEvenPoint.monthsRequired * 1.2),
      },
    },
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get investment metrics
 * @route   GET /api/financial-summary/:id/investment
 * @access  Private (Admin/Finance Manager)
 */
exports.getInvestmentMetrics = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(
    req.params.id,
  ).populate("refIds.sponsorsId");

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  const totalInvestment = financialSummary.totalCosts.grandTotalCosts;
  const totalRevenue = financialSummary.totalRevenue.grandTotalRevenue;
  const netProfit = financialSummary.profitability.netProfit;

  const metrics = {
    totalInvestment,
    totalRevenue,
    netProfit,
    roi: financialSummary.profitability.roi,
    paybackPeriod: financialSummary.profitability.paybackPeriod,
    investmentBreakdown: {
      bySource: {
        internal:
          totalInvestment - (financialSummary.totalRevenue.investments || 0),
        external: financialSummary.totalRevenue.investments || 0,
        sponsorships: financialSummary.totalRevenue.sponsorships || 0,
      },
      byCategory: {
        development:
          (
            (financialSummary.totalCosts.developmentCosts / totalInvestment) *
            100
          ).toFixed(2) + "%",
        infrastructure:
          (
            (financialSummary.totalCosts.infrastructureCosts /
              totalInvestment) *
            100
          ).toFixed(2) + "%",
        content:
          (
            (financialSummary.totalCosts.contentCreationCosts /
              totalInvestment) *
            100
          ).toFixed(2) + "%",
        marketing:
          (
            (financialSummary.totalCosts.marketingCosts / totalInvestment) *
            100
          ).toFixed(2) + "%",
        operational:
          (
            (financialSummary.totalCosts.operationalCosts / totalInvestment) *
            100
          ).toFixed(2) + "%",
      },
    },
    returnMetrics: {
      returnOnInvestment: financialSummary.profitability.roi + "%",
      returnOnEquity: ((netProfit / totalInvestment) * 100).toFixed(2) + "%",
      earningsPerYear: (netProfit / 3).toFixed(2),
      paybackStatus: netProfit > 0 ? "Profitable" : "Not yet profitable",
    },
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

// ============================================
// 🔄 AUTO-GENERATE FROM REFERENCES
// ============================================

/**
 * @desc    Auto-generate financial summary from references
 * @route   POST /api/financial-summary/generate/:projectId
 * @access  Private (Admin/Finance Manager)
 */
exports.generateFromReferences = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  // Fetch all related data
  const [
    development,
    infrastructure,
    content,
    marketing,
    operational,
    revenue,
    sponsors,
  ] = await Promise.all([
    DevelopmentCost.findOne({ projectId }),
    Infrastructure.findOne({ projectId }),
    ContentCreation.findOne({ projectId }),
    Marketing.findOne({ projectId }),
    Operational.findOne({ projectId }),
    Revenue.findOne({ projectId }),
    Sponsors.findOne({ projectId }),
  ]);

  // Check if summary already exists
  let financialSummary = await FinancialSummary.findOne({ projectId });

  // Prepare reference IDs
  const refIds = {
    developmentCostId: development?._id,
    infrastructureId: infrastructure?._id,
    contentId: content?._id,
    marketingId: marketing?._id,
    operationalId: operational?._id,
    revenueId: revenue?._id,
    sponsorsId: sponsors?._id,
  };

  // Calculate totals
  const totalCosts = {
    developmentCosts: development?.totalDevelopmentInvestment || 0,
    infrastructureCosts: infrastructure?.totalInfrastructureThreeYear || 0,
    contentCreationCosts: content?.totalContentThreeYear || 0,
    marketingCosts: marketing?.totalMarketingThreeYear || 0,
    operationalCosts: operational?.totalOperationalThreeYear || 0,
    contingencyFund: 0, // Will be calculated
  };

  totalCosts.grandTotalCosts =
    totalCosts.developmentCosts +
    totalCosts.infrastructureCosts +
    totalCosts.contentCreationCosts +
    totalCosts.marketingCosts +
    totalCosts.operationalCosts;

  // Add 10% contingency
  totalCosts.contingencyFund = totalCosts.grandTotalCosts * 0.1;
  totalCosts.grandTotalCosts += totalCosts.contingencyFund;

  const totalRevenue = {
    b2cRevenue: revenue?.totalRevenueThreeYear || 0,
    b2bRevenue: revenue?.totalB2BThreeYear || 0,
    otherRevenue: revenue?.totalOtherThreeYear || 0,
    sponsorships: sponsors?.totalSponsorshipsThreeYear || 0,
    investments: sponsors?.totalInvestmentReceived || 0,
  };

  totalRevenue.grandTotalRevenue =
    totalRevenue.b2cRevenue +
    totalRevenue.b2bRevenue +
    totalRevenue.otherRevenue +
    totalRevenue.sponsorships +
    totalRevenue.investments;

  // Calculate profitability
  const profitability = calculateProfitability(totalCosts, totalRevenue);
  const breakEvenPoint = calculateBreakEven(totalCosts, totalRevenue);
  const cashFlow = generateCashFlowProjection(totalCosts, totalRevenue, 36);
  const yearlyBreakdown = generateYearlyBreakdown(totalCosts, totalRevenue);

  const summaryData = {
    projectId,
    refIds,
    totalCosts,
    totalRevenue,
    profitability: {
      ...profitability,
      breakEvenPoint,
    },
    cashFlow,
    yearlyBreakdown,
  };

  if (financialSummary) {
    // Update existing
    financialSummary = await FinancialSummary.findOneAndUpdate(
      { projectId },
      { ...summaryData, updatedAt: Date.now() },
      { new: true },
    );
  } else {
    // Create new
    financialSummary = await FinancialSummary.create(summaryData);
  }

  await financialSummary.populate([
    { path: "refIds.developmentCostId" },
    { path: "refIds.infrastructureId" },
    { path: "refIds.contentId" },
    { path: "refIds.marketingId" },
    { path: "refIds.operationalId" },
    { path: "refIds.revenueId" },
    { path: "refIds.sponsorsId" },
  ]);

  res.status(200).json({
    success: true,
    message: financialSummary
      ? "Financial summary updated"
      : "Financial summary created",
    data: {
      financialSummary,
    },
  });
});

/**
 * @desc    Recalculate all metrics
 * @route   POST /api/financial-summary/:id/recalculate
 * @access  Private (Finance Manager)
 */
exports.recalculateMetrics = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(req.params.id);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  // Recalculate all metrics
  const profitability = calculateProfitability(
    financialSummary.totalCosts,
    financialSummary.totalRevenue,
  );
  const breakEvenPoint = calculateBreakEven(
    financialSummary.totalCosts,
    financialSummary.totalRevenue,
  );
  const cashFlow = generateCashFlowProjection(
    financialSummary.totalCosts,
    financialSummary.totalRevenue,
    36,
  );

  financialSummary.profitability = {
    ...profitability,
    breakEvenPoint,
  };
  financialSummary.cashFlow = cashFlow;
  financialSummary.updatedAt = Date.now();

  await financialSummary.save();

  res.status(200).json({
    success: true,
    message: "Metrics recalculated successfully",
    data: {
      financialSummary,
    },
  });
});

// ============================================
// 📈 SCENARIO ANALYSIS
// ============================================

/**
 * @desc    Run what-if scenarios
 * @route   POST /api/financial-summary/:id/scenarios
 * @access  Private (Finance Manager)
 */
exports.runScenarios = catchAsync(async (req, res, next) => {
  const financialSummary = await FinancialSummary.findById(req.params.id);

  if (!financialSummary) {
    return next(new AppError("No financial summary found with that ID", 404));
  }

  const { scenarios } = req.body;

  const results = scenarios.map((scenario) => {
    const { name, costChange, revenueChange } = scenario;

    // Apply changes
    const modifiedCosts = {
      ...financialSummary.totalCosts,
      grandTotalCosts:
        financialSummary.totalCosts.grandTotalCosts * (1 + costChange / 100),
    };

    const modifiedRevenue = {
      ...financialSummary.totalRevenue,
      grandTotalRevenue:
        financialSummary.totalRevenue.grandTotalRevenue *
        (1 + revenueChange / 100),
    };

    const profitability = calculateProfitability(
      modifiedCosts,
      modifiedRevenue,
    );
    const breakEvenPoint = calculateBreakEven(modifiedCosts, modifiedRevenue);

    return {
      name,
      assumptions: {
        costChange: costChange + "%",
        revenueChange: revenueChange + "%",
      },
      results: {
        totalCost: modifiedCosts.grandTotalCosts,
        totalRevenue: modifiedRevenue.grandTotalRevenue,
        netProfit: profitability.netProfit,
        netMargin: profitability.netMargin,
        roi: profitability.roi,
        breakEvenMonths: breakEvenPoint.monthsRequired,
      },
    };
  });

  res.status(200).json({
    success: true,
    data: {
      baseScenario: {
        netProfit: financialSummary.profitability.netProfit,
        netMargin: financialSummary.profitability.netMargin,
        roi: financialSummary.profitability.roi,
        breakEvenMonths:
          financialSummary.profitability.breakEvenPoint.monthsRequired,
      },
      scenarios: results,
    },
  });
});

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Fetch referenced data by IDs
 */
async function fetchReferencedData(refIds) {
  const [
    development,
    infrastructure,
    content,
    marketing,
    operational,
    revenue,
    sponsors,
  ] = await Promise.all([
    refIds.developmentCostId
      ? DevelopmentCost.findById(refIds.developmentCostId)
      : null,
    refIds.infrastructureId
      ? Infrastructure.findById(refIds.infrastructureId)
      : null,
    refIds.contentId ? ContentCreation.findById(refIds.contentId) : null,
    refIds.marketingId ? Marketing.findById(refIds.marketingId) : null,
    refIds.operationalId ? Operational.findById(refIds.operationalId) : null,
    refIds.revenueId ? Revenue.findById(refIds.revenueId) : null,
    refIds.sponsorsId ? Sponsors.findById(refIds.sponsorsId) : null,
  ]);

  return {
    development,
    infrastructure,
    content,
    marketing,
    operational,
    revenue,
    sponsors,
  };
}

/**
 * Generate yearly breakdown
 */
function generateYearlyBreakdown(totalCosts, totalRevenue) {
  const yearlyBreakdown = [];
  const totalCost = totalCosts.grandTotalCosts;
  const totalRev = totalRevenue.grandTotalRevenue;

  let cumulativeProfit = 0;

  for (let year = 1; year <= 3; year++) {
    const yearCost = totalCost / 3;
    const yearRevenue = totalRev / 3;
    const yearProfit = yearRevenue - yearCost;
    cumulativeProfit += yearProfit;

    yearlyBreakdown.push({
      year,
      revenue: yearRevenue,
      costs: yearCost,
      profit: yearProfit,
      margin: ((yearProfit / yearRevenue) * 100).toFixed(2),
      cumulativeProfit,
    });
  }

  return yearlyBreakdown;
}

module.exports = exports;
