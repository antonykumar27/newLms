const mongoose = require("mongoose");
const { Schema } = mongoose;

const standardChapterSchema = new Schema(
  {
    // Reference to Subject
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "StandardSubject",

      required: true,
    },

    // Basic Info
    chapterNumber: {
      type: Number,
      required: true,
    },

    chapterTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    part: {
      type: String,
      trim: true,
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

    // Chapter metadata
    totalPages: {
      type: Number,
      default: 0,
    },

    estimatedDuration: {
      type: Number, // in minutes
      default: 0,
    },

    // Tracking
    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
standardChapterSchema.index(
  { subjectId: 1, chapterNumber: 1 },
  { unique: true },
);

standardChapterSchema.index({ subjectId: 1, order: 1 });
standardChapterSchema.index({ isActive: 1 });

module.exports = mongoose.model("StandardChapter", standardChapterSchema);
