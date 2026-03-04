const mongoose = require("mongoose");
const blockSchema = require("./block");

const textbookPageSchema = new mongoose.Schema(
  {
    // 🔑 IDENTIFIERS
    pageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    textbookId: {
      type: String,
      required: true,
      index: true,
    },

    chapter: {
      type: String,
      required: true,
    },

    pageNumber: {
      type: Number,
      required: true,
    },

    // 📘 CONTENT
    title: {
      type: String,
      required: true,
    },

    content: {
      type: [blockSchema], // ✅ SINGLE SOURCE OF TRUTH
      required: true,
      default: [],
    },

    // 👤 METADATA
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    version: {
      type: Number,
      default: 1,
    },

    lastEdited: {
      type: Date,
      default: Date.now,
    },

    // 🚀 PUBLISHING
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: Date,

    // 🕓 VERSIONING
    previousVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TextbookPage",
    },

    // 🔍 SEARCH
    tags: [String],
    keywords: [String],
  },
  {
    timestamps: true,
  },
);

// 📈 INDEXES (PERFECT)
textbookPageSchema.index({ textbookId: 1, chapter: 1, pageNumber: 1 });
textbookPageSchema.index({ tags: 1 });
textbookPageSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model("TextbookPage", textbookPageSchema);
