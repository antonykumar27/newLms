const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== B2C REVENUE (Direct to Students) =====
  b2cRevenue: {
    subscriptionPlans: [
      {
        tier: { type: String, enum: ["basic", "premium", "pro"] },
        name: String,
        monthlyPrice: Number,
        yearlyPrice: Number,
        features: [String],
        projectedSubscribers: {
          year1: Number,
          year2: Number,
          year3: Number,
        },
        projectedRevenue: {
          year1: Number,
          year2: Number,
          year3: Number,
        },
      },
    ],

    oneTimePurchases: {
      individualCourses: [
        {
          courseName: String,
          price: Number,
          salesYear1: Number,
          salesYear2: Number,
          salesYear3: Number,
          revenueYear1: Number,
          revenueYear2: Number,
          revenueYear3: Number,
        },
      ],
      certifications: {
        pricePerCert: Number,
        certificatesYear1: Number,
        certificatesYear2: Number,
        certificatesYear3: Number,
        revenueYear1: Number,
        revenueYear2: Number,
        revenueYear3: Number,
      },
    },

    totalB2CYear1: Number,
    totalB2CYear2: Number,
    totalB2CYear3: Number,
    totalB2CThreeYear: Number,
  },

  // ===== B2B REVENUE =====
  b2bRevenue: {
    corporateTraining: [
      {
        companyName: String,
        contractValue: Number,
        contractDuration: Number,
        revenueYear1: Number,
        revenueYear2: Number,
        revenueYear3: Number,
      },
    ],

    collegePartnerships: [
      {
        collegeName: String,
        studentsCount: Number,
        revenueShare: Number,
        annualFees: Number,
        revenueYear1: Number,
        revenueYear2: Number,
        revenueYear3: Number,
      },
    ],

    governmentContracts: [
      {
        department: String,
        tenderValue: Number,
        revenueYear1: Number,
        revenueYear2: Number,
        revenueYear3: Number,
      },
    ],

    totalB2BYear1: Number,
    totalB2BYear2: Number,
    totalB2BYear3: Number,
    totalB2BThreeYear: Number,
  },

  // ===== OTHER REVENUE =====
  otherRevenue: {
    placementFees: {
      perPlacement: Number,
      placementsYear1: Number,
      placementsYear2: Number,
      placementsYear3: Number,
      revenueYear1: Number,
      revenueYear2: Number,
      revenueYear3: Number,
    },
    advertising: {
      platformAds: { monthly: Number },
      sponsoredContent: [
        {
          sponsor: String,
          amount: Number,
          duration: Number,
        },
      ],
    },
    totalOtherYear1: Number,
    totalOtherYear2: Number,
    totalOtherYear3: Number,
  },

  // ===== GRAND TOTAL =====
  totalRevenueYear1: Number,
  totalRevenueYear2: Number,
  totalRevenueYear3: Number,
  totalRevenueThreeYear: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Revenue", revenueSchema);
