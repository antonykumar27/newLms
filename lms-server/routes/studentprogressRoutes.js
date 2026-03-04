// routes/student/standardPageRoutes.js
const express = require("express");
const router = express.Router();
const {
  createStandardChapter,
  getPagesByChapter,
  getPageById,
  updatePage,
  deletePage,
  getPagesBySubject,
  getSinglePageById,
  updateChapter,
} = require("../constrollers/standardPagesController");
const { multerMiddleware } = require("../config/cloudinary");
const { isAuthenticatedUser } = require("../middlewares/authenticate");

// Public routes
router.get("/chapter/:chapterId", getPagesByChapter);
router.get("/subject/:subjectId", getPagesBySubject);
router.get("/pages/:id", getPageById);
router.get("/singlePage/:id", getSinglePageById);

// Protected routes (Authenticated users)
router.post(
  "/pages",
  isAuthenticatedUser,
  multerMiddleware, // Make sure this handles dynamic media_* fields
  createStandardChapter,
);
router.put("/pages/:id", isAuthenticatedUser, multerMiddleware, updateChapter);
router.put("/:id", isAuthenticatedUser, multerMiddleware, updatePage);
router.delete("/:id", isAuthenticatedUser, deletePage);

module.exports = router;
