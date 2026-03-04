const mongoose = require("mongoose");

const sponsorsSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },

  // ===== INVESTORS =====
  investors: [
    {
      name: String,
      type: { type: String, enum: ["angel", "vc", "strategic"] },
      investmentAmount: Number,
      equityStake: Number,
      investmentDate: Date,
      boardSeat: Boolean,
      notes: String,
    },
  ],

  // ===== SPONSORS =====
  sponsors: [
    {
      sponsorId: { type: String, required: true },
      name: { type: String, required: true },
      logo: String,
      website: String,
      tier: { type: String, enum: ["platinum", "gold", "silver", "bronze"] },
      contributionAmount: Number,
      contributionType: { type: String, enum: ["cash", "kind", "services"] },
      benefitsProvided: [String],
      startDate: Date,
      endDate: Date,
      renewalOption: Boolean,
      contactPerson: {
        name: String,
        email: String,
        phone: String,
      },
      sponsorshipYear1: Number,
      sponsorshipYear2: Number,
      sponsorshipYear3: Number,
    },
  ],

  // ===== GRANTS =====
  grants: [
    {
      name: String,
      provider: { type: String, enum: ["government", "foundation"] },
      schemeName: String,
      amount: Number,
      receivedDate: Date,
    },
  ],

  // ===== TOTALS =====
  totalSponsorshipsYear1: Number,
  totalSponsorshipsYear2: Number,
  totalSponsorshipsYear3: Number,
  totalSponsorshipsThreeYear: Number,
  totalInvestmentReceived: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sponsors", sponsorsSchema);
