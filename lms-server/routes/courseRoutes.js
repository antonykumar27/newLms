const express = require("express");
const {
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  generateOtp,
  likeOrUnlikeVideo,
  getLikeStatus,
  getVideoLikes,
  likeOrUnlikeCourseOnly,
  addOrRemoveWishlist,
  trackCourseShare,
  addOrRemoveCourseWishlist,
  addToCourseOrder,
  getToCourseOrder,
  getCourseContent,
  getStudentProfile,
  getTeacherProfile,
} = require("../constrollers/courseController");
const {
  getCourseProgress,
  getAllCoursesProgress,
} = require("../constrollers/progressController");

const { multerMiddleware } = require("../config/cloudinary");
const { isAuthenticatedUser } = require("../middlewares/authenticate");

const router = express.Router();

/* ================= COURSE ================= */

// Create course
router.post("/", isAuthenticatedUser, multerMiddleware, createCourse);
// Create share
router.post(
  "/courses/:id/share",
  isAuthenticatedUser,
  multerMiddleware,
  trackCourseShare,
);
// Get all courses
router.get("/", getCourses);

// Get single course
router.get("/:id", isAuthenticatedUser, getCourse);

// Update course
router.put("/:id", isAuthenticatedUser, updateCourse);

// Delete course
router.delete("/:id", isAuthenticatedUser, deleteCourse);
///////////////////////couse order

router.post(
  "/courses/:standardId/enroll",
  isAuthenticatedUser,
  addToCourseOrder,
);
router.get("/courses/enroll", isAuthenticatedUser, getToCourseOrder);
router.get("/entolledCorses/:courseId", isAuthenticatedUser, getCourseContent);
// router.get("/courses/myown/profile", isAuthenticatedUser, getStudentProfile);
router.get("/courses/myown/profile", isAuthenticatedUser, getTeacherProfile);

/* ================= VIDEO LIKE ================= */

router.post(
  "/:courseId/videos/:videoId/like",
  isAuthenticatedUser,
  likeOrUnlikeVideo,
);
router.post(
  "/:courseId/videos/:videoId/wishlist",
  isAuthenticatedUser,
  addOrRemoveWishlist,
);
router.post(
  "/courses/:courseId/wishlist",
  isAuthenticatedUser,
  addOrRemoveCourseWishlist,
);
router.post(
  "/courses/:courseId/progress",
  isAuthenticatedUser,
  addOrRemoveCourseWishlist,
);
router.get(
  "/:courseId/videos/:videoId/like-status",
  isAuthenticatedUser,
  getLikeStatus,
);

router.get("/:courseId/videos/:videoId/likes", getVideoLikes);
/* ================= progress ================= */
// Get progress for specific course
router.get(
  "/courses/:courseId/progress",
  isAuthenticatedUser,
  getCourseProgress,
);

// Get progress for all enrolled courses
router.get("/progress/courses", isAuthenticatedUser, getAllCoursesProgress);
/* ================= COURSE LIKE ================= */

router.post("/:courseId/like", isAuthenticatedUser, likeOrUnlikeCourseOnly);

/* ================= VDOCIPHER OTP ================= */

router.get("/otp/:videoId", isAuthenticatedUser, generateOtp);

module.exports = router;
