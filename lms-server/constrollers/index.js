// ==============================================
// events/index.js - All Event Types
// ==============================================
const EventEmitter = require("events");

class LMSEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Avoid warning
  }
}

const lmsEvents = new LMSEventEmitter();

// ========== EVENT TYPES ==========
const EVENT_TYPES = {
  // Video events
  VIDEO_PLAYED: "video.played",
  VIDEO_PAUSED: "video.paused",
  VIDEO_SEEKED: "video.seeked",
  VIDEO_HEARTBEAT: "video.heartbeat",
  VIDEO_COMPLETED: "video.completed",

  // Page events
  PAGE_VIEWED: "page.viewed",

  // Progress events
  PROGRESS_UPDATED: "progress.updated",
  WATCH_TIME_UPDATED: "watchtime.updated",

  // Gamification events
  STREAK_UPDATED: "streak.updated",
  STREAK_MILESTONE: "streak.milestone",
  BADGE_EARNED: "badge.earned",

  // Analytics events
  DAILY_ACTIVITY: "daily.activity",
  HEATMAP_UPDATE: "heatmap.update",
  INSIGHTS_UPDATE: "insights.update",

  // Quiz events
  QUIZ_STARTED: "quiz.started",
  QUIZ_COMPLETED: "quiz.completed",
};

module.exports = {
  lmsEvents,
  EVENT_TYPES,
};
