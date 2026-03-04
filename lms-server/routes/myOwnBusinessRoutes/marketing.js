const express = require("express");
const marketingController = require("../controllers/marketing.controller");
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
 * @route   GET /api/marketing
 * @desc    Get all marketing plans
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  marketingController.getAllMarketingPlans,
);

/**
 * @route   GET /api/marketing/dashboard/:projectId
 * @desc    Get marketing dashboard
 * @access  Private
 */
router.get(
  "/dashboard/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  marketingController.getMarketingDashboard,
);

/**
 * @route   GET /api/marketing/project/:projectId
 * @desc    Get marketing plan by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  marketingController.getMarketingPlanByProjectId,
);

/**
 * @route   GET /api/marketing/export/:projectId
 * @desc    Export marketing report
 * @access  Private
 */
router.get(
  "/export/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  marketingController.exportMarketingReport,
);

/**
 * @route   GET /api/marketing/:id
 * @desc    Get single marketing plan
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  marketingController.getMarketingPlan,
);

/**
 * @route   GET /api/marketing/:id/roi-analysis
 * @desc    Get ROI analysis
 * @access  Private
 */
router.get(
  "/:id/roi-analysis",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  marketingController.getROIAnalysis,
);

/**
 * @route   GET /api/marketing/:id/channel-performance
 * @desc    Get channel performance
 * @access  Private
 */
router.get(
  "/:id/channel-performance",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  marketingController.getChannelPerformance,
);

/**
 * @route   GET /api/marketing/:id/lead-metrics
 * @desc    Get lead metrics
 * @access  Private
 */
router.get(
  "/:id/lead-metrics",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  marketingController.getLeadMetrics,
);

/**
 * @route   GET /api/marketing/:id/campaign-calendar
 * @desc    Get campaign calendar
 * @access  Private
 */
router.get(
  "/:id/campaign-calendar",
  [
    param("id").isMongoId(),
    query("year").optional().isInt(),
    query("month").optional().isInt({ min: 1, max: 12 }),
  ],
  validateMiddleware.validateRequest,
  marketingController.getCampaignCalendar,
);

// ============================================
// 👑 MARKETING HEAD ROUTES
// ============================================

// Restrict to marketing heads and admins
router.use(authMiddleware.restrictTo("admin", "marketing_head"));

/**
 * @route   POST /api/marketing
 * @desc    Create new marketing plan
 * @access  Private (Marketing Head)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("digitalMarketing").optional(),
    body("traditionalMarketing").optional(),
    body("businessDevelopment").optional(),
  ],
  validateMiddleware.validateRequest,
  marketingController.createMarketingPlan,
);

/**
 * @route   POST /api/marketing/:id/campaigns
 * @desc    Create campaign
 * @access  Private (Marketing Head)
 */
router.post(
  "/:id/campaigns",
  [
    param("id").isMongoId(),
    body("name").notEmpty(),
    body("channel").notEmpty(),
    body("budget").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  marketingController.createCampaign,
);

/**
 * @route   POST /api/marketing/:id/social-platforms
 * @desc    Add social platform
 * @access  Private (Marketing Head)
 */
router.post(
  "/:id/social-platforms",
  [
    param("id").isMongoId(),
    body("name").isIn(["instagram", "facebook", "youtube"]),
    body("monthlyBudget").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  marketingController.addSocialPlatform,
);

/**
 * @route   PATCH /api/marketing/:id
 * @desc    Update marketing plan
 * @access  Private (Marketing Head)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  marketingController.updateMarketingPlan,
);

/**
 * @route   PATCH /api/marketing/:id/social-platforms/:platformIndex
 * @desc    Update social platform
 * @access  Private (Marketing Head)
 */
router.patch(
  "/:id/social-platforms/:platformIndex",
  [
    param("id").isMongoId(),
    param("platformIndex").isInt({ min: 0 }),
    body("monthlyBudget").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  marketingController.updateSocialPlatform,
);

/**
 * @route   DELETE /api/marketing/:id
 * @desc    Delete marketing plan
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  marketingController.deleteMarketingPlan,
);

/**
 * @route   DELETE /api/marketing/:id/social-platforms/:platformIndex
 * @desc    Delete social platform
 * @access  Private (Marketing Head)
 */
router.delete(
  "/:id/social-platforms/:platformIndex",
  [param("id").isMongoId(), param("platformIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  marketingController.deleteSocialPlatform,
);

module.exports = router;
