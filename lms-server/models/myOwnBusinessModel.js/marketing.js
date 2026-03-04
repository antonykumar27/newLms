const mongoose = require("mongoose");

const marketingSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== DIGITAL MARKETING =====
  digitalMarketing: {
    seo: {
      keywordResearch: { monthly: Number },
      onPageOptimization: { monthly: Number },
      linkBuilding: { monthly: Number },
      contentMarketing: { monthly: Number },
      totalMonthly: Number,
      totalThreeYear: Number,
    },
    socialMedia: {
      platforms: [
        {
          name: { type: String, enum: ["instagram", "facebook", "youtube"] },
          monthlyBudget: Number,
        },
      ],
      contentCreation: { monthly: Number },
      communityManagement: { monthly: Number },
      influencerMarketing: { yearly: Number },
      totalMonthly: Number,
      totalThreeYear: Number,
    },
    paidAds: {
      googleAds: { monthly: Number },
      facebookAds: { monthly: Number },
      instagramAds: { monthly: Number },
      youtubeAds: { monthly: Number },
      totalMonthly: Number,
      totalThreeYear: Number,
    },
    emailMarketing: {
      platform: { monthly: Number },
      newsletterCreation: { monthly: Number },
      automation: { setup: Number, monthly: Number },
      totalMonthly: Number,
    },
  },

  // ===== TRADITIONAL MARKETING =====
  traditionalMarketing: {
    printAds: {
      newspapers: [{ name: String, costPerAd: Number, adsPerYear: Number }],
      magazines: [{ name: String, costPerAd: Number, adsPerYear: Number }],
      brochures: { design: Number, printing: Number },
      totalYearly: Number,
    },
    eventsAndSponsorships: {
      educationFairs: [{ name: String, cost: Number, perYear: Number }],
      collegeVisits: { costPerVisit: Number, visitsPerYear: Number },
      sponsorships: [{ event: String, amount: Number }],
      totalYearly: Number,
    },
  },

  // ===== BUSINESS DEVELOPMENT =====
  businessDevelopment: {
    salesTeam: [
      {
        role: { type: String, enum: ["salesManager", "bdExecutive"] },
        count: Number,
        monthlySalary: Number,
        commission: Number,
        totalCompensation: Number,
      },
    ],
    partnerships: {
      collegePartnerships: [{ college: String, revenueShare: Number }],
      corporateTraining: [{ company: String, contractValue: Number }],
    },
    totalBDMonthly: Number,
    totalBDYearly: Number,
  },

  // ===== GRAND TOTAL =====
  totalMarketingMonthly: Number,
  totalMarketingYearly: Number,
  totalMarketingThreeYear: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Marketing", marketingSchema);
