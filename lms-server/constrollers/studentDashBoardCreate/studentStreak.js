// routes/streakRoutes.js
const express = require("express");
const router = express.Router();
const streakController = require("../controllers/streakController");

// സ്ട്രീക്ക് അപ്ഡേറ്റ് ചെയ്യുക (വിദ്യാർത്ഥി പഠിക്കുമ്പോൾ വിളിക്കുക)
router.post("/:studentId/update", streakController.updateStreak);

// സ്ട്രീക്ക് ഹിസ്റ്ററി കാണുക
router.get("/:studentId/history", streakController.getStreakHistory);

// ഫ്രീസ് വാങ്ങുക
router.post("/:studentId/buy-freeze", streakController.buyStreakFreeze);

// റിമൈൻഡർ സെറ്റ് ചെയ്യുക
router.put("/:studentId/reminder", streakController.setReminder);

// ലീഡർബോർഡ് കാണുക
router.get("/leaderboard/:standard?", streakController.getStreakLeaderboard);

module.exports = router;

// controllers/streakController.js
const StudentStreak = require("../models/StudentStreak");
const User = require("../models/User");

// 1. സ്ട്രീക്ക് അപ്ഡേറ്റ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ (ദിവസവും വിളിക്കേണ്ടത്)

exports.updateStreak = async (req, res) => {
  try {
    const { studentId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await StudentStreak.findOne({ studentId });

    // If first time student
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

      return res.status(201).json({
        message: "First streak started 🚀",
        streak,
      });
    }

    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = (today - lastActive) / (1000 * 60 * 60 * 24);

    // Same day → do nothing
    if (diffDays === 0) {
      return res.json({
        message: "Already active today",
        streak,
      });
    }

    // Yesterday active → continue streak
    if (diffDays === 1) {
      streak.currentStreak += 1;

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      streak.lastActiveDate = today;

      await streak.save();

      return res.json({
        message: "Streak continued 🔥",
        streak,
      });
    }

    // Missed days → reset streak
    if (diffDays > 1) {
      streak.currentStreak = 1;
      streak.lastActiveDate = today;

      await streak.save();

      return res.json({
        message: "Streak restarted 💪",
        streak,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating streak",
      error: error.message,
    });
  }
};
// 2. സ്ട്രീക്ക് കണക്കാക്കാനുള്ള ഹെൽപ്പർ ഫംഗ്ഷൻ
function calculateNewStreak(streak, today) {
  if (!streak.lastActiveDate) {
    return {
      newStreak: 1,
      lastActiveDate: today,
      message: "ആദ്യ സ്ട്രീക്ക് ആരംഭിച്ചു!",
    };
  }

  const lastActive = new Date(streak.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  // അവസാനം ആക്റ്റീവ് ആയതും ഇന്നും തമ്മിലുള്ള വ്യത്യാസം
  const diffTime = today - lastActive;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // CASE 1: ഇന്ന് തന്നെ ആക്റ്റീവ് ആയിരുന്നു
  if (diffDays === 0) {
    return {
      newStreak: streak.currentStreak,
      lastActiveDate: streak.lastActiveDate,
      message: "ഇന്ന് ഇതിനകം അപ്ഡേറ്റ് ചെയ്തു!",
    };
  }

  // CASE 2: ഇന്നലെ ആക്റ്റീവ് ആയിരുന്നു (സ്ട്രീക്ക് തുടരുന്നു)
  if (diffDays === 1) {
    return {
      newStreak: streak.currentStreak + 1,
      lastActiveDate: today,
      message: `സ്ട്രീക്ക് തുടരുന്നു! ${streak.currentStreak + 1} ദിവസം`,
    };
  }

  // CASE 3: ഒന്നിൽ കൂടുതൽ ദിവസം വിട്ടു (സ്ട്രീക്ക് ബ്രോക്കൺ)
  if (diffDays > 1) {
    // ഫ്രീസ് ഉണ്ടോ എന്ന് ചെക്ക് ചെയ്യുക
    if (
      streak.streakFreeze.isActive &&
      streak.streakFreeze.freezeCount > 0 &&
      streak.streakFreeze.expiresAt >= today
    ) {
      // ഫ്രീസ് ഉപയോഗിക്കുക
      streak.streakFreeze.freezeCount -= 1;
      streak.streakFreeze.lastFrozenDate = today;

      return {
        newStreak: streak.currentStreak, // സ്ട്രീക്ക് കുറയില്ല
        lastActiveDate: today,
        message: "ഫ്രീസ് ഉപയോഗിച്ചു! സ്ട്രീക്ക് സേവ് ചെയ്തു ❄️",
      };
    }

    // ഫ്രീസ് ഇല്ലെങ്കിൽ സ്ട്രീക്ക് റീസെറ്റ് ആകും
    return {
      newStreak: 1,
      lastActiveDate: today,
      message: "സ്ട്രീക്ക് നഷ്ടപ്പെട്ടു! വീണ്ടും തുടങ്ങാം 💪",
    };
  }

  return {
    newStreak: streak.currentStreak,
    lastActiveDate: streak.lastActiveDate,
    message: "സ്ട്രീക്ക് അതേപടി തുടരുന്നു",
  };
}

// 3. മൈൽസ്റ്റോൺ ചെക്ക് ചെയ്യാനുള്ള ഫംഗ്ഷൻ
function checkMilestone(days) {
  const milestones = [3, 7, 15, 30, 60, 90, 180, 365];
  return milestones.includes(days) ? days : null;
}

// 4. സ്ട്രീക്ക് ഫ്രീസ് വാങ്ങാനുള്ള ഫംഗ്ഷൻ
exports.buyStreakFreeze = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { freezeCount = 1 } = req.body; // എത്ര ഫ്രീസ് വേണം?

    const streak = await StudentStreak.findOne({ studentId });
    if (!streak) {
      return res.status(404).json({ error: "സ്ട്രീക്ക് കണ്ടെത്താനായില്ല" });
    }

    // ഫ്രീസ് എക്സ്പയറി തീയതി (30 ദിവസത്തേക്ക്)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    streak.streakFreeze.isActive = true;
    streak.streakFreeze.freezeCount =
      (streak.streakFreeze.freezeCount || 0) + freezeCount;
    streak.streakFreeze.expiresAt = expiresAt;

    await streak.save();

    res.json({
      message: `${freezeCount} ഫ്രീസ് വാങ്ങി! 30 ദിവസത്തേക്ക് സ്ട്രീക്ക് സുരക്ഷിതം ✅`,
      streak,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. സ്ട്രീക്ക് ഹിസ്റ്ററി കാണാനുള്ള ഫംഗ്ഷൻ
exports.getStreakHistory = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const streak = await StudentStreak.findOne({ studentId }).select(
      "streakHistory milestones longestStreak currentStreak",
    );

    if (!streak) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        streakHistory: [],
        milestones: [],
      });
    }

    // കഴിഞ്ഞ 30 ദിവസത്തെ സ്ട്രീക്ക് സ്റ്റാറ്റസ്
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const wasActive = streak.streakHistory.some((history) => {
        const start = new Date(history.startDate);
        const end = new Date(history.endDate);
        return date >= start && date <= end;
      });

      last30Days.push({
        date: date.toISOString().split("T")[0],
        active: wasActive,
        dayName: date.toLocaleDateString("ml-IN", { weekday: "short" }),
      });
    }

    res.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      last30Days,
      milestones: streak.milestones.sort((a, b) => b.days - a.days),
      totalActiveDays: streak.streakHistory.reduce(
        (acc, curr) => acc + curr.streakLength,
        0,
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. റിമൈൻഡർ സെറ്റ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ
exports.setReminder = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { time, enabled } = req.body; // time: "20:00" ഫോർമാറ്റിൽ

    const streak = await StudentStreak.findOne({ studentId });
    if (!streak) {
      return res.status(404).json({ error: "സ്ട്രീക്ക് കണ്ടെത്താനായില്ല" });
    }

    streak.reminders = {
      enabled: enabled !== undefined ? enabled : true,
      time: time || "20:00",
      lastReminderSent: streak.reminders?.lastReminderSent,
    };

    await streak.save();

    res.json({
      message: `റിമൈൻഡർ ${enabled ? "സെറ്റ് ചെയ്തു" : "ഓഫാക്കി"}! ${time || "20:00"} മണിക്ക് അറിയിക്കും ⏰`,
      reminder: streak.reminders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. സ്ട്രീക്ക് ലീഡർബോർഡ് (ഏറ്റവും കൂടിയ സ്ട്രീക്ക് ഉള്ളവർ)
exports.getStreakLeaderboard = async (req, res) => {
  try {
    const { standard } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await StudentStreak.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $match: standard ? { "student.standard": parseInt(standard) } : {},
      },
      {
        $project: {
          studentName: "$student.name",
          studentAvatar: "$student.avatar",
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: 1,
          milestones: 1,
        },
      },
      { $sort: { currentStreak: -1, longestStreak: -1 } },
      { $limit: limit },
    ]);

    res.json({
      standard: standard || "എല്ലാ ക്ലാസ്സുകളും",
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Streak എന്താണ്? (എന്തിനാ ഇത്?)
// നിങ്ങളുടെ കോഡ് വളരെ സിമ്പിൾ ആയിട്ടുള്ള streak ലോജിക് ആണ് ഉപയോഗിക്കുന്നത്. ഞാൻ മലയാളത്തിൽ വിശദീകരിക്കാം:

// Streak എന്താണ്?
// Streak എന്നാൽ തുടർച്ച എന്നാണ് അർത്ഥം. ഒരു വിദ്യാർത്ഥി തുടർച്ചയായി എത്ര ദിവസം പഠിച്ചു എന്നതിന്റെ കണക്ക്.

// ഉദാഹരണം:

// സുനിൽ ഇന്ന് പഠിച്ചു = Streak 1

// നാളെ വീണ്ടും പഠിച്ചു = Streak 2

// മറ്റന്നാളും പഠിച്ചു = Streak 3

// ഒരു ദിവസം പഠിച്ചില്ല = Streak 0 ആയി പോകും

// എന്തിനാണ് Streak വേണ്ടത്? (Why Streak?)
// പഠന ശീലം ഉണ്ടാക്കാൻ 📚

// ദിവസവും പഠിക്കുന്ന ശീലം വളർത്തിയെടുക്കാൻ

// "ഇന്ന് പഠിച്ചില്ലെങ്കിൽ streak പോകും" എന്ന ചിന്ത പ്രചോദനം നൽകും

// പ്രചോദനം (Motivation) 🔥

// 7 ദിവസം തുടർച്ചയായി പഠിച്ചാൽ ഒരു badge

// 30 ദിവസം ആയാൽ വേറെ badge

// ഇത് കുട്ടികൾക്ക് ആവേശം ഉണ്ടാക്കും

// മത്സരബുദ്ധി (Competition) 🏆

// "എന്റെ ക്ലാസ്സിൽ ആർക്കാണ് കൂടുതൽ streak?" എന്ന ചിന്ത

// Leaderboard-ൽ മുന്നിൽ നിൽക്കാൻ താൽപ്പര്യം

// പുരോഗതി അളക്കാൻ 📊

// എത്ര ദിവസം സ്ഥിരമായി പഠിക്കുന്നു എന്ന് മനസ്സിലാക്കാൻ

// മാതാപിതാക്കൾക്ക് കുട്ടിയുടെ പഠനശീലം മനസ്സിലാക്കാൻ
