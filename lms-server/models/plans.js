const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    tier: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      required: true,
    },
    price: {
      monthly: Number,
      yearly: Number,
      lifetime: Number,
    },
    currency: {
      type: String,
      default: "INR",
    },
    features: [
      {
        name: String,
        included: Boolean,
        limit: Number, // null for unlimited
      },
    ],
    description: String,
    duration: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      default: "monthly",
    },
    trialDays: {
      type: Number,
      default: 7,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
