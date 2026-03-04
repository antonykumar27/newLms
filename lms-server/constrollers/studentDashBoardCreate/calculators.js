// ==============================================
// CALCULATION FUNCTIONS
// ==============================================

const calculateIntensity = (type, normalizedData) => {
  if (type === "video_end" || type === "video_complete") return 4;
  if (type === "video_heartbeat") {
    const progress = normalizedData.currentTime / normalizedData.duration;
    if (progress > 0.7) return 3;
    if (progress > 0.3) return 2;
    return 1;
  }
  if (type === "quiz_complete" || type === "assignment_submit") return 4;
  if (type === "video_play" || type === "page_view") return 1;
  return 0;
};

/**
 * Calculate engagement score (Enhanced version)
 * @param {Array} playerEvents - Array of player events
 * @param {number} cumulativeSeconds - TOTAL seconds watched (cumulative)
 * @param {number} totalDuration - Total video duration
 * @param {Object} options - Additional options
 * @returns {number} Engagement score (0-100)
 */
const calculateEngagementScore = (
  playerEvents = [],
  cumulativeSeconds = 0,
  totalDuration = 0,
  options = {},
) => {
  // Default score
  let score = 50;

  // ==========================================
  // 1. WATCH RATIO (using CUMULATIVE seconds)
  // ==========================================
  if (totalDuration > 0 && cumulativeSeconds > 0) {
    const watchRatio = Math.min(1, cumulativeSeconds / totalDuration);

    // Smooth curve: 40% weight with power curve
    // 30% watch = ~20 points, 70% = ~33 points, 90% = ~38 points
    const watchBonus = 40 * Math.pow(watchRatio, 1.5);
    score += watchBonus;

    // Extra reward for near-completion
    if (watchRatio > 0.95) score += 5;
  }

  // ==========================================
  // 2. SEEK ANALYSIS (if events provided)
  // ==========================================
  if (playerEvents && playerEvents.length > 0) {
    let forwardSeeks = 0;
    let backwardSeeks = 0;
    let largeJumps = 0;

    playerEvents.forEach((event) => {
      if (
        event.type === "seek" &&
        event.from !== undefined &&
        event.to !== undefined
      ) {
        const jumpSize = Math.abs(event.to - event.from);

        if (event.to > event.from) {
          forwardSeeks++;
          if (jumpSize > 30) largeJumps++;
        } else if (event.to < event.from) {
          backwardSeeks++;
        }
      }
    });

    // Penalize excessive forward seeking (skipping)
    if (forwardSeeks > 3) {
      score -= Math.min(forwardSeeks * 2, 15);
    }

    // Penalize large jumps (skipping core content)
    if (largeJumps > 2) {
      score -= largeJumps * 3;
    }

    // Reward backward seeks (reviewing)
    if (backwardSeeks > 0 && backwardSeeks <= 5) {
      score += backwardSeeks * 1.5;
    }

    // Check pause patterns
    const pauseCount = playerEvents.filter((e) => e.type === "pause").length;
    if (pauseCount >= 2 && pauseCount <= 6) {
      score += 5; // Natural pause pattern
    }

    // Check playback rate
    const rateChanges = playerEvents.filter((e) => e.type === "ratechange");
    rateChanges.forEach((change) => {
      if (change.rate < 1 && change.rate > 0.5) {
        score += 2; // Slowing down to understand
      }
      if (change.rate > 1.5) {
        score -= 2; // Speeding through
      }
    });
  }

  // ==========================================
  // 3. ANTI-CHEAT DETECTION
  // ==========================================
  if (totalDuration > 0) {
    const watchRatio = cumulativeSeconds / totalDuration;

    // Suspicious: High watch ratio but no interactions
    if (watchRatio > 0.8 && (!playerEvents || playerEvents.length < 3)) {
      score -= 15;
    }

    // Impossible: Watched more than video length
    if (cumulativeSeconds > totalDuration * 1.2) {
      score -= 20;
    }
  }

  // Clamp score between 0-100
  return Math.min(100, Math.max(0, Math.round(score)));
};

module.exports = {
  calculateIntensity,
  calculateEngagementScore,
};
