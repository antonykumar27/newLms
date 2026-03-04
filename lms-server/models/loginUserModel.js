const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // ========== BASIC INFORMATION ==========
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email address"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email address"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    phoneNumber: {
      type: String,
      required: [true, "Please enter your phone number"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
      index: true,
    },

    // ========== ROLE & TIER SYSTEM ==========
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "parent", null],
      default: null,
      required: false,
    },

    // 🎯 CORE TIER SYSTEM
    tier: {
      type: String,
      enum: ["free", "basic", "premium", "enterprise"],
      default: "free",
      index: true,
    },

    // ========== STUDENT SPECIFIC FIELDS ==========
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LmsStudentProfile",
    },

    standard: {
      type: String,
      trim: true,
    },
    standardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Standard",
    },

    medium: {
      type: String,
      enum: ["english", "malayalam", "hindi", "tamil", "kannada", "other"],
      default: "english",
    },

    wishTo: {
      type: String,
      enum: ["student", "teacher", "admin", "parent", null],
      default: null,
    },
    media: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "pdf"],
        },
        pdfUrl: String,
      },
    ],
    // ========== SUBSCRIPTION SYSTEM ==========
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
      },
      planName: {
        type: String,
        default: "free_trial",
      },
      status: {
        type: String,
        enum: ["active", "expired", "cancelled", "trial", "pending"],
        default: "trial",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe", "paypal", "cash", "upi", null],
        default: null,
      },
      lastPaymentDate: {
        type: Date,
      },
      trialEndsAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      },
    },

    // ========== USAGE LIMITS TRACKING ==========
    usage: {
      videosWatched: {
        type: Number,
        default: 0,
        min: 0,
      },
      notesCreated: {
        type: Number,
        default: 0,
        min: 0,
      },
      quizzesTaken: {
        type: Number,
        default: 0,
        min: 0,
      },
      liveClassesAttended: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastReset: {
        type: Date,
        default: Date.now,
      },
      // Monthly usage counters (resets monthly)
      currentMonth: {
        videos: { type: Number, default: 0 },
        notes: { type: Number, default: 0 },
        quizzes: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
      },
    },

    // ========== PAYMENT HISTORY ==========
    payments: [
      {
        paymentId: {
          type: String,
          required: true,
        },
        orderId: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          default: "INR",
        },
        status: {
          type: String,
          enum: ["success", "failed", "pending", "refunded"],
          required: true,
        },
        method: {
          type: String,
        },
        plan: {
          name: String,
          duration: String,
        },
        invoiceUrl: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    // ========== PROFILE INFORMATION ==========
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          this.name || "user",
        )}`;
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },

    dateOfBirth: {
      type: Date,
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
      pincode: String,
    },

    // ========== ACADEMIC INFORMATION ==========
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastAccessed: Date,
      },
    ],

    completedCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        completedAt: Date,
        score: Number,
        certificateId: String,
      },
    ],

    watchHistory: [
      {
        videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        lastWatched: Date,
        progress: Number,
        completed: Boolean,
      },
    ],

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    // ========== ANALYTICS & STATS ==========
    analytics: {
      totalWatchTime: {
        type: Number,
        default: 0, // in seconds
      },
      totalInteractions: {
        type: Number,
        default: 0,
      },
      streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActive: Date,
      },
      achievements: [
        {
          name: String,
          earnedAt: Date,
          icon: String,
        },
      ],
    },

    // ========== PREFERENCES ==========
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      language: {
        type: String,
        default: "english",
      },
      playbackSpeed: {
        type: Number,
        default: 1,
        min: 0.5,
        max: 2,
      },
      autoPlay: {
        type: Boolean,
        default: true,
      },
      downloadQuality: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },

    // ========== SOCIAL & REFERRAL ==========
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    referrals: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: Date,
        rewardGiven: Boolean,
      },
    ],

    // ========== SYSTEM FIELDS ==========
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    devices: [
      {
        deviceId: String,
        deviceType: String,
        lastUsed: Date,
        userAgent: String,
        ipAddress: String,
      },
    ],

    // ========== SECURITY TOKENS ==========
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    refreshToken: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpire;
        delete ret.refreshToken;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// ========== VIRTUAL FIELDS ==========
userSchema.virtual("fullName").get(function () {
  return this.name;
});

userSchema.virtual("isStudent").get(function () {
  return this.role === "student";
});

userSchema.virtual("isTeacher").get(function () {
  return this.role === "teacher";
});

userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

userSchema.virtual("isPremium").get(function () {
  return this.tier !== "free" && this.subscription.status === "active";
});

userSchema.virtual("isTrialActive").get(function () {
  if (this.subscription.status !== "trial") return false;
  return new Date() < this.subscription.trialEndsAt;
});

userSchema.virtual("daysUntilTrialEnds").get(function () {
  if (!this.isTrialActive) return 0;
  const diff = this.subscription.trialEndsAt - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

userSchema.virtual("subscriptionStatus").get(function () {
  if (this.subscription.status === "active") {
    if (new Date() > this.subscription.endDate) {
      return "expired";
    }
    return "active";
  }
  return this.subscription.status;
});

// ========== INDEXES ==========
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ phoneNumber: 1, isActive: 1 });
userSchema.index({ "subscription.status": 1, "subscription.endDate": 1 });
userSchema.index({ tier: 1, "subscription.status": 1 });
userSchema.index({ "analytics.streak.current": -1 });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

// ========== MIDDLEWARE ==========
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving new user
userSchema.pre("save", function (next) {
  if (this.isNew && !this.referralCode) {
    // Generate unique referral code: First 3 letters of name + random 5 chars
    const namePart = this.name.substring(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.referralCode = `${namePart}${randomPart}`;
  }
  next();
});

// Auto-update subscription status if endDate passed
userSchema.pre("save", function (next) {
  if (
    this.subscription.status === "active" &&
    this.subscription.endDate &&
    new Date() > this.subscription.endDate
  ) {
    this.subscription.status = "expired";
    this.tier = "free";
  }

  // Reset monthly usage if it's a new month
  const now = new Date();
  const lastReset = this.usage.lastReset;
  if (lastReset && now.getMonth() !== lastReset.getMonth()) {
    this.usage.currentMonth = { videos: 0, notes: 0, quizzes: 0, downloads: 0 };
    this.usage.lastReset = now;
  }

  next();
});

// ========== INSTANCE METHODS ==========
// Generate JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      tier: this.tier,
      isPremium: this.isPremium,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// Generate Refresh Token
userSchema.methods.getRefreshToken = function () {
  const refreshToken = jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" },
  );

  this.refreshToken = refreshToken;
  return refreshToken;
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

// Generate Email Verification Token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Check if user can access feature (usage limit)
userSchema.methods.canAccessFeature = function (feature, requiredCount = 1) {
  if (this.isPremium) return { allowed: true, reason: "premium_user" };

  const limits = {
    video: { monthly: 50, total: 200 },
    note: { monthly: 100, total: 500 },
    quiz: { monthly: 30, total: 100 },
    download: { monthly: 10, total: 50 },
  };

  const featureLimit = limits[feature];
  if (!featureLimit) return { allowed: true, reason: "no_limit" };

  const monthlyKey = `${feature}s`;
  const totalKey = `${feature}Count`;

  const monthlyUsed = this.usage.currentMonth[monthlyKey] || 0;
  const totalUsed = this.usage[totalKey] || 0;

  if (monthlyUsed + requiredCount > featureLimit.monthly) {
    return {
      allowed: false,
      reason: "monthly_limit_exceeded",
      used: monthlyUsed,
      limit: featureLimit.monthly,
      resetDate: new Date(
        this.usage.lastReset.getFullYear(),
        this.usage.lastReset.getMonth() + 1,
        1,
      ),
    };
  }

  if (totalUsed + requiredCount > featureLimit.total) {
    return {
      allowed: false,
      reason: "total_limit_exceeded",
      used: totalUsed,
      limit: featureLimit.total,
    };
  }

  return { allowed: true, reason: "within_limits" };
};

// Increment usage
userSchema.methods.incrementUsage = function (feature, count = 1) {
  const monthlyKey = `${feature}s`;
  const totalKey = `${feature}Count`;

  if (this.usage.currentMonth[monthlyKey] !== undefined) {
    this.usage.currentMonth[monthlyKey] += count;
  }

  if (this.usage[totalKey] !== undefined) {
    this.usage[totalKey] += count;
  }

  return this.save();
};

// Check subscription expiry
userSchema.methods.checkSubscriptionExpiry = function () {
  if (this.subscription.status === "active" && this.subscription.endDate) {
    const daysLeft = Math.ceil(
      (this.subscription.endDate - new Date()) / (1000 * 60 * 60 * 24),
    );

    return {
      isActive: true,
      daysLeft,
      willAutoRenew: this.subscription.autoRenew,
      endDate: this.subscription.endDate,
    };
  }

  return {
    isActive: false,
    reason: this.subscription.status,
    canRenew: this.subscription.status === "expired",
  };
};

// ========== STATIC METHODS ==========
// Find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select("+password");
};

// Count users by role
userSchema.statics.countByRole = function (role) {
  return this.countDocuments({ role });
};

// Get premium users
userSchema.statics.getPremiumUsers = function () {
  return this.find({
    "subscription.status": "active",
    tier: { $ne: "free" },
  });
};

// Get users with expiring subscriptions
userSchema.statics.getExpiringSubscriptions = function (days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return this.find({
    "subscription.status": "active",
    "subscription.endDate": {
      $lte: date,
      $gte: new Date(),
    },
  });
};

// Find by referral code
userSchema.statics.findByReferralCode = function (code) {
  return this.findOne({ referralCode: code });
};

// Analytics: Get user growth
userSchema.statics.getUserGrowth = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
        premiumCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$tier", "free"] },
                  { $eq: ["$subscription.status", "active"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
};

module.exports = mongoose.model("User", userSchema);
