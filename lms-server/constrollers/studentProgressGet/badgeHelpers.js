// controllers/analytics/studentProgressGet/helpers/badgeHelpers.js

const {
  BADGE_CONFIGS,
  BADGE_CATEGORY_ICONS,
  STREAK_ACHIEVEMENTS,
  ACHIEVEMENT_LEVELS,
} = require("./analyticsConstants");

/**
 * Get badge name based on category and level
 * @param {string} category - Badge category (streak, completion, quiz, etc.)
 * @param {number} level - Badge level/threshold
 * @returns {string} Badge name
 */
exports.getBadgeName = (category, level) => {
  // Check if we have a predefined badge config
  if (BADGE_CONFIGS[category] && BADGE_CONFIGS[category][level]) {
    return BADGE_CONFIGS[category][level].name;
  }

  // Fallback to streak achievements if available
  if (category === "streak" && STREAK_ACHIEVEMENTS[level]) {
    return STREAK_ACHIEVEMENTS[level].name;
  }

  // Dynamic badge name generation based on category and level
  switch (category) {
    case "streak":
      return `${level} Day Streak ${this.getStreakEmoji(level)}`;

    case "completion":
      return this.getCompletionBadgeName(level);

    case "quiz":
      return this.getQuizBadgeName(level);

    case "engagement":
      return this.getEngagementBadgeName(level);

    case "special":
      return `Special Achievement: ${level}`;

    default:
      return `Achievement Unlocked ${this.getCategoryIcon(category)}`;
  }
};

/**
 * Get badge description based on category and level
 * @param {string} category - Badge category
 * @param {number} level - Badge level/threshold
 * @returns {string} Badge description
 */
exports.getBadgeDescription = (category, level) => {
  // Check if we have a predefined badge config
  if (BADGE_CONFIGS[category] && BADGE_CONFIGS[category][level]) {
    return BADGE_CONFIGS[category][level].description;
  }

  // Fallback to streak achievements if available
  if (category === "streak" && STREAK_ACHIEVEMENTS[level]) {
    return STREAK_ACHIEVEMENTS[level].description;
  }

  // Dynamic description generation
  switch (category) {
    case "streak":
      return `Maintained a ${level}-day learning streak! Keep it up! 🔥`;

    case "completion":
      return this.getCompletionBadgeDescription(level);

    case "quiz":
      return this.getQuizBadgeDescription(level);

    case "engagement":
      return this.getEngagementBadgeDescription(level);

    case "perfect_week":
      return `Learned every day for a whole week! 📅`;

    case "early_bird":
      return `Completed ${level} sessions before 9 AM! 🌅`;

    case "night_owl":
      return `Completed ${level} night study sessions! 🌙`;

    default:
      return `Exceptional achievement in ${category}!`;
  }
};

/**
 * Get badge icon based on category
 * @param {string} category - Badge category
 * @returns {string} Emoji icon
 */
exports.getBadgeIcon = (category) => {
  return BADGE_CATEGORY_ICONS[category] || BADGE_CATEGORY_ICONS.default;
};

/**
 * Get streak emoji based on streak length
 * @param {number} streak - Streak length
 * @returns {string} Appropriate emoji
 */
exports.getStreakEmoji = (streak) => {
  if (streak >= 365) return "🏆";
  if (streak >= 100) return "⭐";
  if (streak >= 50) return "👑";
  if (streak >= 30) return "🌟";
  if (streak >= 15) return "🚀";
  if (streak >= 7) return "🔥🔥";
  if (streak >= 3) return "🔥";
  return "💪";
};

/**
 * Get completion badge name based on count
 * @param {number} count - Number of items completed
 * @returns {string} Badge name
 */
exports.getCompletionBadgeName = (count) => {
  const level = this.getAchievementLevel(count);

  switch (level) {
    case "bronze":
      return "Bronze Learner 🥉";
    case "silver":
      return "Silver Learner 🥈";
    case "gold":
      return "Gold Learner 🥇";
    case "platinum":
      return "Platinum Learner 💎";
    case "diamond":
      return "Diamond Learner 💎💎";
    default:
      return "Beginner Learner 🌱";
  }
};

/**
 * Get completion badge description
 * @param {number} count - Number of items completed
 * @returns {string} Badge description
 */
exports.getCompletionBadgeDescription = (count) => {
  const level = this.getAchievementLevel(count);

  switch (level) {
    case "bronze":
      return `Completed ${count} items! Starting strong!`;
    case "silver":
      return `Completed ${count} items! Building momentum!`;
    case "gold":
      return `Completed ${count} items! Excellent progress!`;
    case "platinum":
      return `Completed ${count} items! Outstanding dedication!`;
    case "diamond":
      return `Completed ${count} items! Master level achieved!`;
    default:
      return `Completed ${count} learning items!`;
  }
};

/**
 * Get quiz badge name based on performance
 * @param {number} score - Quiz score or count
 * @returns {string} Badge name
 */
exports.getQuizBadgeName = (score) => {
  if (score === 100) return "Perfect Score! 🎯";
  if (score >= 90) return "Quiz Master 🧠";
  if (score >= 80) return "Quiz Expert 📚";
  if (score >= 70) return "Quiz Pro 📝";
  if (score >= 60) return "Quiz Pass ✅";
  return "Quiz Taker 📋";
};

/**
 * Get quiz badge description
 * @param {number} score - Quiz score
 * @returns {string} Badge description
 */
exports.getQuizBadgeDescription = (score) => {
  if (score === 100) return "Achieved a perfect score on a quiz!";
  if (score >= 90) return `Scored ${score}% - Excellent performance!`;
  if (score >= 80) return `Scored ${score}% - Great job!`;
  if (score >= 70) return `Scored ${score}% - Good work!`;
  if (score >= 60) return `Scored ${score}% - Quiz passed!`;
  return `Completed a quiz with score ${score}%`;
};

/**
 * Get engagement badge name
 * @param {string} type - Type of engagement
 * @returns {string} Badge name
 */
exports.getEngagementBadgeName = (type) => {
  const badges = {
    comment: "Active Participant 💬",
    share: "Knowledge Sharer 📤",
    like: "Content Supporter 👍",
    discussion: "Discussion Starter 🗣️",
    help: "Community Helper 🤝",
    feedback: "Feedback Provider 📢",
  };

  return badges[type] || "Engaged Learner ✨";
};

/**
 * Get engagement badge description
 * @param {string} type - Type of engagement
 * @param {number} count - Count of actions
 * @returns {string} Badge description
 */
exports.getEngagementBadgeDescription = (type, count = 1) => {
  const descriptions = {
    comment: `Posted ${count} ${count === 1 ? "comment" : "comments"}`,
    share: `Shared ${count} ${count === 1 ? "piece" : "pieces"} of content`,
    like: `Liked ${count} ${count === 1 ? "item" : "items"}`,
    discussion: `Started ${count} ${count === 1 ? "discussion" : "discussions"}`,
    help: `Helped ${count} ${count === 1 ? "fellow student" : "fellow students"}`,
    feedback: `Provided ${count} ${count === 1 ? "piece" : "pieces"} of feedback`,
  };

  return descriptions[type] || `Showed great engagement in the community!`;
};

/**
 * Get achievement level based on count
 * @param {number} count - Achievement count
 * @returns {string} Achievement level
 */
exports.getAchievementLevel = (count) => {
  if (count >= 500) return "diamond";
  if (count >= 250) return "platinum";
  if (count >= 100) return "gold";
  if (count >= 50) return "silver";
  if (count >= 10) return "bronze";
  return "beginner";
};

/**
 * Get category icon
 * @param {string} category - Badge category
 * @returns {string} Emoji icon
 */
exports.getCategoryIcon = (category) => {
  const icons = {
    streak: "🔥",
    completion: "📚",
    quiz: "📝",
    engagement: "💬",
    special: "✨",
    perfect: "🎯",
    early: "🌅",
    night: "🌙",
    social: "👥",
    speed: "⚡",
  };

  return icons[category] || "🏆";
};

/**
 * Calculate progress towards next badge
 * @param {number} currentValue - Current progress value
 * @param {number} targetValue - Target value for next badge
 * @returns {Object} Progress information
 */
exports.calculateBadgeProgress = (currentValue, targetValue) => {
  const progress = Math.min(
    100,
    Math.round((currentValue / targetValue) * 100),
  );
  const remaining = Math.max(0, targetValue - currentValue);

  return {
    current: currentValue,
    target: targetValue,
    progress,
    remaining,
    percentage: progress,
    isCompleted: currentValue >= targetValue,
    message:
      remaining > 0 ? `${remaining} more to go!` : "Achievement unlocked! 🎉",
  };
};

/**
 * Get next badge in progression
 * @param {string} category - Badge category
 * @param {number} currentLevel - Current level/value
 * @returns {Object} Next badge information
 */
exports.getNextBadge = (category, currentLevel) => {
  if (!BADGE_CONFIGS[category]) return null;

  const levels = Object.keys(BADGE_CONFIGS[category])
    .map(Number)
    .sort((a, b) => a - b);

  const nextLevel = levels.find((level) => level > currentLevel);

  if (!nextLevel) return null;

  return {
    level: nextLevel,
    name: BADGE_CONFIGS[category][nextLevel].name,
    description: BADGE_CONFIGS[category][nextLevel].description,
    target: nextLevel,
    current: currentLevel,
    progress: Math.min(100, Math.round((currentLevel / nextLevel) * 100)),
  };
};

/**
 * Get all badges for a category with progress
 * @param {string} category - Badge category
 * @param {number} currentValue - Current progress value
 * @returns {Array} List of badges with progress
 */
exports.getCategoryBadgesWithProgress = (category, currentValue) => {
  if (!BADGE_CONFIGS[category]) return [];

  return Object.entries(BADGE_CONFIGS[category])
    .map(([level, badge]) => ({
      level: parseInt(level),
      name: badge.name,
      description: badge.description,
      target: parseInt(level),
      current: currentValue,
      progress: Math.min(
        100,
        Math.round((currentValue / parseInt(level)) * 100),
      ),
      isUnlocked: currentValue >= parseInt(level),
      icon: this.getBadgeIcon(category),
    }))
    .sort((a, b) => a.level - b.level);
};

/**
 * Format badge for display
 * @param {Object} badge - Badge object
 * @returns {Object} Formatted badge
 */
exports.formatBadgeForDisplay = (badge) => {
  return {
    id: badge._id || badge.badgeId?._id,
    name: badge.name || this.getBadgeName(badge.category, badge.level),
    description:
      badge.description ||
      this.getBadgeDescription(badge.category, badge.level),
    category: badge.category,
    level: badge.level,
    icon: badge.icon || this.getBadgeIcon(badge.category),
    earnedAt: badge.earnedAt,
    progress: badge.progress,
    isNew: badge.earnedAt ? this.isRecentlyEarned(badge.earnedAt) : false,
  };
};

/**
 * Check if badge was recently earned
 * @param {Date} earnedAt - Date badge was earned
 * @returns {boolean} True if earned within last 24 hours
 */
exports.isRecentlyEarned = (earnedAt) => {
  if (!earnedAt) return false;

  const now = new Date();
  const earned = new Date(earnedAt);
  const hoursDiff = (now - earned) / (1000 * 60 * 60);

  return hoursDiff <= 24;
};

/**
 * Get badge rarity color
 * @param {string} category - Badge category
 * @param {number} level - Badge level
 * @returns {string} Hex color code
 */
exports.getBadgeRarityColor = (category, level) => {
  const rarityColors = {
    common: "#8B95A9",
    rare: "#4A6FA5",
    epic: "#9B59B6",
    legendary: "#F1C40F",
    ultimate: "#E67E22",
  };

  if (category === "streak") {
    if (level >= 365) return rarityColors.ultimate;
    if (level >= 100) return rarityColors.legendary;
    if (level >= 50) return rarityColors.epic;
    if (level >= 30) return rarityColors.rare;
    return rarityColors.common;
  }

  if (category === "completion") {
    if (level >= 500) return rarityColors.ultimate;
    if (level >= 250) return rarityColors.legendary;
    if (level >= 100) return rarityColors.epic;
    if (level >= 50) return rarityColors.rare;
    return rarityColors.common;
  }

  return rarityColors.common;
};
