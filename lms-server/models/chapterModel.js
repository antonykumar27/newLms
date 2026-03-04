const mongoose = require("mongoose");
const { Schema } = mongoose;

const chapterSchema = new Schema({
  standard: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  chapterNumber: {
    type: Number,
    required: true,
  },
  chapterName: {
    type: String,
    required: true,
  },
  Title: {
    type: String,
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String,
    default: "/images/default-chapter.png",
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  topics: [
    {
      name: String,
      description: String,
    },
  ],
  learningOutcomes: [
    {
      type: String,
    },
  ],
  videoLinks: [
    {
      title: String,
      url: String,
      duration: String,
    },
  ],
  notes: [
    {
      title: String,
      content: String,
    },
  ],
  isFree: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chapter", chapterSchema);
