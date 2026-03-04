const express = require("express");
const {
  register,
  login,
  checkAdminEmail,
  registerAsStudent,
  refreshToken,
  AdminRelatedSuents,
  getEnrolledStandardContent,
} = require("../constrollers/loginUserController");
const { multerMiddleware } = require("../config/cloudinary2");
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const router = express.Router();

// User Registration Route (with optional media upload)
router.post("/register", multerMiddleware, register);
router.post("/refreshToken", multerMiddleware, refreshToken);
router.post(
  "/registerAsStudent",
  multerMiddleware,
  isAuthenticatedUser,
  registerAsStudent,
);
router.post("/login", login);
router.get("/adminRelatedSuents", isAuthenticatedUser, AdminRelatedSuents);
router.get("/meStandard", isAuthenticatedUser, getEnrolledStandardContent);
router.post("/check-email", checkAdminEmail);

module.exports = router;
