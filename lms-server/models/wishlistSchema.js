const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

wishlistSchema.index({ user: 1, course: 1 }, { unique: true }); // Prevent duplicates

module.exports = mongoose.model("Wishlist", wishlistSchema);
