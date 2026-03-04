const express = require("express");
const operationalController = require("../controllers/operational.controller");
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
 * @route   GET /api/operational
 * @desc    Get all operational records
 * @access  Private
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateMiddleware.validateRequest,
  operationalController.getAllOperational,
);

/**
 * @route   GET /api/operational/dashboard/:projectId
 * @desc    Get operational dashboard
 * @access  Private
 */
router.get(
  "/dashboard/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  operationalController.getOperationalDashboard,
);

/**
 * @route   GET /api/operational/project/:projectId
 * @desc    Get operational record by project ID
 * @access  Private
 */
router.get(
  "/project/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  operationalController.getOperationalByProjectId,
);

/**
 * @route   GET /api/operational/export/:projectId
 * @desc    Export operational report
 * @access  Private
 */
router.get(
  "/export/:projectId",
  [param("projectId").notEmpty()],
  validateMiddleware.validateRequest,
  operationalController.exportOperationalReport,
);

/**
 * @route   GET /api/operational/:id
 * @desc    Get single operational record
 * @access  Private
 */
router.get(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.getOperational,
);

/**
 * @route   GET /api/operational/:id/employee-costs
 * @desc    Get employee cost analysis
 * @access  Private
 */
router.get(
  "/:id/employee-costs",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.getEmployeeCosts,
);

/**
 * @route   GET /api/operational/:id/office-expenses
 * @desc    Get office expenses analysis
 * @access  Private
 */
router.get(
  "/:id/office-expenses",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.getOfficeExpenses,
);

/**
 * @route   GET /api/operational/:id/legal-summary
 * @desc    Get legal compliance summary
 * @access  Private (Admin)
 */
router.get(
  "/:id/legal-summary",
  authMiddleware.restrictTo("admin", "finance_manager"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.getLegalSummary,
);

/**
 * @route   GET /api/operational/:id/tech-summary
 * @desc    Get technology tools summary
 * @access  Private
 */
router.get(
  "/:id/tech-summary",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.getTechSummary,
);

/**
 * @route   GET /api/operational/:id/optimize
 * @desc    Get optimization suggestions
 * @access  Private (Admin)
 */
router.get(
  "/:id/optimize",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.getOptimizationSuggestions,
);

// ============================================
// 👑 ADMIN/FINANCE MANAGER ROUTES
// ============================================

// Restrict to admins and finance managers for modification routes
router.use(authMiddleware.restrictTo("admin", "finance_manager"));

/**
 * @route   POST /api/operational
 * @desc    Create new operational record
 * @access  Private (Admin/Finance Manager)
 */
router.post(
  "/",
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
    body("officeSpace").optional(),
    body("employeeSalaries").optional(),
    body("legalCompliance").optional(),
    body("technologyTools").optional(),
  ],
  validateMiddleware.validateRequest,
  operationalController.createOperational,
);

/**
 * @route   POST /api/operational/:id/employees
 * @desc    Add employee role
 * @access  Private (Admin/HR)
 */
router.post(
  "/:id/employees",
  [
    param("id").isMongoId(),
    body("department").isIn(["management", "admin", "finance", "techSupport"]),
    body("role").notEmpty(),
    body("count").isInt({ min: 1 }),
    body("monthlySalary").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  operationalController.addEmployeeRole,
);

/**
 * @route   POST /api/operational/:id/tech-tools
 * @desc    Add technology tool
 * @access  Private (Admin)
 */
router.post(
  "/:id/tech-tools",
  [
    param("id").isMongoId(),
    body("category").isIn(["productivity", "communication", "accounting"]),
    body("name").notEmpty(),
    body("monthlyCost").isFloat({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  operationalController.addTechTool,
);

/**
 * @route   PATCH /api/operational/:id
 * @desc    Update operational record
 * @access  Private (Admin/Finance Manager)
 */
router.patch(
  "/:id",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.updateOperational,
);

/**
 * @route   PATCH /api/operational/:id/office
 * @desc    Update office space
 * @access  Private (Admin)
 */
router.patch(
  "/:id/office",
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.updateOfficeSpace,
);

/**
 * @route   PATCH /api/operational/:id/employees/:employeeIndex
 * @desc    Update employee role
 * @access  Private (Admin/HR)
 */
router.patch(
  "/:id/employees/:employeeIndex",
  [param("id").isMongoId(), param("employeeIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  operationalController.updateEmployeeRole,
);

/**
 * @route   DELETE /api/operational/:id
 * @desc    Delete operational record
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  [param("id").isMongoId()],
  validateMiddleware.validateRequest,
  operationalController.deleteOperational,
);

/**
 * @route   DELETE /api/operational/:id/employees/:employeeIndex
 * @desc    Delete employee role
 * @access  Private (Admin/HR)
 */
router.delete(
  "/:id/employees/:employeeIndex",
  [param("id").isMongoId(), param("employeeIndex").isInt({ min: 0 })],
  validateMiddleware.validateRequest,
  operationalController.deleteEmployeeRole,
);

/**
 * @route   DELETE /api/operational/:id/tech-tools/:category/:toolIndex
 * @desc    Delete technology tool
 * @access  Private (Admin)
 */
router.delete(
  "/:id/tech-tools/:category/:toolIndex",
  [
    param("id").isMongoId(),
    param("category").isIn(["productivity", "communication", "accounting"]),
    param("toolIndex").isInt({ min: 0 }),
  ],
  validateMiddleware.validateRequest,
  operationalController.deleteTechTool,
);

module.exports = router;
