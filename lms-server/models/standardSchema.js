const mongoose = require("mongoose");
const { Schema } = mongoose;

const standardSchema = new Schema(
  {
    // ---------------- BASIC INFO ----------------
    standard: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    medium: {
      type: String,
      required: true,
      enum: ["english", "malayalam"],
      lowercase: true,
      trim: true,
    },

    // ---------------- PRICING ----------------
    pricing: {
      monthly: {
        type: Number,
        required: true,
        min: 0,
      },
      yearly: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // ---------------- TAX ----------------
    gstPercentage: {
      type: Number,
      default: 18, // India GST
      min: 0,
      max: 100,
    },
    percentage: {
      type: String,

      default: null,
    },

    // ---------------- DISCOUNT (YEARLY ONLY) ----------------
    discount: {
      type: {
        type: String,
        enum: ["percentage", "flat"],
        default: undefined,
      },
      value: {
        type: Number,
        default: 0,
      },
      appliesTo: {
        type: String,
        enum: ["yearly", "monthly"],
        default: "yearly",
      },
    },

    // ---------------- MEDIA ----------------
    media: [
      {
        url: { type: String },
        type: {
          type: String,
          enum: ["image", "video", "pdf"],
        },
        pdfUrl: { type: String },
      },
    ],

    // ---------------- META ----------------
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ---------------- UNIQUE INDEX ----------------
standardSchema.index({ standard: 1, medium: 1 }, { unique: true });

// ---------------- EXPORT ----------------
module.exports = mongoose.model("Standard", standardSchema);
