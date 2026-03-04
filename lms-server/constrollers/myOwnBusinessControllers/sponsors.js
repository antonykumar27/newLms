const Sponsors = require("../models/sponsors.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new sponsors record
 * @route   POST /api/sponsors
 * @access  Private (Admin/Business Head)
 */
exports.createSponsorsRecord = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if record already exists
  const existingRecord = await Sponsors.findOne({ projectId });
  if (existingRecord) {
    return next(
      new AppError("Sponsors record already exists for this project", 400),
    );
  }

  // Calculate totals
  const totals = calculateTotals(req.body);

  const sponsorsData = {
    ...req.body,
    totalSponsorshipsYear1: totals.year1,
    totalSponsorshipsYear2: totals.year2,
    totalSponsorshipsYear3: totals.year3,
    totalSponsorshipsThreeYear: totals.threeYear,
    totalInvestmentReceived: totals.investments,
  };

  const sponsors = await Sponsors.create(sponsorsData);

  res.status(201).json({
    success: true,
    message: "Sponsors record created successfully",
    data: {
      sponsors,
    },
  });
});

/**
 * @desc    Get all sponsors records
 * @route   GET /api/sponsors
 * @access  Private
 */
exports.getAllSponsorsRecords = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = Sponsors.find(queryObj);

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
  const sponsorsRecords = await query;
  const total = await Sponsors.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: sponsorsRecords.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      sponsorsRecords,
    },
  });
});

/**
 * @desc    Get single sponsors record by ID
 * @route   GET /api/sponsors/:id
 * @access  Private
 */
exports.getSponsorsRecord = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      sponsors,
    },
  });
});

/**
 * @desc    Get sponsors record by project ID
 * @route   GET /api/sponsors/project/:projectId
 * @access  Private
 */
exports.getSponsorsByProjectId = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findOne({
    projectId: req.params.projectId,
  });

  if (!sponsors) {
    return next(new AppError("No sponsors record found for this project", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      sponsors,
    },
  });
});

/**
 * @desc    Update sponsors record
 * @route   PATCH /api/sponsors/:id
 * @access  Private (Admin/Business Head)
 */
exports.updateSponsorsRecord = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  // Merge existing data with updates
  const mergedData = {
    ...sponsors.toObject(),
    ...req.body,
  };

  // Recalculate totals
  const totals = calculateTotals(mergedData);

  const updateData = {
    ...req.body,
    totalSponsorshipsYear1: totals.year1,
    totalSponsorshipsYear2: totals.year2,
    totalSponsorshipsYear3: totals.year3,
    totalSponsorshipsThreeYear: totals.threeYear,
    totalInvestmentReceived: totals.investments,
    updatedAt: Date.now(),
  };

  const updatedSponsors = await Sponsors.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Sponsors record updated successfully",
    data: {
      sponsors: updatedSponsors,
    },
  });
});

/**
 * @desc    Delete sponsors record
 * @route   DELETE /api/sponsors/:id
 * @access  Private (Admin only)
 */
exports.deleteSponsorsRecord = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findByIdAndDelete(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Sponsors record deleted successfully",
    data: null,
  });
});

// ============================================
// 💰 INVESTOR MANAGEMENT
// ============================================

/**
 * @desc    Add investor
 * @route   POST /api/sponsors/:id/investors
 * @access  Private (Admin/Business Head)
 */
exports.addInvestor = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const {
    name,
    type,
    investmentAmount,
    equityStake,
    investmentDate,
    boardSeat,
    notes,
  } = req.body;

  sponsors.investors.push({
    name,
    type,
    investmentAmount,
    equityStake,
    investmentDate: investmentDate || new Date(),
    boardSeat: boardSeat || false,
    notes,
  });

  // Recalculate total investment
  sponsors.totalInvestmentReceived = sponsors.investors.reduce(
    (sum, inv) => sum + (inv.investmentAmount || 0),
    0,
  );

  await sponsors.save();

  res.status(201).json({
    success: true,
    message: "Investor added successfully",
    data: {
      investor: req.body,
    },
  });
});

/**
 * @desc    Update investor
 * @route   PATCH /api/sponsors/:id/investors/:investorIndex
 * @access  Private (Admin/Business Head)
 */
exports.updateInvestor = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { investorIndex } = req.params;

  if (!sponsors.investors[investorIndex]) {
    return next(new AppError("Investor not found", 404));
  }

  // Update investor fields
  Object.assign(sponsors.investors[investorIndex], req.body);

  // Recalculate total investment
  sponsors.totalInvestmentReceived = sponsors.investors.reduce(
    (sum, inv) => sum + (inv.investmentAmount || 0),
    0,
  );

  await sponsors.save();

  res.status(200).json({
    success: true,
    message: "Investor updated successfully",
    data: {
      investor: sponsors.investors[investorIndex],
    },
  });
});

/**
 * @desc    Delete investor
 * @route   DELETE /api/sponsors/:id/investors/:investorIndex
 * @access  Private (Admin only)
 */
exports.deleteInvestor = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { investorIndex } = req.params;

  if (!sponsors.investors[investorIndex]) {
    return next(new AppError("Investor not found", 404));
  }

  sponsors.investors.splice(investorIndex, 1);

  // Recalculate total investment
  sponsors.totalInvestmentReceived = sponsors.investors.reduce(
    (sum, inv) => sum + (inv.investmentAmount || 0),
    0,
  );

  await sponsors.save();

  res.status(200).json({
    success: true,
    message: "Investor deleted successfully",
    data: null,
  });
});

// ============================================
// 🤝 SPONSOR MANAGEMENT
// ============================================

/**
 * @desc    Add sponsor
 * @route   POST /api/sponsors/:id/sponsors
 * @access  Private (Admin/Marketing Head)
 */
exports.addSponsor = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const sponsorData = req.body;

  // Generate sponsorId if not provided
  if (!sponsorData.sponsorId) {
    sponsorData.sponsorId = `SP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  // Calculate yearly distribution if not provided
  if (
    !sponsorData.sponsorshipYear1 &&
    sponsorData.contributionAmount &&
    sponsorData.startDate &&
    sponsorData.endDate
  ) {
    const start = new Date(sponsorData.startDate);
    const end = new Date(sponsorData.endDate);
    const totalMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    // Distribute evenly across the period
    const monthlyAmount = sponsorData.contributionAmount / totalMonths;

    // Calculate year-wise
    sponsorData.sponsorshipYear1 = calculateYearlyAmount(
      monthlyAmount,
      start,
      end,
      1,
    );
    sponsorData.sponsorshipYear2 = calculateYearlyAmount(
      monthlyAmount,
      start,
      end,
      2,
    );
    sponsorData.sponsorshipYear3 = calculateYearlyAmount(
      monthlyAmount,
      start,
      end,
      3,
    );
  }

  sponsors.sponsors.push(sponsorData);

  // Recalculate sponsorship totals
  const sponsorshipTotals = sponsors.sponsors.reduce(
    (acc, s) => {
      acc.year1 += s.sponsorshipYear1 || 0;
      acc.year2 += s.sponsorshipYear2 || 0;
      acc.year3 += s.sponsorshipYear3 || 0;
      return acc;
    },
    { year1: 0, year2: 0, year3: 0 },
  );

  sponsors.totalSponsorshipsYear1 = sponsorshipTotals.year1;
  sponsors.totalSponsorshipsYear2 = sponsorshipTotals.year2;
  sponsors.totalSponsorshipsYear3 = sponsorshipTotals.year3;
  sponsors.totalSponsorshipsThreeYear =
    sponsorshipTotals.year1 + sponsorshipTotals.year2 + sponsorshipTotals.year3;

  await sponsors.save();

  res.status(201).json({
    success: true,
    message: "Sponsor added successfully",
    data: {
      sponsor: sponsorData,
    },
  });
});

/**
 * @desc    Update sponsor
 * @route   PATCH /api/sponsors/:id/sponsors/:sponsorIndex
 * @access  Private (Admin/Marketing Head)
 */
exports.updateSponsor = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { sponsorIndex } = req.params;

  if (!sponsors.sponsors[sponsorIndex]) {
    return next(new AppError("Sponsor not found", 404));
  }

  // Update sponsor fields
  Object.assign(sponsors.sponsors[sponsorIndex], req.body);

  // Recalculate sponsorship totals
  const sponsorshipTotals = sponsors.sponsors.reduce(
    (acc, s) => {
      acc.year1 += s.sponsorshipYear1 || 0;
      acc.year2 += s.sponsorshipYear2 || 0;
      acc.year3 += s.sponsorshipYear3 || 0;
      return acc;
    },
    { year1: 0, year2: 0, year3: 0 },
  );

  sponsors.totalSponsorshipsYear1 = sponsorshipTotals.year1;
  sponsors.totalSponsorshipsYear2 = sponsorshipTotals.year2;
  sponsors.totalSponsorshipsYear3 = sponsorshipTotals.year3;
  sponsors.totalSponsorshipsThreeYear =
    sponsorshipTotals.year1 + sponsorshipTotals.year2 + sponsorshipTotals.year3;

  await sponsors.save();

  res.status(200).json({
    success: true,
    message: "Sponsor updated successfully",
    data: {
      sponsor: sponsors.sponsors[sponsorIndex],
    },
  });
});

/**
 * @desc    Delete sponsor
 * @route   DELETE /api/sponsors/:id/sponsors/:sponsorIndex
 * @access  Private (Admin only)
 */
exports.deleteSponsor = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { sponsorIndex } = req.params;

  if (!sponsors.sponsors[sponsorIndex]) {
    return next(new AppError("Sponsor not found", 404));
  }

  sponsors.sponsors.splice(sponsorIndex, 1);

  // Recalculate sponsorship totals
  const sponsorshipTotals = sponsors.sponsors.reduce(
    (acc, s) => {
      acc.year1 += s.sponsorshipYear1 || 0;
      acc.year2 += s.sponsorshipYear2 || 0;
      acc.year3 += s.sponsorshipYear3 || 0;
      return acc;
    },
    { year1: 0, year2: 0, year3: 0 },
  );

  sponsors.totalSponsorshipsYear1 = sponsorshipTotals.year1;
  sponsors.totalSponsorshipsYear2 = sponsorshipTotals.year2;
  sponsors.totalSponsorshipsYear3 = sponsorshipTotals.year3;
  sponsors.totalSponsorshipsThreeYear =
    sponsorshipTotals.year1 + sponsorshipTotals.year2 + sponsorshipTotals.year3;

  await sponsors.save();

  res.status(200).json({
    success: true,
    message: "Sponsor deleted successfully",
    data: null,
  });
});

// ============================================
// 🎁 GRANT MANAGEMENT
// ============================================

/**
 * @desc    Add grant
 * @route   POST /api/sponsors/:id/grants
 * @access  Private (Admin/Business Head)
 */
exports.addGrant = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { name, provider, schemeName, amount, receivedDate } = req.body;

  sponsors.grants.push({
    name,
    provider,
    schemeName,
    amount,
    receivedDate: receivedDate || new Date(),
  });

  // Grants are not included in totals by default, but we could add them if needed

  await sponsors.save();

  res.status(201).json({
    success: true,
    message: "Grant added successfully",
    data: {
      grant: req.body,
    },
  });
});

/**
 * @desc    Update grant
 * @route   PATCH /api/sponsors/:id/grants/:grantIndex
 * @access  Private (Admin/Business Head)
 */
exports.updateGrant = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { grantIndex } = req.params;

  if (!sponsors.grants[grantIndex]) {
    return next(new AppError("Grant not found", 404));
  }

  Object.assign(sponsors.grants[grantIndex], req.body);
  await sponsors.save();

  res.status(200).json({
    success: true,
    message: "Grant updated successfully",
    data: {
      grant: sponsors.grants[grantIndex],
    },
  });
});

/**
 * @desc    Delete grant
 * @route   DELETE /api/sponsors/:id/grants/:grantIndex
 * @access  Private (Admin only)
 */
exports.deleteGrant = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const { grantIndex } = req.params;

  if (!sponsors.grants[grantIndex]) {
    return next(new AppError("Grant not found", 404));
  }

  sponsors.grants.splice(grantIndex, 1);
  await sponsors.save();

  res.status(200).json({
    success: true,
    message: "Grant deleted successfully",
    data: null,
  });
});

// ============================================
// 📊 DASHBOARD & ANALYTICS
// ============================================

/**
 * @desc    Get sponsors dashboard
 * @route   GET /api/sponsors/dashboard/:projectId
 * @access  Private
 */
exports.getSponsorsDashboard = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findOne({ projectId: req.params.projectId });

  if (!sponsors) {
    return next(new AppError("No sponsors record found for this project", 404));
  }

  const dashboard = {
    overview: {
      totalSponsorships: sponsors.totalSponsorshipsThreeYear,
      totalInvestments: sponsors.totalInvestmentReceived,
      totalFunding:
        sponsors.totalSponsorshipsThreeYear +
        (sponsors.totalInvestmentReceived || 0),
      sponsorCount: sponsors.sponsors.length,
      investorCount: sponsors.investors.length,
      grantCount: sponsors.grants.length,
    },
    sponsorsByTier: {
      platinum: sponsors.sponsors.filter((s) => s.tier === "platinum").length,
      gold: sponsors.sponsors.filter((s) => s.tier === "gold").length,
      silver: sponsors.sponsors.filter((s) => s.tier === "silver").length,
      bronze: sponsors.sponsors.filter((s) => s.tier === "bronze").length,
    },
    sponsorsByType: {
      cash: sponsors.sponsors
        .filter((s) => s.contributionType === "cash")
        .reduce((sum, s) => sum + (s.contributionAmount || 0), 0),
      kind: sponsors.sponsors.filter((s) => s.contributionType === "kind")
        .length,
      services: sponsors.sponsors.filter(
        (s) => s.contributionType === "services",
      ).length,
    },
    yearlyBreakdown: {
      year1: sponsors.totalSponsorshipsYear1,
      year2: sponsors.totalSponsorshipsYear2,
      year3: sponsors.totalSponsorshipsYear3,
    },
    topSponsors: sponsors.sponsors
      .sort((a, b) => (b.contributionAmount || 0) - (a.contributionAmount || 0))
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        tier: s.tier,
        amount: s.contributionAmount,
        type: s.contributionType,
      })),
    investorsByType: {
      angel: sponsors.investors.filter((i) => i.type === "angel").length,
      vc: sponsors.investors.filter((i) => i.type === "vc").length,
      strategic: sponsors.investors.filter((i) => i.type === "strategic")
        .length,
    },
    recentActivity: [
      ...sponsors.sponsors.slice(0, 3).map((s) => ({
        type: "sponsor",
        name: s.name,
        date: s.startDate,
        amount: s.contributionAmount,
      })),
      ...sponsors.investors.slice(0, 3).map((i) => ({
        type: "investor",
        name: i.name,
        date: i.investmentDate,
        amount: i.investmentAmount,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
  };

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});

/**
 * @desc    Get sponsor details
 * @route   GET /api/sponsors/:id/sponsor-details
 * @access  Private
 */
exports.getSponsorDetails = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const details = {
    activeSponsors: sponsors.sponsors.filter((s) => {
      const now = new Date();
      return new Date(s.endDate) > now;
    }),
    expiringSponsors: sponsors.sponsors.filter((s) => {
      const now = new Date();
      const endDate = new Date(s.endDate);
      const daysUntilExpiry = Math.ceil(
        (endDate - now) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry > 0 && daysUntilExpiry <= 60; // Expiring in next 60 days
    }),
    sponsorshipByYear: {
      year1: sponsors.sponsors
        .map((s) => ({
          name: s.name,
          amount: s.sponsorshipYear1,
        }))
        .filter((s) => s.amount > 0),
      year2: sponsors.sponsors
        .map((s) => ({
          name: s.name,
          amount: s.sponsorshipYear2,
        }))
        .filter((s) => s.amount > 0),
      year3: sponsors.sponsors
        .map((s) => ({
          name: s.name,
          amount: s.sponsorshipYear3,
        }))
        .filter((s) => s.amount > 0),
    },
    benefitsSummary: sponsors.sponsors.flatMap(
      (s) =>
        s.benefitsProvided?.map((benefit) => ({
          sponsor: s.name,
          benefit,
        })) || [],
    ),
  };

  res.status(200).json({
    success: true,
    data: details,
  });
});

/**
 * @desc    Get investor details
 * @route   GET /api/sponsors/:id/investor-details
 * @access  Private (Admin/Finance)
 */
exports.getInvestorDetails = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const totalInvestment = sponsors.totalInvestmentReceived;
  const totalEquity = sponsors.investors.reduce(
    (sum, i) => sum + (i.equityStake || 0),
    0,
  );

  const details = {
    summary: {
      totalInvestment,
      totalEquity,
      averageInvestment: totalInvestment / (sponsors.investors.length || 1),
      boardSeats: sponsors.investors.filter((i) => i.boardSeat).length,
    },
    byType: {
      angel: sponsors.investors.filter((i) => i.type === "angel"),
      vc: sponsors.investors.filter((i) => i.type === "vc"),
      strategic: sponsors.investors.filter((i) => i.type === "strategic"),
    },
    capTable: sponsors.investors.map((i) => ({
      name: i.name,
      type: i.type,
      investment: i.investmentAmount,
      equity: i.equityStake + "%",
      boardSeat: i.boardSeat ? "Yes" : "No",
    })),
    timeline: sponsors.investors
      .sort((a, b) => new Date(a.investmentDate) - new Date(b.investmentDate))
      .map((i) => ({
        date: i.investmentDate,
        name: i.name,
        amount: i.investmentAmount,
        type: i.type,
      })),
  };

  res.status(200).json({
    success: true,
    data: details,
  });
});

/**
 * @desc    Get grant details
 * @route   GET /api/sponsors/:id/grant-details
 * @access  Private
 */
exports.getGrantDetails = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findById(req.params.id);

  if (!sponsors) {
    return next(new AppError("No sponsors record found with that ID", 404));
  }

  const details = {
    summary: {
      totalGrants: sponsors.grants.length,
      totalAmount: sponsors.grants.reduce((sum, g) => sum + (g.amount || 0), 0),
      byProvider: {
        government: sponsors.grants.filter((g) => g.provider === "government")
          .length,
        foundation: sponsors.grants.filter((g) => g.provider === "foundation")
          .length,
      },
    },
    grants: sponsors.grants.map((g) => ({
      name: g.name,
      provider: g.provider,
      scheme: g.schemeName,
      amount: g.amount,
      date: g.receivedDate,
    })),
    byYear: sponsors.grants.reduce((acc, g) => {
      const year = new Date(g.receivedDate).getFullYear();
      if (!acc[year]) acc[year] = 0;
      acc[year] += g.amount || 0;
      return acc;
    }, {}),
  };

  res.status(200).json({
    success: true,
    data: details,
  });
});

/**
 * @desc    Export sponsors report
 * @route   GET /api/sponsors/export/:projectId
 * @access  Private
 */
exports.exportSponsorsReport = catchAsync(async (req, res, next) => {
  const sponsors = await Sponsors.findOne({ projectId: req.params.projectId });

  if (!sponsors) {
    return next(new AppError("No sponsors record found for this project", 404));
  }

  const report = {
    generatedAt: new Date(),
    projectId: sponsors.projectId,
    executiveSummary: {
      totalSponsorships: sponsors.totalSponsorshipsThreeYear,
      totalInvestments: sponsors.totalInvestmentReceived,
      totalGrants: sponsors.grants.reduce((sum, g) => sum + (g.amount || 0), 0),
      activeSponsors: sponsors.sponsors.filter(
        (s) => new Date(s.endDate) > new Date(),
      ).length,
    },
    sponsors: sponsors.sponsors.map((s) => ({
      name: s.name,
      tier: s.tier,
      contribution: s.contributionAmount,
      type: s.contributionType,
      period: `${new Date(s.startDate).toLocaleDateString()} - ${new Date(s.endDate).toLocaleDateString()}`,
      benefits: s.benefitsProvided,
      contact: s.contactPerson,
    })),
    investors: sponsors.investors.map((i) => ({
      name: i.name,
      type: i.type,
      investment: i.investmentAmount,
      equity: i.equityStake + "%",
      boardSeat: i.boardSeat ? "Yes" : "No",
      date: new Date(i.investmentDate).toLocaleDateString(),
    })),
    grants: sponsors.grants.map((g) => ({
      name: g.name,
      provider: g.provider,
      scheme: g.schemeName,
      amount: g.amount,
      date: new Date(g.receivedDate).toLocaleDateString(),
    })),
    financialSummary: {
      yearlySponsorships: {
        year1: sponsors.totalSponsorshipsYear1,
        year2: sponsors.totalSponsorshipsYear2,
        year3: sponsors.totalSponsorshipsYear3,
      },
      totalFunding:
        sponsors.totalSponsorshipsThreeYear +
        (sponsors.totalInvestmentReceived || 0),
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
 * Calculate totals helper
 */
function calculateTotals(data) {
  let year1 = 0;
  let year2 = 0;
  let year3 = 0;
  let investments = 0;

  // Calculate from sponsors
  if (data.sponsors) {
    data.sponsors.forEach((sponsor) => {
      year1 += sponsor.sponsorshipYear1 || 0;
      year2 += sponsor.sponsorshipYear2 || 0;
      year3 += sponsor.sponsorshipYear3 || 0;
    });
  }

  // Calculate from investors
  if (data.investors) {
    investments = data.investors.reduce(
      (sum, inv) => sum + (inv.investmentAmount || 0),
      0,
    );
  }

  return {
    year1,
    year2,
    year3,
    threeYear: year1 + year2 + year3,
    investments,
  };
}

/**
 * Calculate yearly amount from monthly
 */
function calculateYearlyAmount(monthlyAmount, startDate, endDate, targetYear) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const yearStart = new Date(start.getFullYear() + targetYear - 1, 0, 1);
  const yearEnd = new Date(start.getFullYear() + targetYear - 1, 11, 31);

  const overlapStart = new Date(Math.max(start, yearStart));
  const overlapEnd = new Date(Math.min(end, yearEnd));

  if (overlapStart > overlapEnd) return 0;

  const months =
    (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
    (overlapEnd.getMonth() - overlapStart.getMonth()) +
    1;

  return monthlyAmount * months;
}

module.exports = exports;
