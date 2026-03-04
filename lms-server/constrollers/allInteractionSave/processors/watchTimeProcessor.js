// services/processors/watchTimeProcessor.js
const WatchTime = require("../../models/watchTimeSchema");
const WatchSession = require("../../models/watchSession");
const mongoose = require("mongoose");

module.exports = async (job) => {
  const {
    userId,
    videoId,
    pageId,
    chapterId,
    subjectId,
    standardId,
    currentTime,
    totalDuration,
    watchTimeMs,
    playerEvents = [],
    deviceInfo,
    sessionId,
    type,
  } = job.data;

  try {
    if (!watchTimeMs || !videoId || !userId) return;

    const watchedSeconds = Math.round(watchTimeMs / 1000);
    if (watchedSeconds < 3) return;

    const progress =
      totalDuration && totalDuration > 0
        ? Number(((currentTime / totalDuration) * 100).toFixed(1))
        : 0;

    let watchTime = await WatchTime.findOne({ userId, videoId, page: pageId });

    // Anti-cheat validation
    let validWatchedSeconds = watchedSeconds;
    if (watchTime) {
      if (currentTime - watchTime.lastPosition > 30) validWatchedSeconds = 0;
      if (currentTime < watchTime.lastPosition) validWatchedSeconds = 0;
    }

    const isFirstTime = !watchTime;
    const isCompletingNow = !watchTime?.completed && progress >= 90;

    const updateData = {
      $set: {
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        lastPosition: currentTime,
        lastWatchedAt: new Date(),
        progress,
      },
      $inc: { totalWatchedSeconds: validWatchedSeconds },
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

    // Handle unique watch seconds
    if (isFirstTime) {
      updateData.$inc.uniqueWatchedSeconds = validWatchedSeconds;
    } else {
      const lastPosition = watchTime?.lastPosition || 0;
      if (currentTime > lastPosition) {
        const uniqueSeconds = Math.min(
          validWatchedSeconds,
          currentTime - lastPosition,
        );
        updateData.$inc.uniqueWatchedSeconds = uniqueSeconds;
      }
    }

    // Handle completion
    if (isCompletingNow) {
      updateData.$set.completed = true;
      updateData.$set.completedAt = new Date();
      updateData.$inc.completionCount = 1;
    }

    watchTime = await WatchTime.findOneAndUpdate(
      { userId, videoId, page: pageId },
      updateData,
      { upsert: true, new: true },
    );

    // Create watch session
    if (watchTime) {
      const finalSessionId =
        sessionId ||
        `session_${userId}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionStartTime = Math.max(0, currentTime - validWatchedSeconds);

      const session = new WatchSession({
        sessionId: finalSessionId,
        userId,
        standard: standardId,
        subject: subjectId,
        chapter: chapterId,
        page: pageId,
        videoId,
        startedAt: new Date(Date.now() - watchTimeMs),
        endedAt: new Date(),
        startPosition: sessionStartTime,
        endPosition: currentTime,
        videoDuration: totalDuration,
        watchTimeMs,
        watchedSeconds: validWatchedSeconds,
        isUnique: isFirstTime,
        progress,
        completed: isCompletingNow,
        deviceInfo: deviceInfo || {},
        playerEvents: playerEvents || [],
        engagementScore: calculateEngagementScore(
          playerEvents,
          validWatchedSeconds,
          totalDuration,
        ),
      });

      await session.save();
    }

    console.log(
      `✅ Watch time processed: user ${userId}, video ${videoId}, ${validWatchedSeconds}s`,
    );
  } catch (error) {
    console.error("❌ Watch time processor error:", error);
    throw error;
  }
};

function calculateEngagementScore(playerEvents, watchedSeconds, totalDuration) {
  if (!playerEvents || playerEvents.length === 0) return 50;

  let score = 50;

  const pauseCount = playerEvents.filter((e) => e.type === "pause").length;
  const seekCount = playerEvents.filter((e) => e.type === "seek").length;

  if (seekCount > 5) score -= 10;
  if (seekCount > 10) score -= 10;

  if (totalDuration > 0) {
    const watchRatio = watchedSeconds / totalDuration;
    if (watchRatio > 0.9) score += 20;
    else if (watchRatio > 0.7) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
