const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const courseSchema = new Schema(
  {
    // 🔹 Page reference
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "StandardPage",
      required: true,
      index: true,
    },
    title: String,

    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "pdf"],
      default: "video",
    },

    // 🔹 Instructor
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔹 Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    // 🔹 Optional (future-proof)
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// 🔹 Indexes
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ pageId: 1 });

module.exports = model("Course", courseSchema);
