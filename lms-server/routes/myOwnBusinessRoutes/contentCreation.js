const express = require("express");
const contentController = require("../controllers/contentCreation.controller");
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
 * @route   GET /api/content-creation
 * @desc    Get all content plans
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  contentController.getAllContentPlans,
);

/**
 * @route   GET /api/content-creation/stats/overview
 * @desc    Get content statistics
 * @access  Private (Admin/Manager)
 */
router.get(
  "/stats/overview",
  authMiddleware.restrictTo("admin", "content_manager", "business_head"),
  contentController.getContentStats,
);

/**
 * @route   GET /api/content-creation/project/:projectId
 * @desc    Get content plan by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  contentController.getContentPlanByProjectId,
);

/**
 * @route   GET /api/content-creation/compare/:ids
 * @desc    Compare multiple content plans
 * @access  Private (Admin/Manager)
 */
router.get(
  "/compare/:ids",
  authMiddleware.restrictTo("admin", "content_manager", "business_head"),
  [param("ids").notEmpty()],
  validateMiddleware.validateRequest,
  contentController.compareContentPlans,
);

/**
 * @route   GET /api/content-creation/:id
 * @desc    Get single content plan
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid ID format")],
  validateMiddleware.validateRequest,
  contentController.getContentPlan,
);

/**
 * @route   GET /api/content-creation/:id/breakdown
 * @desc    Get cost breakdown for a plan
 * @access  Private
 */
router.get(
  "/:id/breakdown",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  contentController.getCostBreakdown,
);

/**
 * @route   GET /api/content-creation/:id/budget-projection
 * @desc    Get budget projection
 * @access  Private (Manager)
 */
router.get(
  "/:id/budget-projection",
  authMiddleware.restrictTo("admin", "content_manager", "finance_manager"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  contentController.getBudgetProjection,
);

// ============================================
// 👑 CONTENT MANAGER ROUTES
// ============================================

// Restrict to content managers and admins for modification routes
router.use(authMiddleware.restrictTo("admin", "content_manager"));

/**
 * @route   POST /api/content-creation
 * @desc    Create new content plan
 * @access  Private (Admin/Content Manager)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("studioEquipment").optional(),
    body("instructorCosts").optional(),
    body("contentProduction").optional(),
  ],
  validateMiddleware.validateRequest,
  contentController.createContentPlan,
);

/**
 * @route   POST /api/content-creation/bulk
 * @desc    Bulk create content plans
 * @access  Private (Admin only)
 */
router.post(
  "/bulk",
  authMiddleware.restrictTo("admin"),
  [
    body("plans").isArray().withMessage("Plans must be an array"),
    body("plans.*.projectId").notEmpty(),
  ],
  validateMiddleware.validateRequest,
  contentController.bulkCreateContentPlans,
);

/**
 * @route   POST /api/content-creation/:id/cameras
 * @desc    Add camera equipment
 * @access  Private (Content Manager)
 */
router.post(
  "/:id/cameras",
  [
    param("id").isMongoId(),
    body("brand").notEmpty(),
    body("model").notEmpty(),
    body("quantity").isInt({ min: 1 }),
    body("unitPrice").isFloat({ min: 0 }),
    body("type").isIn(["dslr", "mirrorless", "webcam"]),
  ],
  validateMiddleware.validateRequest,
  contentController.addCamera,
);

/**
 * @route   POST /api/content-creation/:id/fulltime-teachers
 * @desc    Add full-time teacher
 * @access  Private (Content Manager)
 */
router.post(
  "/:id/fulltime-teachers",
  [
    param("id").isMongoId(),
    body("name").notEmpty(),
    body("subject").notEmpty(),
    body("monthlySalary").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  contentController.addFullTimeTeacher,
);

/**
 * @route   POST /api/content-creation/:id/parttime-teachers
 * @desc    Add part-time teacher
 * @access  Private (Content Manager)
 */
router.post(
  "/:id/parttime-teachers",
  [
    param("id").isMongoId(),
    body("name").notEmpty(),
    body("subject").notEmpty(),
    body("hourlyRate").isFloat({ min: 0 }),
    body("monthlyHours").isInt({ min: 1 }),
  ],
  validateMiddleware.validateRequest,
  contentController.addPartTimeTeacher,
);

/**
 * @route   PATCH /api/content-creation/:id/video-production
 * @desc    Update video production costs
 * @access  Private (Content Manager)
 */
router.patch(
  "/:id/video-production",
  [
    param("id").isMongoId(),
    body("costPerMinute").optional().isFloat({ min: 0 }),
    body("minutesPerMonth").optional().isInt({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  contentController.updateVideoProduction,
);

/**
 * @route   PATCH /api/content-creation/:id/cameras/:cameraId
 * @desc    Update camera equipment
 * @access  Private (Content Manager)
 */
router.patch(
  "/:id/cameras/:cameraId",
  [
    param("id").isMongoId(),
    param("cameraId").isMongoId(),
    body("brand").optional(),
    body("quantity").optional().isInt({ min: 1 }),
    body("unitPrice").optional().isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  contentController.updateCamera,
);

/**
 * @route   PATCH /api/content-creation/:id
 * @desc    Update content plan
 * @access  Private (Content Manager)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  contentController.updateContentPlan,
);

/**
 * @route   DELETE /api/content-creation/:id/cameras/:cameraId
 * @desc    Delete camera equipment
 * @access  Private (Content Manager)
 */
router.delete(
  "/:id/cameras/:cameraId",
  [param("id").isMongoId(), param("cameraId").isMongoId()],
  validateMiddleware.validateRequest,
  contentController.deleteCamera,
);

/**
 * @route   DELETE /api/content-creation/:id
 * @desc    Delete content plan
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  contentController.deleteContentPlan,
);

module.exports = router;
