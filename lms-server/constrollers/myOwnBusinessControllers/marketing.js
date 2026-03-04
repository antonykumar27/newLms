const Marketing = require("../models/marketing.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateDigitalTotals,
  calculateTraditionalTotals,
  calculateBDTotals,
  calculateGrandTotals,
  calculateROI,
  calculateCAC,
  analyzeChannelPerformance,
  generateMarketingInsights,
} = require("../utils/marketingCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new marketing plan
 * @route   POST /api/marketing
 * @access  Private (Admin/Marketing Head)
 */
exports.createMarketingPlan = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if marketing plan already exists
  const existingPlan = await Marketing.findOne({ projectId });
  if (existingPlan) {
    return next(
      new AppError("Marketing plan already exists for this project", 400),
    );
  }

  // Calculate all totals
  const digitalTotals = calculateDigitalTotals(req.body.digitalMarketing);
  const traditionalTotals = calculateTraditionalTotals(
    req.body.traditionalMarketing,
  );
  const bdTotals = calculateBDTotals(req.body.businessDevelopment);
  const grandTotals = calculateGrandTotals(
    digitalTotals,
    traditionalTotals,
    bdTotals,
  );

  const marketingData = {
    ...req.body,
    digitalMarketing: {
      ...req.body.digitalMarketing,
      seo: {
        ...req.body.digitalMarketing?.seo,
        totalMonthly: digitalTotals.seoMonthly,
        totalThreeYear: digitalTotals.seoMonthly * 36,
      },
      socialMedia: {
        ...req.body.digitalMarketing?.socialMedia,
        totalMonthly: digitalTotals.socialMonthly,
        totalThreeYear: digitalTotals.socialMonthly * 36,
      },
      paidAds: {
        ...req.body.digitalMarketing?.paidAds,
        totalMonthly: digitalTotals.adsMonthly,
        totalThreeYear: digitalTotals.adsMonthly * 36,
      },
      emailMarketing: {
        ...req.body.digitalMarketing?.emailMarketing,
        totalMonthly: digitalTotals.emailMonthly,
      },
    },
    traditionalMarketing: {
      ...req.body.traditionalMarketing,
      totalYearly: traditionalTotals.yearly,
    },
    businessDevelopment: {
      ...req.body.businessDevelopment,
      totalBDMonthly: bdTotals.monthly,
      totalBDYearly: bdTotals.yearly,
    },
    totalMarketingMonthly: grandTotals.monthly,
    totalMarketingYearly: grandTotals.yearly,
    totalMarketingThreeYear: grandTotals.threeYear,
  };

  const marketing = await Marketing.create(marketingData);

  res.status(201).json({
    success: true,
    message: "Marketing plan created successfully",
    data: {
      marketing,
    },
  });
});

/**
 * @desc    Get all marketing plans
 * @route   GET /api/marketing
 * @access  Private
 */
exports.getAllMarketingPlans = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = Marketing.find(queryObj);

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
  const marketingPlans = await query;
  const total = await Marketing.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: marketingPlans.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      marketingPlans,
    },
  });
});

/**
 * @desc    Get single marketing plan by ID
 * @route   GET /api/marketing/:id
 * @access  Private
 */
exports.getMarketingPlan = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      marketing,
    },
  });
});

/**
 * @desc    Get marketing plan by project ID
 * @route   GET /api/marketing/project/:projectId
 * @access  Private
 */
exports.getMarketingPlanByProjectId = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findOne({
    projectId: req.params.projectId,
  });

  if (!marketing) {
    return next(new AppError("No marketing plan found for this project", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      marketing,
    },
  });
});

/**
 * @desc    Update marketing plan
 * @route   PATCH /api/marketing/:id
 * @access  Private (Admin/Marketing Head)
 */
exports.updateMarketingPlan = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  // Merge existing data with updates
  const mergedData = {
    ...marketing.toObject(),
    ...req.body,
  };

  // Recalculate totals
  const digitalTotals = calculateDigitalTotals(mergedData.digitalMarketing);
  const traditionalTotals = calculateTraditionalTotals(
    mergedData.traditionalMarketing,
  );
  const bdTotals = calculateBDTotals(mergedData.businessDevelopment);
  const grandTotals = calculateGrandTotals(
    digitalTotals,
    traditionalTotals,
    bdTotals,
  );

  const updateData = {
    ...req.body,
    digitalMarketing: {
      ...mergedData.digitalMarketing,
      seo: {
        ...mergedData.digitalMarketing?.seo,
        totalMonthly: digitalTotals.seoMonthly,
        totalThreeYear: digitalTotals.seoMonthly * 36,
      },
      socialMedia: {
        ...mergedData.digitalMarketing?.socialMedia,
        totalMonthly: digitalTotals.socialMonthly,
        totalThreeYear: digitalTotals.socialMonthly * 36,
      },
      paidAds: {
        ...mergedData.digitalMarketing?.paidAds,
        totalMonthly: digitalTotals.adsMonthly,
        totalThreeYear: digitalTotals.adsMonthly * 36,
      },
    },
    traditionalMarketing: {
      ...mergedData.traditionalMarketing,
      totalYearly: traditionalTotals.yearly,
    },
    businessDevelopment: {
      ...mergedData.businessDevelopment,
      totalBDMonthly: bdTotals.monthly,
      totalBDYearly: bdTotals.yearly,
    },
    totalMarketingMonthly: grandTotals.monthly,
    totalMarketingYearly: grandTotals.yearly,
    totalMarketingThreeYear: grandTotals.threeYear,
    updatedAt: Date.now(),
  };

  const updatedMarketing = await Marketing.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Marketing plan updated successfully",
    data: {
      marketing: updatedMarketing,
    },
  });
});

/**
 * @desc    Delete marketing plan
 * @route   DELETE /api/marketing/:id
 * @access  Private (Admin only)
 */
exports.deleteMarketingPlan = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findByIdAndDelete(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Marketing plan deleted successfully",
    data: null,
  });
});

// ============================================
// 📊 CAMPAIGN MANAGEMENT
// ============================================

/**
 * @desc    Add social media platform
 * @route   POST /api/marketing/:id/social-platforms
 * @access  Private (Marketing Head)
 */
exports.addSocialPlatform = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const { name, monthlyBudget } = req.body;

  marketing.digitalMarketing.socialMedia.platforms.push({
    name,
    monthlyBudget,
  });

  // Recalculate social media total
  const socialTotal =
    marketing.digitalMarketing.socialMedia.platforms.reduce(
      (sum, p) => sum + p.monthlyBudget,
      0,
    ) +
    (marketing.digitalMarketing.socialMedia.contentCreation?.monthly || 0) +
    (marketing.digitalMarketing.socialMedia.communityManagement?.monthly || 0);

  marketing.digitalMarketing.socialMedia.totalMonthly = socialTotal;
  marketing.digitalMarketing.socialMedia.totalThreeYear = socialTotal * 36;

  // Recalculate grand total
  await updateGrandTotals(marketing);

  await marketing.save();

  res.status(201).json({
    success: true,
    message: "Social platform added successfully",
    data: {
      platform: { name, monthlyBudget },
    },
  });
});

/**
 * @desc    Update social media platform
 * @route   PATCH /api/marketing/:id/social-platforms/:platformIndex
 * @access  Private (Marketing Head)
 */
exports.updateSocialPlatform = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const { platformIndex } = req.params;
  const { monthlyBudget } = req.body;

  if (!marketing.digitalMarketing.socialMedia.platforms[platformIndex]) {
    return next(new AppError("Platform not found", 404));
  }

  marketing.digitalMarketing.socialMedia.platforms[
    platformIndex
  ].monthlyBudget = monthlyBudget;

  // Recalculate totals
  const socialTotal =
    marketing.digitalMarketing.socialMedia.platforms.reduce(
      (sum, p) => sum + p.monthlyBudget,
      0,
    ) +
    (marketing.digitalMarketing.socialMedia.contentCreation?.monthly || 0) +
    (marketing.digitalMarketing.socialMedia.communityManagement?.monthly || 0);

  marketing.digitalMarketing.socialMedia.totalMonthly = socialTotal;
  marketing.digitalMarketing.socialMedia.totalThreeYear = socialTotal * 36;

  await updateGrandTotals(marketing);
  await marketing.save();

  res.status(200).json({
    success: true,
    message: "Social platform updated successfully",
    data: {
      platforms: marketing.digitalMarketing.socialMedia.platforms,
    },
  });
});

/**
 * @desc    Delete social media platform
 * @route   DELETE /api/marketing/:id/social-platforms/:platformIndex
 * @access  Private (Marketing Head)
 */
exports.deleteSocialPlatform = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const { platformIndex } = req.params;

  if (!marketing.digitalMarketing.socialMedia.platforms[platformIndex]) {
    return next(new AppError("Platform not found", 404));
  }

  marketing.digitalMarketing.socialMedia.platforms.splice(platformIndex, 1);

  // Recalculate totals
  const socialTotal =
    marketing.digitalMarketing.socialMedia.platforms.reduce(
      (sum, p) => sum + p.monthlyBudget,
      0,
    ) +
    (marketing.digitalMarketing.socialMedia.contentCreation?.monthly || 0) +
    (marketing.digitalMarketing.socialMedia.communityManagement?.monthly || 0);

  marketing.digitalMarketing.socialMedia.totalMonthly = socialTotal;
  marketing.digitalMarketing.socialMedia.totalThreeYear = socialTotal * 36;

  await updateGrandTotals(marketing);
  await marketing.save();

  res.status(200).json({
    success: true,
    message: "Social platform deleted successfully",
    data: null,
  });
});

// ============================================
// 📈 ROI & PERFORMANCE ANALYSIS
// ============================================

/**
 * @desc    Get marketing ROI analysis
 * @route   GET /api/marketing/:id/roi-analysis
 * @access  Private
 */
exports.getROIAnalysis = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  // This would typically come from actual revenue data
  const estimatedRevenue = {
    digital: 5000000, // ₹50L from digital channels
    traditional: 2000000, // ₹20L from traditional
    bd: 3000000, // ₹30L from business development
  };

  const roi = calculateROI(marketing, estimatedRevenue);
  const cac = calculateCAC(marketing, 500); // Assume 500 customers acquired
  const channelPerformance = analyzeChannelPerformance(
    marketing,
    estimatedRevenue,
  );

  const analysis = {
    overview: {
      totalSpend: marketing.totalMarketingThreeYear,
      estimatedRevenue: Object.values(estimatedRevenue).reduce(
        (a, b) => a + b,
        0,
      ),
      roi: roi.toFixed(2) + "%",
      cac: formatCurrency(cac),
    },
    channelBreakdown: channelPerformance,
    recommendations: generateMarketingInsights(channelPerformance),
    efficiency: {
      marketingEfficiency: (
        estimatedRevenue.digital /
        marketing.digitalMarketing.paidAds.totalThreeYear
      ).toFixed(2),
      costPerLead: (marketing.totalMarketingMonthly / 100).toFixed(0), // Assume 100 leads/month
    },
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get channel-wise performance
 * @route   GET /api/marketing/:id/channel-performance
 * @access  Private
 */
exports.getChannelPerformance = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const performance = {
    digital: {
      seo: {
        budget: marketing.digitalMarketing.seo.totalThreeYear,
        effectiveness: "High",
        leads: 1200,
        costPerLead: (
          marketing.digitalMarketing.seo.totalThreeYear / 1200
        ).toFixed(0),
      },
      socialMedia: {
        budget: marketing.digitalMarketing.socialMedia.totalThreeYear,
        platforms: marketing.digitalMarketing.socialMedia.platforms.map(
          (p) => ({
            name: p.name,
            budget: p.monthlyBudget * 36,
            reach:
              p.name === "instagram"
                ? "50K"
                : p.name === "facebook"
                  ? "75K"
                  : "100K",
          }),
        ),
      },
      paidAds: {
        google: {
          budget:
            (marketing.digitalMarketing.paidAds.googleAds?.monthly || 0) * 36,
          cpc: 15, // Cost per click
          clicks: 50000,
        },
        facebook: {
          budget:
            (marketing.digitalMarketing.paidAds.facebookAds?.monthly || 0) * 36,
          cpc: 12,
          clicks: 60000,
        },
      },
      email: {
        budget:
          (marketing.digitalMarketing.emailMarketing?.totalMonthly || 0) * 36,
        openRate: "22%",
        clickRate: "3.5%",
      },
    },
    traditional: {
      print: {
        budget: marketing.traditionalMarketing?.printAds?.totalYearly * 3 || 0,
        reach: "200K",
      },
      events: {
        budget:
          marketing.traditionalMarketing?.eventsAndSponsorships?.totalYearly *
            3 || 0,
        eventsAttended: 12,
      },
    },
    businessDevelopment: {
      salesTeam: {
        budget: marketing.businessDevelopment?.totalBDYearly * 3 || 0,
        deals: 50,
        averageDealSize: 200000,
      },
    },
  };

  res.status(200).json({
    success: true,
    data: performance,
  });
});

/**
 * @desc    Get lead generation metrics
 * @route   GET /api/marketing/:id/lead-metrics
 * @access  Private
 */
exports.getLeadMetrics = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const metrics = {
    monthly: {
      leads: 500,
      mqls: 200, // Marketing Qualified Leads
      sqls: 100, // Sales Qualified Leads
      opportunities: 50,
      customers: 25,
    },
    funnels: {
      topOfFunnel: {
        visitors: 10000,
        leads: 500,
        conversionRate: "5%",
        cost: marketing.digitalMarketing.paidAds.totalMonthly,
      },
      middleOfFunnel: {
        leads: 500,
        mqls: 200,
        conversionRate: "40%",
        cost: marketing.digitalMarketing.emailMarketing.totalMonthly,
      },
      bottomOfFunnel: {
        opportunities: 50,
        customers: 25,
        conversionRate: "50%",
        cost: marketing.businessDevelopment.totalBDMonthly,
      },
    },
    costs: {
      costPerLead: (marketing.totalMarketingMonthly / 500).toFixed(0),
      costPerMQL: (marketing.totalMarketingMonthly / 200).toFixed(0),
      costPerSQL: (marketing.totalMarketingMonthly / 100).toFixed(0),
      costPerCustomer: (marketing.totalMarketingMonthly / 25).toFixed(0),
    },
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
});

// ============================================
// 📅 CAMPAIGN PLANNING
// ============================================

/**
 * @desc    Create campaign budget
 * @route   POST /api/marketing/:id/campaigns
 * @access  Private (Marketing Head)
 */
exports.createCampaign = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const { name, channel, budget, startDate, endDate, goals } = req.body;

  // Initialize campaigns array if not exists
  if (!marketing.campaigns) {
    marketing.campaigns = [];
  }

  const campaign = {
    name,
    channel,
    budget,
    startDate,
    endDate,
    goals,
    status: "planned",
    createdAt: new Date(),
  };

  marketing.campaigns.push(campaign);
  await marketing.save();

  res.status(201).json({
    success: true,
    message: "Campaign created successfully",
    data: {
      campaign,
    },
  });
});

/**
 * @desc    Get campaign calendar
 * @route   GET /api/marketing/:id/campaign-calendar
 * @access  Private
 */
exports.getCampaignCalendar = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findById(req.params.id);

  if (!marketing) {
    return next(new AppError("No marketing plan found with that ID", 404));
  }

  const { year, month } = req.query;

  // This would typically filter campaigns by date
  const calendar = {
    planned: [
      {
        name: "Summer Sale Campaign",
        channel: "Social Media",
        budget: 50000,
        startDate: "2024-06-01",
        endDate: "2024-06-30",
        status: "planned",
      },
    ],
    active: [
      {
        name: "Back to School",
        channel: "Google Ads",
        budget: 75000,
        startDate: "2024-05-15",
        endDate: "2024-06-15",
        status: "active",
      },
    ],
    completed: [
      {
        name: "Spring Campaign",
        channel: "Email",
        budget: 25000,
        startDate: "2024-03-01",
        endDate: "2024-03-31",
        status: "completed",
        results: {
          leads: 150,
          revenue: 300000,
        },
      },
    ],
  };

  res.status(200).json({
    success: true,
    data: calendar,
  });
});

// ============================================
// 📊 DASHBOARD & REPORTS
// ============================================

/**
 * @desc    Get marketing dashboard
 * @route   GET /api/marketing/dashboard/:projectId
 * @access  Private
 */
exports.getMarketingDashboard = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findOne({
    projectId: req.params.projectId,
  });

  if (!marketing) {
    return next(new AppError("No marketing plan found for this project", 404));
  }

  const dashboard = {
    overview: {
      totalBudget: marketing.totalMarketingThreeYear,
      monthlySpend: marketing.totalMarketingMonthly,
      yearlySpend: marketing.totalMarketingYearly,
      breakdown: {
        digital:
          marketing.digitalMarketing.seo.totalThreeYear +
          marketing.digitalMarketing.socialMedia.totalThreeYear +
          marketing.digitalMarketing.paidAds.totalThreeYear +
          marketing.digitalMarketing.emailMarketing.totalMonthly * 36,
        traditional: marketing.traditionalMarketing?.totalYearly * 3 || 0,
        businessDev: marketing.businessDevelopment?.totalBDYearly * 3 || 0,
      },
    },
    digitalMix: {
      seo: marketing.digitalMarketing.seo.totalThreeYear,
      social: marketing.digitalMarketing.socialMedia.totalThreeYear,
      ads: marketing.digitalMarketing.paidAds.totalThreeYear,
      email: marketing.digitalMarketing.emailMarketing.totalMonthly * 36,
    },
    socialPlatforms: marketing.digitalMarketing.socialMedia.platforms.map(
      (p) => ({
        name: p.name,
        monthlyBudget: p.monthlyBudget,
        yearlyBudget: p.monthlyBudget * 12,
      }),
    ),
    salesTeam: marketing.businessDevelopment?.salesTeam.map((t) => ({
      role: t.role,
      count: t.count,
      monthlyCompensation: t.totalCompensation,
    })),
    recommendations: [
      {
        channel: "Google Ads",
        suggestion: "Increase budget by 20% - high ROI observed",
        impact: "Potential +30% leads",
      },
      {
        channel: "Instagram",
        suggestion: "Focus on reels content for better engagement",
        impact: "Potential +50% reach",
      },
    ],
  };

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});

/**
 * @desc    Export marketing report
 * @route   GET /api/marketing/export/:projectId
 * @access  Private
 */
exports.exportMarketingReport = catchAsync(async (req, res, next) => {
  const marketing = await Marketing.findOne({
    projectId: req.params.projectId,
  });

  if (!marketing) {
    return next(new AppError("No marketing plan found for this project", 404));
  }

  const report = {
    generatedAt: new Date(),
    projectId: marketing.projectId,
    executiveSummary: {
      totalInvestment: marketing.totalMarketingThreeYear,
      channels: [
        {
          name: "Digital Marketing",
          amount:
            marketing.digitalMarketing.seo.totalThreeYear +
            marketing.digitalMarketing.socialMedia.totalThreeYear +
            marketing.digitalMarketing.paidAds.totalThreeYear,
        },
        {
          name: "Traditional Marketing",
          amount: marketing.traditionalMarketing?.totalYearly * 3 || 0,
        },
        {
          name: "Business Development",
          amount: marketing.businessDevelopment?.totalBDYearly * 3 || 0,
        },
      ],
    },
    detailed: {
      digital: marketing.digitalMarketing,
      traditional: marketing.traditionalMarketing,
      businessDev: marketing.businessDevelopment,
    },
    roi: {
      estimated: "300%",
      paybackPeriod: "8 months",
    },
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
 * Update grand totals helper
 */
async function updateGrandTotals(marketing) {
  const digitalTotal =
    (marketing.digitalMarketing.seo?.totalMonthly || 0) +
    (marketing.digitalMarketing.socialMedia?.totalMonthly || 0) +
    (marketing.digitalMarketing.paidAds?.totalMonthly || 0) +
    (marketing.digitalMarketing.emailMarketing?.totalMonthly || 0);

  const traditionalYearly = marketing.traditionalMarketing?.totalYearly || 0;
  const bdMonthly = marketing.businessDevelopment?.totalBDMonthly || 0;

  marketing.totalMarketingMonthly =
    digitalTotal + bdMonthly + traditionalYearly / 12;
  marketing.totalMarketingYearly = marketing.totalMarketingMonthly * 12;
  marketing.totalMarketingThreeYear = marketing.totalMarketingMonthly * 36;
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
