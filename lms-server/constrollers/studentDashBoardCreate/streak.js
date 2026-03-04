const StudentStreak = require("../../models/StudentStreak.js");
const UserProgress = require("../../models/userProgressSchema.js");

// ==============================================
// PRODUCTION READY STREAK SYSTEM 🔥
// ==============================================
const checkAndUpdateStreak = async (userId, date) => {
  try {
    // ✅ 1️⃣ Validate input

    const today = new Date(date);

    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(today);
    const endOfDay = new Date(today);

    endOfDay.setHours(23, 59, 59, 999);

    // ✅ CORRECT VALIDATION - Based on TODAY's activity
    const todaysProgress = await UserProgress.find({
      userId: userId,
      updatedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .lean()
      .catch((err) => {
        console.error("❌ MongoDB query failed:", err);
        return [];
      });

    // Calculate today's total watch time from sessions
    let todayWatchTime = 0;
    let completedToday = false;

    todaysProgress.forEach((progress) => {
      // Check if completed today
      if (progress.isCompleted) {
        const lastCompletion = progress.completionHistory
          ?.filter((h) => h.type === "first" || h.type === "revision")
          .find(
            (h) =>
              new Date(h.completedAt) >= startOfDay &&
              new Date(h.completedAt) <= endOfDay,
          );

        if (lastCompletion) completedToday = true;
      }

      // Calculate watch time from today's sessions
      if (progress.pageSessions && Array.isArray(progress.pageSessions)) {
        progress.pageSessions.forEach((session) => {
          const sessionStart = new Date(session.startTime);
          if (sessionStart >= startOfDay && sessionStart <= endOfDay) {
            todayWatchTime += session.duration || 0;
          }
        });
      }
    });

    // 🎯 Validation rules
    const hasValidActivity = completedToday || todayWatchTime >= 600; // 10 minutes

    if (!hasValidActivity) {
      return null;
    }

    // 🔍 Find streak
    let streak = await StudentStreak.findOne({ studentId: userId });

    // 🆕 New user
    if (!streak) {
      return await StudentStreak.create({
        studentId: userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        streakStartDate: today,
        streakFreeze: {
          isActive: true,
          freezeCount: 3,
          expiresAt: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        milestones: [],
        streakHistory: [],
      });
    }

    // 📅 Get last active date (SAFE - no mutation)
    const lastActiveDate = streak.lastActiveDate
      ? new Date(streak.lastActiveDate)
      : null;

    if (lastActiveDate) {
      lastActiveDate.setHours(0, 0, 0, 0);
    }

    const lastActive = lastActiveDate?.getTime();
    const todayTime = today.getTime();

    // Same day
    if (lastActive === todayTime) {
      return streak;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    // ❄️ Check freeze expiry
    if (
      streak.streakFreeze.expiresAt &&
      new Date(streak.streakFreeze.expiresAt) < today
    ) {
      streak.streakFreeze.isActive = false;
      streak.streakFreeze.freezeCount = 0;
      await streak.save();
    }

    const daysMissed = lastActive
      ? Math.floor((todayTime - lastActive) / (1000 * 60 * 60 * 24)) - 1
      : 0;

    // ✅ Streak continues
    if (lastActive === yesterdayTime) {
      const updated = await StudentStreak.findOneAndUpdate(
        { studentId: userId, lastActiveDate: streak.lastActiveDate },
        {
          $inc: { currentStreak: 1 },
          $set: { lastActiveDate: today },
          $max: { longestStreak: streak.currentStreak + 1 },
        },
        { new: true },
      );

      // 🏆 Milestone check
      const milestoneDays = [7, 30, 50, 100, 200, 365];
      if (milestoneDays.includes(updated.currentStreak)) {
        const exists = updated.milestones.some(
          (m) => m.days === updated.currentStreak,
        );
        if (!exists) {
          updated.milestones.push({
            days: updated.currentStreak,
            achievedAt: new Date(),
            badgeAwarded: true,
          });
          await updated.save();
        }
      }

      return updated;
    }

    // ❄️ Use freeze (only for 1 day)
    if (
      streak.streakFreeze.isActive &&
      streak.streakFreeze.freezeCount > 0 &&
      daysMissed === 1
    ) {
      const updated = await StudentStreak.findOneAndUpdate(
        { studentId: userId },
        {
          $inc: { "streakFreeze.freezeCount": -1 },
          $set: {
            lastActiveDate: today,
            "streakFreeze.lastFrozenDate": yesterday,
          },
        },
        { new: true },
      );

      if (updated.streakFreeze.freezeCount === 0) {
        updated.streakFreeze.isActive = false;
        await updated.save();
      }

      return updated;
    }

    // 💔 Streak broken

    // Save to history
    if (streak.currentStreak > 0) {
      await StudentStreak.updateOne(
        { studentId: userId },
        {
          $push: {
            streakHistory: {
              startDate: streak.streakStartDate,
              endDate: lastActiveDate || yesterday,
              streakLength: streak.currentStreak,
              isActive: false,
            },
          },
        },
      );
    }

    // Reset streak
    const resetStreak = await StudentStreak.findOneAndUpdate(
      { studentId: userId },
      {
        $set: {
          currentStreak: 1,
          streakStartDate: today,
          lastActiveDate: today,
        },
      },
      { new: true },
    );

    return resetStreak;
  } catch (error) {
    console.error("🔥 Streak error:", error);
    return null;
  }
};

module.exports = checkAndUpdateStreak;
