const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middlewares/authenticate");

const {
  trackInteraction,
} = require("../constrollers/studentDashBoardCreate/interactionControllerforAnalytics");

const {
  getVideoProgressState,
} = require("../constrollers/analyticsControllersecond");

// All routes require authentication
router.use(isAuthenticatedUser);

router.post("/analytics/interaction", trackInteraction);
router.get("/courses/:courseId/videos/:videoId/state", getVideoProgressState);

module.exports = router;
