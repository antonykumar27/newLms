const express = require("express");
const revenueController = require("../controllers/revenue.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateMiddleware = require("../middleware/validate.middleware");
const { body, param, query } = require("express-validator");

const router = express.Router();

// ============================================
// 🔒 PROTECT ALL ROUTES
// ============================================
router.use(authMiddleware.protect);

// ============================================
// 📊 PUBLIC (AUTHENTICATED) ROUTES
// ============================================

/**
 * @route   GET /api/revenue
 * @desc    Get all revenue records
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  revenueController.getAllRevenue,
);

/**
 * @route   GET /api/revenue/dashboard/:projectId
 * @desc    Get revenue dashboard
 * @access  Private
 */
router.get(
  "/dashboard/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  revenueController.getRevenueDashboard,
);

/**
 * @route   GET /api/revenue/project/:projectId
 * @desc    Get revenue record by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  revenueController.getRevenueByProjectId,
);

/**
 * @route   GET /api/revenue/export/:projectId
 * @desc    Export revenue report
 * @access  Private
 */
router.get(
  "/export/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  revenueController.exportRevenueReport,
);

/**
 * @route   GET /api/revenue/:id
 * @desc    Get single revenue record
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  revenueController.getRevenue,
);

/**
 * @route   GET /api/revenue/:id/b2c-analysis
 * @desc    Get B2C revenue analysis
 * @access  Private
 */
router.get(
  "/:id/b2c-analysis",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  revenueController.getB2CAnalysis,
);

/**
 * @route   GET /api/revenue/:id/b2b-analysis
 * @desc    Get B2B revenue analysis
 * @access  Private
 */
router.get(
  "/:id/b2b-analysis",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  revenueController.getB2BAnalysis,
);

/**
 * @route   GET /api/revenue/:id/other-analysis
 * @desc    Get other revenue analysis
 * @access  Private
 */
router.get(
  "/:id/other-analysis",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  revenueController.getOtherAnalysis,
);

/**
 * @route   GET /api/revenue/:id/forecast
 * @desc    Get revenue forecast
 * @access  Private (Finance Manager)
 */
router.get(
  "/:id/forecast",
  authMiddleware.restrictTo("admin", "finance_manager", "business_head"),
  [
    param("id").isMongoId(),
    query("months").optional().isInt({ min: 1, max: 60 }),
  ],
  validateMiddleware.validateRequest,
  revenueController.getRevenueForecast,
);

// ============================================
// 👑 ADMIN/BUSINESS HEAD ROUTES
// ============================================

// Restrict to admins and business heads for modification routes
router.use(authMiddleware.restrictTo("admin", "business_head"));

/**
 * @route   POST /api/revenue
 * @desc    Create new revenue record
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("b2cRevenue").optional(),
    body("b2bRevenue").optional(),
    body("otherRevenue").optional(),
  ],
  validateMiddleware.validateRequest,
  revenueController.createRevenue,
);

/**
 * @route   POST /api/revenue/:id/subscription-plans
 * @desc    Add subscription plan
 * @access  Private (Admin)
 */
router.post(
  "/:id/subscription-plans",
  [
    param("id").isMongoId(),
    body("tier").isIn(["basic", "premium", "pro"]),
    body("name").notEmpty(),
    body("monthlyPrice").isFloat({ min: 0 }),
    body("yearlyPrice").isFloat({ min: 0 }),
    body("features").isArray(),
    body("projectedSubscribers.year1").isInt({ min: 0 }),
    body("projectedSubscribers.year2").isInt({ min: 0 }),
    body("projectedSubscribers.year3").isInt({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  revenueController.addSubscriptionPlan,
);

/**
 * @route   POST /api/revenue/:id/corporate-training
 * @desc    Add corporate training contract
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/:id/corporate-training",
  [
    param("id").isMongoId(),
    body("companyName").notEmpty(),
    body("contractValue").isFloat({ min: 0 }),
    body("contractDuration").isInt({ min: 1, max: 36 }),
  ],
  validateMiddleware.validateRequest,
  revenueController.addCorporateTraining,
);

/**
 * @route   POST /api/revenue/:id/college-partnership
 * @desc    Add college partnership
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/:id/college-partnership",
  [
    param("id").isMongoId(),
    body("collegeName").notEmpty(),
    body("studentsCount").isInt({ min: 1 }),
    body("revenueShare").isFloat({ min: 0, max: 100 }),
    body("annualFees").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  revenueController.addCollegePartnership,
);

/**
 * @route   PATCH /api/revenue/:id
 * @desc    Update revenue record
 * @access  Private (Admin/Business Head)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  revenueController.updateRevenue,
);

/**
 * @route   PATCH /api/revenue/:id/subscription-plans/:planIndex
 * @desc    Update subscription plan
 * @access  Private (Admin)
 */
router.patch(
  "/:id/subscription-plans/:planIndex",
  [param("id").isMongoId(), param("planIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  revenueController.updateSubscriptionPlan,
);

/**
 * @route   DELETE /api/revenue/:id
 * @desc    Delete revenue record
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  revenueController.deleteRevenue,
);

/**
 * @route   DELETE /api/revenue/:id/subscription-plans/:planIndex
 * @desc    Delete subscription plan
 * @access  Private (Admin)
 */
router.delete(
  "/:id/subscription-plans/:planIndex",
  [param("id").isMongoId(), param("planIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  revenueController.deleteSubscriptionPlan,
);

module.exports = router;
