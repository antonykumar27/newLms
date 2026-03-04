const StudentStreak = require("../../models/StudentStreak");

exports.getStudentStreakDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const streak = await StudentStreak.findOne({ studentId: userId });
    console.log("streak", streak);
    if (!streak) {
      return res.status(404).json({
        success: false,
        message: "Streak data not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ FIX: Check if user was active today using lastActiveDate
    const lastActive = streak.lastActiveDate
      ? new Date(streak.lastActiveDate)
      : null;

    let isActiveToday = false;
    if (lastActive) {
      const lastActiveDate = new Date(lastActive);
      lastActiveDate.setHours(0, 0, 0, 0);
      isActiveToday = lastActiveDate.getTime() === today.getTime();
    }

    // ✅ FIX: Get streak history for additional data
    const currentStreakHistory = streak.streakHistory?.find(
      (history) => history.isActive === true,
    );

    const streakData = {
      // Core streak info
      current: streak.currentStreak || 0,
      best: streak.longestStreak || 0,
      startDate:
        currentStreakHistory?.startDate || streak.lastActiveDate || new Date(),

      // Today's status
      today: {
        completed: isActiveToday,
        // Note: You need to track lessons, minutes, xp separately
        // Either add these fields to schema or get from another collection
        lessons: 0, // You need to implement this
        minutes: 0, // You need to implement this
        xp: 0, // You need to implement this
        lastActive: streak.lastActiveDate,
      },

      // Next milestone (calculate based on current streak)
      nextMilestone: {
        target: getNextMilestone(streak.currentStreak || 0),
        reward: getMilestoneReward(getNextMilestone(streak.currentStreak || 0)),
        daysRemaining:
          getNextMilestone(streak.currentStreak || 0) -
          (streak.currentStreak || 0),
        estimatedDate: calculateEstimatedDate(streak.currentStreak || 0),
      },

      // Streak protection
      protection: {
        freezes: streak.streakFreeze?.freezeCount || 0,
        total: 3,
        nextFreeze: "5 days", // You need to calculate this
      },

      // Milestones achieved
      achievements: {
        current: (streak.milestones || []).map((m) => ({
          name: `${m.days} Day Streak`,
          achieved: true,
          date: m.achievedAt,
        })),
      },

      // Calendar data (you need to generate from streakHistory)
      calendar: {
        month: new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        days: [], // You need to generate this from streakHistory
      },

      // Weekly stats (calculate from streakHistory)
      weekly: {
        active: 0, // Calculate from last 7 days
        total: 7,
        productive: 0, // You need to define what "productive" means
      },
    };

    res.status(200).json({
      success: true,
      data: streakData,
    });
  } catch (error) {
    console.error("Error in getStudentStreakDetails:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Helper functions
function getNextMilestone(currentStreak) {
  const milestones = [7, 14, 30, 60, 100];
  for (let milestone of milestones) {
    if (currentStreak < milestone) return milestone;
  }
  return milestones[milestones.length - 1];
}

function getMilestoneReward(milestone) {
  const rewards = {
    7: "🔥 7-Day Streak Badge",
    14: "⭐ 14-Day Streak Badge + 100 XP",
    30: "🏆 30-Day Streak Badge + 500 XP",
    60: "💎 60-Day Streak Badge + 1000 XP",
    100: "👑 Legendary Streak + 2000 XP",
  };
  return rewards[milestone] || "🎁 Streak Reward";
}

function calculateEstimatedDate(currentStreak) {
  const targetDays = getNextMilestone(currentStreak);
  const remainingDays = targetDays - currentStreak;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + remainingDays);
  return estimatedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
