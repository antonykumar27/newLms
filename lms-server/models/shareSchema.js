const mongoose = require("mongoose");
const { Schema } = mongoose;
const shareSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    videoId: {
      type: String, // optional
      default: null,
    },

    platform: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Share", shareSchema);
