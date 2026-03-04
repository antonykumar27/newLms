const mongoose = require("mongoose");
const { Schema } = mongoose;

const progressSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  standardId: {
    type: Schema.Types.ObjectId,
    ref: "Standard",
    required: true,
    index: true,
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: "StandardSubject",
    required: true,
    index: true,
  },

  chapterId: {
    type: Schema.Types.ObjectId,
    ref: "StandardChapter",
    required: true,
    index: true,
  },

  pageId: {
    type: Schema.Types.ObjectId,
    ref: "MathsLesson",
    required: true,
    index: true,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  attempted: {
    type: Number,
    default: 0,
  },
  correct: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  lastAttempt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started",
  },
  bookmarkQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  notes: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      note: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Progress", progressSchema);
