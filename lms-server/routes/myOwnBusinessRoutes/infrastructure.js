const express = require("express");
const infraController = require("../controllers/infrastructure.controller");
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
 * @route   GET /api/infrastructure
 * @desc    Get all infrastructure estimates
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  infraController.getAllInfrastructure,
);

/**
 * @route   GET /api/infrastructure/stats/overview
 * @desc    Get infrastructure statistics
 * @access  Private (Admin/Business Head)
 */
router.get(
  "/stats/overview",
  authMiddleware.restrictTo("admin", "business_head", "tech_lead"),
  infraController.getInfrastructureStats,
);

/**
 * @route   GET /api/infrastructure/project/:projectId
 * @desc    Get infrastructure by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  infraController.getInfrastructureByProjectId,
);

/**
 * @route   GET /api/infrastructure/:id
 * @desc    Get single infrastructure estimate
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.getInfrastructure,
);

/**
 * @route   GET /api/infrastructure/:id/monthly-breakdown
 * @desc    Get monthly cost breakdown
 * @access  Private
 */
router.get(
  "/:id/monthly-breakdown",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.getMonthlyBreakdown,
);

/**
 * @route   GET /api/infrastructure/:id/utilization
 * @desc    Get resource utilization
 * @access  Private (Tech Lead)
 */
router.get(
  "/:id/utilization",
  authMiddleware.restrictTo("admin", "tech_lead"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.getResourceUtilization,
);

/**
 * @route   GET /api/infrastructure/:id/optimize
 * @desc    Get optimization suggestions
 * @access  Private (Tech Lead)
 */
router.get(
  "/:id/optimize",
  authMiddleware.restrictTo("admin", "tech_lead"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.getOptimizationSuggestions,
);

/**
 * @route   GET /api/infrastructure/export/:id
 * @desc    Export infrastructure data
 * @access  Private
 */
router.get(
  "/export/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.exportInfrastructure,
);

/**
 * @route   POST /api/infrastructure/compare-providers
 * @desc    Compare different providers
 * @access  Private
 */
router.post(
  "/compare-providers",
  [body("requirements").notEmpty()],
  validateMiddleware.validateRequest,
  infraController.compareProviders,
);

/**
 * @route   POST /api/infrastructure/estimate-scaling
 * @desc    Estimate scaling costs
 * @access  Private
 */
router.post(
  "/estimate-scaling",
  [body("currentInfra").notEmpty(), body("targetUsers").isInt({ min: 1 })],
  validateMiddleware.validateRequest,
  infraController.estimateScaling,
);

/**
 * @route   POST /api/infrastructure/forecast
 * @desc    Get usage forecast
 * @access  Private
 */
router.post(
  "/forecast",
  [
    body("currentUsage").isInt({ min: 1 }),
    body("growthRate").isFloat({ min: 0, max: 100 }),
    body("months").optional().isInt({ min: 1, max: 36 }),
  ],
  validateMiddleware.validateRequest,
  infraController.getUsageForecast,
);

// ============================================
// 👑 TECH LEAD ROUTES
// ============================================

// Restrict to tech leads and admins for modification routes
router.use(authMiddleware.restrictTo("admin", "tech_lead"));

/**
 * @route   POST /api/infrastructure
 * @desc    Create new infrastructure estimate
 * @access  Private (Tech Lead)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("cloudHosting").optional(),
    body("storageAndCDN").optional(),
    body("thirdPartyServices").optional(),
  ],
  validateMiddleware.validateRequest,
  infraController.createInfrastructure,
);

/**
 * @route   POST /api/infrastructure/bulk
 * @desc    Bulk create infrastructure estimates
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
  infraController.bulkCreateInfrastructure,
);

/**
 * @route   PATCH /api/infrastructure/:id/upgrade-backend
 * @desc    Upgrade backend server tier
 * @access  Private (Tech Lead)
 */
router.patch(
  "/:id/upgrade-backend",
  [param("id").isMongoId(), body("newTier").isIn(["small", "medium", "large"])],
  validateMiddleware.validateRequest,
  infraController.upgradeBackendTier,
);

/**
 * @route   PATCH /api/infrastructure/:id/upgrade-database
 * @desc    Upgrade database tier
 * @access  Private (Tech Lead)
 */
router.patch(
  "/:id/upgrade-database",
  [
    param("id").isMongoId(),
    body("newTier").isIn(["free", "m10", "m20", "m30"]),
  ],
  validateMiddleware.validateRequest,
  infraController.upgradeDatabaseTier,
);

/**
 * @route   PATCH /api/infrastructure/:id
 * @desc    Update infrastructure estimate
 * @access  Private (Tech Lead)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.updateInfrastructure,
);

/**
 * @route   DELETE /api/infrastructure/:id
 * @desc    Delete infrastructure estimate
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  infraController.deleteInfrastructure,
);

module.exports = router;
