const mongoose = require("mongoose");
const { Schema } = mongoose;

const quizAttemptSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    quizCategory: {
      type: String,
      enum: ["PAGE", "CHAPTER", "SUBJECT"],
      required: true,
    },

    // ========== 🎯 SMART CONTEXT IDS ==========
    contextIds: {
      standardId: {
        type: Schema.Types.ObjectId,
        ref: "Standard",
        default: null,
      },
      subjectId: { type: Schema.Types.ObjectId, ref: "Subject", default: null },
      chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
      pageId: { type: Schema.Types.ObjectId, ref: "Page", default: null },
    },

    // 📊 RESULTS
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true },
    marksObtained: { type: Number, required: true },
    score: { type: Number, min: 0, max: 100 },

    // ⏱ TIME
    timeTaken: Number,
    date: { type: Date, default: Date.now },

    // 👤 USER INFO (denormalized)
    username: String,
    email: String,

    // 🏆 FLAGS
    isBestAttempt: { type: Boolean, default: false },
    isBestForContext: { type: Boolean, default: false }, // NEW: For PAGE/CHAPTER level best
    passed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// ========== 🔥 ULTIMATE INDEXES ==========
quizAttemptSchema.index({ quizId: 1, userId: 1 }, { unique: false }); // Allow multiple
quizAttemptSchema.index({ userId: 1, date: -1 });
quizAttemptSchema.index({ "contextIds.subjectId": 1, userId: 1, score: -1 });
quizAttemptSchema.index({ "contextIds.chapterId": 1, userId: 1, score: -1 });
quizAttemptSchema.index({ "contextIds.pageId": 1, userId: 1, score: -1 });

// ========== 🛡️ UNIQUE COMPOUND INDEX (Prevents race condition) ==========
quizAttemptSchema.index(
  { quizId: 1, userId: 1, attemptNumber: 1 },
  { unique: true }, // 🔥 CRITICAL: Ensures no duplicate attempt numbers
);

// ========== 🎯 ATOMIC ATTEMPT NUMBER GENERATION ==========
quizAttemptSchema.statics.getNextAttemptNumber = async function (
  quizId,
  userId,
  session,
) {
  const result = await this.findOneAndUpdate(
    { quizId, userId },
    { $inc: { attemptCounter: 1 } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      session,
    },
  ).select("attemptCounter");

  return result?.attemptCounter || 1;
};

// ========== 🏆 ULTIMATE BEST ATTEMPT UPDATE ==========
quizAttemptSchema.statics.updateBestAttempts = async function (
  quizId,
  userId,
  contextIds,
  session,
) {
  const { subjectId, chapterId, pageId } = contextIds;

  // 1. Quiz level best attempt
  const quizBest = await this.findOne({ quizId, userId })
    .sort({ score: -1, attemptNumber: -1 })
    .session(session);

  if (quizBest) {
    await this.updateMany(
      { quizId, userId },
      { $set: { isBestAttempt: false } },
      { session },
    );
    await this.findByIdAndUpdate(
      quizBest._id,
      { $set: { isBestAttempt: true } },
      { session },
    );
  }

  // 2. Context level best attempts (PAGE/CHAPTER/SUBJECT)
  const contextBestPromises = [];

  if (subjectId) {
    contextBestPromises.push(
      this.updateContextBestAttempt(userId, "subjectId", subjectId, session),
    );
  }
  if (chapterId) {
    contextBestPromises.push(
      this.updateContextBestAttempt(userId, "chapterId", chapterId, session),
    );
  }
  if (pageId) {
    contextBestPromises.push(
      this.updateContextBestAttempt(userId, "pageId", pageId, session),
    );
  }

  await Promise.all(contextBestPromises);
};

// Helper for context best
quizAttemptSchema.statics.updateContextBestAttempt = async function (
  userId,
  contextField,
  contextId,
  session,
) {
  const query = {
    userId,
    [`contextIds.${contextField}`]: contextId,
  };

  const best = await this.findOne(query)
    .sort({ score: -1, attemptNumber: -1 })
    .session(session);

  if (best) {
    await this.updateMany(
      { ...query, isBestForContext: true },
      { $set: { isBestForContext: false } },
      { session },
    );
    await this.findByIdAndUpdate(
      best._id,
      { $set: { isBestForContext: true } },
      { session },
    );
  }
};

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
