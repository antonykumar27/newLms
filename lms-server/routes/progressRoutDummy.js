const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middlewares/authenticate");
//studentDashBoardProgressGet
const {
  getStudentDashboardResume,
} = require("../constrollers/studentDashBoardDetailsGet/studentDashBoardProgressGet");
const {
  getCourseProgress,

  getAllCoursesProgress,
  getUserOverallProgress,
  updatetrackSpentTimeProgress,
} = require("../constrollers/progressController");
const {
  getUserInteractionProfile,
  getPlatformInteractionAnalytics,
  getInteractionAlerts,
  getVideoInteractionDeepDive,
} = require("../constrollers/interactionControllerforAnalytics1");
const {
  getUserWatchProgress,
  getUserAllProgress,
  getContinueWatching,
} = require("../constrollers/analyticsForChecking");
const { getStudentDashboard } = require("../constrollers/studentDashBoard");
// const {
//   getStudentDashboardResume,
// } = require("../constrollers/studentProgressGet/studentDashBoard2");
const ReportController = require("../constrollers/interactionReports");
// 🔹 All routes are protected
router.get(
  "/reports/progress/now",
  isAuthenticatedUser,
  // authenticate,
  getUserOverallProgress,
);
// 📊 Get progress for a specific course

router.get(
  "/progress",
  isAuthenticatedUser,
  // authenticate,
  ReportController.getProgressReport,
);

// 📈 Get progress for all enrolled courses
router.get("/all", isAuthenticatedUser, getAllCoursesProgress);
//ithu UserAnalytics full Data Access Cheyyan Ullathanu
router.get(
  "/analytics/user/:userId",
  isAuthenticatedUser,
  getUserInteractionProfile,
);
//ithu Ceoyku full Data Access Cheyyan Ullathanu
router.get(
  "/progressRoutes/interaction-analytics/platform",
  isAuthenticatedUser,
  getPlatformInteractionAnalytics,
);
router.get(
  "/progressRoutes/interaction-analytics/video/:userId/deepdive",
  isAuthenticatedUser,
  getVideoInteractionDeepDive,
);
router.get(
  "/progressRoutes/interaction-analytics/alerts/history",
  isAuthenticatedUser,
  getInteractionAlerts,
);
router.get(
  "/progressRoutes/interaction-analytics/alerts",
  isAuthenticatedUser,
  getInteractionAlerts,
);
// 🎯 Update progress for a lecture

// 🎯 Update progress for a lecture
router.post(
  "/trackSpentTime",
  isAuthenticatedUser,
  updatetrackSpentTimeProgress,
);
// User routes (fast UI data from WatchTime)
router.get(
  "/progress/:videoId/:pageId",
  isAuthenticatedUser,
  getUserWatchProgress,
);
// router.get("/progress/all", isAuthenticatedUser, getUserAllProgress);
router.get("/progress/all", isAuthenticatedUser, getStudentDashboard);
router.get(
  "/progress/allStudentDashBoard",
  isAuthenticatedUser,
  getStudentDashboardResume,
);
router.get(
  "/progress/continue-watching",
  isAuthenticatedUser,
  getContinueWatching,
);

module.exports = router;
