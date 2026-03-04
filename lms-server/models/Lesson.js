const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: String,
    videoUrl: String,
    duration: Number, // in minutes

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LessonLMS", lessonSchema);
