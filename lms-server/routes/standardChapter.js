const express = require("express");
const router = express.Router();
const {
  createStandardChapter,
  getAllStandardChapter,
  getChapterById,
  updateChapter,
  deleteChapter,
  addMediaToChapter,
  removeMediaFromChapter,
  getChaptersBySubject,
  getTeacherAndStudentsAndSubjectBySubject,
  getChaptersBySubjectRate,
} = require("../constrollers/standardChapterController");
const { multerMiddleware } = require("../config/cloudinary");
const { isAuthenticatedUser } = require("../middlewares/authenticate");

// Public routes
router.get("/", getAllStandardChapter);
router.get("/chapters/subject/:subjectId", getChaptersBySubject);
router.get(
  "/getSubjectRelatedDataById/:subjectId",
  getTeacherAndStudentsAndSubjectBySubject,
);
router.get("/chapters/:subjectId", getChaptersBySubject);
// here get standard rate
router.get("/standardRate/:subjectId", getChaptersBySubjectRate);

// Protected routes (Authenticated users)
router.post(
  "/chapters",
  isAuthenticatedUser,
  multerMiddleware,
  createStandardChapter,
);
router.put("/:id", isAuthenticatedUser, multerMiddleware, updateChapter);
router.delete("/:id", isAuthenticatedUser, deleteChapter);
router.post(
  "/:id/media",
  isAuthenticatedUser,
  multerMiddleware,
  addMediaToChapter,
);
router.delete(
  "/:id/media/:mediaId",
  isAuthenticatedUser,
  removeMediaFromChapter,
);

module.exports = router;
