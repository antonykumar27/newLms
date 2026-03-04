// constants/analyticsConstants.js

// ==================== STREAK CONSTANTS ====================

export const STREAK_MILESTONES = [3, 7, 15, 30, 50, 100, 200, 365];

export const STREAK_MESSAGES = {
  0: "Start your learning journey today! 🔥",
  1: "Great start! Come back tomorrow! 💪",
  2: "2 day streak! Keep the momentum! 🔥",
  default: (streak) => `${streak} day streak! You're unstoppable! 🚀`,
};

export const STREAK_ACHIEVEMENTS = {
  3: { name: "3-Day Starter", description: "Completed 3 days in a row!" },
  7: { name: "Week Warrior", description: "7-day streak achieved!" },
  15: { name: "Fortnight Fighter", description: "15 consecutive days!" },
  30: { name: "Monthly Master", description: "30-day streak!" },
  50: { name: "Fifty Club", description: "50 days of learning!" },
  100: { name: "Century Champion", description: "100-day streak!" },
  200: { name: "Double Century", description: "200 days strong!" },
  365: { name: "Year-Long Legend", description: "365 days of consistency!" },
};

// ==================== PAGE CONSTANTS ====================

export const PAGE_MILESTONES = [10, 25, 50, 100, 250, 500];

// ==================== HEATMAP CONSTANTS ====================

export const HEATMAP_COLORS = [
  "#ebedf0", // Level 0 - No activity
  "#9be9a8", // Level 1 - Light (1-15 min)
  "#40c463", // Level 2 - Medium (15-30 min)
  "#30a14e", // Level 3 - High (30-60 min)
  "#216e39", // Level 4 - Very High (60+ min)
];

export const HEATMAP_INTENSITY_LEVELS = {
  0: "No activity",
  1: "Light (1-15 min)",
  2: "Medium (15-30 min)",
  3: "High (30-60 min)",
  4: "Very High (60+ min)",
};

// ==================== BADGE CONSTANTS ====================

export const BADGE_CONFIGS = {
  streak: {
    3: {
      name: "3 Day Streak 🔥",
      description: "Maintained a 3-day learning streak!",
    },
    7: {
      name: "7 Day Streak 🔥🔥",
      description: "Maintained a week-long learning streak!",
    },
    15: {
      name: "15 Day Streak 🚀",
      description: "Two weeks of consistent learning!",
    },
    30: {
      name: "30 Day Streak 🌟",
      description: "A full month of daily learning!",
    },
    50: {
      name: "50 Day Streak 👑",
      description: "50 days of dedication!",
    },
    100: {
      name: "100 Day Streak 🤖",
      description: "Triple digits! You're a machine!",
    },
    200: {
      name: "200 Day Streak ⭐",
      description: "Elite consistency!",
    },
    365: {
      name: "365 Day Streak 🏆",
      description: "A full year of learning!",
    },
  },
  completion: {
    10: {
      name: "Bronze Learner 🥉",
      description: "Completed 10 videos!",
    },
    25: {
      name: "Silver Learner 🥈",
      description: "Completed 25 videos!",
    },
    50: {
      name: "Gold Learner 🥇",
      description: "Completed 50 videos!",
    },
    100: {
      name: "Platinum Learner 💎",
      description: "Completed 100 videos!",
    },
    250: {
      name: "Diamond Learner 💎💎",
      description: "Completed 250 videos!",
    },
    500: {
      name: "Master Learner 👑",
      description: "Completed 500 videos!",
    },
  },
};

export const BADGE_CATEGORY_ICONS = {
  streak: "🔥",
  completion: "🏆",
  quiz: "📝",
  engagement: "💫",
  default: "⭐",
};

// ==================== STUDY TIME CONSTANTS ====================

export const STUDY_TIMES = {
  MORNING: {
    range: [5, 12],
    name: "Morning 🌅",
    icon: "🌅",
  },
  AFTERNOON: {
    range: [12, 17],
    name: "Afternoon ☀️",
    icon: "☀️",
  },
  EVENING: {
    range: [17, 20],
    name: "Evening 🌆",
    icon: "🌆",
  },
  NIGHT: {
    range: [20, 5], // 8 PM to 5 AM (wraps around)
    name: "Night 🌙",
    icon: "🌙",
  },
};

// ==================== DAYS OF WEEK ====================

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ==================== QUIZ CONSTANTS ====================

export const QUIZ_DIFFICULTY_LEVELS = {
  easy: { color: "#4caf50", label: "Easy 🟢" },
  medium: { color: "#ff9800", label: "Medium 🟠" },
  hard: { color: "#f44336", label: "Hard 🔴" },
};

export const QUIZ_PASS_PERCENTAGE = 60; // 60% to pass

// ==================== CONTENT TYPES ====================

export const CONTENT_TYPES = ["video", "quiz", "article", "interactive", "pdf"];

// ==================== ACHIEVEMENT LEVELS ====================

export const ACHIEVEMENT_LEVELS = {
  bronze: { min: 0, max: 25, color: "#cd7f32", icon: "🥉" },
  silver: { min: 26, max: 50, color: "#c0c0c0", icon: "🥈" },
  gold: { min: 51, max: 75, color: "#ffd700", icon: "🥇" },
  platinum: { min: 76, max: 90, color: "#e5e4e2", icon: "💎" },
  diamond: { min: 91, max: 100, color: "#b9f2ff", icon: "💎💎" },
};

// ==================== LEADERBOARD CONSTANTS ====================

export const LEADERBOARD_TYPES = {
  CLASS: "class",
  SUBJECT: "subject",
  GLOBAL: "global",
  WEEKLY: "weekly",
};

export const LEADERBOARD_POINTS = {
  VIDEO_COMPLETE: 10,
  QUIZ_PASS: 25,
  PERFECT_QUIZ: 50,
  STREAK_DAY: 5,
  BADGE_EARNED: 100,
};

// ==================== TIME CONSTANTS ====================

export const TIME_IN_SECONDS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000,
};

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  ENROLLMENT_REQUIRED: "You don't have access to any standard",
  ENROLLMENT_DENIED: "You don't have access to this standard",
  SERVER_ERROR: "Server error",
  DATA_FETCH_FAILED: "Failed to fetch analytics data",
};

// ==================== CACHE KEYS ====================

export const CACHE_KEYS = {
  STUDENT_DASHBOARD: (userId) => `student:dashboard:${userId}`,
  LEADERBOARD: (type, contextId) => `leaderboard:${type}:${contextId}`,
  BADGE_PROGRESS: (userId) => `badges:progress:${userId}`,
};
