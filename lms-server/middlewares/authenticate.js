const ErrorHandler = require("../utilis/errorHandler");
const User = require("../models/loginUserModel");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

// Middleware to check if the user is authenticated
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token

  // const token = req.cookies.token;  // Assuming the token is stored with the name 'token'

  if (!token) {
    return next(new ErrorHandler("Please log in to access this resource", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("first login", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});

// Middleware to authorize user roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role '${req.user.role}' is not authorized to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};
exports.isMainPriest = (req, res, next) => {
  if (req.user.role !== "main-priest") {
    return res.status(403).json({
      message: "You do not have permission to perform this action.",
    });
  }
  next();
};
