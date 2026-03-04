const User = require("../../models/myOwnBusinessModel.js/businnesUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../../utilis/errorHandler");
const catchAsync = require("../../middlewares/catchAsyncError");

// ============================================
// 🔐 AUTHENTICATION CONTROLLERS
// ============================================

/**
 * @desc    Register new user
 * @route   POST /api/users/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, role, department } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered", 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate userId
  const userId = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Create user
  const user = await User.create({
    userId,
    name,
    email,
    phone,
    password: hashedPassword,
    role: role || "business_head",
    department,
    accessLevel: role === "admin" ? "admin" : "viewer",
    isActive: true,
  });

  // Generate token
  const token = jwt.sign(
    { id: user._id, userId: user.userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new ErrorHandler("Your account has been deactivated", 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = jwt.sign(
    { id: user._id, userId: user.userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      token,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/users/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res, next) => {
  // In stateless JWT, we just clear token on client side
  // But we can implement token blacklist if needed

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Change password
 * @route   PATCH /api/users/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  // Hash new password
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// ============================================
// 👤 USER MANAGEMENT CONTROLLERS
// ============================================

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtering
  let query = User.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const users = await query;
  const total = await User.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    results: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      users,
    },
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin/Manager)
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("No user found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Get user by userId (custom ID)
 * @route   GET /api/users/userId/:userId
 * @access  Private
 */
exports.getUserByUserId = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ userId: req.params.userId });

  if (!user) {
    return next(new ErrorHandler("No user found with that User ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Create new user (by admin)
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, role, department, accessLevel } =
    req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered", 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate userId
  const userId = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const user = await User.create({
    userId,
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    department,
    accessLevel: accessLevel || "viewer",
    isActive: true,
  });

  user.password = undefined;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user,
    },
  });
});

/**
 * @desc    Update user
 * @route   PATCH /api/users/:id
 * @access  Private (Admin/Self)
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  // Prevent password update here
  if (req.body.password) {
    return next(
      new ErrorHandler(
        "This route is not for password updates. Use /change-password",
        400,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    return next(new ErrorHandler("No user found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      user,
    },
  });
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
      updatedAt: Date.now(),
    },
    { new: true },
  );

  if (!user) {
    return next(new ErrorHandler("No user found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
    data: null,
  });
});

/**
 * @desc    Hard delete user (permanent)
 * @route   DELETE /api/users/:id/permanent
 * @access  Private (Super Admin only)
 */
exports.hardDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ErrorHandler("No user found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "User permanently deleted",
    data: null,
  });
});

/**
 * @desc    Activate user
 * @route   PATCH /api/users/:id/activate
 * @access  Private (Admin only)
 */
exports.activateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isActive: true,
      updatedAt: Date.now(),
    },
    { new: true },
  );

  if (!user) {
    return next(new ErrorHandler("No user found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    message: "User activated successfully",
    data: {
      user,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent password/role update here
  if (req.body.password || req.body.role) {
    return next(
      new ErrorHandler("This route is not for password or role updates", 400),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      department: req.body.department,
      profileImage: req.body.profileImage,
      updatedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

// ============================================
// 📊 DASHBOARD & ANALYTICS
// ============================================

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats/dashboard
 * @access  Private (Admin only)
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: ["$isActive", 1, 0] },
        },
        inactiveUsers: {
          $sum: { $cond: ["$isActive", 0, 1] },
        },
      },
    },
  ]);

  const roleStats = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const recentUsers = await User.find()
    .sort("-createdAt")
    .limit(5)
    .select("name email role createdAt");

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 },
      byRole: roleStats,
      recentUsers,
    },
  });
});

/**
 * @desc    Get users by role
 * @route   GET /api/users/role/:role
 * @access  Private
 */
exports.getUsersByRole = catchAsync(async (req, res, next) => {
  const users = await User.find({
    role: req.params.role,
    isActive: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    results: users.length,
    data: {
      users,
    },
  });
});
