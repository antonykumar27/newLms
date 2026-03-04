const express = require("express");
const financialController = require("../controllers/financialSummary.controller");
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
 * @route   GET /api/financial-summary
 * @desc    Get all financial summaries
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  financialController.getAllFinancialSummaries,
);

/**
 * @route   GET /api/financial-summary/dashboard/:id
 * @desc    Get financial dashboard
 * @access  Private
 */
router.get(
  "/dashboard/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.getFinancialDashboard,
);

/**
 * @route   GET /api/financial-summary/project/:projectId
 * @desc    Get financial summary by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  financialController.getFinancialSummaryByProjectId,
);

/**
 * @route   GET /api/financial-summary/:id
 * @desc    Get single financial summary
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.getFinancialSummary,
);

/**
 * @route   GET /api/financial-summary/:id/breakeven
 * @desc    Get break-even analysis
 * @access  Private
 */
router.get(
  "/:id/breakeven",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.getBreakEvenAnalysis,
);

// ============================================
// 👑 FINANCE MANAGER ROUTES
// ============================================

// Restrict to finance managers and admins
router.use(authMiddleware.restrictTo("admin", "finance_manager"));

/**
 * @route   GET /api/financial-summary/:id/pnl
 * @desc    Get profit & loss statement
 * @access  Private (Finance Manager)
 */
router.get(
  "/:id/pnl",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.getProfitLossStatement,
);

/**
 * @route   GET /api/financial-summary/:id/cashflow
 * @desc    Get cash flow statement
 * @access  Private (Finance Manager)
 */
router.get(
  "/:id/cashflow",
  [
    param("id").isMongoId(),
    query("months").optional().isInt({ min: 1, max: 36 }),
  ],
  validateMiddleware.validateRequest,
  financialController.getCashFlowStatement,
);

/**
 * @route   GET /api/financial-summary/:id/investment
 * @desc    Get investment metrics
 * @access  Private (Finance Manager)
 */
router.get(
  "/:id/investment",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.getInvestmentMetrics,
);

/**
 * @route   POST /api/financial-summary
 * @desc    Create new financial summary
 * @access  Private (Finance Manager)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("refIds").optional(),
    body("totalCosts").optional(),
    body("totalRevenue").optional(),
  ],
  validateMiddleware.validateRequest,
  financialController.createFinancialSummary,
);

/**
 * @route   POST /api/financial-summary/generate/:projectId
 * @desc    Auto-generate from references
 * @access  Private (Finance Manager)
 */
router.post(
  "/generate/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  financialController.generateFromReferences,
);

/**
 * @route   POST /api/financial-summary/:id/recalculate
 * @desc    Recalculate all metrics
 * @access  Private (Finance Manager)
 */
router.post(
  "/:id/recalculate",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.recalculateMetrics,
);

/**
 * @route   POST /api/financial-summary/:id/scenarios
 * @desc    Run what-if scenarios
 * @access  Private (Finance Manager)
 */
router.post(
  "/:id/scenarios",
  [
    param("id").isMongoId(),
    body("scenarios").isArray(),
    body("scenarios.*.name").notEmpty(),
    body("scenarios.*.costChange").isFloat(),
    body("scenarios.*.revenueChange").isFloat(),
  ],
  validateMiddleware.validateRequest,
  financialController.runScenarios,
);

/**
 * @route   PATCH /api/financial-summary/:id
 * @desc    Update financial summary
 * @access  Private (Finance Manager)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.updateFinancialSummary,
);

/**
 * @route   DELETE /api/financial-summary/:id
 * @desc    Delete financial summary
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  financialController.deleteFinancialSummary,
);

module.exports = router;
