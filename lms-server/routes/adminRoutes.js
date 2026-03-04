const express = require("express");
const {
  getAllCourses,
  getCourseById,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  updateCourseStatus,
  deleteCourse,
  getAdminStats,
  getCourseAnalytics,
  getPopularCourses,
  getAllTeacherApplications,

  bulkActionApplications,
  getApplicationStats,
  // Teacher Management Functions
  getAllTeachers,
  getTeacherById,
  getTeacherStats,
  updateTeacherStatus,
  getTeacherCourses,
  searchTeachers,
  bulkUpdateTeacherStatus,
  getAdminDashboardStats,
  getAllCoursesStatus,
} = require("../constrollers/adminCourseController");
const { getAllUsers } = require("../constrollers/userController");
const {
  approveApplication,
  rejectApplication,
  getPendingApplications,
  getApplicationById,
} = require("../constrollers/teacherAllAplication");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/authenticate");

const router = express.Router();

/* =========================
   ALL ADMIN ROUTES REQUIRE AUTHENTICATION
========================= */
// router.use(isAuthenticatedUser, authorizeRoles("admin"));
router.use(isAuthenticatedUser);
/* =========================
   user APPLICATION ROUTES
========================= */
router.get("/users", getAllUsers);
/* =========================
   TEACHER APPLICATION ROUTES
========================= */
router.get("/applications", getPendingApplications);
router.get("/applications/:id", getApplicationById);
router.put("/applications/:id/approve", approveApplication);
router.put("/applications/:id/reject", rejectApplication);
router.post("/applications/bulk-action", bulkActionApplications);
router.get("/teacher-applications/stats", getApplicationStats);

/* =========================
   TEACHER MANAGEMENT ROUTES
========================= */
router.get("/dashboard/stats", getAdminDashboardStats);
router.get("/teachers/stats", getTeacherStats);
router.get("/teachers", getAllTeachers);
router.get("/teachers/:id", getTeacherById);
router.get("/teachers/:id/courses", getTeacherCourses);
router.put("/teachers/:id/status", updateTeacherStatus);
router.get("/teachers/search", searchTeachers);
router.put("/teachers/bulk-status", bulkUpdateTeacherStatus);

/* =========================
   DASHBOARD & ANALYTICS ROUTES
========================= */
router.get("/dashboard/stats", getAdminStats);
router.get("/courses/analytics/:id", getCourseAnalytics);
router.get("/courses/popular", getPopularCourses);

/* =========================
   COURSE MANAGEMENT ROUTES
========================= */
router.get("/courses", getAllCourses);
router.get("/courses/stats", getAllCoursesStatus);
router.get("/courses/pending", getPendingCourses);
router.get("/courses/:id", getCourseById);

/* =========================
   COURSE MODERATION ROUTES
========================= */
router.put("/courses/:id/approve", approveCourse);
router.put("/courses/:id/reject", rejectCourse);
router.put("/courses/:id/status", updateCourseStatus);

/* =========================
   COURSE OPERATIONS ROUTES
========================= */
router.delete("/courses/:id", deleteCourse);

module.exports = router;
