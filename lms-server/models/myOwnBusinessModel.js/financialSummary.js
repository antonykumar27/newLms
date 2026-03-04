const mongoose = require("mongoose");

const financialSummarySchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== REFERENCES =====
  refIds: {
    developmentCostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DevelopmentCost",
    },
    infrastructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Infrastructure",
    },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: "ContentCreation" },
    marketingId: { type: mongoose.Schema.Types.ObjectId, ref: "Marketing" },
    operationalId: { type: mongoose.Schema.Types.ObjectId, ref: "Operational" },
    revenueId: { type: mongoose.Schema.Types.ObjectId, ref: "Revenue" },
    sponsorsId: { type: mongoose.Schema.Types.ObjectId, ref: "Sponsors" },
  },

  // ===== TOTAL COSTS =====
  totalCosts: {
    developmentCosts: Number,
    infrastructureCosts: Number,
    contentCreationCosts: Number,
    marketingCosts: Number,
    operationalCosts: Number,
    contingencyFund: Number, // 10-15% of total
    grandTotalCosts: Number,
  },

  // ===== TOTAL REVENUE =====
  totalRevenue: {
    b2cRevenue: Number,
    b2bRevenue: Number,
    otherRevenue: Number,
    sponsorships: Number,
    investments: Number,
    grandTotalRevenue: Number,
  },

  // ===== PROFITABILITY =====
  profitability: {
    grossProfit: Number,
    grossMargin: Number,
    netProfit: Number,
    netMargin: Number,
    roi: Number,
    paybackPeriod: Number, // months
    breakEvenPoint: {
      usersRequired: Number,
      monthsRequired: Number,
      revenueRequired: Number,
    },
  },

  // ===== YEARLY BREAKDOWN =====
  yearlyBreakdown: [
    {
      year: Number,
      revenue: Number,
      costs: Number,
      profit: Number,
      margin: Number,
      cumulativeProfit: Number,
    },
  ],

  // ===== CASH FLOW =====
  cashFlow: {
    initialInvestment: Number,
    monthlyBurnRate: Number,
    runway: Number,
    cashFlowMonths: [
      {
        month: Number,
        inflow: Number,
        outflow: Number,
        netCashFlow: Number,
        cumulativeCash: Number,
      },
    ],
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FinancialSummary", financialSummarySchema);
