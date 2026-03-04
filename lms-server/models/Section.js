// models/Section.js
const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
      minlength: [3, "Section title must be at least 3 characters"],
      maxlength: [200, "Section title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
      index: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    requiresCompletion: {
      type: Boolean,
      default: false,
    },
    previewVideo: {
      type: String,
      default: null,
    },
    // Stats
    videoCount: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "deleted"],
      default: "draft",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate for videos
SectionSchema.virtual("videos", {
  ref: "Video",
  localField: "_id",
  foreignField: "sectionId",
  justOne: false,
});

// Indexes for better performance
SectionSchema.index({ courseId: 1, order: 1 });
SectionSchema.index({ status: 1 });

const Section = mongoose.model("Section", SectionSchema);
module.exports = Section;
