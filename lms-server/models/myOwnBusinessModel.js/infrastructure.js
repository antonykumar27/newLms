const mongoose = require("mongoose");

const infrastructureCostSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== CLOUD HOSTING =====
  cloudHosting: {
    backendServers: {
      tier: { type: String, enum: ["small", "medium", "large"] },
      monthly: Number,
      yearly: Number,
      threeYear: Number,
      specs: {
        cpu: Number,
        ram: Number,
        storage: Number,
        bandwidth: Number,
      },
    },
    databaseServers: {
      tier: { type: String, enum: ["free", "m10", "m20", "m30"] },
      monthly: Number,
      yearly: Number,
      threeYear: Number,
      specs: {
        storage: Number,
        connections: Number,
      },
    },
    redisServers: {
      tier: { type: String, enum: ["free", "small", "medium"] },
      monthly: Number,
      yearly: Number,
      threeYear: Number,
    },
    totalCloudMonthly: Number,
    totalCloudYearly: Number,
    totalCloudThreeYear: Number,
  },

  // ===== STORAGE & CDN =====
  storageAndCDN: {
    videoStorage: {
      provider: { type: String, enum: ["awsS3", "cloudinary", "wasabi"] },
      monthlyStorage: Number,
      monthlyCost: Number,
      yearlyCost: Number,
      threeYearCost: Number,
    },
    cdn: {
      provider: { type: String, enum: ["cloudflare", "awsCloudfront"] },
      monthlyBandwidth: Number,
      monthlyCost: Number,
      yearlyCost: Number,
      threeYearCost: Number,
    },
    backups: {
      automatedBackups: { monthly: Number, retention: Number },
      disasterRecovery: { setup: Number, monthly: Number },
      totalMonthly: Number,
      totalThreeYear: Number,
    },
    totalStorageMonthly: Number,
    totalStorageThreeYear: Number,
  },

  // ===== THIRD-PARTY SERVICES =====
  thirdPartyServices: {
    emailService: {
      provider: String,
      monthlyLimit: Number,
      monthlyCost: Number,
      yearlyCost: Number,
      threeYearCost: Number,
    },
    smsService: {
      provider: String,
      monthlyLimit: Number,
      monthlyCost: Number,
      yearlyCost: Number,
      threeYearCost: Number,
    },
    paymentGateway: {
      provider: { type: String, enum: ["razorpay", "ccavenue"] },
      setupFee: Number,
      monthlyFee: Number,
      transactionFee: Number,
      threeYearCost: Number,
    },
    videoConferencing: {
      provider: { type: String, enum: ["zoom", "agora"] },
      monthlyMinutes: Number,
      monthlyCost: Number,
      threeYearCost: Number,
    },
    monitoring: {
      sentry: { monthly: Number, events: Number },
      datadog: { monthly: Number },
      totalMonthly: Number,
      totalThreeYear: Number,
    },
    totalThirdPartyMonthly: Number,
    totalThirdPartyThreeYear: Number,
  },

  // ===== GRAND TOTAL =====
  totalInfrastructureMonthly: Number,
  totalInfrastructureYearly: Number,
  totalInfrastructureThreeYear: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Infrastructure", infrastructureCostSchema);
