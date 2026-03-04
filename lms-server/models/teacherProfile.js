const mongoose = require("mongoose");

// Sub-schemas for better organization
//ivide teacherinte skill ethanennum athu ethu level anennum parayunna field
const expertiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "intermediate",
  },
  years: { type: Number, min: 0 },
  verified: { type: Boolean, default: false },
});
//ivide teacherinte qualification ethanennu parayunna bhagam  ethanennum athu ethu level anennum parayunna field
const qualificationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, min: 1900, max: new Date().getFullYear() },
  certificateUrl: String,
  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
//ivide teacherinte experience ethanennu parayunna bhagam  ethanennum athu ethu level anennum parayunna field
const experienceSchema = new mongoose.Schema({
  position: { type: String, required: true },
  organization: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  currentlyWorking: { type: Boolean, default: false },
  verificationUrl: String,
  verified: { type: Boolean, default: false },
});

const teacherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    isApplied: {
      type: Boolean,
      default: false,
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", "approved"],
      default: "pending",
    },
    // ========== APPLICATION & VERIFICATION ==========
    application: {
      // ✅ FIXED: Consolidated status fields
      status: {
        type: String,
        enum: [
          "not_applied",
          "pending",
          "approved",
          "rejected",
          "suspended",
          "inactive",
        ],
        default: "not_applied",
      },
      submittedAt: Date,
      approvedAt: Date,
      rejectedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectionReason: String,
    },

    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      method: String, // "manual", "automated", "third_party"
      nextReviewDate: Date,
      expiryDate: Date, // For time-limited verification
    },

    // ========== DOCUMENTS ==========
    // ✅ FIXED: Single objects instead of arrays where logical
    // documents: {
    //   resume: documentSchema,
    //   idProof: {
    //     ...documentSchema.obj,
    //     idType: {
    //       type: String,
    //       enum: [
    //         "passport",
    //         "driver_license",
    //         "national_id",
    //         "pan_card",
    //         "aadhaar",
    //         "other",
    //       ],
    //     },
    //     idNumber: String,
    //   },
    //   additionalDocuments: [documentSchema], // For certificates, etc
    // },

    resume: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "pdf"],
        },
        pdfUrl: String,
      },
    ],
    idProof: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "pdf"],
        },
        pdfUrl: String,
      },
    ],
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
    assignedClasses: [
      {
        standard: {
          type: Number,
          required: true,
          enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
        subject: {
          type: String,
          required: true,
          enum: [
            "Maths",
            "Science",
            "English",
            "Physics",
            "Chemistry",
            "Biology",
            "History",
            "Geography",
            "Economics",
            "Hindi",
            "Mathematics",
            "Basic Science",
          ],
        },
        // Teaching Type
        medium: String,
        part: {
          type: String,
          enum: ["1", "2", "I", "II"],
          required: false,
          default: undefined,
        },
      },
    ],
    academicYear: {
      type: String,
      required: true,
      default: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // ✅ 0 = Jan, 5 = June

        // Academic year starts from June (month >= 5)
        return month >= 5 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      },
    },

    teachingType: {
      type: String,
      enum: ["school", "exam", "skill"],
      required: true,
    },
    // Exam/Competitive fields
    examCourses: [
      {
        examName: String,
        subject: String,
        level: String,
      },
    ],
    // Skill-based fields
    skillCourses: [
      {
        skillName: String,
        category: String,
        level: String,
      },
    ],
    // ========== BRAND & PROFILE ==========
    // custom Slug pinned padikkanam
    profile: {
      customSlug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [
          /^[a-z0-9-]+$/,
          "Slug can only contain lowercase letters, numbers, and hyphens",
        ],
      },
      headline: { type: String, maxlength: 120 },
      tagline: { type: String, maxlength: 60 },
      bio: { type: String, maxlength: 2000 },
      teachingPhilosophy: { type: String, maxlength: 1000 },
      // ✅ FIXED: Structured expertise
      expertise: [expertiseSchema],
      qualifications: [qualificationSchema],
      experience: [experienceSchema],
      languages: [
        {
          language: String,
          proficiency: {
            type: String,
            enum: ["basic", "conversational", "fluent", "native"],
          },
        },
      ],
    },

    // ========== SOCIAL & CONTACT ==========
    social: {
      linkedin: {
        type: String,
        match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/],
      },
      github: { type: String, match: [/^https?:\/\/(www\.)?github\.com\/.+/] },
      twitter: {
        type: String,
        match: [/^https?:\/\/(www\.)?twitter\.com\/.+/],
      },
      website: { type: String, match: [/^https?:\/\/.+/] },
      youtube: {
        type: String,
        match: [/^https?:\/\/(www\.)?youtube\.com\/.+/],
      },
      portfolio: String,
    },

    contact: {
      publicEmail: { type: String, match: [/^\S+@\S+\.\S+$/] },
      publicPhone: String,
      timezone: { type: String, default: "UTC" },
      responseTime: { type: Number, default: 24, min: 1, max: 168 }, // hours
    },

    // ========== PAYMENT & COMMISSIONS ==========
    payment: {
      // Rates
      hourlyRate: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: "INR", uppercase: true },

      // Commission
      commissionRate: { type: Number, min: 0, max: 100, default: 70 },
      customCommission: { type: Boolean, default: false },
      commissionDetails: {
        type: { type: String, enum: ["fixed", "tiered", "graduated"] },
        tiers: [
          {
            minSales: Number,
            maxSales: Number,
            rate: Number,
          },
        ],
        effectiveFrom: Date,
        notes: String,
      },

      // Payout settings
      payoutMethod: {
        type: {
          type: String,
          enum: ["bank", "paypal", "stripe", "razorpay", "upi"],
        },
        details: mongoose.Schema.Types.Mixed,
        isDefault: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
      },
    },

    // ========== FINANCIAL & BANKING ==========
    bank: {
      accountName: String,
      accountNumber: { type: String, sparse: true },
      bankName: String,
      branch: String,
      ifscCode: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    tax: {
      taxId: String, // PAN, GST, etc
      taxForm: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
    },

    // ========== STATISTICS (AGGREGATED) ==========
    stats: {
      // Courses
      totalCourses: { type: Number, default: 0, min: 0 },
      publishedCourses: { type: Number, default: 0, min: 0 },
      draftCourses: { type: Number, default: 0, min: 0 },
      archivedCourses: { type: Number, default: 0, min: 0 },

      // Students
      totalStudents: { type: Number, default: 0, min: 0 },
      activeStudents: { type: Number, default: 0, min: 0 },
      completedStudents: { type: Number, default: 0, min: 0 },

      // Revenue
      totalRevenue: { type: Number, default: 0, min: 0 },
      monthlyRevenue: { type: Number, default: 0, min: 0 },
      pendingWithdrawals: { type: Number, default: 0, min: 0 },
      totalWithdrawn: { type: Number, default: 0, min: 0 },
      lastWithdrawal: Date,

      // Ratings
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0, min: 0 },
      averageCompletionRate: { type: Number, default: 0, min: 0, max: 100 },

      // Activity
      joinedDate: { type: Date, default: Date.now },
      lastCourseCreated: Date,
      lastPayment: Date,
      lastLogin: Date,

      // Engagement
      responseRate: { type: Number, default: 0, min: 0, max: 100 },
      averageResponseTime: { type: Number, default: 0, min: 0 }, // hours
    },

    // ========== SETTINGS ==========
    settings: {
      // Profile visibility
      publicProfile: { type: Boolean, default: true },
      showEarnings: { type: Boolean, default: false },
      showContactInfo: { type: Boolean, default: false },

      // Course settings
      autoPublish: { type: Boolean, default: false },
      allowReviews: { type: Boolean, default: true },
      allowStudentMessages: { type: Boolean, default: true },

      // Notifications
      emailNotifications: {
        newEnrollment: { type: Boolean, default: true },
        newReview: { type: Boolean, default: true },
        withdrawal: { type: Boolean, default: true },
        courseUpdates: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },

      // Auto-renew
      autoRenewContract: { type: Boolean, default: true },
      notifyBeforeExpiry: { type: Boolean, default: true },
      expiryReminderDays: { type: Number, default: 7, min: 1, max: 30 },
    },

    // ========== ACCESS & PERMISSIONS ==========
    access: {
      level: {
        type: String,
        enum: ["basic", "premium", "enterprise"],
        default: "basic",
      },
      features: [
        {
          feature: String,
          grantedAt: Date,
          expiresAt: Date,
          grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      contractType: {
        type: String,
        enum: ["standard", "premium", "custom"],
        default: "standard",
      },
      contractExpiry: Date,
    },

    // ========== COMPLIANCE & BLOCKING ==========
    compliance: {
      isBanned: { type: Boolean, default: false },
      bannedAt: Date,
      bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      banReason: String,
      canReapplyAfter: Date,
      previousRejections: [
        {
          date: Date,
          reason: String,
          feedback: String,
          rejectedBy: {
            adminId: mongoose.Schema.Types.ObjectId,
            name: String,
          },
        },
      ],
      warnings: [
        {
          date: Date,
          reason: String,
          severity: { type: String, enum: ["low", "medium", "high"] },
          issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          acknowledged: { type: Boolean, default: false },
        },
      ],
    },

    // ========== ONBOARDING ==========
    onboarding: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      steps: {
        profileSetup: { type: Boolean, default: false },
        firstCourse: { type: Boolean, default: false },
        paymentSetup: { type: Boolean, default: false },
        verification: { type: Boolean, default: false },
        publishCourse: { type: Boolean, default: false },
        studentEngagement: { type: Boolean, default: false },
      },
      currentStep: { type: String, default: "profileSetup" },
      lastPrompted: Date,
    },

    // ========== METADATA ==========
    metadata: {
      lastProfileUpdate: Date,
      lastStatsUpdate: Date,
      lastActivity: Date,
      profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
      ipAddresses: [String],
      userAgent: String,
      signupSource: String, // "web", "mobile", "referral", "admin"
      referralCode: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields when converting to JSON ithu remove cheythittu bakkiyullathu mathram return cheyum
        delete ret.bank;
        delete ret.tax;
        delete ret.compliance;
        delete ret.metadata;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// ==================== INDEXES ====================
teacherProfileSchema.index({ "profile.customSlug": 1 });
teacherProfileSchema.index({ "application.status": 1 });
teacherProfileSchema.index({ "verification.isVerified": 1 });
teacherProfileSchema.index({ "stats.rating": -1 });
teacherProfileSchema.index({ "stats.totalRevenue": -1 });
teacherProfileSchema.index({ "profile.expertise.name": 1 });
teacherProfileSchema.index({ "payment.commissionRate": 1 });
teacherProfileSchema.index({ "metadata.lastActivity": -1 });

// ==================== VIRTUALS ====================
teacherProfileSchema.virtual("profileUrl").get(function () {
  if (this.profile.customSlug) {
    return `/teacher/${this.profile.customSlug}`;
  }
  return `/teacher/${this.user}`;
});

teacherProfileSchema.virtual("isActive").get(function () {
  return (
    this.application.status === "approved" &&
    this.verification.isVerified === true &&
    !this.compliance.isBanned
  );
});

teacherProfileSchema.virtual("teachingExperience").get(function () {
  if (!this.profile.experience || this.profile.experience.length === 0)
    return 0;

  const teachingExp = this.profile.experience.filter(
    (exp) =>
      exp.position.toLowerCase().includes("teacher") ||
      exp.position.toLowerCase().includes("instructor") ||
      exp.position.toLowerCase().includes("professor") ||
      exp.position.toLowerCase().includes("trainer"),
  );

  let totalYears = 0;
  teachingExp.forEach((exp) => {
    const start = new Date(exp.startDate);
    const end = exp.currentlyWorking ? new Date() : new Date(exp.endDate);
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    totalYears += Math.max(0, years);
  });

  return Math.round(totalYears * 10) / 10; // Round to 1 decimal
});

teacherProfileSchema.virtual("monthlyEarnings").get(function () {
  return this.stats.monthlyRevenue * (this.payment.commissionRate / 100);
});

// ==================== INSTANCE METHODS ====================
teacherProfileSchema.methods.getPublicProfile = function () {
  const publicProfile = this.toObject();

  // Return only public-safe data
  return {
    profile: publicProfile.profile,
    social: publicProfile.social,
    contact: {
      publicEmail: publicProfile.contact.publicEmail,
      publicPhone: publicProfile.contact.publicPhone,
    },
    stats: {
      totalCourses: publicProfile.stats.totalCourses,
      totalStudents: publicProfile.stats.totalStudents,
      rating: publicProfile.stats.rating,
      totalReviews: publicProfile.stats.totalReviews,
      teachingExperience: this.teachingExperience,
    },
    profileUrl: this.profileUrl,
    isVerified: publicProfile.verification.isVerified,
  };
};

teacherProfileSchema.methods.hasExpertise = function (expertiseName) {
  return this.profile.expertise.some(
    (exp) => exp.name.toLowerCase() === expertiseName.toLowerCase(),
  );
};

// ==================== STATIC METHODS ====================
teacherProfileSchema.statics.findActiveTeachers = function (limit = 50) {
  return this.find({
    "application.status": "approved",
    "verification.isVerified": true,
    "compliance.isBanned": false,
    "settings.publicProfile": true,
  })
    .sort({ "stats.rating": -1, "stats.totalStudents": -1 })
    .limit(limit)
    .select("profile stats verification")
    .populate("user", "name avatar email");
};

teacherProfileSchema.statics.findByExpertise = function (
  expertise,
  level = null,
) {
  const query = {
    "profile.expertise.name": { $regex: new RegExp(expertise, "i") },
    "application.status": "approved",
    "settings.publicProfile": true,
  };

  if (level) {
    query["profile.expertise.level"] = level;
  }

  return this.find(query)
    .select("profile stats")
    .populate("user", "name avatar")
    .sort({ "stats.rating": -1 });
};

teacherProfileSchema.statics.getTopEarners = function (
  limit = 20,
  timeframe = "monthly",
) {
  const sortField =
    timeframe === "monthly" ? "stats.monthlyRevenue" : "stats.totalRevenue";

  return this.find({
    "application.status": "approved",
    "verification.isVerified": true,
    [sortField]: { $gt: 0 },
  })
    .sort({ [sortField]: -1 })
    .limit(limit)
    .select("profile stats payment.commissionRate")
    .populate("user", "name");
};

// ==================== MIDDLEWARE ====================
teacherProfileSchema.pre("save", function (next) {
  // Auto-generate profile completion percentage
  if (this.isModified()) {
    let completion = 0;
    const fields = [
      this.profile?.headline ? 10 : 0,
      this.profile?.bio ? 10 : 0,
      this.profile?.expertise?.length > 0 ? 10 : 0,
      this.profile?.qualifications?.length > 0 ? 10 : 0,
      this.profile?.experience?.length > 0 ? 10 : 0,
      this.documents?.resume?.url ? 10 : 0,
      this.documents?.idProof?.url ? 10 : 0,
      this.social?.linkedin || this.social?.website ? 10 : 0,
      this.profile?.teachingPhilosophy ? 10 : 0,
      this.profile?.customSlug ? 10 : 0,
    ];

    completion = fields.reduce((sum, value) => sum + value, 0);
    this.metadata.profileCompletion = completion;
    this.metadata.lastProfileUpdate = new Date();
  }

  next();
});

teacherProfileSchema.post("save", function (doc) {
  // Emit event for cache invalidation, analytics, etc.
  // This will be handled by your service layer
});

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);
