const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const { multerMiddleware } = require("../config/cloudinaryQuiz");
const isAdmin = true;
// ================= QUESTION CONTROLLER =================
const {
  deleteQuestion,
  getQuestions,
  getQuestionById,
  submitAnswer,
  createQuestion,
  updateQuestion,
  getRandomQuestions,
  updateUserProgress,
  gettextBookById,
  getQuestionquizById,
  getQuestionquizByChapterId,
  getQuestionquizBySubjectId,
} = require("../constrollers/questionController");
const quizAttemptController = require("../constrollers/quizAttemptController");
// ================= CHAPTER CONTROLLER =================
const {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getChaptersBySubject,
  getPopularChapters,
} = require("../constrollers/chapterController");

// ================= PROGRESS CONTROLLER =================
const {
  getMyProgress,
  getChapterProgress,
  bookmarkQuestion,
  addNote,
  getBookmarks,
  getStudyNotes,
  updateProgress,
  getLeaderboard,
  deleteProgress,
} = require("../constrollers/progressController1");

// ================= PUBLIC ROUTES =================

// Chapters
router.get("/chapters", getAllChapters);
router.get("/chapters/:id", getChapterById);

// Questions
router.get("/", getQuestions);
router.get("/questions", getQuestions);

router.get("/questions/:id", getQuestionById);
// ================= Quiz ROUTES =================
// USER ROUTES
router.post(
  "/result",
  isAuthenticatedUser,
  quizAttemptController.createQuizAttempt,
);
router.get(
  "/my-attempts/:quizId",
  isAuthenticatedUser,
  quizAttemptController.getQuizAttemptsByUser,
);
router.get(
  "/my-improvement",
  isAuthenticatedUser,
  quizAttemptController.getStudentImprovementAnalytics,
);
// ADMIN ROUTES
router.get(
  "/getMyAllResults",
  isAuthenticatedUser,

  quizAttemptController.getAllQuizAttemptsByUser,
);

// ADMIN ROUTES
router.get(
  "/all",
  isAuthenticatedUser,

  quizAttemptController.getAllQuizAttempts,
);
// ================= STUDENT ROUTES =================

// Progress
router.get("/my-progress", isAuthenticatedUser, getMyProgress);
router.get("/progress/:chapterId", isAuthenticatedUser, getChapterProgress);
router.delete("/progress/:chapterId", isAuthenticatedUser, deleteProgress);

// Answer & progress update
router.post("/submit-answer", isAuthenticatedUser, submitAnswer);
router.post("/update-progress", isAuthenticatedUser, updateProgress);

// Bookmarks & notes
router.post("/bookmark", isAuthenticatedUser, bookmarkQuestion);
router.post("/add-note", isAuthenticatedUser, addNote);
router.get("/bookmarks", isAuthenticatedUser, getBookmarks);
router.get("/notes", isAuthenticatedUser, getStudyNotes);

// Leaderboard
router.get("/leaderboard", isAuthenticatedUser, getLeaderboard);

// ================= ADMIN ROUTES =================

// Chapters (Admin)
router.post("/createChapter", isAuthenticatedUser, createChapter);
router.put("/chapters/:id", isAuthenticatedUser, updateChapter);
router.delete("/chapters/:id", isAuthenticatedUser, deleteChapter);
router.post("/createTextBook", isAuthenticatedUser, createChapter);

router.get("/textbook/page/:pageId", isAuthenticatedUser, gettextBookById);
// Questions (Admin)
router.post(
  "/questions",
  isAuthenticatedUser,
  multerMiddleware,
  createQuestion,
);
router.get("/questionPage/:pageId", isAuthenticatedUser, getQuestionquizById);
router.get(
  "/chaptersAllget/:chapterId",
  isAuthenticatedUser,
  getQuestionquizByChapterId,
);
router.get(
  "/subjectsAllget/:subjectId",
  isAuthenticatedUser,
  getQuestionquizBySubjectId,
);
router.put("/questions/:id", isAuthenticatedUser, updateQuestion);
router.delete("/questions/:id", isAuthenticatedUser, deleteQuestion);

module.exports = router;
