const express = require("express");
const router = express.Router();

const { isAuthenticatedUser } = require("../middlewares/authenticate");
//studentDashBoardProgressGet
const {
  getStudentDashboard,
} = require("../constrollers/studentDashBoardDetailsGet/studentDashBoardProgressGet");

router.get(
  "/progress/allStudentDashBoard",
  isAuthenticatedUser,
  getStudentDashboard,
);

module.exports = router;
