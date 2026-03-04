// services/filterBuilder.js

const mongoose = require("mongoose");

/**
 * Builds progress filter based on query parameters
 */
exports.buildProgressFilter = (userId, enrolledStandardId, queryParams) => {
  const { standardId, subjectId, chapterId, pageId, fromDate, toDate } =
    queryParams;

  const progressFilter = { userId };

  if (standardId) progressFilter.standardId = standardId;
  else progressFilter.standardId = enrolledStandardId;

  if (subjectId) progressFilter.subjectId = subjectId;
  if (chapterId) progressFilter.chapterId = chapterId;
  if (pageId) progressFilter.pageId = pageId;

  // Date range filter
  if (fromDate || toDate) {
    progressFilter.lastAccessed = {};
    if (fromDate) progressFilter.lastAccessed.$gte = new Date(fromDate);
    if (toDate) progressFilter.lastAccessed.$lte = new Date(toDate);
  }

  return progressFilter;
};

/**
 * Builds quiz filter based on query parameters
 */
exports.buildQuizFilter = (userId, queryParams) => {
  const { subjectId, chapterId, pageId, fromDate, toDate } = queryParams;

  const quizFilter = { userId };

  if (subjectId) quizFilter["contextIds.subjectId"] = subjectId;
  if (chapterId) quizFilter["contextIds.chapterId"] = chapterId;
  if (pageId) quizFilter["contextIds.pageId"] = pageId;
  if (fromDate) quizFilter.createdAt = { $gte: new Date(fromDate) };
  if (toDate) quizFilter.createdAt = { $lte: new Date(toDate) };

  return quizFilter;
};

/**
 * Parses include parameter into sections array
 */
exports.parseIncludeSections = (includeParam) => {
  const defaultSections =
    "overall,content,watchtime,quiz,engagement,achievements,leaderboard,heatmap,activity";
  const sections = (includeParam || defaultSections)
    .split(",")
    .map((s) => s.trim());
  return sections;
};
