const DailyActivity = require("../models/dailyActivitySchema");

/**
 * Get current streak for user
 */
const getCurrentStreak = async (userId) => {
  try {
    const activities = await DailyActivity.find({
      userId,
      "metrics.isValidLearningDay": true,
    }).sort({ date: -1 });

    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < activities.length; i++) {
      const activityDate = new Date(activities[i].date);
      activityDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (activityDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("❌ Streak calculation error:", error);
    return 0;
  }
};

module.exports = {
  getCurrentStreak,
};
