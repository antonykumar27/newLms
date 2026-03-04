const { updateDailyActivity } = require("./dailyActivity");
const { updateStudentHeatmap } = require("./heatmap");
const checkAndUpdateStreak = require("./streak");
const checkAndAwardBadges = require("./badges");
const updateStudentInsights = require("./insights");
const { calculateIntensity } = require("./calculators");
const { isValidForStreak } = require("./validators");

// ==============================================
// MAIN BACKGROUND TASK ORCHESTRATOR
// ==============================================
const runAllBackgroundTasks = async (
  interactionPayload,
  normalizedData,
  additionalData = {},
) => {
  try {
    const { userId, type, videoId, subjectId, standardId, chapterId, pageId } =
      interactionPayload;

    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Update Daily Activity
    await updateDailyActivity(userId, {
      date: today,
      type,
      videoId,
      subjectId,
      chapterId,
      pageId,
      data: { ...normalizedData, watchTimeMs: additionalData.watchTimeMs },
    });

    // 2️⃣ Update Heatmap
    await updateStudentHeatmap(userId, {
      date: today,
      type,
      intensity: calculateIntensity(type, normalizedData),
      subjectId,
      videoId,
    });

    // 3️⃣ Update Streak
    const streakUpdated = await checkAndUpdateStreak(
      userId,
      today,
      type,
      subjectId,
      videoId,
    );

    // 4️⃣ Check Badges
    let awardedBadges = [];

    awardedBadges = await checkAndAwardBadges(userId, {
      type,
      subjectId,
      videoId,
      currentStreak: streakUpdated?.currentStreak,
      activityDate: today,
    });

    // 5️⃣ Update Insights
    await updateStudentInsights(userId, {
      type,
      subjectId,
      videoId,
      chapterId,
      pageId,
      date: today,
      data: normalizedData,
    });

    // ✅ IMPORTANT: RETURN DATA
    return {
      streakData: streakUpdated || null,
      badges: awardedBadges || [],
    };
  } catch (error) {
    console.error("❌ Background tasks failed:", error);
    return {
      streakData: null,
      badges: [],
    };
  }
};

module.exports = runAllBackgroundTasks;
