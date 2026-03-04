// services/progressService.js - FIXED VERSION

/**
 * 🎯 ANTI-CHEAT: Check if range is valid to add
 */
function isValidWatchRange(start, end, maxDuration, action) {
  const rangeSize = end - start;

  // Seek action - never add range
  if (action === "seek") {
    return false;
  }

  // Pause action - allow if reasonable
  if (action === "pause") {
    return rangeSize <= 300; // Max 5 minutes
  }

  // Large jump detection (>30 seconds)
  if (rangeSize > 30) {
    return false;
  }

  // Suspicious - watched >80% at once
  if (rangeSize > maxDuration * 0.8) {
    return false;
  }

  // Invalid timestamps
  if (start < 0 || end > maxDuration || end <= start) {
    return false;
  }

  // Too small to track
  if (rangeSize < 0.5) {
    return false;
  }

  return true;
}

/**
 * 🎯 Update seek history with anti-cheat detection
 */
function updateSeekHistory(progress, from, to) {
  if (!progress.seekHistory) {
    progress.seekHistory = [];
  }

  const seekDelta = Math.abs(to - from);

  progress.seekHistory.push({
    from,
    to,
    delta: seekDelta,
    timestamp: new Date(),
  });

  // Keep only last 20 seeks
  if (progress.seekHistory.length > 20) {
    progress.seekHistory = progress.seekHistory.slice(-20);
  }

  // Check for rapid seeking (5 seeks in 30 seconds)
  const recentSeeks = progress.seekHistory.slice(-5);
  if (recentSeeks.length === 5) {
    const firstSeek = recentSeeks[0].timestamp;
    const lastSeek = recentSeeks[4].timestamp;
    const timeSpan = (lastSeek - firstSeek) / 1000;

    if (timeSpan < 30) {
      progress.rapidSeekFlag = true;
      progress.flaggedForReview = true;
      progress.flagReason = `Rapid seeking: ${timeSpan}s-ൽ 5 seeks`;
    }
  }

  return seekDelta;
}

/**
 * 🎯 Merge watched ranges (optimize storage)
 */
function mergeWatchedRanges(progress, newRange) {
  const MERGE_THRESHOLD = 5.0;
  let merged = false;

  for (const existing of progress.watchedRanges) {
    if (
      newRange.start <= existing.end + MERGE_THRESHOLD &&
      newRange.end >= existing.start - MERGE_THRESHOLD
    ) {
      existing.start = Math.min(existing.start, newRange.start);
      existing.end = Math.max(existing.end, newRange.end);
      merged = true;
      break;
    }
  }

  if (!merged) {
    progress.watchedRanges.push(newRange);
  }

  progress.watchedRanges.sort((a, b) => a.start - b.start);
}

/**
 * 🎯 Add watched range with anti-cheat
 */
function addWatchedRange(progress, start, end, maxDuration, action = "play") {
  if (!isValidWatchRange(start, end, maxDuration, action)) {
    return false;
  }

  const clampedStart = Math.max(0, Math.min(start, maxDuration));
  const clampedEnd = Math.max(0, Math.min(end, maxDuration));

  if (clampedEnd - clampedStart < 0.1) return false;

  if (!Array.isArray(progress.watchedRanges)) {
    progress.watchedRanges = [];
  }

  const newRange = {
    start: parseFloat(clampedStart.toFixed(2)),
    end: parseFloat(clampedEnd.toFixed(2)),
    sessionId: progress.currentSessionId,
    watchedAt: new Date(),
  };

  mergeWatchedRanges(progress, newRange);
  return true;
}

/**
 * 🎯 Calculate total unique watched time
 */
function calculateTotalWatched(ranges, duration) {
  if (!ranges || ranges.length === 0) return 0;

  let totalWatched = 0;
  let currentEnd = -Infinity;

  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

  for (const range of sortedRanges) {
    const rangeStart = Math.max(0, Math.min(range.start, duration));
    const rangeEnd = Math.max(0, Math.min(range.end, duration));

    if (rangeEnd <= rangeStart) continue;

    if (rangeStart > currentEnd) {
      totalWatched += rangeEnd - rangeStart;
      currentEnd = rangeEnd;
    } else if (rangeEnd > currentEnd) {
      totalWatched += rangeEnd - currentEnd;
      currentEnd = rangeEnd;
    }
  }

  return parseFloat(totalWatched.toFixed(2));
}

/**
 * 🎯 Calculate watch quality
 */
function calculateWatchQuality(progress, duration) {
  if (duration === 0) return "GOOD";

  const watchRatio = progress.totalWatched / duration;
  const seekCount = progress.seekCount || 0;
  const rapidSeek = progress.rapidSeekFlag || false;

  if (watchRatio >= 0.95 && seekCount < 5 && !rapidSeek) {
    return "EXCELLENT";
  }

  if (watchRatio >= 0.8 && seekCount < 15 && !rapidSeek) {
    return "GOOD";
  }

  if (watchRatio >= 0.5) {
    return rapidSeek ? "SKIMMED" : "GOOD";
  }

  return "POOR";
}

/**
 * 🎯 Recalculate all lecture totals
 */
function recalculateLectureTotals(progress, lectureDuration) {
  // Calculate total watched
  progress.totalWatched = calculateTotalWatched(
    progress.watchedRanges,
    lectureDuration,
  );

  // Calculate completion percentage
  if (lectureDuration > 0) {
    const rawPercentage = (progress.totalWatched / lectureDuration) * 100;
    progress.completionPercentage = Math.min(100, Math.round(rawPercentage));
  } else {
    progress.completionPercentage = 0;
  }

  // Calculate watch quality
  progress.watchQuality = calculateWatchQuality(progress, lectureDuration);

  // Check if needs review
  if (progress.rapidSeekFlag && !progress.flaggedForReview) {
    progress.flaggedForReview = true;
    progress.flagReason = "Rapid seeking detected";
  }
}

/**
 * 🎯 Handle video end (with re-watch logic)
 */
function handleVideoEnd(progress, currentTime, previousPosition, now) {
  progress.lastPosition = currentTime;
  progress.lastPlayedAt = now;

  // 📚 Already completed - This is a REVISION
  if (progress.isCompleted) {
    progress.revisionCount = (progress.revisionCount || 0) + 1;
    progress.lastRevisedAt = now;

    // Add final range if valid
    if (currentTime > previousPosition) {
      const watchedAtEnd = currentTime - previousPosition;
      if (watchedAtEnd <= 10) {
        addWatchedRange(
          progress,
          previousPosition,
          currentTime,
          progress.duration,
          "end",
        );
      }
    }

    return {
      isNewCompletion: false,
      isRevision: true,
      revisionCount: progress.revisionCount,
    };
  }

  // 🆕 First time - Check for completion
  if (currentTime > previousPosition) {
    const watchedAtEnd = currentTime - previousPosition;
    if (watchedAtEnd <= 10) {
      addWatchedRange(
        progress,
        previousPosition,
        currentTime,
        progress.duration,
        "end",
      );
    }
  }

  // Recalculate
  recalculateLectureTotals(progress, progress.duration);

  // Check 90% rule
  if (progress.completionPercentage >= 90) {
    progress.isCompleted = true;
    progress.completedAt = now;
    progress.revisionCount = 0;

    return {
      isNewCompletion: true,
      isRevision: false,
    };
  }

  return {
    isNewCompletion: false,
    isRevision: false,
  };
}

// Export all functions
module.exports = {
  isValidWatchRange,
  updateSeekHistory,
  addWatchedRange,
  mergeWatchedRanges,
  calculateTotalWatched,
  calculateWatchQuality,
  recalculateLectureTotals,
  handleVideoEnd,
};
