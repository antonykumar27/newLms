// ==============================================
// CONSTANTS & CONFIGURATION
// ==============================================

const VALID_INTERACTION_TYPES = [
  "video_play",
  "video_pause",
  "video_seek_forward",
  "video_seek_backward",
  "video_end",
  "video_seek",
  "video_view",
  "timeupdate",
  "video_quality_change",
  "video_speed_change",
  "video_mute",
  "video_unmute",
  "video_fullscreen",
  "video_exit_fullscreen",
  "video_picture_in_picture",
  "video_heartbeat",
  "video_caption_toggle",
  "chapter_view",
  "page_view",
  "course_enroll",
  "course_complete",
  "course_review",
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "assignment_view",
  "assignment_submit",
  "comment_add",
  "question_ask",
  "note_add",
  "note_update",
  "note_delete",
  "bookmark_add",
  "bookmark_remove",
  "search",
  "filter",
  "sort",
  "share",
];

const PREMIUM_TYPES = [
  "video_download",
  "course_certificate",
  "quiz_feedback",
  "assignment_review",
  "live_chat",
  "instructor_message",
];

const RATE_LIMIT_CONFIG = {
  video_heartbeat: 10000, // 10 seconds
  video_play: 1000, // 1 second
  video_pause: 500, // 0.5 seconds
  video_seek: 2000, // 2 seconds
  video_quality_change: 5000, // 5 seconds
  video_speed_change: 5000, // 5 seconds
  video_view: 0, // No limit
  comment_add: 3000, // 3 seconds
  note_add: 2000, // 2 seconds
  default: 500, // Default 500ms
};

module.exports = {
  VALID_INTERACTION_TYPES,
  PREMIUM_TYPES,
  RATE_LIMIT_CONFIG,
};
