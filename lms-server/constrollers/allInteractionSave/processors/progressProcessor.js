// services/processors/progressProcessor.js
const UserProgress = require("../../models/userProgressSchema");
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
    type,
  } = job.data;

  try {
    if (!pageId || !videoId || !userId) return;

    const video = await mongoose.model("Video").findById(videoId);
    if (!video) return;

    const lectureDuration = totalDuration ? parseFloat(totalDuration) : 0;
    const now = new Date();
    const validatedTime = Math.min(
      parseFloat(currentTime) || 0,
      lectureDuration,
    );

    let progress = await UserProgress.findOne({ userId, pageId });

    if (!progress) {
      progress = new UserProgress({
        chapterId,
        subjectId,
        standardId,
        userId,
        pageId,
        videoId,
        duration: lectureDuration,
        lastPosition: 0,
        completionPercentage: 0,
        isCompleted: false,
        watchedRanges: [],
        pageSessions: [{ startTime: now, endTime: null, timeSpent: 0 }],
      });
      await progress.save();
    } else {
      const lastSession =
        progress.pageSessions[progress.pageSessions.length - 1];
      const timeSinceLastSession = lastSession?.endTime
        ? (now - lastSession.endTime) / 1000 / 60
        : 0;

      if (!lastSession?.endTime || timeSinceLastSession > 30) {
        progress.pageSessions.push({
          startTime: now,
          endTime: null,
          timeSpent: 0,
        });
      }
    }

    const currentSession =
      progress.pageSessions[progress.pageSessions.length - 1];
    const previousPosition = progress.lastPosition || 0;

    // Handle different action types
    switch (type) {
      case "play":
      case "video_play":
        progress.lastPosition = validatedTime;
        if (!currentSession.startTime) currentSession.startTime = now;
        break;

      case "pause":
      case "video_pause":
        progress.lastPosition = validatedTime;
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 300) {
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
            );
          }
        }
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }
        break;

      case "seek":
        progress.lastPosition = validatedTime;
        break;

      case "timeupdate":
      case "video_heartbeat":
        progress.lastPosition = validatedTime;
        if (validatedTime > previousPosition) {
          const delta = validatedTime - previousPosition;
          if (delta > 0.5 && delta <= 120) {
            addWatchedRange(
              progress,
              previousPosition,
              validatedTime,
              lectureDuration,
            );
          }
        }
        break;

      case "end":
      case "video_end":
        progress.lastPosition = validatedTime;
        if (
          validatedTime > previousPosition &&
          validatedTime - previousPosition <= 10
        ) {
          addWatchedRange(
            progress,
            previousPosition,
            validatedTime,
            lectureDuration,
          );
        }
        if (currentSession.startTime && !currentSession.endTime) {
          currentSession.endTime = now;
          currentSession.timeSpent = (now - currentSession.startTime) / 1000;
        }
        break;
    }

    progress.totalWatched = calculateTotalWatched(
      progress.watchedRanges,
      lectureDuration,
    );

    if (lectureDuration > 0) {
      const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
      progress.completionPercentage = Math.min(100, Math.round(rawPercentage));
      if (!progress.isCompleted && progress.completionPercentage >= 95) {
        progress.isCompleted = true;
      }
    }

    progress.totalTimeSpent = progress.pageSessions.reduce(
      (total, session) => total + (session.timeSpent || 0),
      0,
    );

    await progress.save();

    console.log(
      `✅ Progress updated: user ${userId}, video ${videoId}, ${progress.completionPercentage}%`,
    );
  } catch (error) {
    console.error("❌ Progress processor error:", error);
    throw error;
  }
};

function addWatchedRange(progress, start, end, maxDuration) {
  const rangeSize = end - start;

  if (rangeSize > 30) return false;
  if (rangeSize > maxDuration * 0.8) return false;
  if (start < 0 || end > maxDuration || end <= start || rangeSize < 0.5)
    return false;

  const newRange = {
    start: parseFloat(start.toFixed(2)),
    end: parseFloat(end.toFixed(2)),
  };

  let merged = false;
  for (const existing of progress.watchedRanges) {
    if (
      newRange.start <= existing.end + 2 &&
      newRange.end >= existing.start - 2
    ) {
      existing.start = Math.min(existing.start, newRange.start);
      existing.end = Math.max(existing.end, newRange.end);
      merged = true;
      break;
    }
  }

  if (!merged) progress.watchedRanges.push(newRange);
  progress.watchedRanges.sort((a, b) => a.start - b.start);
  return true;
}

function calculateTotalWatched(ranges, duration) {
  if (!ranges || ranges.length === 0) return 0;

  let totalWatched = 0;
  let lastEnd = -1;

  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

  for (const range of sortedRanges) {
    const start = Math.max(0, Math.min(range.start, duration));
    const end = Math.max(0, Math.min(range.end, duration));

    if (end <= start) continue;

    if (start > lastEnd) {
      totalWatched += end - start;
      lastEnd = end;
    } else if (end > lastEnd) {
      totalWatched += end - lastEnd;
      lastEnd = end;
    }
  }

  return parseFloat(totalWatched.toFixed(2));
}
