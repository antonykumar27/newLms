const express = require("express");
const {
  getTeacherCourses,
  getTeacherCourseStats,
  createTeacherCourse,
  getTeacherCourseById,
  updateTeacherCourse,
  deleteTeacherCourse,
  publishTeacherCourse,
  unpublishTeacherCourse,
  archiveTeacherCourse,
  duplicateTeacherCourse,
  bulkCourseAction,
  applyAsTeacher,
  getTeacherCoursesById,
  updateTeacherCourseForApprove,
} = require("../constrollers/teacherCourseController");

const { multerMiddleware } = require("../config/cloudinaryCourse");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/authenticate");

const router = express.Router();

/* =========================
   APPLY AS TEACHER (ANY LOGGED-IN USER)
========================= */
router.post(
  "/applyAsTeacher",
  isAuthenticatedUser,
  multerMiddleware,
  applyAsTeacher,
);

/* =========================
   TEACHER-ONLY ROUTES
========================= */
// router.use(isAuthenticatedUser, authorizeRoles("teacher"));
router.use(isAuthenticatedUser);

// Dashboard
router.get("/courses", getTeacherCourses);
router.get("/:id/preview", getTeacherCoursesById);
router.get("/courses/stats", getTeacherCourseStats);

// Create
router.post("/courses", multerMiddleware, createTeacherCourse);

// Read
router.get("/courses/:id", getTeacherCourseById);

// Update & Delete
router.put("/courses/:id", multerMiddleware, updateTeacherCourse);
router.put("/course/:id", multerMiddleware, updateTeacherCourseForApprove);
router.delete("/courses/:id", deleteTeacherCourse);

// Status management
router.put("/courses/:id/publish", publishTeacherCourse);
router.put("/courses/:id/unpublish", unpublishTeacherCourse);
router.put("/courses/:id/archive", archiveTeacherCourse);

// Utilities
router.post("/courses/:id/duplicate", duplicateTeacherCourse);
router.post("/courses/bulk-action", bulkCourseAction);

module.exports = router;
