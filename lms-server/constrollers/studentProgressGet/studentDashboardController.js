// controllers/analytics/studentDashboardController.js

const { validateEnrollment, fetchDashboardData } = require("./dataFetcher");
const {
  buildProgressFilter,
  buildQuizFilter,
  parseIncludeSections,
} = require("./filterBuilder");
const { buildResponse } = require("./responseBuilder");

/**
 * MASTER ANALYTICS ENDPOINT - Get all student progress data in one call
 * @route GET /api/analytics/student/dashboard
 * @access Private
 */
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const queryParams = req.query;

    // Parse which sections to include
    const sections = parseIncludeSections(queryParams.include);

    // Validate enrollment and get enrolled standard
    const enrollment = await validateEnrollment(userId, queryParams.standardId);
    const enrolledStandardId = enrollment.standard._id;

    // Build filters
    const progressFilter = buildProgressFilter(
      userId,
      enrolledStandardId,
      queryParams,
    );
    const quizFilter = buildQuizFilter(userId, queryParams);

    // Fetch all data in parallel
    const [
      user,
      streak,
      subjects,
      chapters,
      pages,
      videos,
      watchTimeProgress,
      quizAttempts,
      userProgress,
      dailyUniqueStats,
      earnedBadges,
      badgeProgress,
      classLeaderboard,
      subjectLeaderboard,
      heatmapData,
    ] = await fetchDashboardData(
      userId,
      enrolledStandardId,
      progressFilter,
      quizFilter,
      sections,
      queryParams,
    );

    // Build response with all data
    const data = {
      user,
      streak,
      subjects,
      chapters,
      pages,
      videos,
      watchTimeProgress,
      quizAttempts,
      userProgress,
      dailyUniqueStats,
      earnedBadges,
      badgeProgress,
      classLeaderboard,
      subjectLeaderboard,
      heatmapData,
    };

    const response = buildResponse(data, queryParams, enrollment, sections);

    res.json(response);
  } catch (error) {
    console.error("Error in getStudentDashboard:", error);

    if (
      error.message.includes("enrollment") ||
      error.message.includes("Access denied")
    ) {
      return res.status(403).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
