const ContentCreation = require("../models/contentCreation.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  calculateInstructorTotals,
  calculateProductionTotals,
  calculateGrandTotal,
} = require("../utils/calculations");

// ============================================
// 📦 BASE CRUD OPERATIONS
// ============================================

/**
 * @desc    Create new content creation plan
 * @route   POST /api/content-creation
 * @access  Private (Admin/Content Manager)
 */
exports.createContentPlan = catchAsync(async (req, res, next) => {
  const { projectId } = req.body;

  // Check if project already exists
  const existingPlan = await ContentCreation.findOne({ projectId });
  if (existingPlan) {
    return next(
      new AppError("Content plan already exists for this project", 400),
    );
  }

  // Calculate all totals before saving
  const planData = {
    ...req.body,
    instructorCosts: {
      ...req.body.instructorCosts,
      totalInstructorMonthly: calculateInstructorTotals(
        req.body.instructorCosts,
        "monthly",
      ),
      totalInstructorYearly: calculateInstructorTotals(
        req.body.instructorCosts,
        "yearly",
      ),
      totalInstructorThreeYear: calculateInstructorTotals(
        req.body.instructorCosts,
        "threeYear",
      ),
    },
    contentProduction: {
      ...req.body.contentProduction,
      totalProductionMonthly: calculateProductionTotals(
        req.body.contentProduction,
        "monthly",
      ),
      totalProductionThreeYear: calculateProductionTotals(
        req.body.contentProduction,
        "threeYear",
      ),
    },
    totalContentThreeYear: calculateGrandTotal(req.body),
  };

  const contentPlan = await ContentCreation.create(planData);

  res.status(201).json({
    success: true,
    message: "Content creation plan created successfully",
    data: {
      contentPlan,
    },
  });
});

/**
 * @desc    Get all content plans
 * @route   GET /api/content-creation
 * @access  Private
 */
exports.getAllContentPlans = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = ContentCreation.find(queryObj);

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
  const contentPlans = await query;
  const total = await ContentCreation.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: contentPlans.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      contentPlans,
    },
  });
});

/**
 * @desc    Get single content plan by ID
 * @route   GET /api/content-creation/:id
 * @access  Private
 */
exports.getContentPlan = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      contentPlan,
    },
  });
});

/**
 * @desc    Get content plan by project ID
 * @route   GET /api/content-creation/project/:projectId
 * @access  Private
 */
exports.getContentPlanByProjectId = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findOne({
    projectId: req.params.projectId,
  });

  if (!contentPlan) {
    return next(new AppError("No content plan found for this project", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      contentPlan,
    },
  });
});

/**
 * @desc    Update content plan
 * @route   PATCH /api/content-creation/:id
 * @access  Private (Admin/Content Manager)
 */
exports.updateContentPlan = catchAsync(async (req, res, next) => {
  // Recalculate totals if related fields are updated
  const updateData = { ...req.body, updatedAt: Date.now() };

  if (
    req.body.instructorCosts ||
    req.body.contentProduction ||
    req.body.studioEquipment
  ) {
    // Get existing plan for base data
    const existingPlan = await ContentCreation.findById(req.params.id);
    if (!existingPlan) {
      return next(new AppError("No content plan found with that ID", 404));
    }

    // Merge existing data with updates
    const mergedData = {
      ...existingPlan.toObject(),
      ...req.body,
    };

    // Recalculate totals
    if (req.body.instructorCosts) {
      updateData.instructorCosts = {
        ...mergedData.instructorCosts,
        totalInstructorMonthly: calculateInstructorTotals(
          mergedData.instructorCosts,
          "monthly",
        ),
        totalInstructorYearly: calculateInstructorTotals(
          mergedData.instructorCosts,
          "yearly",
        ),
        totalInstructorThreeYear: calculateInstructorTotals(
          mergedData.instructorCosts,
          "threeYear",
        ),
      };
    }

    if (req.body.contentProduction) {
      updateData.contentProduction = {
        ...mergedData.contentProduction,
        totalProductionMonthly: calculateProductionTotals(
          mergedData.contentProduction,
          "monthly",
        ),
        totalProductionThreeYear: calculateProductionTotals(
          mergedData.contentProduction,
          "threeYear",
        ),
      };
    }

    // Recalculate grand total
    updateData.totalContentThreeYear = calculateGrandTotal(mergedData);
  }

  const contentPlan = await ContentCreation.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Content plan updated successfully",
    data: {
      contentPlan,
    },
  });
});

/**
 * @desc    Delete content plan
 * @route   DELETE /api/content-creation/:id
 * @access  Private (Admin only)
 */
exports.deleteContentPlan = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findByIdAndDelete(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "Content plan deleted successfully",
    data: null,
  });
});

// ============================================
// 🎥 STUDIO EQUIPMENT MANAGEMENT
// ============================================

/**
 * @desc    Add camera equipment
 * @route   POST /api/content-creation/:id/cameras
 * @access  Private (Content Manager)
 */
exports.addCamera = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const { brand, model, quantity, unitPrice, type } = req.body;

  const newCamera = {
    brand,
    model,
    quantity,
    unitPrice,
    totalPrice: quantity * unitPrice,
    type,
  };

  contentPlan.studioEquipment.cameras.push(newCamera);

  // Recalculate total studio equipment
  contentPlan.studioEquipment.totalStudioEquipment = calculateStudioTotal(
    contentPlan.studioEquipment,
  );

  await contentPlan.save();

  res.status(201).json({
    success: true,
    message: "Camera added successfully",
    data: {
      camera: newCamera,
      totalStudioEquipment: contentPlan.studioEquipment.totalStudioEquipment,
    },
  });
});

/**
 * @desc    Update camera equipment
 * @route   PATCH /api/content-creation/:id/cameras/:cameraId
 * @access  Private (Content Manager)
 */
exports.updateCamera = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const camera = contentPlan.studioEquipment.cameras.id(req.params.cameraId);

  if (!camera) {
    return next(new AppError("No camera found with that ID", 404));
  }

  Object.assign(camera, req.body);

  // Recalculate total price if quantity or unit price changed
  if (req.body.quantity || req.body.unitPrice) {
    camera.totalPrice =
      (req.body.quantity || camera.quantity) *
      (req.body.unitPrice || camera.unitPrice);
  }

  // Recalculate total studio equipment
  contentPlan.studioEquipment.totalStudioEquipment = calculateStudioTotal(
    contentPlan.studioEquipment,
  );

  await contentPlan.save();

  res.status(200).json({
    success: true,
    message: "Camera updated successfully",
    data: {
      camera,
    },
  });
});

/**
 * @desc    Delete camera equipment
 * @route   DELETE /api/content-creation/:id/cameras/:cameraId
 * @access  Private (Content Manager)
 */
exports.deleteCamera = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const camera = contentPlan.studioEquipment.cameras.id(req.params.cameraId);

  if (!camera) {
    return next(new AppError("No camera found with that ID", 404));
  }

  camera.deleteOne();

  // Recalculate total studio equipment
  contentPlan.studioEquipment.totalStudioEquipment = calculateStudioTotal(
    contentPlan.studioEquipment,
  );

  await contentPlan.save();

  res.status(200).json({
    success: true,
    message: "Camera deleted successfully",
    data: null,
  });
});

// ============================================
// 👨‍🏫 INSTRUCTOR MANAGEMENT
// ============================================

/**
 * @desc    Add full-time teacher
 * @route   POST /api/content-creation/:id/fulltime-teachers
 * @access  Private (Content Manager)
 */
exports.addFullTimeTeacher = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const { name, subject, monthlySalary, benefits } = req.body;

  const yearlySalary = monthlySalary * 12;
  const threeYearSalary = monthlySalary * 36;
  const totalCompensation = monthlySalary + (benefits || 0);

  const newTeacher = {
    name,
    subject,
    monthlySalary,
    yearlySalary,
    threeYearSalary,
    benefits: benefits || 0,
    totalCompensation,
  };

  contentPlan.instructorCosts.fullTimeTeachers.push(newTeacher);

  // Recalculate totals
  contentPlan.instructorCosts.totalInstructorMonthly =
    calculateInstructorTotals(contentPlan.instructorCosts, "monthly");
  contentPlan.instructorCosts.totalInstructorYearly = calculateInstructorTotals(
    contentPlan.instructorCosts,
    "yearly",
  );
  contentPlan.instructorCosts.totalInstructorThreeYear =
    calculateInstructorTotals(contentPlan.instructorCosts, "threeYear");

  // Recalculate grand total
  contentPlan.totalContentThreeYear = calculateGrandTotal(contentPlan);

  await contentPlan.save();

  res.status(201).json({
    success: true,
    message: "Full-time teacher added successfully",
    data: {
      teacher: newTeacher,
    },
  });
});

/**
 * @desc    Add part-time teacher
 * @route   POST /api/content-creation/:id/parttime-teachers
 * @access  Private (Content Manager)
 */
exports.addPartTimeTeacher = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const { name, subject, hourlyRate, monthlyHours } = req.body;

  const monthlyPayment = hourlyRate * monthlyHours;

  const newTeacher = {
    name,
    subject,
    hourlyRate,
    monthlyHours,
    monthlyPayment,
  };

  contentPlan.instructorCosts.partTimeTeachers.push(newTeacher);

  // Recalculate totals
  contentPlan.instructorCosts.totalInstructorMonthly =
    calculateInstructorTotals(contentPlan.instructorCosts, "monthly");

  await contentPlan.save();

  res.status(201).json({
    success: true,
    message: "Part-time teacher added successfully",
    data: {
      teacher: newTeacher,
    },
  });
});

// ============================================
// 🎬 CONTENT PRODUCTION MANAGEMENT
// ============================================

/**
 * @desc    Update video production costs
 * @route   PATCH /api/content-creation/:id/video-production
 * @access  Private (Content Manager)
 */
exports.updateVideoProduction = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const { costPerMinute, minutesPerMonth } = req.body;

  if (costPerMinute) {
    contentPlan.contentProduction.videoProduction.costPerMinute = costPerMinute;
  }

  if (minutesPerMonth) {
    contentPlan.contentProduction.videoProduction.minutesPerMonth =
      minutesPerMonth;
  }

  // Calculate monthly cost
  contentPlan.contentProduction.videoProduction.monthlyCost =
    contentPlan.contentProduction.videoProduction.costPerMinute *
    contentPlan.contentProduction.videoProduction.minutesPerMonth;

  // Calculate three year cost
  contentPlan.contentProduction.videoProduction.threeYearCost =
    contentPlan.contentProduction.videoProduction.monthlyCost * 36;

  // Recalculate totals
  contentPlan.contentProduction.totalProductionMonthly =
    calculateProductionTotals(contentPlan.contentProduction, "monthly");
  contentPlan.contentProduction.totalProductionThreeYear =
    calculateProductionTotals(contentPlan.contentProduction, "threeYear");

  // Recalculate grand total
  contentPlan.totalContentThreeYear = calculateGrandTotal(contentPlan);

  await contentPlan.save();

  res.status(200).json({
    success: true,
    message: "Video production updated successfully",
    data: {
      videoProduction: contentPlan.contentProduction.videoProduction,
    },
  });
});

// ============================================
// 📊 ANALYTICS & REPORTS
// ============================================

/**
 * @desc    Get content creation statistics
 * @route   GET /api/content-creation/stats/overview
 * @access  Private (Admin)
 */
exports.getContentStats = catchAsync(async (req, res, next) => {
  const stats = await ContentCreation.aggregate([
    {
      $group: {
        _id: null,
        totalPlans: { $sum: 1 },
        averageTotalCost: { $avg: "$totalContentThreeYear" },
        minTotalCost: { $min: "$totalContentThreeYear" },
        maxTotalCost: { $max: "$totalContentThreeYear" },
        totalStudioEquipmentCost: {
          $sum: "$studioEquipment.totalStudioEquipment",
        },
        totalInstructorCost: {
          $sum: "$instructorCosts.totalInstructorThreeYear",
        },
        totalProductionCost: {
          $sum: "$contentProduction.totalProductionThreeYear",
        },
      },
    },
  ]);

  // Get monthly trends
  const monthlyTrends = await ContentCreation.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        totalCost: { $sum: "$totalContentThreeYear" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  // Get equipment distribution
  const equipmentStats = await ContentCreation.aggregate([
    { $unwind: "$studioEquipment.cameras" },
    {
      $group: {
        _id: "$studioEquipment.cameras.type",
        count: { $sum: "$studioEquipment.cameras.quantity" },
        totalValue: { $sum: "$studioEquipment.cameras.totalPrice" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      monthlyTrends,
      equipmentStats,
    },
  });
});

/**
 * @desc    Get content plan comparison
 * @route   GET /api/content-creation/compare/:ids
 * @access  Private (Admin)
 */
exports.compareContentPlans = catchAsync(async (req, res, next) => {
  const ids = req.params.ids.split(",");

  const plans = await ContentCreation.find({
    _id: { $in: ids },
  });

  if (plans.length === 0) {
    return next(new AppError("No content plans found", 404));
  }

  const comparison = plans.map((plan) => ({
    projectId: plan.projectId,
    totalCost: plan.totalContentThreeYear,
    studioEquipment: plan.studioEquipment.totalStudioEquipment,
    instructorCosts: plan.instructorCosts.totalInstructorThreeYear,
    productionCosts: plan.contentProduction.totalProductionThreeYear,
    teachers: plan.instructorCosts.fullTimeTeachers.length,
    partTimeTeachers: plan.instructorCosts.partTimeTeachers.length,
    cameras: plan.studioEquipment.cameras.length,
    createdAt: plan.createdAt,
  }));

  res.status(200).json({
    success: true,
    data: {
      comparison,
    },
  });
});

/**
 * @desc    Get cost breakdown for a plan
 * @route   GET /api/content-creation/:id/breakdown
 * @access  Private
 */
exports.getCostBreakdown = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const breakdown = {
    totalCost: contentPlan.totalContentThreeYear,
    categories: [
      {
        name: "Studio Equipment",
        cost: contentPlan.studioEquipment.totalStudioEquipment || 0,
        percentage: (
          ((contentPlan.studioEquipment.totalStudioEquipment || 0) /
            contentPlan.totalContentThreeYear) *
          100
        ).toFixed(2),
        items: {
          cameras: contentPlan.studioEquipment.cameras.reduce(
            (sum, cam) => sum + cam.totalPrice,
            0,
          ),
          audio: contentPlan.studioEquipment.audioEquipment.reduce(
            (sum, audio) => sum + audio.totalPrice,
            0,
          ),
          lighting: contentPlan.studioEquipment.lighting.reduce(
            (sum, light) => sum + light.totalPrice,
            0,
          ),
          computers: contentPlan.studioEquipment.computers.reduce(
            (sum, comp) => sum + comp.totalPrice,
            0,
          ),
          software: contentPlan.studioEquipment.softwareLicenses.reduce(
            (sum, soft) => sum + (soft.threeYearCost || 0),
            0,
          ),
        },
      },
      {
        name: "Instructor Costs",
        cost: contentPlan.instructorCosts.totalInstructorThreeYear || 0,
        percentage: (
          ((contentPlan.instructorCosts.totalInstructorThreeYear || 0) /
            contentPlan.totalContentThreeYear) *
          100
        ).toFixed(2),
        breakdown: {
          fullTime: contentPlan.instructorCosts.fullTimeTeachers.reduce(
            (sum, teacher) => sum + teacher.threeYearSalary,
            0,
          ),
          partTime: contentPlan.instructorCosts.partTimeTeachers.reduce(
            (sum, teacher) => sum + teacher.monthlyPayment * 36,
            0,
          ),
          guest: contentPlan.instructorCosts.guestLecturers.reduce(
            (sum, guest) => sum + guest.oneTimeFee * guest.sessionsPerYear * 3,
            0,
          ),
          writers: contentPlan.instructorCosts.contentWriters.reduce(
            (sum, writer) => sum + writer.monthlyCost * 36,
            0,
          ),
          editors: contentPlan.instructorCosts.videoEditors.reduce(
            (sum, editor) => sum + editor.monthlyCost * 36,
            0,
          ),
        },
      },
      {
        name: "Content Production",
        cost: contentPlan.contentProduction.totalProductionThreeYear || 0,
        percentage: (
          ((contentPlan.contentProduction.totalProductionThreeYear || 0) /
            contentPlan.totalContentThreeYear) *
          100
        ).toFixed(2),
        breakdown: {
          video:
            contentPlan.contentProduction.videoProduction.threeYearCost || 0,
          graphic:
            (contentPlan.contentProduction.graphicDesign.monthlyCost || 0) * 36,
          animation:
            (contentPlan.contentProduction.animation.monthlyCost || 0) * 36,
        },
      },
    ],
  };

  res.status(200).json({
    success: true,
    data: breakdown,
  });
});

// ============================================
// 📈 BUDGET PLANNING
// ============================================

/**
 * @desc    Get monthly budget projection
 * @route   GET /api/content-creation/:id/budget-projection
 * @access  Private
 */
exports.getBudgetProjection = catchAsync(async (req, res, next) => {
  const contentPlan = await ContentCreation.findById(req.params.id);

  if (!contentPlan) {
    return next(new AppError("No content plan found with that ID", 404));
  }

  const monthlyProjection = [];

  // Calculate monthly costs
  const monthlyInstructorCost =
    contentPlan.instructorCosts.totalInstructorMonthly || 0;
  const monthlyProductionCost =
    contentPlan.contentProduction.totalProductionMonthly || 0;
  const totalMonthly = monthlyInstructorCost + monthlyProductionCost;

  // Project for 36 months
  for (let month = 1; month <= 36; month++) {
    monthlyProjection.push({
      month,
      instructorCost: monthlyInstructorCost,
      productionCost: monthlyProductionCost,
      total: totalMonthly,
      cumulative: totalMonthly * month,
    });
  }

  // Calculate quarterly projections
  const quarterlyProjection = [];
  for (let quarter = 1; quarter <= 12; quarter++) {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    quarterlyProjection.push({
      quarter,
      months: `${startMonth}-${endMonth}`,
      total: totalMonthly * 3,
      cumulative: totalMonthly * endMonth,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      monthlyBreakdown: {
        instructorCost: monthlyInstructorCost,
        productionCost: monthlyProductionCost,
        studioEquipmentAmortized:
          contentPlan.studioEquipment.totalStudioEquipment / 36 || 0,
        totalMonthly,
      },
      monthlyProjection,
      quarterlyProjection,
      threeYearTotal: contentPlan.totalContentThreeYear,
    },
  });
});

// ============================================
// 📋 BULK OPERATIONS
// ============================================

/**
 * @desc    Bulk create content plans
 * @route   POST /api/content-creation/bulk
 * @access  Private (Admin only)
 */
exports.bulkCreateContentPlans = catchAsync(async (req, res, next) => {
  const { plans } = req.body;

  if (!Array.isArray(plans) || plans.length === 0) {
    return next(new AppError("Please provide an array of plans", 400));
  }

  // Process each plan with calculations
  const processedPlans = plans.map((plan) => ({
    ...plan,
    instructorCosts: {
      ...plan.instructorCosts,
      totalInstructorMonthly: calculateInstructorTotals(
        plan.instructorCosts,
        "monthly",
      ),
      totalInstructorYearly: calculateInstructorTotals(
        plan.instructorCosts,
        "yearly",
      ),
      totalInstructorThreeYear: calculateInstructorTotals(
        plan.instructorCosts,
        "threeYear",
      ),
    },
    contentProduction: {
      ...plan.contentProduction,
      totalProductionMonthly: calculateProductionTotals(
        plan.contentProduction,
        "monthly",
      ),
      totalProductionThreeYear: calculateProductionTotals(
        plan.contentProduction,
        "threeYear",
      ),
    },
    totalContentThreeYear: calculateGrandTotal(plan),
  }));

  const createdPlans = await ContentCreation.insertMany(processedPlans);

  res.status(201).json({
    success: true,
    message: `Successfully created ${createdPlans.length} content plans`,
    data: {
      count: createdPlans.length,
      contentPlans: createdPlans,
    },
  });
});

// Helper function to calculate studio equipment total
function calculateStudioTotal(studioEquipment) {
  let total = 0;

  // Add recording room setup
  if (studioEquipment.recordingRoom) {
    total += studioEquipment.recordingRoom.totalSetup || 0;
  }

  // Add cameras
  total += studioEquipment.cameras.reduce(
    (sum, cam) => sum + (cam.totalPrice || 0),
    0,
  );

  // Add audio equipment
  total += studioEquipment.audioEquipment.reduce(
    (sum, audio) => sum + (audio.totalPrice || 0),
    0,
  );

  // Add lighting
  total += studioEquipment.lighting.reduce(
    (sum, light) => sum + (light.totalPrice || 0),
    0,
  );

  // Add computers
  total += studioEquipment.computers.reduce(
    (sum, comp) => sum + (comp.totalPrice || 0),
    0,
  );

  // Add software (one-time cost)
  total += studioEquipment.softwareLicenses.reduce(
    (sum, soft) => sum + (soft.threeYearCost || 0),
    0,
  );

  return total;
}

module.exports = exports;
