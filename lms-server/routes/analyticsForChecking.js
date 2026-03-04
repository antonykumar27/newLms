// routes/watchRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  getUserWatchProgress,
  getUserAllProgress,
  getContinueWatching,
} = require("../controllers/watchController");

// User routes (fast UI data from WatchTime)
router.get("/progress/:videoId/:pageId", protect, getUserWatchProgress);
router.get("/all-progress", protect, getUserAllProgress);
router.get("/continue-watching", protect, getContinueWatching);

module.exports = router;
// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  getVideoAnalytics,
  getUserEngagementReport,
  getPlatformAnalytics,
} = require("../controllers/analyticsController");

// Analytics routes (business data from WatchSession)
router.get("/video/:videoId", protect, admin, getVideoAnalytics);
router.get("/user/:userId", protect, admin, getUserEngagementReport);
router.get("/platform", protect, admin, getPlatformAnalytics);

module.exports = router;
