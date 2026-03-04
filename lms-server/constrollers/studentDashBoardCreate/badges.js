// ==============================================
// CHECK AND AWARD BADGES - ENTERPRISE VERSION 🔥
// ==============================================
const mongoose = require("mongoose");
const {
  BadgeDefinition,
  StudentBadge,
  BadgeProgress,
} = require("../../models/StudentBadge.js");
const StudentStreak = require("../../models/StudentStreak.js");

const checkAndAwardBadges = async (userId, badgeData) => {
  try {
    const { type, subjectId, videoId } = badgeData;

    // ✅ Get ONLY active badges (with lean() for performance)
    const badgeDefinitions = await BadgeDefinition.find({
      isActive: true,
    }).lean();

    if (!badgeDefinitions.length) {
      return [];
    }

    // ✅ Get all earned badges once (with lean())
    const earnedBadges = await StudentBadge.find({ studentId: userId })
      .select("badgeId")
      .lean();

    const earnedSet = new Set(earnedBadges.map((b) => b.badgeId.toString()));

    // ✅ OPTIMIZATION: Fetch streak once if needed
    let streakDoc = null;
    const hasStreakBadges = badgeDefinitions.some(
      (b) => b.criteria?.type === "streak",
    );

    if (hasStreakBadges) {
      streakDoc = await StudentStreak.findOne({ studentId: userId })
        .select("currentStreak")
        .lean();
    }

    if (streakDoc) {
    }

    const newlyEarnedBadges = [];

    for (const badge of badgeDefinitions) {
      // Skip if already earned
      if (earnedSet.has(badge._id.toString())) {
        continue;
      }

      let earned = false;
      let progress = 0;
      let targetValue = 0;
      let currentValue = 0;

      // ✅ Check badge criteria
      switch (badge.criteria?.type) {
        case "streak":
          targetValue = badge.criteria.threshold || 0;
          currentValue = streakDoc?.currentStreak || 0;

          if (targetValue > 0) {
            if (currentValue >= targetValue) {
              earned = true;
              progress = 100;
            } else {
              progress = (currentValue / targetValue) * 100;
            }
          }
          break;

        case "first_video":
          targetValue = 1;
          currentValue = 1;
          if (type === "video_end" || type === "video_complete") {
            earned = true;
            progress = 100;
          }
          break;

        default:
          continue;
      }

      // ✅ Update progress
      await BadgeProgress.findOneAndUpdate(
        { studentId: userId, badgeId: badge._id },
        {
          $set: {
            progress: Math.min(progress, 100),
            lastUpdated: new Date(),
            targetValue,
            currentValue,
          },
          $inc: { attempts: 1 },
        },
        { upsert: true, new: true },
      );

      // ✅ Award badge if earned (with race condition protection)
      if (earned) {
        // ✅ Safe ObjectId conversion
        let safeVideoId = undefined;
        if (videoId && mongoose.Types.ObjectId.isValid(videoId)) {
          safeVideoId = new mongoose.Types.ObjectId(videoId);
        }

        // ✅ Use findOneAndUpdate with upsert to prevent race conditions
        const studentBadge = await StudentBadge.findOneAndUpdate(
          {
            studentId: userId,
            badgeId: badge._id,
          },
          {
            $setOnInsert: {
              studentId: userId,
              badgeId: badge._id,
              earnedAt: new Date(),
              context: {
                streakAtTime:
                  badge.criteria?.type === "streak" ? currentValue : undefined,
                subjectId: subjectId || undefined,
              },
              metadata: {
                source: type,
                videoId: safeVideoId,
              },
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );

        newlyEarnedBadges.push(studentBadge);
        earnedSet.add(badge._id.toString()); // Prevent duplicate in same batch
      }
    }

    return newlyEarnedBadges;
  } catch (error) {
    console.error("❌ Badge check failed:", error);
    return [];
  }
};

module.exports = checkAndAwardBadges;
