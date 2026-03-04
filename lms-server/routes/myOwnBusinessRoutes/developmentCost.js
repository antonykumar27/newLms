const express = require("express");
const devCostController = require("../controllers/developmentCost.controller");
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
 * @route   GET /api/development-cost
 * @desc    Get all development cost estimates
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  devCostController.getAllDevelopmentCosts,
);

/**
 * @route   GET /api/development-cost/stats/overview
 * @desc    Get development statistics
 * @access  Private (Admin/Business Head)
 */
router.get(
  "/stats/overview",
  authMiddleware.restrictTo("admin", "business_head", "project_manager"),
  devCostController.getDevelopmentStats,
);

/**
 * @route   GET /api/development-cost/project/:projectId
 * @desc    Get development cost by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  devCostController.getDevelopmentCostByProjectId,
);

/**
 * @route   GET /api/development-cost/compare/:ids
 * @desc    Compare multiple projects
 * @access  Private (Admin/Business Head)
 */
router.get(
  "/compare/:ids",
  authMiddleware.restrictTo("admin", "business_head"),
  [param("ids").notEmpty()],
  validateMiddleware.validateRequest,
  devCostController.compareProjects,
);

/**
 * @route   GET /api/development-cost/:id
 * @desc    Get single development cost estimate
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid ID format")],
  validateMiddleware.validateRequest,
  devCostController.getDevelopmentCost,
);

/**
 * @route   GET /api/development-cost/:id/breakdown
 * @desc    Get cost breakdown
 * @access  Private
 */
router.get(
  "/:id/breakdown",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  devCostController.getCostBreakdown,
);

/**
 * @route   POST /api/development-cost/calculate
 * @desc    Calculate estimate based on hours
 * @access  Private
 */
router.post(
  "/calculate",
  [
    body("webHours").optional().isInt({ min: 0 }),
    body("mobileHours").optional().isInt({ min: 0 }),
    body("designHours").optional().isInt({ min: 0 }),
    body("qaHours").optional().isInt({ min: 0 }),
    body("avgRatePerHour").optional().isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  devCostController.calculateEstimate,
);

/**
 * @route   POST /api/development-cost/timeline
 * @desc    Estimate project timeline
 * @access  Private
 */
router.post(
  "/timeline",
  [
    body("totalHours").isInt({ min: 1 }),
    body("teamSize").optional().isInt({ min: 1, max: 20 }),
    body("workingDaysPerWeek").optional().isInt({ min: 1, max: 7 }),
    body("hoursPerDay").optional().isInt({ min: 1, max: 12 }),
  ],
  validateMiddleware.validateRequest,
  devCostController.estimateTimeline,
);

/**
 * @route   POST /api/development-cost/resources
 * @desc    Suggest resource allocation
 * @access  Private
 */
router.post(
  "/resources",
  [
    body("projectScope").isIn(["small", "medium", "large"]),
    body("timeline").optional().isInt({ min: 1, max: 24 }),
  ],
  validateMiddleware.validateRequest,
  devCostController.suggestResources,
);

// ============================================
// 👑 PROJECT MANAGER ROUTES
// ============================================

// Restrict to project managers and admins for modification routes
router.use(authMiddleware.restrictTo("admin", "project_manager"));

/**
 * @route   POST /api/development-cost
 * @desc    Create new development cost estimate
 * @access  Private (Admin/Project Manager)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("webApp").optional(),
    body("mobileApp").optional(),
    body("design").optional(),
    body("qaTesting").optional(),
    body("deployment").optional(),
  ],
  validateMiddleware.validateRequest,
  devCostController.createDevelopmentCost,
);

/**
 * @route   POST /api/development-cost/bulk
 * @desc    Bulk create development costs
 * @access  Private (Admin only)
 */
router.post(
  "/bulk",
  authMiddleware.restrictTo("admin"),
  [
    body("projects").isArray().withMessage("Projects must be an array"),
    body("projects.*.projectId").notEmpty(),
  ],
  validateMiddleware.validateRequest,
  devCostController.bulkCreateDevelopmentCosts,
);

/**
 * @route   PATCH /api/development-cost/bulk/rates
 * @desc    Bulk update hourly rates
 * @access  Private (Admin only)
 */
router.patch(
  "/bulk/rates",
  authMiddleware.restrictTo("admin"),
  [
    body("projectIds").isArray().withMessage("Project IDs must be an array"),
    body("section").isIn(["frontend", "backend", "reactNative"]),
    body("newRate").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  devCostController.bulkUpdateRates,
);

/**
 * @route   PATCH /api/development-cost/:id
 * @desc    Update development cost estimate
 * @access  Private (Project Manager)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  devCostController.updateDevelopmentCost,
);

/**
 * @route   PATCH /api/development-cost/:id/rates
 * @desc    Update hourly rates for a section
 * @access  Private (Project Manager)
 */
router.patch(
  "/:id/rates",
  [
    param("id").isMongoId(),
    body("section").isIn(["frontend", "backend", "reactNative"]),
    body("ratePerHour").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  devCostController.updateHourlyRates,
);

/**
 * @route   DELETE /api/development-cost/:id
 * @desc    Delete development cost estimate
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  devCostController.deleteDevelopmentCost,
);

module.exports = router;
