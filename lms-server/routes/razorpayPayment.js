const express = require("express");
const {
  addToCourseOrder,
  getRazorpayKey,
  verifyPayment,
  createCourseOrder,
} = require("../constrollers/razorpayPayment");
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const router = express.Router();

// ✅ Route to create an order
router.post("/create-order", isAuthenticatedUser, addToCourseOrder);
router.post("/create-course-order", isAuthenticatedUser, createCourseOrder);

// ✅ Route to get Razorpay key
router.get("/razorpay-keyget", isAuthenticatedUser, getRazorpayKey);
router.post("/verify-payment", isAuthenticatedUser, verifyPayment);
router.post("/verify-course-payment", isAuthenticatedUser, verifyPayment);

module.exports = router;
