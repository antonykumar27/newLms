const mongoose = require("mongoose");

const developmentCostSchema = new mongoose.Schema({
  // Reference
  projectId: { type: String, required: true, unique: true },

  // ===== WEB APP DEVELOPMENT =====
  webApp: {
    frontend: {
      reactJs: { hours: Number, ratePerHour: Number, total: Number },
      reduxStateManagement: { hours: Number, total: Number },
      tailwindCss: { hours: Number, total: Number },
      responsiveDesign: { hours: Number, total: Number },
      subTotal: Number,
    },
    backend: {
      nodeJs: { hours: Number, ratePerHour: Number, total: Number },
      expressFramework: { hours: Number, total: Number },
      apiDevelopment: { hours: Number, total: Number },
      databaseDesign: { hours: Number, total: Number },
      authentication: { hours: Number, total: Number },
      subTotal: Number,
    },
    database: {
      mongodbAtlas: { setup: Number, optimization: Number, total: Number },
      redisCache: { setup: Number, total: Number },
      dataMigration: { hours: Number, total: Number },
      subTotal: Number,
    },
    thirdParty: {
      paymentGateway: { setup: Number, integration: Number },
      emailService: { setup: Number },
      smsService: { setup: Number },
      videoConferencing: { setup: Number },
      subTotal: Number,
    },
    totalWeb: Number,
  },

  // ===== MOBILE APP DEVELOPMENT =====
  mobileApp: {
    crossPlatform: {
      reactNative: { hours: Number, ratePerHour: Number, total: Number },
      codeSharing: { savings: Number },
      subTotal: Number,
    },
    iosSpecific: {
      swiftHelpers: { hours: Number, total: Number },
      appStoreConnect: { setup: Number },
      pushNotifications: { hours: Number, total: Number },
      subTotal: Number,
    },
    androidSpecific: {
      kotlinHelpers: { hours: Number, total: Number },
      googlePlayServices: { hours: Number, total: Number },
      firebaseIntegration: { hours: Number, total: Number },
      subTotal: Number,
    },
    mobileFeatures: {
      offlineAccess: { hours: Number, total: Number },
      pushNotifications: { hours: Number, total: Number },
      biometricAuth: { hours: Number, total: Number },
      mobilePayments: { upi: Number, wallet: Number },
      subTotal: Number,
    },
    totalMobile: Number,
  },

  // ===== DESIGN COSTS =====
  design: {
    webDesign: {
      wireframing: { hours: Number, total: Number },
      prototyping: { hours: Number, total: Number },
      uiKits: { purchase: Number, customization: Number },
      responsiveMockups: { hours: Number, total: Number },
      subTotal: Number,
    },
    mobileDesign: {
      iosHIG: { hours: Number, total: Number },
      materialDesign: { hours: Number, total: Number },
      appIcons: { design: Number, variants: Number },
      splashScreens: { design: Number, total: Number },
      subTotal: Number,
    },
    branding: {
      logo: { design: Number, revisions: Number },
      colorPalette: { development: Number },
      typography: { licensing: Number },
      brandGuidelines: { creation: Number },
      subTotal: Number,
    },
    totalDesign: Number,
  },

  // ===== QA & TESTING =====
  qaTesting: {
    manualTesting: {
      functional: { hours: Number, total: Number },
      regression: { hours: Number, total: Number },
      uxTesting: { hours: Number, total: Number },
      subTotal: Number,
    },
    automatedTesting: {
      jestSetup: { hours: Number, total: Number },
      cypress: { hours: Number, total: Number },
      loadTesting: { hours: Number, total: Number },
      subTotal: Number,
    },
    deviceTesting: {
      iosDevices: { count: Number, rental: Number },
      androidDevices: { count: Number, rental: Number },
      browserStack: { subscription: Number },
      subTotal: Number,
    },
    securityAudit: {
      penetrationTesting: { cost: Number },
      vulnerabilityScan: { cost: Number },
      sslSetup: { cost: Number },
      subTotal: Number,
    },
    totalQA: Number,
  },

  // ===== DEPLOYMENT & LAUNCH =====
  deployment: {
    appStoreAccounts: {
      appleDeveloper: { yearly: Number, threeYear: Number },
      googlePlay: { oneTime: Number },
      subTotal: Number,
    },
    domainAndSSL: {
      domainName: { purchase: Number, renewal: Number },
      sslCertificate: { letzEncrypt: Number, premium: Number },
      subTotal: Number,
    },
    serverSetup: {
      configuration: { hours: Number, total: Number },
      loadBalancer: { setup: Number },
      autoScaling: { setup: Number },
      subTotal: Number,
    },
    totalDeployment: Number,
  },

  // ===== GRAND TOTAL =====
  totalDevelopmentInvestment: Number,
  currency: { type: String, default: "INR" },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DevelopmentCost", developmentCostSchema);
