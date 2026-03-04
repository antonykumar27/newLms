const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
  // 🔹 OPTIONAL GENERAL MEDIA
  media: [
    {
      url: String,
      mediaType: {
        type: String,
        enum: ["image", "video", "pdf"],
      },
      pdfUrl: String,
    },
  ],

  // 🔥 Updated questionType
  questionType: {
    type: String,
    enum: ["MCQ_SINGLE", "MCQ_MULTIPLE", "TEXT"], // Added TEXT type
    default: "MCQ_SINGLE",
  },

  question: {
    type: String,
    required: true,
  },

  // 🔥 Question image
  questionImageUrl: {
    url: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "pdf"],
      default: "image",
    },
    pdfUrl: {
      type: String,
      default: null,
    },
  },

  // 🔥 Options with image support (only for MCQ)
  options: [
    {
      value: {
        type: String,
        required: true,
      },
      optionImageUrl: {
        url: {
          type: String,
          default: null,
        },
        mediaType: {
          type: String,
          enum: ["image", "video", "pdf"],
          default: "image",
        },
        pdfUrl: {
          type: String,
          default: null,
        },
      },
    },
  ],

  // 🔥 For MCQ_SINGLE: stores option value
  // 🔥 For MCQ_MULTIPLE: stores JSON array of indices [0,2]
  // 🔥 For TEXT: stores the correct answer string
  correctAnswer: {
    type: String,
    required: true,
  },

  explanation: {
    type: String,
    required: true,
  },

  hints: [String],

  solutionSteps: [String],

  tags: [String],

  marks: {
    type: Number,
    default: 1,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    ref: "Standardpage",
    required: true,
    index: true,
  },

  isFree: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
