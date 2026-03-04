const express = require("express");
const kpiController = require("../controllers/kpi.controller");
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
 * @route   GET /api/kpi
 * @desc    Get all KPI records
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  kpiController.getAllKPIs,
);

/**
 * @route   GET /api/kpi/dashboard/:projectId
 * @desc    Get comprehensive KPI dashboard
 * @access  Private
 */
router.get(
  "/dashboard/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.getKPIDashboard,
);

/**
 * @route   GET /api/kpi/trends/:projectId
 * @desc    Get KPI trends over time
 * @access  Private
 */
router.get(
  "/trends/:projectId",
  [
    param("projectId").notEmpty(),
    query("days").optional().isInt({ min: 7, max: 365 }),
  ],
  validateMiddleware.validateRequest,
  kpiController.getKPITrends,
);

/**
 * @route   GET /api/kpi/project/:projectId
 * @desc    Get KPI by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.getKPIByProjectId,
);

/**
 * @route   GET /api/kpi/:projectId/user-metrics
 * @desc    Get user metrics
 * @access  Private
 */
router.get(
  "/:projectId/user-metrics",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.getUserMetrics,
);

/**
 * @route   GET /api/kpi/:projectId/content-metrics
 * @desc    Get content metrics
 * @access  Private
 */
router.get(
  "/:projectId/content-metrics",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.getContentMetrics,
);

/**
 * @route   GET /api/kpi/:projectId/engagement-metrics
 * @desc    Get engagement metrics
 * @access  Private
 */
router.get(
  "/:projectId/engagement-metrics",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.getEngagementMetrics,
);

/**
 * @route   GET /api/kpi/export/:projectId
 * @desc    Export KPI report
 * @access  Private
 */
router.get(
  "/export/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.exportKPIReport,
);

/**
 * @route   GET /api/kpi/:id
 * @desc    Get single KPI record
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  kpiController.getKPI,
);

/**
 * @route   GET /api/kpi/:id/progress
 * @desc    Get goal progress
 * @access  Private
 */
router.get(
  "/:id/progress",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  kpiController.getGoalProgress,
);

// ============================================
// 👑 FINANCE MANAGER ROUTES
// ============================================

/**
 * @route   GET /api/kpi/:projectId/financial-metrics
 * @desc    Get financial metrics
 * @access  Private (Finance Manager)
 */
router.get(
  "/:projectId/financial-metrics",
  authMiddleware.restrictTo("admin", "finance_manager", "business_head"),
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.getFinancialMetrics,
);

/**
 * @route   GET /api/kpi/forecast/:projectId
 * @desc    Get KPI forecasts
 * @access  Private (Business Head)
 */
router.get(
  "/forecast/:projectId",
  authMiddleware.restrictTo("admin", "business_head"),
  [
    param("projectId").notEmpty(),
    query("months").optional().isInt({ min: 1, max: 36 }),
  ],
  validateMiddleware.validateRequest,
  kpiController.getKPIForecast,
);

// ============================================
// 👑 ADMIN/BUSINESS HEAD ROUTES
// ============================================

// Restrict to admins and business heads for modification routes
router.use(authMiddleware.restrictTo("admin", "business_head"));

/**
 * @route   POST /api/kpi
 * @desc    Create new KPI record
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("userMetrics").optional(),
    body("financialMetrics").optional(),
    body("contentMetrics").optional(),
    body("engagementMetrics").optional(),
  ],
  validateMiddleware.validateRequest,
  kpiController.createKPI,
);

/**
 * @route   PATCH /api/kpi/:id
 * @desc    Update KPI record
 * @access  Private (Admin/Business Head)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  kpiController.updateKPI,
);

/**
 * @route   PATCH /api/kpi/:id/targets
 * @desc    Set KPI targets
 * @access  Private (Admin/Business Head)
 */
router.patch(
  "/:id/targets",
  [param("id").isMongoId(), body("targets").notEmpty()],
  validateMiddleware.validateRequest,
  kpiController.setTargets,
);

/**
 * @route   DELETE /api/kpi/:id
 * @desc    Delete KPI record
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  kpiController.deleteKPI,
);

module.exports = router;
