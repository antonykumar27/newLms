const mongoose = require("mongoose");

const contentCreationSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== STUDIO EQUIPMENT (One-time) =====
  studioEquipment: {
    recordingRoom: {
      type: { type: String, enum: ["rented", "owned", "homeStudio"] },
      monthlyRent: Number,
      soundproofing: Number,
      lightingSetup: Number,
      greenScreen: Number,
      furniture: Number,
      totalSetup: Number,
    },
    cameras: [
      {
        brand: String,
        model: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
        type: { type: String, enum: ["dslr", "mirrorless", "webcam"] },
      },
    ],
    audioEquipment: [
      {
        type: { type: String, enum: ["microphone", "audioInterface"] },
        brand: String,
        model: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    lighting: [
      {
        type: { type: String, enum: ["ringLight", "softbox"] },
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    computers: [
      {
        type: { type: String, enum: ["mac", "pc"] },
        specs: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    softwareLicenses: [
      {
        name: { type: String, enum: ["adobePremiere", "finalCut"] },
        licenseType: { type: String, enum: ["monthly", "yearly"] },
        monthlyCost: Number,
        threeYearCost: Number,
      },
    ],
    totalStudioEquipment: Number,
  },

  // ===== INSTRUCTOR COSTS =====
  instructorCosts: {
    fullTimeTeachers: [
      {
        name: String,
        subject: String,
        monthlySalary: Number,
        yearlySalary: Number,
        threeYearSalary: Number,
        benefits: Number,
        totalCompensation: Number,
      },
    ],
    partTimeTeachers: [
      {
        name: String,
        subject: String,
        hourlyRate: Number,
        monthlyHours: Number,
        monthlyPayment: Number,
      },
    ],
    guestLecturers: [
      {
        name: String,
        expertise: String,
        oneTimeFee: Number,
        sessionsPerYear: Number,
      },
    ],
    contentWriters: [
      {
        type: { type: String, enum: ["scriptWriter", "articleWriter"] },
        ratePerWord: Number,
        monthlyWords: Number,
        monthlyCost: Number,
      },
    ],
    videoEditors: [
      {
        type: { type: String, enum: ["inHouse", "freelance"] },
        ratePerVideo: Number,
        videosPerMonth: Number,
        monthlyCost: Number,
      },
    ],
    totalInstructorMonthly: Number,
    totalInstructorYearly: Number,
    totalInstructorThreeYear: Number,
  },

  // ===== CONTENT PRODUCTION =====
  contentProduction: {
    videoProduction: {
      costPerMinute: Number,
      minutesPerMonth: Number,
      monthlyCost: Number,
      threeYearCost: Number,
    },
    graphicDesign: {
      costPerAsset: Number,
      assetsPerMonth: Number,
      monthlyCost: Number,
    },
    animation: {
      costPerSecond: Number,
      secondsPerMonth: Number,
      monthlyCost: Number,
    },
    totalProductionMonthly: Number,
    totalProductionThreeYear: Number,
  },

  // ===== GRAND TOTAL =====
  totalContentThreeYear: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContentCreation", contentCreationSchema);
