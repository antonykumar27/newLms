const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    // 🔐 Core permission
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    standard: {
      // ✅ fixed typo
      type: mongoose.Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    enrolledDate: {
      type: Date,
      default: Date.now,
    },

    // 💰 Payment
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "free", "refunded", "failed", "cancelled"],
      default: "pending",
      index: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // ⚡ Access control
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    accessExpiresAt: {
      type: Date,
      required: false,
    },

    // 📈 Progress
    progress: {
      completedLessons: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalLessons: {
        type: Number,
        default: 0,
        min: 0,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastAccessed: {
        type: Date,
        default: null,
      },
    },

    // 📦 Metadata
    enrolledVia: {
      type: String,
      enum: ["web", "mobile", "admin"],
      default: "web",
    },

    couponCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// 📊 Indexes
enrollmentSchema.index({ student: 1, standard: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, isActive: 1 });
enrollmentSchema.index({ standard: 1, paymentStatus: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
