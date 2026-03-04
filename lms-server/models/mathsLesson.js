// server/models/Lesson.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const versionSchema = new mongoose.Schema({
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
});

const mathslessonSchema = new mongoose.Schema({
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
  // Media (for chapter cover/image)
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
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: "StandardChapter",
    required: true,
    index: true,
  },
  pageNumber: {
    type: String, // Can be ObjectId or string
    required: true,
  },
  teacherId: {
    type: String, // Can be ObjectId or string
    required: true,
  },
  // Version history
  versions: [versionSchema],

  // Stats
  views: {
    type: Number,
    default: 0,
  },
  lastAccessed: Date,

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

// Pre-save middleware to add version
mathslessonSchema.pre("save", function (next) {
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

module.exports = mongoose.model("MathsLesson", mathslessonSchema);
