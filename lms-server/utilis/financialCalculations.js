/**
 * Calculate total costs from all sources
 */
exports.calculateTotalCosts = (referencedData, providedCosts = {}) => {
  let total = {
    developmentCosts:
      providedCosts.developmentCosts ||
      referencedData.development?.totalDevelopmentInvestment ||
      0,
    infrastructureCosts:
      providedCosts.infrastructureCosts ||
      referencedData.infrastructure?.totalInfrastructureThreeYear ||
      0,
    contentCreationCosts:
      providedCosts.contentCreationCosts ||
      referencedData.content?.totalContentThreeYear ||
      0,
    marketingCosts:
      providedCosts.marketingCosts ||
      referencedData.marketing?.totalMarketingThreeYear ||
      0,
    operationalCosts:
      providedCosts.operationalCosts ||
      referencedData.operational?.totalOperationalThreeYear ||
      0,
    contingencyFund: providedCosts.contingencyFund || 0,
  };

  total.grandTotalCosts =
    total.developmentCosts +
    total.infrastructureCosts +
    total.contentCreationCosts +
    total.marketingCosts +
    total.operationalCosts +
    total.contingencyFund;

  return total;
};

/**
 * Calculate total revenue from all sources
 */
exports.calculateTotalRevenue = (referencedData, providedRevenue = {}) => {
  let total = {
    b2cRevenue:
      providedRevenue.b2cRevenue ||
      referencedData.revenue?.totalRevenueThreeYear ||
      0,
    b2bRevenue:
      providedRevenue.b2bRevenue ||
      referencedData.revenue?.totalB2BThreeYear ||
      0,
    otherRevenue:
      providedRevenue.otherRevenue ||
      referencedData.revenue?.totalOtherThreeYear ||
      0,
    sponsorships:
      providedRevenue.sponsorships ||
      referencedData.sponsors?.totalSponsorshipsThreeYear ||
      0,
    investments:
      providedRevenue.investments ||
      referencedData.sponsors?.totalInvestmentReceived ||
      0,
  };

  total.grandTotalRevenue =
    total.b2cRevenue +
    total.b2bRevenue +
    total.otherRevenue +
    total.sponsorships +
    total.investments;

  return total;
};

/**
 * Calculate profitability metrics
 */
exports.calculateProfitability = (totalCosts, totalRevenue) => {
  const grossProfit =
    totalRevenue.grandTotalRevenue - totalCosts.grandTotalCosts;
  const grossMargin = (grossProfit / totalRevenue.grandTotalRevenue) * 100 || 0;
  const netProfit = grossProfit; // Assuming no taxes for now
  const netMargin = (netProfit / totalRevenue.grandTotalRevenue) * 100 || 0;
  const roi = (netProfit / totalCosts.grandTotalCosts) * 100 || 0;
  const paybackPeriod = exports.calculatePaybackPeriod(
    totalCosts.grandTotalCosts,
    netProfit,
  );

  return {
    grossProfit,
    grossMargin: grossMargin.toFixed(2),
    netProfit,
    netMargin: netMargin.toFixed(2),
    roi: roi.toFixed(2),
    paybackPeriod,
  };
};

/**
 * Calculate break-even point
 */
exports.calculateBreakEven = (totalCosts, totalRevenue) => {
  const totalCost = totalCosts.grandTotalCosts;
  const totalRev = totalRevenue.grandTotalRevenue;

  // Monthly averages over 36 months
  const avgMonthlyRevenue = totalRev / 36;
  const avgMonthlyCost = totalCost / 36;

  // Break-even calculations
  const monthsRequired = Math.ceil(totalCost / avgMonthlyRevenue) || 0;
  const revenueRequired = totalCost;

  // Estimate users needed (assuming average revenue per user)
  const avgRevenuePerUser = 5000; // Example: ₹5000 per user per year
  const usersRequired = Math.ceil(totalCost / avgRevenuePerUser);

  return {
    usersRequired,
    monthsRequired,
    revenueRequired,
    monthlyRevenue: avgMonthlyRevenue,
    monthlyCost: avgMonthlyCost,
  };
};

/**
 * Calculate ROI (Return on Investment)
 */
exports.calculateROI = (totalCost, netProfit) => {
  return ((netProfit / totalCost) * 100).toFixed(2);
};

/**
 * Calculate payback period in months
 */
exports.calculatePaybackPeriod = (totalCost, annualProfit) => {
  if (annualProfit <= 0) return 999; // Never pays back
  const months = totalCost / (annualProfit / 12);
  return Math.ceil(months);
};

/**
 * Generate cash flow projection for 36 months
 */
exports.generateCashFlowProjection = (
  totalCosts,
  totalRevenue,
  months = 36,
) => {
  const cashFlowMonths = [];

  const totalCost = totalCosts.grandTotalCosts;
  const totalRev = totalRevenue.grandTotalRevenue;

  const monthlyOutflow = totalCost / months;
  const monthlyInflow = totalRev / months;

  let cumulativeCash = 0;

  // Initial investment (first month)
  const initialInvestment = totalCost * 0.3; // Assume 30% upfront

  for (let month = 1; month <= months; month++) {
    // Adjust inflow/outflow for first few months (ramp-up period)
    let inflow = monthlyInflow;
    let outflow = monthlyOutflow;

    if (month <= 3) {
      // Ramp-up period: lower revenue, higher costs
      inflow = monthlyInflow * (month / 3);
      outflow = monthlyOutflow * 1.2;
    }

    if (month === 1) {
      outflow += initialInvestment;
    }

    const netCashFlow = inflow - outflow;
    cumulativeCash += netCashFlow;

    cashFlowMonths.push({
      month,
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      netCashFlow: Math.round(netCashFlow),
      cumulativeCash: Math.round(cumulativeCash),
    });
  }

  // Calculate monthly burn rate (average of first 6 months)
  const firstSixMonths = cashFlowMonths.slice(0, 6);
  const avgBurnRate =
    firstSixMonths.reduce((sum, m) => sum + m.netCashFlow, 0) / 6;

  // Calculate runway (months until cash runs out)
  const minCash = Math.min(...cashFlowMonths.map((m) => m.cumulativeCash));
  const runway =
    minCash < 0
      ? cashFlowMonths.findIndex((m) => m.cumulativeCash < 0)
      : months;

  return {
    initialInvestment,
    monthlyBurnRate: Math.round(Math.abs(avgBurnRate)),
    runway,
    cashFlowMonths,
  };
};

/**
 * Format currency in Indian Rupees
 */
exports.formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 */
exports.calculateCAGR = (beginningValue, endingValue, years) => {
  return (
    (Math.pow(endingValue / beginningValue, 1 / years) - 1) *
    100
  ).toFixed(2);
};

/**
 * Calculate NPV (Net Present Value)
 */
exports.calculateNPV = (cashFlows, discountRate) => {
  return cashFlows.reduce((npv, cashFlow, index) => {
    return npv + cashFlow / Math.pow(1 + discountRate / 100, index + 1);
  }, 0);
};

/**
 * Calculate IRR (Internal Rate of Return) - Simplified
 */
exports.calculateIRR = (cashFlows) => {
  // Simple IRR approximation
  const totalInflow = cashFlows.reduce((sum, cf) => sum + Math.max(cf, 0), 0);
  const totalOutflow = Math.abs(
    cashFlows.reduce((sum, cf) => sum + Math.min(cf, 0), 0),
  );
  return ((totalInflow / totalOutflow - 1) * 100).toFixed(2);
};
