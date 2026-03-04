const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middlewares/authenticate");
//studentDashBoardProgressGet
const {
  getStudentStreakDetails,
} = require("../constrollers/studentDashBoardDetailsGet/studentAllDetailsGetAndSendRoutes");

router.get("/myStreak", isAuthenticatedUser, getStudentStreakDetails);

module.exports = router;
