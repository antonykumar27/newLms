const mongoose = require("mongoose");

const operationalSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== OFFICE SPACE =====
  officeSpace: {
    type: { type: String, enum: ["rented", "owned", "coworking"] },
    monthlyRent: Number,
    securityDeposit: Number,
    maintenance: { monthly: Number },
    utilities: {
      electricity: Number,
      water: Number,
      internet: Number,
    },
    totalMonthly: Number,
    totalThreeYear: Number,
  },

  // ===== EMPLOYEE SALARIES =====
  employeeSalaries: [
    {
      department: {
        type: String,
        enum: ["management", "admin", "finance", "techSupport"],
      },
      role: String,
      count: Number,
      monthlySalary: Number,
      benefits: Number,
      totalCompensation: Number,
    },
  ],
  totalSalaryMonthly: Number,
  totalSalaryYearly: Number,
  totalSalaryThreeYear: Number,

  // ===== LEGAL & COMPLIANCE =====
  legalCompliance: {
    companyRegistration: { oneTime: Number },
    gstRegistration: { oneTime: Number },
    trademarks: [{ name: String, cost: Number }],
    legalRetainers: { monthly: Number },
    insurance: {
      professionalIndemnity: { yearly: Number },
      cyberLiability: { yearly: Number },
    },
    totalYearly: Number,
    totalThreeYear: Number,
  },

  // ===== TECHNOLOGY TOOLS =====
  technologyTools: {
    productivityTools: [
      {
        name: { type: String, enum: ["slack", "asana", "jira"] },
        monthlyCost: Number,
      },
    ],
    communicationTools: [
      {
        name: { type: String, enum: ["zoom", "googleWorkspace"] },
        monthlyCost: Number,
      },
    ],
    accountingTools: [
      {
        name: { type: String, enum: ["zoho", "tally"] },
        monthlyCost: Number,
      },
    ],
    totalMonthly: Number,
    totalThreeYear: Number,
  },

  // ===== GRAND TOTAL =====
  totalOperationalMonthly: Number,
  totalOperationalYearly: Number,
  totalOperationalThreeYear: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Operational", operationalSchema);
