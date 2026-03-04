const Operational = require("../models/operational.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateOfficeTotals,
  calculateSalaryTotals,
  calculateLegalTotals,
  calculateTechTotals,
  calculateGrandTotals,
  calculatePerEmployeeCost,
  generateEfficiencyMetrics,
} = require("../utils/operationalCalculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new operational cost record
 * @route   POST /api/operational
 * @access  Private (Admin/Finance Manager)
 */
exports.createOperational = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if operational record already exists
  const existingRecord = await Operational.findOne({ projectId });
  if (existingRecord) {
    return next(
      new AppError("Operational record already exists for this project", 400),
    );
  }

  // Calculate all totals
  const officeTotals = calculateOfficeTotals(req.body.officeSpace);
  const salaryTotals = calculateSalaryTotals(req.body.employeeSalaries);
  const legalTotals = calculateLegalTotals(req.body.legalCompliance);
  const techTotals = calculateTechTotals(req.body.technologyTools);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  const operationalData = {
    ...req.body,
    officeSpace: {
      ...req.body.officeSpace,
      totalMonthly: officeTotals.monthly,
      totalThreeYear: officeTotals.threeYear,
    },
    totalSalaryMonthly: salaryTotals.monthly,
    totalSalaryYearly: salaryTotals.yearly,
    totalSalaryThreeYear: salaryTotals.threeYear,
    legalCompliance: {
      ...req.body.legalCompliance,
      totalYearly: legalTotals.yearly,
      totalThreeYear: legalTotals.threeYear,
    },
    technologyTools: {
      ...req.body.technologyTools,
      totalMonthly: techTotals.monthly,
      totalThreeYear: techTotals.threeYear,
    },
    totalOperationalMonthly: grandTotals.monthly,
    totalOperationalYearly: grandTotals.yearly,
    totalOperationalThreeYear: grandTotals.threeYear,
  };

  const operational = await Operational.create(operationalData);

  res.status(201).json({
    success: true,
    message: "Operational record created successfully",
    data: {
      operational,
    },
  });
});

/**
 * @desc    Get all operational records
 * @route   GET /api/operational
 * @access  Private
 */
exports.getAllOperational = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = Operational.find(queryObj);

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
  const operationalRecords = await query;
  const total = await Operational.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: operationalRecords.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      operationalRecords,
    },
  });
});

/**
 * @desc    Get single operational record by ID
 * @route   GET /api/operational/:id
 * @access  Private
 */
exports.getOperational = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      operational,
    },
  });
});

/**
 * @desc    Get operational record by project ID
 * @route   GET /api/operational/project/:projectId
 * @access  Private
 */
exports.getOperationalByProjectId = catchAsync(async (req, res, next) => {
  const operational = await Operational.findOne({
    projectId: req.params.projectId,
  });

  if (!operational) {
    return next(
      new AppError("No operational record found for this project", 404),
    );
  }

  res.status(200).json({
    success: true,
    data: {
      operational,
    },
  });
});

/**
 * @desc    Update operational record
 * @route   PATCH /api/operational/:id
 * @access  Private (Admin/Finance Manager)
 */
exports.updateOperational = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  // Merge existing data with updates
  const mergedData = {
    ...operational.toObject(),
    ...req.body,
  };

  // Recalculate totals
  const officeTotals = calculateOfficeTotals(mergedData.officeSpace);
  const salaryTotals = calculateSalaryTotals(mergedData.employeeSalaries);
  const legalTotals = calculateLegalTotals(mergedData.legalCompliance);
  const techTotals = calculateTechTotals(mergedData.technologyTools);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  const updateData = {
    ...req.body,
    officeSpace: {
      ...mergedData.officeSpace,
      totalMonthly: officeTotals.monthly,
      totalThreeYear: officeTotals.threeYear,
    },
    totalSalaryMonthly: salaryTotals.monthly,
    totalSalaryYearly: salaryTotals.yearly,
    totalSalaryThreeYear: salaryTotals.threeYear,
    legalCompliance: {
      ...mergedData.legalCompliance,
      totalYearly: legalTotals.yearly,
      totalThreeYear: legalTotals.threeYear,
    },
    technologyTools: {
      ...mergedData.technologyTools,
      totalMonthly: techTotals.monthly,
      totalThreeYear: techTotals.threeYear,
    },
    totalOperationalMonthly: grandTotals.monthly,
    totalOperationalYearly: grandTotals.yearly,
    totalOperationalThreeYear: grandTotals.threeYear,
    updatedAt: Date.now(),
  };

  const updatedOperational = await Operational.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Operational record updated successfully",
    data: {
      operational: updatedOperational,
    },
  });
});

/**
 * @desc    Delete operational record
 * @route   DELETE /api/operational/:id
 * @access  Private (Admin only)
 */
exports.deleteOperational = catchAsync(async (req, res, next) => {
  const operational = await Operational.findByIdAndDelete(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Operational record deleted successfully",
    data: null,
  });
});

// ============================================
// 🏢 OFFICE MANAGEMENT
// ============================================

/**
 * @desc    Update office space details
 * @route   PATCH /api/operational/:id/office
 * @access  Private (Admin)
 */
exports.updateOfficeSpace = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  // Update office space fields
  operational.officeSpace = {
    ...operational.officeSpace.toObject(),
    ...req.body,
  };

  // Recalculate office totals
  const officeTotals = calculateOfficeTotals(operational.officeSpace);
  operational.officeSpace.totalMonthly = officeTotals.monthly;
  operational.officeSpace.totalThreeYear = officeTotals.threeYear;

  // Recalculate grand totals
  const salaryTotals = calculateSalaryTotals(operational.employeeSalaries);
  const legalTotals = calculateLegalTotals(operational.legalCompliance);
  const techTotals = calculateTechTotals(operational.technologyTools);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  operational.totalOperationalMonthly = grandTotals.monthly;
  operational.totalOperationalYearly = grandTotals.yearly;
  operational.totalOperationalThreeYear = grandTotals.threeYear;

  await operational.save();

  res.status(200).json({
    success: true,
    message: "Office space updated successfully",
    data: {
      officeSpace: operational.officeSpace,
    },
  });
});

// ============================================
// 👥 EMPLOYEE MANAGEMENT
// ============================================

/**
 * @desc    Add employee department/role
 * @route   POST /api/operational/:id/employees
 * @access  Private (Admin/HR)
 */
exports.addEmployeeRole = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const { department, role, count, monthlySalary, benefits } = req.body;

  const totalCompensation = monthlySalary + (benefits || 0);

  operational.employeeSalaries.push({
    department,
    role,
    count,
    monthlySalary,
    benefits: benefits || 0,
    totalCompensation,
  });

  // Recalculate salary totals
  const salaryTotals = calculateSalaryTotals(operational.employeeSalaries);
  operational.totalSalaryMonthly = salaryTotals.monthly;
  operational.totalSalaryYearly = salaryTotals.yearly;
  operational.totalSalaryThreeYear = salaryTotals.threeYear;

  // Recalculate grand totals
  const officeTotals = calculateOfficeTotals(operational.officeSpace);
  const legalTotals = calculateLegalTotals(operational.legalCompliance);
  const techTotals = calculateTechTotals(operational.technologyTools);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  operational.totalOperationalMonthly = grandTotals.monthly;
  operational.totalOperationalYearly = grandTotals.yearly;
  operational.totalOperationalThreeYear = grandTotals.threeYear;

  await operational.save();

  res.status(201).json({
    success: true,
    message: "Employee role added successfully",
    data: {
      employee: req.body,
    },
  });
});

/**
 * @desc    Update employee role
 * @route   PATCH /api/operational/:id/employees/:employeeIndex
 * @access  Private (Admin/HR)
 */
exports.updateEmployeeRole = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const { employeeIndex } = req.params;

  if (!operational.employeeSalaries[employeeIndex]) {
    return next(new AppError("Employee role not found", 404));
  }

  // Update employee fields
  Object.assign(operational.employeeSalaries[employeeIndex], req.body);

  // Recalculate total compensation
  const emp = operational.employeeSalaries[employeeIndex];
  emp.totalCompensation = (emp.monthlySalary || 0) + (emp.benefits || 0);

  // Recalculate salary totals
  const salaryTotals = calculateSalaryTotals(operational.employeeSalaries);
  operational.totalSalaryMonthly = salaryTotals.monthly;
  operational.totalSalaryYearly = salaryTotals.yearly;
  operational.totalSalaryThreeYear = salaryTotals.threeYear;

  // Recalculate grand totals
  const officeTotals = calculateOfficeTotals(operational.officeSpace);
  const legalTotals = calculateLegalTotals(operational.legalCompliance);
  const techTotals = calculateTechTotals(operational.technologyTools);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  operational.totalOperationalMonthly = grandTotals.monthly;
  operational.totalOperationalYearly = grandTotals.yearly;
  operational.totalOperationalThreeYear = grandTotals.threeYear;

  await operational.save();

  res.status(200).json({
    success: true,
    message: "Employee role updated successfully",
    data: {
      employee: operational.employeeSalaries[employeeIndex],
    },
  });
});

/**
 * @desc    Delete employee role
 * @route   DELETE /api/operational/:id/employees/:employeeIndex
 * @access  Private (Admin/HR)
 */
exports.deleteEmployeeRole = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const { employeeIndex } = req.params;

  if (!operational.employeeSalaries[employeeIndex]) {
    return next(new AppError("Employee role not found", 404));
  }

  operational.employeeSalaries.splice(employeeIndex, 1);

  // Recalculate salary totals
  const salaryTotals = calculateSalaryTotals(operational.employeeSalaries);
  operational.totalSalaryMonthly = salaryTotals.monthly;
  operational.totalSalaryYearly = salaryTotals.yearly;
  operational.totalSalaryThreeYear = salaryTotals.threeYear;

  // Recalculate grand totals
  const officeTotals = calculateOfficeTotals(operational.officeSpace);
  const legalTotals = calculateLegalTotals(operational.legalCompliance);
  const techTotals = calculateTechTotals(operational.technologyTools);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  operational.totalOperationalMonthly = grandTotals.monthly;
  operational.totalOperationalYearly = grandTotals.yearly;
  operational.totalOperationalThreeYear = grandTotals.threeYear;

  await operational.save();

  res.status(200).json({
    success: true,
    message: "Employee role deleted successfully",
    data: null,
  });
});

// ============================================
// 🛠️ TECHNOLOGY TOOLS MANAGEMENT
// ============================================

/**
 * @desc    Add technology tool
 * @route   POST /api/operational/:id/tech-tools
 * @access  Private (Admin)
 */
exports.addTechTool = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const { category, name, monthlyCost } = req.body;

  switch (category) {
    case "productivity":
      operational.technologyTools.productivityTools.push({ name, monthlyCost });
      break;
    case "communication":
      operational.technologyTools.communicationTools.push({
        name,
        monthlyCost,
      });
      break;
    case "accounting":
      operational.technologyTools.accountingTools.push({ name, monthlyCost });
      break;
    default:
      return next(new AppError("Invalid category", 400));
  }

  // Recalculate tech totals
  const techTotals = calculateTechTotals(operational.technologyTools);
  operational.technologyTools.totalMonthly = techTotals.monthly;
  operational.technologyTools.totalThreeYear = techTotals.threeYear;

  // Recalculate grand totals
  const officeTotals = calculateOfficeTotals(operational.officeSpace);
  const salaryTotals = calculateSalaryTotals(operational.employeeSalaries);
  const legalTotals = calculateLegalTotals(operational.legalCompliance);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  operational.totalOperationalMonthly = grandTotals.monthly;
  operational.totalOperationalYearly = grandTotals.yearly;
  operational.totalOperationalThreeYear = grandTotals.threeYear;

  await operational.save();

  res.status(201).json({
    success: true,
    message: "Technology tool added successfully",
    data: {
      tool: { category, name, monthlyCost },
    },
  });
});

/**
 * @desc    Delete technology tool
 * @route   DELETE /api/operational/:id/tech-tools/:category/:toolIndex
 * @access  Private (Admin)
 */
exports.deleteTechTool = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const { category, toolIndex } = req.params;

  let toolsArray;
  switch (category) {
    case "productivity":
      toolsArray = operational.technologyTools.productivityTools;
      break;
    case "communication":
      toolsArray = operational.technologyTools.communicationTools;
      break;
    case "accounting":
      toolsArray = operational.technologyTools.accountingTools;
      break;
    default:
      return next(new AppError("Invalid category", 400));
  }

  if (!toolsArray[toolIndex]) {
    return next(new AppError("Tool not found", 404));
  }

  toolsArray.splice(toolIndex, 1);

  // Recalculate tech totals
  const techTotals = calculateTechTotals(operational.technologyTools);
  operational.technologyTools.totalMonthly = techTotals.monthly;
  operational.technologyTools.totalThreeYear = techTotals.threeYear;

  // Recalculate grand totals
  const officeTotals = calculateOfficeTotals(operational.officeSpace);
  const salaryTotals = calculateSalaryTotals(operational.employeeSalaries);
  const legalTotals = calculateLegalTotals(operational.legalCompliance);
  const grandTotals = calculateGrandTotals(
    officeTotals,
    salaryTotals,
    legalTotals,
    techTotals,
  );

  operational.totalOperationalMonthly = grandTotals.monthly;
  operational.totalOperationalYearly = grandTotals.yearly;
  operational.totalOperationalThreeYear = grandTotals.threeYear;

  await operational.save();

  res.status(200).json({
    success: true,
    message: "Technology tool deleted successfully",
    data: null,
  });
});

// ============================================
// 📊 ANALYTICS & REPORTS
// ============================================

/**
 * @desc    Get operational dashboard
 * @route   GET /api/operational/dashboard/:projectId
 * @access  Private
 */
exports.getOperationalDashboard = catchAsync(async (req, res, next) => {
  const operational = await Operational.findOne({
    projectId: req.params.projectId,
  });

  if (!operational) {
    return next(
      new AppError("No operational record found for this project", 404),
    );
  }

  // Calculate total employees
  const totalEmployees = operational.employeeSalaries.reduce(
    (sum, dept) => sum + dept.count,
    0,
  );

  // Calculate per employee costs
  const perEmployeeCosts = calculatePerEmployeeCost(
    operational,
    totalEmployees,
  );

  // Generate efficiency metrics
  const efficiency = generateEfficiencyMetrics(operational, totalEmployees);

  const dashboard = {
    overview: {
      totalMonthly: operational.totalOperationalMonthly,
      totalYearly: operational.totalOperationalYearly,
      totalThreeYear: operational.totalOperationalThreeYear,
      totalEmployees,
    },
    breakdown: {
      office: {
        monthly: operational.officeSpace.totalMonthly,
        percentage:
          (
            (operational.officeSpace.totalMonthly /
              operational.totalOperationalMonthly) *
            100
          ).toFixed(1) + "%",
        details: operational.officeSpace,
      },
      salaries: {
        monthly: operational.totalSalaryMonthly,
        percentage:
          (
            (operational.totalSalaryMonthly /
              operational.totalOperationalMonthly) *
            100
          ).toFixed(1) + "%",
        byDepartment: operational.employeeSalaries.map((dept) => ({
          department: dept.department,
          monthly: dept.totalCompensation * dept.count,
          employees: dept.count,
        })),
      },
      legal: {
        monthly: (operational.legalCompliance.totalYearly || 0) / 12,
        yearly: operational.legalCompliance.totalYearly,
        details: operational.legalCompliance,
      },
      tech: {
        monthly: operational.technologyTools.totalMonthly,
        percentage:
          (
            (operational.technologyTools.totalMonthly /
              operational.totalOperationalMonthly) *
            100
          ).toFixed(1) + "%",
        tools: {
          productivity: operational.technologyTools.productivityTools,
          communication: operational.technologyTools.communicationTools,
          accounting: operational.technologyTools.accountingTools,
        },
      },
    },
    perEmployee: perEmployeeCosts,
    efficiency: efficiency,
  };

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});

/**
 * @desc    Get employee cost analysis
 * @route   GET /api/operational/:id/employee-costs
 * @access  Private
 */
exports.getEmployeeCosts = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const analysis = {
    summary: {
      totalMonthly: operational.totalSalaryMonthly,
      totalYearly: operational.totalSalaryYearly,
      totalThreeYear: operational.totalSalaryThreeYear,
    },
    byDepartment: operational.employeeSalaries.map((dept) => ({
      department: dept.department,
      role: dept.role,
      count: dept.count,
      perEmployeeMonthly: dept.totalCompensation,
      totalMonthly: dept.totalCompensation * dept.count,
      totalYearly: dept.totalCompensation * dept.count * 12,
      benefits: dept.benefits,
    })),
    averages: {
      averageSalary:
        operational.totalSalaryMonthly /
        operational.employeeSalaries.reduce((sum, d) => sum + d.count, 0),
      benefitsPercentage:
        (
          (operational.employeeSalaries.reduce(
            (sum, d) => sum + d.benefits,
            0,
          ) /
            operational.totalSalaryMonthly) *
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
 * @desc    Get office expense analysis
 * @route   GET /api/operational/:id/office-expenses
 * @access  Private
 */
exports.getOfficeExpenses = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const analysis = {
    summary: {
      type: operational.officeSpace.type,
      monthlyTotal: operational.officeSpace.totalMonthly,
      yearlyTotal: operational.officeSpace.totalMonthly * 12,
      threeYearTotal: operational.officeSpace.totalThreeYear,
    },
    breakdown: {
      rent: operational.officeSpace.monthlyRent || 0,
      maintenance: operational.officeSpace.maintenance?.monthly || 0,
      utilities: {
        electricity: operational.officeSpace.utilities?.electricity || 0,
        water: operational.officeSpace.utilities?.water || 0,
        internet: operational.officeSpace.utilities?.internet || 0,
        total:
          (operational.officeSpace.utilities?.electricity || 0) +
          (operational.officeSpace.utilities?.water || 0) +
          (operational.officeSpace.utilities?.internet || 0),
      },
    },
    oneTime: {
      securityDeposit: operational.officeSpace.securityDeposit || 0,
    },
    perEmployee:
      operational.officeSpace.totalMonthly /
      operational.employeeSalaries.reduce((sum, d) => sum + d.count, 0),
  };

  res.status(200).json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Get legal compliance summary
 * @route   GET /api/operational/:id/legal-summary
 * @access  Private (Admin)
 */
exports.getLegalSummary = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const summary = {
    registration: {
      company: operational.legalCompliance.companyRegistration?.oneTime || 0,
      gst: operational.legalCompliance.gstRegistration?.oneTime || 0,
      trademarks:
        operational.legalCompliance.trademarks?.map((t) => ({
          name: t.name,
          cost: t.cost,
        })) || [],
    },
    recurring: {
      legalRetainers: operational.legalCompliance.legalRetainers?.monthly || 0,
      yearlyRetainers:
        (operational.legalCompliance.legalRetainers?.monthly || 0) * 12,
    },
    insurance: {
      professionalIndemnity:
        operational.legalCompliance.insurance?.professionalIndemnity?.yearly ||
        0,
      cyberLiability:
        operational.legalCompliance.insurance?.cyberLiability?.yearly || 0,
      totalYearly:
        (operational.legalCompliance.insurance?.professionalIndemnity?.yearly ||
          0) +
        (operational.legalCompliance.insurance?.cyberLiability?.yearly || 0),
    },
    totals: {
      oneTime:
        (operational.legalCompliance.companyRegistration?.oneTime || 0) +
        (operational.legalCompliance.gstRegistration?.oneTime || 0) +
        (operational.legalCompliance.trademarks?.reduce(
          (sum, t) => sum + t.cost,
          0,
        ) || 0),
      yearly: operational.legalCompliance.totalYearly,
      threeYear: operational.legalCompliance.totalThreeYear,
    },
  };

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @desc    Get technology tools summary
 * @route   GET /api/operational/:id/tech-summary
 * @access  Private
 */
exports.getTechSummary = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const summary = {
    monthly: operational.technologyTools.totalMonthly,
    yearly: operational.technologyTools.totalMonthly * 12,
    threeYear: operational.technologyTools.totalThreeYear,
    byCategory: {
      productivity: {
        tools: operational.technologyTools.productivityTools,
        monthly: operational.technologyTools.productivityTools.reduce(
          (sum, t) => sum + t.monthlyCost,
          0,
        ),
      },
      communication: {
        tools: operational.technologyTools.communicationTools,
        monthly: operational.technologyTools.communicationTools.reduce(
          (sum, t) => sum + t.monthlyCost,
          0,
        ),
      },
      accounting: {
        tools: operational.technologyTools.accountingTools,
        monthly: operational.technologyTools.accountingTools.reduce(
          (sum, t) => sum + t.monthlyCost,
          0,
        ),
      },
    },
    perEmployee:
      operational.technologyTools.totalMonthly /
      operational.employeeSalaries.reduce((sum, d) => sum + d.count, 0),
  };

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @desc    Export operational report
 * @route   GET /api/operational/export/:projectId
 * @access  Private
 */
exports.exportOperationalReport = catchAsync(async (req, res, next) => {
  const operational = await Operational.findOne({
    projectId: req.params.projectId,
  });

  if (!operational) {
    return next(
      new AppError("No operational record found for this project", 404),
    );
  }

  const report = {
    generatedAt: new Date(),
    projectId: operational.projectId,
    executiveSummary: {
      totalOperationalCost: operational.totalOperationalThreeYear,
      monthlyBurn: operational.totalOperationalMonthly,
      employees: operational.employeeSalaries.reduce(
        (sum, d) => sum + d.count,
        0,
      ),
    },
    sections: {
      office: operational.officeSpace,
      salaries: operational.employeeSalaries,
      legal: operational.legalCompliance,
      technology: operational.technologyTools,
    },
    metrics: {
      costPerEmployee:
        operational.totalOperationalMonthly /
        operational.employeeSalaries.reduce((sum, d) => sum + d.count, 0),
      salaryToTotalRatio:
        (
          (operational.totalSalaryMonthly /
            operational.totalOperationalMonthly) *
          100
        ).toFixed(1) + "%",
      officeToTotalRatio:
        (
          (operational.officeSpace.totalMonthly /
            operational.totalOperationalMonthly) *
          100
        ).toFixed(1) + "%",
    },
  };

  res.status(200).json({
    success: true,
    data: report,
  });
});

// ============================================
// 📈 OPTIMIZATION & FORECASTING
// ============================================

/**
 * @desc    Get cost optimization suggestions
 * @route   GET /api/operational/:id/optimize
 * @access  Private (Admin)
 */
exports.getOptimizationSuggestions = catchAsync(async (req, res, next) => {
  const operational = await Operational.findById(req.params.id);

  if (!operational) {
    return next(new AppError("No operational record found with that ID", 404));
  }

  const totalEmployees = operational.employeeSalaries.reduce(
    (sum, d) => sum + d.count,
    0,
  );
  const suggestions = [];

  // Office space optimization
  if (
    operational.officeSpace.type === "rented" &&
    operational.officeSpace.monthlyRent > 50000
  ) {
    suggestions.push({
      category: "Office Space",
      suggestion: "Consider moving to co-working space to reduce fixed costs",
      potentialSavings: operational.officeSpace.monthlyRent * 0.4,
      difficulty: "medium",
    });
  }

  // Technology tools optimization
  const totalTechCost = operational.technologyTools.totalMonthly;
  if (totalTechCost > 5000 * totalEmployees) {
    suggestions.push({
      category: "Technology Tools",
      suggestion: "Consolidate software subscriptions and remove unused tools",
      potentialSavings: totalTechCost * 0.2,
      difficulty: "easy",
    });
  }

  // Insurance optimization
  const totalInsurance =
    (operational.legalCompliance.insurance?.professionalIndemnity?.yearly ||
      0) + (operational.legalCompliance.insurance?.cyberLiability?.yearly || 0);
  if (totalInsurance > 50000) {
    suggestions.push({
      category: "Insurance",
      suggestion: "Review insurance policies and negotiate better rates",
      potentialSavings: totalInsurance * 0.15,
      difficulty: "medium",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      currentMonthly: operational.totalOperationalMonthly,
      potentialMonthlySavings: suggestions.reduce(
        (sum, s) => sum + s.potentialSavings,
        0,
      ),
      suggestions,
    },
  });
});

module.exports = exports;
