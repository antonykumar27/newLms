const mongoose = require("mongoose");
const Video = require("../../models/videoModel");
const UserProgress = require("../../models/userProgressSchema");

// ==============================================
// UPDATE USER PROGRESS (PRODUCTION READY)
// ALL FIXES APPLIED - DUPLICATE KEY & ANTI-CHEAT FIXED
// ==============================================

/**
 * Calculate total unique watched time from ranges
 */
const calculateTotalWatched = (ranges, duration) => {
  if (!ranges || ranges.length === 0) return 0;

  let totalWatched = 0;
  let lastEnd = -1;

  const sortedRanges = [...ranges]
    .map((r) => ({
      start: Math.max(0, Math.min(r.start, duration)),
      end: Math.max(0, Math.min(r.end, duration)),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);

  for (const range of sortedRanges) {
    if (range.start > lastEnd) {
      totalWatched += range.end - range.start;
      lastEnd = range.end;
    } else if (range.end > lastEnd) {
      totalWatched += range.end - lastEnd;
      lastEnd = range.end;
    }
  }

  return parseFloat(totalWatched.toFixed(2));
};

/**
 * Merge watch ranges to prevent duplicates and overlaps
 */
// const mergeWatchRanges = (existingRanges, newRange) => {
//   if (!existingRanges || existingRanges.length === 0) {
//     return [newRange];
//   }

//   // Add new range to existing ones
//   const allRanges = [
//     ...existingRanges.map((r) => ({
//       start: parseFloat(r.start.toFixed(2)),
//       end: parseFloat(r.end.toFixed(2)),
//     })),
//     newRange,
//   ];

//   // Sort by start time
//   const sorted = allRanges.sort((a, b) => a.start - b.start);

//   // Merge overlapping ranges
//   const merged = [];
//   let current = sorted[0];

//   for (let i = 1; i < sorted.length; i++) {
//     if (sorted[i].start <= current.end + 2) {
//       // Overlap threshold 2 seconds
//       current.end = Math.max(current.end, sorted[i].end);
//     } else {
//       merged.push(current);
//       current = sorted[i];
//     }
//   }
//   merged.push(current);

//   return merged;
// };
const mergeWatchRanges = (existingRanges, newRange) => {
  // 1️⃣ എല്ലാ റേഞ്ചുകളും ഒരുമിപ്പിക്കുക
  const allRanges = [...existingRanges, newRange];

  // 2️⃣ തുടക്കം അനുസരിച്ച് ക്രമീകരിക്കുക
  allRanges.sort((a, b) => a.start - b.start);

  // 3️⃣ ലയിപ്പിക്കുക
  const merged = [];
  let current = allRanges[0];

  for (let i = 1; i < allRanges.length; i++) {
    // 2 സെക്കൻഡ് gap വരെ അനുവദിക്കുക
    if (allRanges[i].start <= current.end + 2) {
      // Overlap ആണ് - end വലുതാക്കുക
      current.end = Math.max(current.end, allRanges[i].end);
    } else {
      // Overlap അല്ല - current range save ചെയ്ത് പുതിയത് തുടങ്ങുക
      merged.push(current);
      current = allRanges[i];
    }
  }

  // അവസാനത്തെ range ചേർക്കുക
  merged.push(current);

  return merged;
};

/**
 * Validate if a watch range is legitimate (FIXED ANTI-CHEAT)
 */
const isValidWatchRange = (start, end, maxDuration, action) => {
  // Block seek actions from creating ranges
  if (action === "seek" || action === "seeked") return false;

  const rangeSize = end - start;

  // Basic validations
  if (start < 0 || end > maxDuration) return false;
  if (end <= start) return false;

  // FIXED: For small videos (< 60 sec), allow full watch
  if (maxDuration <= 60) {
    // Allow full video watch for short videos
    return rangeSize >= 0.5 && rangeSize <= maxDuration;
  }

  // For longer videos, use anti-cheat
  if (rangeSize < 0.5) return false; // Too small
  if (rangeSize > 120) return false; // Max 2 minutes continuous (for long videos)
  if (rangeSize > maxDuration * 0.2) return false; // Max 20% of video

  return true;
};

/**
 * Helper function to safely get userId string for logging
 */
const getUserIdString = (userId) => {
  if (!userId) return "unknown";
  if (userId.toString) {
    const str = userId.toString();
    return str.slice(-6);
  }
  if (typeof userId === "string") {
    return userId.slice(-6);
  }
  return "unknown";
};

/**
 * Format time for logging
 */
const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return "0 sec";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

/**
 * Should we add a watch range based on action
 */
const shouldAddWatchRange = (action, currentTime, previousTime, duration) => {
  // Don't add ranges for seek actions
  if (action === "seek" || action === "seeked") return false;

  const delta = currentTime - previousTime;

  // Valid range conditions
  return delta > 0.3 && delta <= 300 && currentTime <= duration;
};

/**
 * Should we end the current session
 */
const shouldEndSession = (action) => {
  return ["pause", "video_pause", "end", "video_end"].includes(action);
};

/**
 * Calculate completion percentage
 */
const calculateCompletion = (totalWatched, duration) => {
  if (duration <= 0) return 0;
  return Math.min(100, Math.round((totalWatched / duration) * 100 * 10) / 10);
};

/**
 * Main function to update user video progress
 */
const updateUserProgress = async (
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
  deviceInfo = "",
  ipAddress = "",
) => {
  // ========== INPUT VALIDATION ==========
  if (!pageId || !videoId || !userId || !type) {
    const missingFields = [];
    if (!pageId) missingFields.push("pageId");
    if (!videoId) missingFields.push("videoId");
    if (!userId) missingFields.push("userId");
    if (!type) missingFields.push("type");

    console.error("❌ Missing required parameters:", {
      missingFields,
      received: {
        pageId: !!pageId,
        videoId: !!videoId,
        userId: !!userId,
        type: !!type,
      },
    });

    return {
      success: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  let validatedTime = 0;
  let lectureDuration = 0;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const startTime = Date.now();
  const userIdLog = getUserIdString(userId);

  while (retryCount < MAX_RETRIES) {
    try {
      // ========== GET VIDEO DETAILS ==========
      const video = await Video.findById(videoId)
        .select("duration title")
        .lean();

      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      lectureDuration = totalDuration
        ? parseFloat(totalDuration)
        : video.duration || 0;

      if (lectureDuration <= 0) {
        throw new Error(`Invalid video duration: ${lectureDuration}`);
      }

      validatedTime = Math.min(
        Math.max(parseFloat(currentTime) || 0, 0),
        lectureDuration,
      );

      const now = new Date();
      const action = type.toLowerCase();

      // ========== FIND OR CREATE PROGRESS (FIXED DUPLICATE KEY) ==========
      let progress = await UserProgress.findOne({ userId, pageId });

      if (!progress) {
        // Check if already exists (double-check to prevent race condition)
        const existingProgress = await UserProgress.findOne({ userId, pageId });
        if (existingProgress) {
          progress = existingProgress;
        } else {
          // ========== CREATE NEW PROGRESS ==========
          try {
            const newProgress = new UserProgress({
              chapterId,
              subjectId,
              standardId,
              userId,
              pageId,
              videoId,
              duration: lectureDuration,
              lastPosition: validatedTime,
              completionPercentage: 0,
              isCompleted: false,
              watchedRanges: [],
              pageSessions: [
                {
                  _id: new mongoose.Types.ObjectId(),
                  startTime: now,
                  endTime: null,
                  duration: 0,
                  lastKnownPosition: validatedTime,
                },
              ],
              totalWatched: 0,
              totalTimeSpent: 0,
              lastActiveAt: now,
              deviceInfo,
              ipAddress,
              firstWatchStartedAt: now,
              firstWatchCompletedAt: null,
              totalTimeToComplete: 0,
              totalWatchTimeOverall: 0,
              watchCount: 0,
              lastWatchedAt: now,
              completionHistory: [],
              engagementScore: 0,
              retryCount: 0,
            });

            await newProgress.save();
            progress = newProgress;
          } catch (createError) {
            // If duplicate key error, try to fetch again
            if (createError.code === 11000) {
              progress = await UserProgress.findOne({ userId, pageId });
              if (!progress) throw createError;
            } else {
              throw createError;
            }
          }
        }
      }

      // If still no progress, something went wrong
      if (!progress) {
        throw new Error("Failed to create or find progress");
      }

      // ========== UPDATE EXISTING PROGRESS ==========
      const previousPosition = progress.lastPosition;
      const lastSession =
        progress.pageSessions && progress.pageSessions.length > 0
          ? progress.pageSessions[progress.pageSessions.length - 1]
          : null;

      // Prepare update operations
      const updateOps = {
        $set: {
          lastPosition: validatedTime,
          lastActiveAt: now,
          updatedAt: now,
        },
      };

      // ========== HANDLE WATCH RANGES (FIXED FOR SMALL VIDEOS) ==========
      if (
        shouldAddWatchRange(
          action,
          validatedTime,
          previousPosition,
          lectureDuration,
        )
      ) {
        const newRange = {
          start: parseFloat(previousPosition.toFixed(2)),
          end: parseFloat(validatedTime.toFixed(2)),
        };

        // Validate range with fixed logic
        if (
          isValidWatchRange(
            newRange.start,
            newRange.end,
            lectureDuration,
            action,
          )
        ) {
          // Get current watched ranges
          const currentRanges = progress.watchedRanges || [];

          // Merge with existing ranges
          const mergedRanges = mergeWatchRanges(currentRanges, newRange);
          updateOps.$set.watchedRanges = mergedRanges;
        }
      }

      // ========== HANDLE SESSION UPDATES ==========
      if (lastSession && !lastSession.endTime) {
        // Update existing session
        const timeSpent = (now - new Date(lastSession.startTime)) / 1000;

        if (shouldEndSession(action)) {
          // End current session
          updateOps.$set["pageSessions.$[session].endTime"] = now;
          updateOps.$set["pageSessions.$[session].duration"] = Math.min(
            timeSpent,
            lectureDuration,
          );
          updateOps.$set["pageSessions.$[session].lastKnownPosition"] =
            validatedTime;
        } else {
          // Update session duration and position
          updateOps.$set["pageSessions.$[session].duration"] = Math.min(
            timeSpent,
            lectureDuration,
          );
          updateOps.$set["pageSessions.$[session].lastKnownPosition"] =
            validatedTime;
        }

        // Apply update with array filter
        const updateResult = await UserProgress.updateOne(
          {
            _id: progress._id,
            "pageSessions._id": lastSession._id,
            "pageSessions.endTime": null,
          },
          updateOps,
          {
            arrayFilters: [{ "session._id": lastSession._id }],
            runValidators: true,
          },
        );

        if (updateResult.modifiedCount === 0 && retryCount < MAX_RETRIES - 1) {
          retryCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, retryCount)),
          );
          continue;
        }
      } else {
        // Create new session
        const newSession = {
          _id: new mongoose.Types.ObjectId(),
          startTime: now,
          endTime: null,
          duration: 0,
          lastKnownPosition: validatedTime,
        };

        updateOps.$push = {
          pageSessions: newSession,
        };

        const updateResult = await UserProgress.updateOne(
          { _id: progress._id },
          updateOps,
        );

        if (updateResult.modifiedCount === 0 && retryCount < MAX_RETRIES - 1) {
          retryCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, retryCount)),
          );
          continue;
        }
      }

      // ========== GET UPDATED PROGRESS ==========
      const updatedProgress = await UserProgress.findOne({
        userId,
        pageId,
      }).lean();

      if (!updatedProgress) {
        throw new Error("Progress not found after update");
      }

      // ========== RECALCULATE ALL METRICS ==========
      // Calculate total watched time from ranges
      const totalWatched = calculateTotalWatched(
        updatedProgress.watchedRanges || [],
        lectureDuration,
      );

      // Calculate completion percentage
      const completionPercentage = calculateCompletion(
        totalWatched,
        lectureDuration,
      );

      // Calculate total time spent from sessions
      const totalTimeSpent = (updatedProgress.pageSessions || []).reduce(
        (total, s) => total + (s.duration || 0),
        0,
      );

      // Check if completed
      const isCompleted = completionPercentage >= 95;
      const wasCompleted = updatedProgress.isCompleted;

      // ========== TIME-TO-COMPLETION & REVISION TRACKING ==========
      const metricsUpdate = {
        $set: {
          totalWatched,
          completionPercentage,
          totalTimeSpent,
          isCompleted,
          totalWatchTimeOverall: totalTimeSpent,
          engagementScore:
            lectureDuration > 0
              ? parseFloat((totalTimeSpent / lectureDuration).toFixed(2))
              : 0,
          lastWatchedAt: now,
        },
      };

      // Handle first time completion
      if (!wasCompleted && isCompleted) {
        if (!updatedProgress.firstWatchCompletedAt) {
          const timeToComplete = updatedProgress.firstWatchStartedAt
            ? (now - new Date(updatedProgress.firstWatchStartedAt)) / 1000
            : totalTimeSpent;

          metricsUpdate.$set.firstWatchCompletedAt = now;
          metricsUpdate.$set.totalTimeToComplete = timeToComplete;
          metricsUpdate.$set.watchCount = 1;

          metricsUpdate.$push = {
            completionHistory: {
              completedAt: now,
              percentageAtThatTime: completionPercentage,
              timeSpentUntilThen: totalTimeSpent,
              type: "first",
            },
          };
        }
      }

      // Handle revision watches
      if (updatedProgress.isCompleted && isCompleted) {
        const lastCompletion = updatedProgress.completionHistory?.slice(-1)[0];

        if (lastCompletion) {
          const hoursSinceLastComplete =
            (now - new Date(lastCompletion.completedAt)) / (1000 * 60 * 60);

          if (hoursSinceLastComplete > 1) {
            const newWatchCount = (updatedProgress.watchCount || 0) + 1;

            metricsUpdate.$set.watchCount = newWatchCount;

            if (!metricsUpdate.$push) {
              metricsUpdate.$push = {};
            }
            metricsUpdate.$push.completionHistory = {
              completedAt: now,
              percentageAtThatTime: completionPercentage,
              timeSpentUntilThen: totalTimeSpent,
              type: "revision",
            };
          }
        }
      }

      // Apply final metrics update
      await UserProgress.updateOne({ _id: updatedProgress._id }, metricsUpdate);

      // ========== DETAILED LOGGING ==========
      const processingTime = Date.now() - startTime;
      const efficiency =
        totalTimeSpent > 0
          ? ((totalWatched / totalTimeSpent) * 100).toFixed(1)
          : 0;

      return {
        success: true,
        completionPercentage,
        totalWatched,
        totalTimeSpent,
        totalWatchTimeOverall: totalTimeSpent,
        isCompleted,
        watchCount: updatedProgress.watchCount || 0,
        timeToComplete: updatedProgress.totalTimeToComplete || 0,
        engagementScore: totalTimeSpent / lectureDuration,
        lastPosition: validatedTime,
      };
    } catch (error) {
      // Handle duplicate key error specially
      if (error.code === 11000) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, retryCount)),
          );
          continue;
        }
      }

      // Check if it's a write conflict or version error
      if (
        error.code === 112 ||
        error.message.includes("Write conflict") ||
        error.message.includes("version")
      ) {
        retryCount++;

        if (retryCount < MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, retryCount)),
          );
          continue;
        }
      }

      // Other error or max retries exceeded
      console.error("❌ Error in updateUserProgress:", {
        error: error.message,
        userId: userIdLog,
        pageId,
        action: type,
        retryCount,
        stack: error.stack,
      });

      // ========== FALLBACK ULTRA LIGHT UPDATE ==========
      try {
        await UserProgress.updateOne(
          { userId, pageId },
          {
            $set: {
              lastPosition: validatedTime || 0,
              lastActiveAt: new Date(),
            },
            $inc: { retryCount: 1 },
          },
          { upsert: true },
        );

        return {
          success: false,
          error: error.message,
          fallbackPosition: validatedTime || 0,
          retryCount,
        };
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);

        return {
          success: false,
          error: fallbackError.message,
          fallbackPosition: validatedTime || 0,
        };
      }
    }
  }

  console.error("❌ Max retries exceeded for user:", userIdLog);

  return {
    success: false,
    error: "Max retries exceeded",
    fallbackPosition: validatedTime || 0,
  };
};

module.exports = updateUserProgress;
