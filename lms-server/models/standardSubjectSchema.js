const mongoose = require("mongoose");
const { Schema } = mongoose;

const standardSubjectSchema = new Schema(
  {
    standardId: {
      type: Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
    },
    standard: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    part: {
      type: String,
      default: null,
      trim: true,
    },

    medium: {
      type: String,
      required: true,
      enum: ["english", "malayalam"],
      lowercase: true,
      trim: true,
    },

    media: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "pdf"],
        },
        pdfUrl: String,
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ NEW: Analytics Field - ഇത് add ചെയ്യുക!
    analytics: {
      interactions: {
        video_play: { type: Number, default: 0 },
        video_pause: { type: Number, default: 0 },
        video_end: { type: Number, default: 0 },
        video_seek: { type: Number, default: 0 },
        video_heartbeat: { type: Number, default: 0 },
        video_view: { type: Number, default: 0 },
        quiz_start: { type: Number, default: 0 },
        quiz_answer: { type: Number, default: 0 },
        quiz_complete: { type: Number, default: 0 },
        assignment_view: { type: Number, default: 0 },
        assignment_submit: { type: Number, default: 0 },
        comment_add: { type: Number, default: 0 },
        question_ask: { type: Number, default: 0 },
        note_add: { type: Number, default: 0 },
        note_update: { type: Number, default: 0 },
        note_delete: { type: Number, default: 0 },
        bookmark_add: { type: Number, default: 0 },
        bookmark_remove: { type: Number, default: 0 },
        chapter_view: { type: Number, default: 0 },
        page_view: { type: Number, default: 0 },
        course_enroll: { type: Number, default: 0 },
        course_complete: { type: Number, default: 0 },
        search: { type: Number, default: 0 },
        filter: { type: Number, default: 0 },
        sort: { type: Number, default: 0 },
        share: { type: Number, default: 0 },
      },
      lastInteraction: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

// ✅ UNIQUE INDEX (NULL SAFE PART)
standardSubjectSchema.index(
  { standard: 1, subject: 1, part: 1, medium: 1 },
  { unique: true },
);

module.exports = mongoose.model("StandardSubject", standardSubjectSchema);
