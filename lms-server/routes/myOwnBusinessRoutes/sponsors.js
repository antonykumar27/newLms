const express = require("express");
const sponsorsController = require("../controllers/sponsors.controller");
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
 * @route   GET /api/sponsors
 * @desc    Get all sponsors records
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  sponsorsController.getAllSponsorsRecords,
);

/**
 * @route   GET /api/sponsors/dashboard/:projectId
 * @desc    Get sponsors dashboard
 * @access  Private
 */
router.get(
  "/dashboard/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  sponsorsController.getSponsorsDashboard,
);

/**
 * @route   GET /api/sponsors/project/:projectId
 * @desc    Get sponsors record by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  sponsorsController.getSponsorsByProjectId,
);

/**
 * @route   GET /api/sponsors/export/:projectId
 * @desc    Export sponsors report
 * @access  Private
 */
router.get(
  "/export/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  sponsorsController.exportSponsorsReport,
);

/**
 * @route   GET /api/sponsors/:id
 * @desc    Get single sponsors record
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  sponsorsController.getSponsorsRecord,
);

/**
 * @route   GET /api/sponsors/:id/sponsor-details
 * @desc    Get sponsor details
 * @access  Private
 */
router.get(
  "/:id/sponsor-details",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  sponsorsController.getSponsorDetails,
);

/**
 * @route   GET /api/sponsors/:id/investor-details
 * @desc    Get investor details
 * @access  Private (Admin/Finance)
 */
router.get(
  "/:id/investor-details",
  authMiddleware.restrictTo("admin", "finance_manager"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  sponsorsController.getInvestorDetails,
);

/**
 * @route   GET /api/sponsors/:id/grant-details
 * @desc    Get grant details
 * @access  Private
 */
router.get(
  "/:id/grant-details",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  sponsorsController.getGrantDetails,
);

// ============================================
// 👑 ADMIN/BUSINESS HEAD ROUTES
// ============================================

// Restrict to admins and business heads for modification routes
router.use(authMiddleware.restrictTo("admin", "business_head"));

/**
 * @route   POST /api/sponsors
 * @desc    Create new sponsors record
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("investors").optional(),
    body("sponsors").optional(),
    body("grants").optional(),
  ],
  validateMiddleware.validateRequest,
  sponsorsController.createSponsorsRecord,
);

/**
 * @route   POST /api/sponsors/:id/investors
 * @desc    Add investor
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/:id/investors",
  [
    param("id").isMongoId(),
    body("name").notEmpty(),
    body("type").isIn(["angel", "vc", "strategic"]),
    body("investmentAmount").isFloat({ min: 0 }),
    body("equityStake").optional().isFloat({ min: 0, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  sponsorsController.addInvestor,
);

/**
 * @route   POST /api/sponsors/:id/sponsors
 * @desc    Add sponsor
 * @access  Private (Admin/Marketing Head)
 */
router.post(
  "/:id/sponsors",
  [
    param("id").isMongoId(),
    body("name").notEmpty(),
    body("tier").isIn(["platinum", "gold", "silver", "bronze"]),
    body("contributionAmount").isFloat({ min: 0 }),
    body("contributionType").isIn(["cash", "kind", "services"]),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
  ],
  validateMiddleware.validateRequest,
  sponsorsController.addSponsor,
);

/**
 * @route   POST /api/sponsors/:id/grants
 * @desc    Add grant
 * @access  Private (Admin/Business Head)
 */
router.post(
  "/:id/grants",
  [
    param("id").isMongoId(),
    body("name").notEmpty(),
    body("provider").isIn(["government", "foundation"]),
    body("schemeName").notEmpty(),
    body("amount").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  sponsorsController.addGrant,
);

/**
 * @route   PATCH /api/sponsors/:id
 * @desc    Update sponsors record
 * @access  Private (Admin/Business Head)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  sponsorsController.updateSponsorsRecord,
);

/**
 * @route   PATCH /api/sponsors/:id/investors/:investorIndex
 * @desc    Update investor
 * @access  Private (Admin/Business Head)
 */
router.patch(
  "/:id/investors/:investorIndex",
  [param("id").isMongoId(), param("investorIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  sponsorsController.updateInvestor,
);

/**
 * @route   PATCH /api/sponsors/:id/sponsors/:sponsorIndex
 * @desc    Update sponsor
 * @access  Private (Admin/Marketing Head)
 */
router.patch(
  "/:id/sponsors/:sponsorIndex",
  [param("id").isMongoId(), param("sponsorIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  sponsorsController.updateSponsor,
);

/**
 * @route   PATCH /api/sponsors/:id/grants/:grantIndex
 * @desc    Update grant
 * @access  Private (Admin/Business Head)
 */
router.patch(
  "/:id/grants/:grantIndex",
  [param("id").isMongoId(), param("grantIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  sponsorsController.updateGrant,
);

/**
 * @route   DELETE /api/sponsors/:id
 * @desc    Delete sponsors record
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  sponsorsController.deleteSponsorsRecord,
);

/**
 * @route   DELETE /api/sponsors/:id/investors/:investorIndex
 * @desc    Delete investor
 * @access  Private (Admin only)
 */
router.delete(
  "/:id/investors/:investorIndex",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId(), param("investorIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  sponsorsController.deleteInvestor,
);

/**
 * @route   DELETE /api/sponsors/:id/sponsors/:sponsorIndex
 * @desc    Delete sponsor
 * @access  Private (Admin only)
 */
router.delete(
  "/:id/sponsors/:sponsorIndex",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId(), param("sponsorIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  sponsorsController.deleteSponsor,
);

/**
 * @route   DELETE /api/sponsors/:id/grants/:grantIndex
 * @desc    Delete grant
 * @access  Private (Admin only)
 */
router.delete(
  "/:id/grants/:grantIndex",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId(), param("grantIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  sponsorsController.deleteGrant,
);

module.exports = router;
