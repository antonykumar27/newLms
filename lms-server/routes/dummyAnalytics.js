// routes/analytics.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getStudentStreak,
  updateStreak,
  getWeeklyActivity,
  getMonthlyActivity,
  getYearlyHeatmap,
  getEarnedBadges,
  getNextBadges,
  getSmartInsights,
  generateInsights,
  getClassLeaderboard,
  getSubjectLeaderboard,
  createStudentAnalytics,
  getAllStudentAnalytics,
  getStudentAnalytics,
  updateStudentAnalytics,
  deleteStudentAnalytics,
  updateDailyActivity,
  addBadge,
  updateSubjectPerformance,
  generateWeeklySummary,
} from "../constrollers/dummyAnalyticController.js";

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(authorize("student", "admin"));

// Streak routes
router.get("/streak", getStudentStreak);
router.post("/streak/update", updateStreak);

// Activity routes
router.get("/weekly", getWeeklyActivity);
router.get("/monthly", getMonthlyActivity);
router.get("/heatmap", getYearlyHeatmap);

// Badge routes
router.get("/badges", getEarnedBadges);
router.get("/badges/next", getNextBadges);

// Insights routes
router.get("/insights", getSmartInsights);
router.post("/insights/generate", generateInsights);

// Leaderboard routes
router.get("/leaderboard/class", getClassLeaderboard);
router.get("/leaderboard/subject/:subjectId", getSubjectLeaderboard);
router.route("/").post(createStudentAnalytics).get(getAllStudentAnalytics);

router
  .route("/:studentId")
  .get(getStudentAnalytics)
  .put(updateStudentAnalytics)
  .delete(deleteStudentAnalytics);

router.post("/:studentId/daily-activity", updateDailyActivity);
router.post("/:studentId/badges", addBadge);
router.post("/:studentId/subject-performance", updateSubjectPerformance);
router.post("/:studentId/weekly-summary", generateWeeklySummary);

export default router;
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

// Import controllers
import {
  getStudentStreak,
  updateStreak,
  resetStreak,
  updateStreakFreeze
} from '../controllers/streakController.js';

import {
  trackActivity,
  getDailyActivity,
  getWeeklyActivity,
  getMonthlyActivity
} from '../controllers/activityController.js';

import {
  getHeatmap,
  regenerateHeatmap,
  getHeatmapCellDetails,
  updateHeatmapNote
} from '../controllers/heatmapController.js';

import {
  getBadgeDefinitions,
  getEarnedBadges,
  getNextBadges,
  checkAndAwardBadges,
  toggleBadgeFavorite
} from '../controllers/badgeController.js';

import {
  getClassLeaderboard,
  getSubjectLeaderboard,
  getGlobalLeaderboard,
  getMyLeaderboardStats
} from '../controllers/leaderboardController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// ==================== STREAK ROUTES ====================
router.get('/streak', getStudentStreak);
router.post('/streak/update', updateStreak);
router.post('/streak/freeze', updateStreakFreeze);
router.post('/streak/reset', authorize('admin'), resetStreak);

// ==================== ACTIVITY ROUTES ====================
router.post('/activity/track', trackActivity);
router.get('/activity/daily', getDailyActivity);
router.get('/activity/weekly', getWeeklyActivity);
router.get('/activity/monthly', getMonthlyActivity);

// ==================== HEATMAP ROUTES ====================
router.get('/heatmap', getHeatmap);
router.post('/heatmap/regenerate', regenerateHeatmap);
router.get('/heatmap/cell', getHeatmapCellDetails);
router.post('/heatmap/note', updateHeatmapNote);

// ==================== BADGE ROUTES ====================
router.get('/badges/definitions', getBadgeDefinitions);
router.get('/badges/earned', getEarnedBadges);
router.get('/badges/next', getNextBadges);
router.post('/badges/check', checkAndAwardBadges);
router.patch('/badges/:badgeId/toggle-favorite', toggleBadgeFavorite);

// ==================== LEADERBOARD ROUTES ====================
router.get('/leaderboard/class', getClassLeaderboard);
router.get('/leaderboard/subject/:subjectId', getSubjectLeaderboard);
router.get('/leaderboard/global', getGlobalLeaderboard);
router.get('/leaderboard/my-stats', getMyLeaderboardStats);

export default router;