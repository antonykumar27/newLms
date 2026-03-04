const mongoose = require("mongoose");
const { Schema } = mongoose;

// Version history sub-schema
const versionSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    changeNote: {
      type: String,
      default: "Content updated",
    },
  },
  { _id: false },
);

// Quiz progress sub-schema
const QuizProgressSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: false,
      index: true,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    lastAttempt: {
      type: Date,
    },
  },
  { _id: false },
);

// Video progress sub-schema
const VideoProgressSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: false,
      index: true,
    },
    totalWatched: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastPosition: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

// Media sub-schema
const MediaSchema = new Schema(
  {
    url: String,
    type: {
      type: String,
      enum: ["image", "video", "pdf"],
    },
    pdfUrl: String,
  },
  { _id: false },
);

// MAIN STANDARD PAGE SCHEMA
const StandardPageSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    enum: ["maths", "physics", "chemistry", "biology", "other"],
    default: "maths",
  },
  // Media array
  media: [MediaSchema],

  // References
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
  pageNumber: {
    type: Number, // Changed from String to Number
    required: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId, // Changed from String to ObjectId
    ref: "User",
    required: true,
  },

  // Progress tracking
  quizProgress: QuizProgressSchema,
  videoProgress: VideoProgressSchema,

  // Version history
  versions: [versionSchema],

  // Stats
  views: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastAccessed: {
    type: Date,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware
StandardPageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Add to version history if content changed
  if (this.isModified("content")) {
    if (!this.versions) this.versions = [];

    this.versions.push({
      content: this.content,
      updatedAt: new Date(),
    });

    // Keep only last 5 versions
    if (this.versions.length > 5) {
      this.versions = this.versions.slice(-5);
    }
  }

  next();
});

// Unique compound index
StandardPageSchema.index({ chapterId: 1, pageNumber: 1 }, { unique: true });

// Additional indexes for performance
StandardPageSchema.index({ standardId: 1, subjectId: 1 });
StandardPageSchema.index({ createdBy: 1 });

module.exports = mongoose.model("StandardPage", StandardPageSchema);
