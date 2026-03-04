// Step 2: Controller Clean ആയി

// 📁 controllers/studentStreakController.js

const {
  updateStudentStreakLogic,
} = require("../services/studentStreakService");

exports.updateStreak = async (req, res) => {
  try {
    const { studentId } = req.body;

    const result = await updateStudentStreakLogic(studentId);

    return res.status(result.status).json({
      message: result.message,
      streak: result.streak,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating streak",
      error: error.message,
    });
  }
};

// Step 1: Service File Create ചെയ്യാം

// 📁 services/studentStreakService.js

const StudentStreak = require("../models/studentStreakModel");

exports.updateStudentStreakLogic = async (studentId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = await StudentStreak.findOne({ studentId });

  // First time
  if (!streak) {
    streak = await StudentStreak.create({
      studentId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      streakHistory: [
        {
          startDate: today,
          endDate: today,
          streakLength: 1,
          isActive: true,
        },
      ],
    });

    return {
      message: "First streak started 🚀",
      streak,
      status: 201,
    };
  }

  const lastActive = new Date(streak.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffDays = (today - lastActive) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return {
      message: "Already active today",
      streak,
      status: 200,
    };
  }

  if (diffDays === 1) {
    streak.currentStreak += 1;

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = today;
    await streak.save();

    return {
      message: "Streak continued 🔥",
      streak,
      status: 200,
    };
  }

  if (diffDays > 1) {
    streak.currentStreak = 1;
    streak.lastActiveDate = today;
    await streak.save();

    return {
      message: "Streak restarted 💪",
      streak,
      status: 200,
    };
  }
};
