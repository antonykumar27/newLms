// services/events/interactionEvents.js
const EventTypes = {
  // Video events
  VIDEO_PLAY: "video_play",
  VIDEO_PAUSE: "video_pause",
  VIDEO_SEEK: "video_seek",
  VIDEO_END: "video_end",
  VIDEO_HEARTBEAT: "video_heartbeat",
  VIDEO_VIEW: "video_view",
  VIDEO_QUALITY_CHANGE: "video_quality_change",
  VIDEO_SPEED_CHANGE: "video_speed_change",

  // Learning events
  PAGE_VIEW: "page_view",
  CHAPTER_VIEW: "chapter_view",
  COURSE_ENROLL: "course_enroll",
  COURSE_COMPLETE: "course_complete",

  // Assessment events
  QUIZ_START: "quiz_start",
  QUIZ_COMPLETE: "quiz_complete",
  ASSIGNMENT_SUBMIT: "assignment_submit",

  // Engagement events
  NOTE_ADD: "note_add",
  BOOKMARK_ADD: "bookmark_add",
  COMMENT_ADD: "comment_add",
};

class InteractionEvent {
  constructor(type, userId, data = {}) {
    this.type = type;
    this.userId = userId;
    this.timestamp = new Date().toISOString();
    this.data = data;
    this.metadata = {
      userAgent: data.userAgent,
      ip: data.ip,
      deviceType: data.deviceType,
    };
  }

  toJSON() {
    return {
      type: this.type,
      userId: this.userId,
      timestamp: this.timestamp,
      data: this.data,
      metadata: this.metadata,
    };
  }
}

module.exports = { EventTypes, InteractionEvent };
