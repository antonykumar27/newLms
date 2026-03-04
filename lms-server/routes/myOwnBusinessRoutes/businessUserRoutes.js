const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateMiddleware = require("../middleware/validate.middleware");
const { body, param } = require("express-validator");

const router = express.Router();

// ============================================
// 🔓 PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").optional().isMobilePhone("any"),
  ],
  validateMiddleware.validateRequest,
  userController.register,
);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateMiddleware.validateRequest,
  userController.login,
);

// ============================================
// 🔒 PROTECTED ROUTES (All require authentication)
// ============================================

// Apply auth middleware to all routes below
router.use(authMiddleware.protect);

/**
 * @route   POST /api/users/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", userController.logout);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", userController.getMe);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch(
  "/me",
  [
    body("name").optional(),
    body("phone").optional().isMobilePhone("any"),
    body("department").optional(),
  ],
  validateMiddleware.validateRequest,
  userController.updateMe,
);

/**
 * @route   PATCH /api/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.patch(
  "/change-password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validateMiddleware.validateRequest,
  userController.changePassword,
);

// ============================================
// 👑 ADMIN ONLY ROUTES
// ============================================

// Restrict to admin for all routes below
router.use(authMiddleware.restrictTo("admin"));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get("/", userController.getAllUsers);

/**
 * @route   GET /api/users/stats/dashboard
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get("/stats/dashboard", userController.getUserStats);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role
 * @access  Private (Admin)
 */
router.get(
  "/role/:role",
  [
    param("role").isIn([
      "admin",
      "business_head",
      "finance_manager",
      "content_manager",
      "marketing_head",
      "instructor",
    ]),
  ],
  validateMiddleware.validateRequest,
  userController.getUsersByRole,
);

/**
 * @route   GET /api/users/userId/:userId
 * @desc    Get user by userId
 * @access  Private (Admin)
 */
router.get(
  "/userId/:userId",
  [param("userId").notEmpty()],
  validateMiddleware.validateRequest,
  userController.getUserByUserId,
);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin)
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateMiddleware.validateRequest,
  userController.getUser,
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn([
        "admin",
        "business_head",
        "finance_manager",
        "content_manager",
        "marketing_head",
        "instructor",
      ])
      .withMessage("Invalid role"),
  ],
  validateMiddleware.validateRequest,
  userController.createUser,
);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("role")
      .optional()
      .isIn([
        "admin",
        "business_head",
        "finance_manager",
        "content_manager",
        "marketing_head",
        "instructor",
      ]),
  ],
  validateMiddleware.validateRequest,
  userController.updateUser,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user (deactivate)
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateMiddleware.validateRequest,
  userController.deleteUser,
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  Private (Admin)
 */
router.patch(
  "/:id/activate",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateMiddleware.validateRequest,
  userController.activateUser,
);

/**
 * @route   DELETE /api/users/:id/permanent
 * @desc    Hard delete user (permanent)
 * @access  Private (Admin only - Super Admin)
 */
router.delete(
  "/:id/permanent",
  authMiddleware.restrictTo("admin"), // Add super admin check if needed
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateMiddleware.validateRequest,
  userController.hardDeleteUser,
);

module.exports = router;
