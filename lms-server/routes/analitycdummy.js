const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const {
  saveWatchTime,
  batchSaveWatchTime,
  getVideoProgress,

  getDailyStudyTime,
  getCourseAnalytics,

  getLectureWatchTime,
} = require("../constrollers/analyticsController");
// const { trackInteraction } = require("../constrollers/interactionController");
const {
  trackInteraction,
  getLastWacthTime,
} = require("../constrollers/studentDashBoardCreate/interactionControllerforAnalytics");
const ReportController = require("../constrollers/interactionController");
const {
  getVideoProgressState,
} = require("../constrollers/analyticsControllersecond");
const rateLimit = require("express-rate-limit");
const interactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many interaction requests, please try again later.",
  },
});
// All routes require authentication
router.use(isAuthenticatedUser);
// // 🔐 Analytics Report (Admin/Teachers only)
// router.get(
//   "/analytics",
//   // authenticate,
//   // authorize(['admin', 'teacher', 'instructor']),
//   ReportController.getAnalyticsReport,
// );

// // 👤 Interaction Report (Own activity or teachers viewing students)
// router.get(
//   "/interactions",
//   // authenticate,
//   ReportController.getInteractionReport,
// );

// 📈 Progress Report (Students own or teachers viewing students)
// router.get(
//   "/progress",
//   // authenticate,
//   ReportController.getProgressReport,
// );

// 👨‍🏫 Teacher Dashboard
// router.get(
//   "/teacher-dashboard",
//   // authenticate,
//   // authorize(["teacher", "instructor"]),
//   ReportController.getTeacherDashboard,
// );

// 📤 Export Reports
// router.get("/export", ReportController.exportReport);
// Watch time endpoints
// router.post("/watch-time", saveWatchTime);

// ✅ Track single interaction
//OK OK OK ITHU USE CHEYYUNNATHANU router.post("/interaction", interactionLimiter, trackInteraction);
// router.get("/page/:pageId/videos/:videoId", getLastWacthTime);
router.post("/analytics/interaction", interactionLimiter, trackInteraction);
router.get("/courses/:courseId/videos/:videoId/state", getVideoProgressState);
// router.get("/interactions/user", getUserInteractions); // ✅ Get user's interactions
// router.get("/interactions/course/:courseId", getCourseInteractions); // ✅ Get course analytics

// router.post("/watch-time/batch", batchSaveWatchTime);
// router.get("/progress/:courseId/:videoId", getVideoProgress);

// Analytics endpoints
// router.get("/stats", getLearningStats);
// router.get("/study-time", getDailyStudyTime);
// router.get("/courses/:courseId", getCourseAnalytics);

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const {
//   updateHeatmap,
//   getYearlyHeatmap,
//   getMonthlyAnalysis,
//   getStreakInfo,
//   addNoteToDay,
//   recalculateHeatmap,
// } = require("../controllers/heatmapController");

// // 🛡️ Authentication middleware (നിങ്ങളുടെ auth system അനുസരിച്ച്)
// const { protect, authorize } = require("../middleware/auth");

// // എല്ലാ റൂട്ടുകൾക്കും authentication ആവശ്യമാണ്
// router.use(protect);

// // 📊 ഹീറ്റ്മാപ്പ് കാണുക
// router.get("/:studentId/:year", getYearlyHeatmap);

// // 📈 മാസ വിശകലനം
// router.get("/:studentId/:year/:month", getMonthlyAnalysis);

// // 🏆 സ്ട്രീക്ക് വിവരങ്ങൾ
// router.get("/:studentId/streaks", getStreakInfo);

// // 🔄 ഹീറ്റ്മാപ്പ് അപ്ഡേറ്റ് ചെയ്യുക (ഇവന്റ് കിട്ടുമ്പോൾ)
// router.post("/:studentId/update", updateHeatmap);

// // 📝 കുറിപ്പ് ചേർക്കുക (ടീച്ചർമാർക്ക് മാത്രം)
// router.post("/:studentId/note", authorize("teacher", "admin"), addNoteToDay);

// // 🔄 ഹീറ്റ്മാപ്പ് പുനഃക്രമീകരിക്കുക (അഡ്മിന് മാത്രം)
// router.post(
//   "/:studentId/:year/recalculate",
//   authorize("admin"),
//   recalculateHeatmap,
// );

// module.exports = router;
