// routes/interactionAnalyticsRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  getUserInteractionProfile,
  getCourseInteractionAnalytics,
  getPlatformInteractionAnalytics,
  getVideoInteractionDeepDive,
  getInteractionAlerts,
} = require("../controllers/interactionAnalyticsController");

// Level 1: Single User (Personalized) Level 1 → User Intelligence
router.get("/user/:userId", protect, getUserInteractionProfile);

// Level 2: Course (Content Team) Level 2 → Course Intelligence
router.get("/course/:subjectId", protect, admin, getCourseInteractionAnalytics);

// Level 3: Platform (Executives) Level 3 → Business Intelligence
router.get("/platform", protect, admin, getPlatformInteractionAnalytics);

// Level 4: Video Deep Dive (Content Team) Level 4 → Video Intelligence
router.get(
  "/video/:videoId/deepdive",
  protect,
  admin,
  getVideoInteractionDeepDive,
);

// Level 5: Real-time Alerts (Operations) Level 5 → Alerts System
router.get("/alerts", protect, admin, getInteractionAlerts);

module.exports = router;
