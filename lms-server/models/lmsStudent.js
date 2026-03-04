const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==================== SUB-SCHEMAS ====================
const preferenceSchema = new Schema(
  {
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    dailyGoal: {
      type: Number,
      default: 30, // minutes
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
    language: {
      type: String,
      default: "en",
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
    playbackSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
  },
  { _id: false },
);

const badgeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    description: String,
  },
  { _id: false },
);

const wishlistSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const engagementSchema = new Schema(
  {
    doubtsAsked: { type: Number, default: 0 },
    forumPosts: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    peerReviews: { type: Number, default: 0 },
    lastActive: Date,
  },
  { _id: false },
);

const statsSchema = new Schema(
  {
    totalEnrollments: { type: Number, default: 0 },
    completedCourses: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 }, // in seconds
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLearningDate: Date,
    totalLessonsCompleted: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    rank: Number,
    totalCertificates: { type: Number, default: 0 },
  },
  { _id: false },
);

const currentSessionSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    lectureId: { type: Schema.Types.ObjectId, ref: "Lecture" },
    startTime: Date,
    lastActivity: Date,
  },
  { _id: false },
);

const metadataSchema = new Schema(
  {
    onboardingCompleted: { type: Boolean, default: false },
    lastProfileUpdate: Date,
    source: { type: String, enum: ["web", "mobile", "admin"], default: "web" },
    registeredIp: String,
    lastLoginIp: String,
    timezone: String,
  },
  { _id: false },
);

// ==================== MAIN SCHEMA ====================
const studentProfileSchema = new mongoose.Schema(
  {
    // Core
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Academic Info (for school/college version)
    academicInfo: {
      standardId: { type: Schema.Types.ObjectId, ref: "Standard" },
      schoolName: String,
      admissionNumber: String,
      batch: String,
      section: String,
      rollNumber: String,
    },

    // Personal Info
    personalInfo: {
      dateOfBirth: Date,
      gender: { type: String, enum: ["male", "female", "other"] },
      profilePhoto: String,
      phoneNumber: String,
      alternatePhone: String,
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "IN" },
      },
    },

    // Parent/Guardian Info
    parentInfo: {
      name: String,
      relationship: { type: String, enum: ["father", "mother", "guardian"] },
      phone: String,
      email: String,
      occupation: String,
    },

    // ========== 🎯 SUMMARY FIELDS (NOT ARRAYS) ==========
    preferences: { type: preferenceSchema, default: () => ({}) },
    engagement: { type: engagementSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) },
    currentSession: { type: currentSessionSchema, default: () => ({}) },
    metadata: { type: metadataSchema, default: () => ({}) },

    // ========== ✅ SMALL ARRAYS (SAFE TO KEEP) ==========
    badges: [badgeSchema],
    wishlist: [wishlistSchema],

    // ========== ⚠️ REFERENCE IDS ONLY (NOT FULL DATA) ==========
    // These are just references, actual data in separate collections
    activeEnrollmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Enrollment",
      },
    ],

    completedEnrollmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Enrollment",
      },
    ],

    certificateIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Certificate",
      },
    ],

    recentLectureIds: [
      {
        lectureId: { type: Schema.Types.ObjectId, ref: "Lecture" },
        lastAccessed: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ==================== INDEXES ====================
studentProfileSchema.index({ "academicInfo.standardId": 1 });
studentProfileSchema.index({ "academicInfo.schoolName": 1 });
studentProfileSchema.index({ "stats.totalPoints": -1 });
studentProfileSchema.index({ "stats.lastLearningDate": -1 });
studentProfileSchema.index({ "parentInfo.phone": 1 });
studentProfileSchema.index({ "personalInfo.phoneNumber": 1 });

// ==================== VIRTUAL POPULATE ====================
studentProfileSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "activeEnrollmentIds",
  foreignField: "_id",
  justOne: false,
});

studentProfileSchema.virtual("certificates", {
  ref: "Certificate",
  localField: "certificateIds",
  foreignField: "_id",
  justOne: false,
});

studentProfileSchema.virtual("recentLectures", {
  ref: "Lecture",
  localField: "recentLectureIds.lectureId",
  foreignField: "_id",
  justOne: false,
});

// ==================== INSTANCE METHODS ====================
studentProfileSchema.methods.updateStats = async function () {
  const Enrollment = mongoose.model("Enrollment");
  const Certificate = mongoose.model("Certificate");

  // Get counts from separate collections
  const [enrollments, certificates] = await Promise.all([
    Enrollment.countDocuments({ userId: this.user }),
    Certificate.countDocuments({ userId: this.user }),
  ]);

  this.stats.totalEnrollments = enrollments;
  this.stats.totalCertificates = certificates;

  return this.save();
};

studentProfileSchema.methods.addToWishlist = async function (courseId) {
  if (!this.wishlist.some((item) => item.courseId.equals(courseId))) {
    this.wishlist.push({ courseId, addedAt: new Date() });
    await this.save();
  }
  return this;
};

studentProfileSchema.methods.updateLastActive = function () {
  this.engagement.lastActive = new Date();
  this.stats.lastLearningDate = new Date();
  return this.save();
};

// ==================== STATIC METHODS ====================
studentProfileSchema.statics.getLeaderboard = function (
  standardId,
  limit = 10,
) {
  return this.find({ "academicInfo.standardId": standardId })
    .sort({ "stats.totalPoints": -1 })
    .limit(limit)
    .populate("user", "name email avatar");
};

studentProfileSchema.statics.getOrCreate = async function (userId) {
  let profile = await this.findOne({ user: userId });

  if (!profile) {
    profile = await this.create({ user: userId });
  }

  return profile;
};

module.exports = mongoose.model("LmsStudentProfile", studentProfileSchema);
