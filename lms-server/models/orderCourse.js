const mongoose = require("mongoose");

const pricingBreakdownSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    gstPercentage: {
      type: Number,
      required: true,
    },

    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    // 👤 User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📘 Course Snapshot
    standardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StandardSubject",
      required: true,
      index: true,
    },

    standardLevel: Number,
    medium: String,

    // 💰 Pricing
    pricing: pricingBreakdownSchema,

    currency: {
      type: String,
      default: "INR",
    },

    // 💳 Payment Info
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "wallet", "free"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "cancelled", "refunded"],
      default: "created",
      index: true,
    },

    gatewayOrderId: {
      type: String,
      index: true,
    },

    gatewayPaymentId: String,
    gatewaySignature: String,

    // 🧾 Invoice Fields
    invoiceNumber: String,

    // ⏱ Timeline
    paidAt: Date,
    refundedAt: Date,

    // 📦 Subscription Period
    subscription: {
      startDate: Date,
      endDate: Date,
      academicYear: {
        start: Number,
        end: Number,
        validTill: Date,
      },
    },

    notes: String,
  },
  { timestamps: true },
);

// 📊 Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ standardId: 1, paymentStatus: 1 });
orderSchema.index({ gatewayOrderId: 1 });

module.exports = mongoose.model("Order", orderSchema);
