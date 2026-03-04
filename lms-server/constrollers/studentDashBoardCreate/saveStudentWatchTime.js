// ==============================================
// SAVE WATCH TIME SERVICE
// ==============================================

const WatchTime = require("../../models/watchTimeSchema");
const WatchSession = require("../../models/watchSession");

/**
 * Save watch time and create watch session
 * @param {Object} params - Parameters object
 * @returns {Object} - Result object with watch time and session data
 */
const saveWatchTime = async ({
  userId,
  watchTimeMs,
  currentTime = 0,
  totalDuration = 0,
  playerEvents = [],
  isPreview = false,
  sessionId,
  deviceInfo,
  videoId,
  pageId,
  chapterId,
  subjectId,
  standardId,
}) => {
  try {
    // 🔒 Validate required fields
    if (!userId || !videoId || !watchTimeMs) {
      console.error("❌ Missing required fields:", {
        userId: !!userId,
        videoId: !!videoId,
        watchTimeMs: !!watchTimeMs,
      });
      throw new Error(
        "Missing required fields: userId, videoId, or watchTimeMs",
      );
    }

    // ✅ Console logs now will work

    const watchedSeconds = Math.floor(watchTimeMs / 1000);

    // 🔒 Ignore very small noise (optional but recommended)
    if (watchedSeconds <= 0) {
      return {
        success: true,
        message: "Watch time too small to record",
        data: null,
      };
    }

    // Generate session ID if not provided
    const finalSessionId =
      sessionId ||
      `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ===============================
    // ✅ 1. UPDATE WATCHTIME (PROGRESS)
    // ===============================
    const progressPercent =
      totalDuration > 0
        ? Math.min(100, Math.round((currentTime / totalDuration) * 100))
        : 0;

    // Find existing watch time
    let watchTime = await WatchTime.findOne({
      userId,
      videoId,
      ...(pageId && { page: pageId }),
    });

    const isFirstTime = !watchTime;

    const isCompletingNow = watchTime
      ? !watchTime.completed && progressPercent >= 90
      : progressPercent >= 90;

    const progressUpdate = {
      $set: {
        lastPosition: currentTime,
        lastWatchedAt: new Date(),
        isPreview,
        progress: progressPercent,
        ...(pageId && { page: pageId }),
        ...(chapterId && { chapter: chapterId }),
        ...(subjectId && { subject: subjectId }),
        ...(standardId && { standard: standardId }),
      },
      $inc: {
        totalWatchedSeconds: watchedSeconds,
      },
      $setOnInsert: {
        firstWatchedAt: new Date(),
        videoDuration: totalDuration,
        hierarchyPath: {
          standard: standardId,
          subject: subjectId,
          chapter: chapterId,
          page: pageId,
          video: videoId,
        },
      },
    };

    // Handle unique watched seconds
    if (isFirstTime) {
      progressUpdate.$inc.uniqueWatchedSeconds = watchedSeconds;
    } else {
      const lastPosition = watchTime?.lastPosition || 0;
      if (currentTime > lastPosition) {
        const uniqueSeconds = Math.min(
          watchedSeconds,
          currentTime - lastPosition,
        );
        progressUpdate.$inc.uniqueWatchedSeconds = uniqueSeconds;
      } else {
        progressUpdate.$inc.uniqueWatchedSeconds = 0;
      }
    }

    // Mark completed if watched ≥ 90%
    if (totalDuration > 0 && progressPercent >= 90) {
      progressUpdate.$set.completed = true;
      progressUpdate.$set.completedAt = new Date();
      progressUpdate.$inc.completionCount = 1;
    }

    watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, ...(pageId && { page: pageId }) },
      progressUpdate,
      { upsert: true, new: true },
    );

    // ==================================
    // ✅ 2. CREATE WATCH SESSION (ANALYTICS)
    // ==================================
    const startTime = Math.max(0, currentTime - watchedSeconds);
    const sessionStartTime = new Date(Date.now() - watchTimeMs);

    // Calculate engagement score
    const engagementScore = calculateEngagementScore(
      playerEvents,
      watchedSeconds,
      totalDuration,
    );

    const watchSession = new WatchSession({
      sessionId: finalSessionId,
      userId,
      standard: standardId,
      subject: subjectId,
      chapter: chapterId,
      page: pageId,
      videoId,
      watchTimeMs,
      startPosition: startTime,
      endPosition: currentTime,
      videoDuration: totalDuration,
      playerEvents: playerEvents || [],
      deviceInfo: deviceInfo || {},
      isPreview,
      startedAt: sessionStartTime,
      endedAt: new Date(),
      watchedSeconds: watchedSeconds,
      isUnique: isFirstTime,
      progress: progressPercent,
      completed: isCompletingNow,
      engagementScore: engagementScore,
    });

    await watchSession.save();

    // ===============================
    // ✅ 3. RETURN RESULT
    // ===============================
    return {
      success: true,
      message: "Watch time saved successfully",
      data: {
        watchTime: {
          id: watchTime._id,
          lastPosition: watchTime.lastPosition,
          totalWatchedSeconds: watchTime.totalWatchedSeconds,
          uniqueWatchedSeconds: watchTime.uniqueWatchedSeconds,
          progress: watchTime.progress,
          completed: watchTime.completed,
          completionCount: watchTime.completionCount || 0,
        },
        session: {
          sessionId: watchSession.sessionId,
          watchTimeMs: watchSession.watchTimeMs,
          engagementScore: watchSession.engagementScore,
          startedAt: watchSession.startedAt,
          endedAt: watchSession.endedAt,
        },
      },
    };
  } catch (error) {
    console.error("❌ Save watch time error:", error);
    throw error;
  }
};

/**
 * Calculate engagement score based on player events
 * @param {Array} playerEvents - Array of player events
 * @param {number} watchedSeconds - Seconds watched
 * @param {number} totalDuration - Total video duration
 * @returns {number} - Engagement score (0-100)
 */
const calculateEngagementScore = (
  playerEvents,
  watchedSeconds,
  totalDuration,
) => {
  if (!playerEvents || playerEvents.length === 0) return 50;

  let score = 50;
  const seekCount = playerEvents.filter((e) => e.type === "seek").length;
  const pauseCount = playerEvents.filter((e) => e.type === "pause").length;
  const playCount = playerEvents.filter((e) => e.type === "play").length;

  if (seekCount > 5) score -= 10;
  if (seekCount > 10) score -= 10;

  if (pauseCount > 10) score -= 5;
  if (playCount > 15) score -= 5;

  if (totalDuration > 0) {
    const watchRatio = watchedSeconds / totalDuration;
    if (watchRatio > 0.9) score += 20;
    else if (watchRatio > 0.7) score += 10;
    else if (watchRatio > 0.5) score += 5;
  }

  return Math.min(100, Math.max(0, score));
};

// ✅ Export as module.exports (not exports.saveWatchTime)
module.exports = { saveWatchTime };
