const mongoose = require("mongoose");
const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lectureId: {
      // Change from videoId to lectureId
      type: String, // or Schema.Types.ObjectId
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["course", "lecture", "video"], // Change from "video" to "lecture"
      required: false,
    },
  },
  { timestamps: true },
);

// Update unique index
likeSchema.index({ user: 1, course: 1, lectureId: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
