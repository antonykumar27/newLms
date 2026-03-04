// models/AttemptCounter.js
const mongoose = require("mongoose");

const attemptCounterSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attemptCounter: {
    type: Number,
    default: 0,
  },
});

// Unique compound index
attemptCounterSchema.index({ quizId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("QuziAttemptCounter", attemptCounterSchema);
