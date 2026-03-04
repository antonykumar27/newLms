const express = require("express");
const router = express.Router();
const {
  getAllStandardSubjects,
  getStandardSubjectByStandard,
  createStandardSubject,
  updateStandardSubject,
  deleteStandardSubject,
  addMediaToStandardSubject,
  removeMediaFromStandardSubject,
  getStandardSubjectsByRange,
  getAllStandardSubjectsTeacher,
  getAllStandardSubjectsForStudent,
  getAllStandardSubjectsForAdmin,
} = require("../constrollers/standardSubjectController");
const {
  createStandard,
  getAllStandards,
  getThisStandardById,
  updateStandard,
  getAllStandardsForTeacher,
  deleteStandard,
  getAllStandardsForStudents,
} = require("../constrollers/standardController");
const { multerMiddleware } = require("../config/cloudinary");
const { isAuthenticatedUser } = require("../middlewares/authenticate");
// Import middleware if you have authentication/authorization
// const { protect, authorize } = require("../middleware/auth");
//standard
router.post(
  "/createStandard",
  isAuthenticatedUser,
  multerMiddleware,
  createStandard,
);
router.get("/getAllStandards", isAuthenticatedUser, getAllStandards);
router.get(
  "/getAllStandardsForStudents",
  isAuthenticatedUser,
  getAllStandardsForStudents,
);

router.get(
  "/getAllStandardsForTeacher",
  isAuthenticatedUser,
  getAllStandardsForTeacher,
);
router.get("/getThisStandard/:standard", getThisStandardById);
router.put("/updateStandard", multerMiddleware, updateStandard);
router.delete("/deleteStandard/:id", deleteStandard);
// Public routes
router.get(
  "/createdThisStandardSubjectForAdmin",
  isAuthenticatedUser,
  getAllStandardSubjectsForAdmin,
);
router.get(
  "/createdThisStandardSubject",
  isAuthenticatedUser,
  getAllStandardSubjects,
);
router.get(
  "/createdThisStandardSubjectForStudent",
  isAuthenticatedUser,
  getAllStandardSubjectsForStudent,
);
router.get("/teacher", isAuthenticatedUser, getAllStandardSubjectsTeacher);
router.get("/range/:min/:max", getStandardSubjectsByRange);
router.get("/:standard", getStandardSubjectByStandard);

// Protected routes (Admin only)
// router.use(protect); // Apply authentication middleware
// router.use(authorize("admin")); // Apply authorization middleware if needed

router.post(
  "/createStandardSubject",
  isAuthenticatedUser,
  multerMiddleware,
  createStandardSubject,
);
router.put("/updateStandardSubject", multerMiddleware, updateStandardSubject);
router.delete("/:id", deleteStandardSubject);
router.post("/:id/media", addMediaToStandardSubject);
router.delete("/:id/media/:mediaId", removeMediaFromStandardSubject);

module.exports = router;
