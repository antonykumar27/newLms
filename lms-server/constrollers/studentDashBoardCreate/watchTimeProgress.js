const WatchTime = require("../../models/watchTimeSchema");
const WatchSession = require("../../models/watchSession");
const { calculateEngagementScore } = require("./calculators");

// ==============================================
// UPDATE WATCH TIME PROGRESS
// ==============================================
const actualWatchTimeProgress = async ({
  currentTime,
  type,
  pageId,
  videoId,
  userId,
  totalDuration,
  chapterId,
  subjectId,
  standardId,
  watchTimeMs,
  playerEvents = [],
  isPreview = false,
  deviceInfo,
  sessionId,
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

    const watchedSeconds = Math.floor(watchTimeMs / 1000);

    // 🔒 Ignore very small noise
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
      `session_${userId}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    // ===============================
    // ✅ 1. GET OR CREATE WATCH TIME
    // ===============================
    let watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, ...(pageId && { page: pageId }) },
      {
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
          lastPosition: 0,
          progress: 0,
          totalWatchedSeconds: 0,
          uniqueWatchedSeconds: 0,
          completed: false,
          completionCount: 0,
        },
      },
      { upsert: true, new: true },
    );

    const isFirstTime =
      !watchTime.lastPosition ||
      (watchTime.lastPosition === 0 && watchTime.progress === 0);

    // ===============================
    // ✅ 2. CALCULATE VALID DELTA
    // ===============================
    const lastPosition = watchTime.lastPosition || 0;
    let validSeconds = 0;

    if (currentTime > lastPosition) {
      const delta = currentTime - lastPosition;
      // Anti-cheat: Max 30 seconds per update
      validSeconds = Math.min(watchedSeconds, delta, 30);
    }

    // Calculate progress percentage
    const progressPercent =
      totalDuration > 0
        ? Number(((currentTime / totalDuration) * 100).toFixed(1))
        : 0;

    // Check if completing now
    const isCompletingNow = !watchTime.completed && progressPercent >= 90;

    // Calculate CUMULATIVE total for engagement score
    const cumulativeTotal = (watchTime.totalWatchedSeconds || 0) + validSeconds;

    // ===============================
    // ✅ 3. PREPARE UPDATE
    // ===============================
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
        totalWatchedSeconds: validSeconds,
      },
    };

    // Handle unique watched seconds
    if (validSeconds > 0) {
      // For unique seconds, we still use validSeconds
      // This prevents rewatching from counting as unique
      progressUpdate.$inc.uniqueWatchedSeconds = validSeconds;
    }

    // Mark completed if watched ≥ 90%
    if (totalDuration > 0 && progressPercent >= 90 && !watchTime.completed) {
      progressUpdate.$set.completed = true;
      progressUpdate.$set.completedAt = new Date();
      progressUpdate.$inc.completionCount = 1;
    }

    // ===============================
    // ✅ 4. UPDATE WATCH TIME
    // ===============================
    watchTime = await WatchTime.findOneAndUpdate(
      { _id: watchTime._id },
      progressUpdate,
      { new: true },
    );

    c;

    // ===============================
    // ✅ 5. CALCULATE ENGAGEMENT SCORE
    // ===============================
    // IMPORTANT: Use CUMULATIVE total, not delta!
    const engagementScore = calculateEngagementScore(
      playerEvents,
      cumulativeTotal, // 👈 This is the KEY fix!
      totalDuration,
      { isFirstTime }, // Optional: pass context
    );

    // ===============================
    // ✅ 6. CREATE WATCH SESSION (FIRE & FORGET)
    // ===============================
    const startTime = Math.max(0, currentTime - validSeconds);
    const sessionStartTime = new Date(Date.now() - validSeconds * 1000);

    const watchSession = new WatchSession({
      sessionId: finalSessionId,
      userId,
      standard: standardId,
      subject: subjectId,
      chapter: chapterId,
      page: pageId,
      videoId,
      watchTimeMs: validSeconds * 1000,
      startPosition: startTime,
      endPosition: currentTime,
      videoDuration: totalDuration,
      playerEvents: playerEvents || [],
      deviceInfo: deviceInfo || {},
      isPreview,
      startedAt: sessionStartTime,
      endedAt: new Date(),
      watchedSeconds: validSeconds,
      cumulativeWatchedSeconds: cumulativeTotal, // Store cumulative too
      isUnique: isFirstTime,
      progress: progressPercent,
      completed: isCompletingNow,
      engagementScore: engagementScore,
    });

    // Don't await - fire and forget
    watchSession.save().catch((err) => {
      console.error("⚠️ Session save failed (non-critical):", err.message);
    });

    // ===============================
    // ✅ 7. RETURN RESULT
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
          sessionId: finalSessionId,
          watchTimeMs: validSeconds * 1000,
          engagementScore,
          cumulativeTotal,
        },
      },
    };
  } catch (error) {
    console.error("❌ Save watch time error:", error);
    throw error;
  }
};

module.exports = actualWatchTimeProgress;
