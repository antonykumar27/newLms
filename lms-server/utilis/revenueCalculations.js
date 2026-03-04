/**
 * Calculate B2C revenue totals
 */
exports.calculateB2CTotals = (b2c) => {
  if (!b2c) {
    return { year1: 0, year2: 0, year3: 0, threeYear: 0 };
  }

  let year1 = 0;
  let year2 = 0;
  let year3 = 0;

  // Subscription plans
  if (b2c.subscriptionPlans) {
    b2c.subscriptionPlans.forEach((plan) => {
      year1 += plan.projectedRevenue?.year1 || 0;
      year2 += plan.projectedRevenue?.year2 || 0;
      year3 += plan.projectedRevenue?.year3 || 0;
    });
  }

  // Individual courses
  if (b2c.oneTimePurchases?.individualCourses) {
    b2c.oneTimePurchases.individualCourses.forEach((course) => {
      year1 += course.revenueYear1 || 0;
      year2 += course.revenueYear2 || 0;
      year3 += course.revenueYear3 || 0;
    });
  }

  // Certifications
  if (b2c.oneTimePurchases?.certifications) {
    year1 += b2c.oneTimePurchases.certifications.revenueYear1 || 0;
    year2 += b2c.oneTimePurchases.certifications.revenueYear2 || 0;
    year3 += b2c.oneTimePurchases.certifications.revenueYear3 || 0;
  }

  return {
    year1,
    year2,
    year3,
    threeYear: year1 + year2 + year3,
  };
};

/**
 * Calculate B2B revenue totals
 */
exports.calculateB2BTotals = (b2b) => {
  if (!b2b) {
    return { year1: 0, year2: 0, year3: 0, threeYear: 0 };
  }

  let year1 = 0;
  let year2 = 0;
  let year3 = 0;

  // Corporate training
  if (b2b.corporateTraining) {
    b2b.corporateTraining.forEach((contract) => {
      year1 += contract.revenueYear1 || 0;
      year2 += contract.revenueYear2 || 0;
      year3 += contract.revenueYear3 || 0;
    });
  }

  // College partnerships
  if (b2b.collegePartnerships) {
    b2b.collegePartnerships.forEach((partnership) => {
      year1 += partnership.revenueYear1 || 0;
      year2 += partnership.revenueYear2 || 0;
      year3 += partnership.revenueYear3 || 0;
    });
  }

  // Government contracts
  if (b2b.governmentContracts) {
    b2b.governmentContracts.forEach((contract) => {
      year1 += contract.revenueYear1 || 0;
      year2 += contract.revenueYear2 || 0;
      year3 += contract.revenueYear3 || 0;
    });
  }

  return {
    year1,
    year2,
    year3,
    threeYear: year1 + year2 + year3,
  };
};

/**
 * Calculate other revenue totals
 */
exports.calculateOtherTotals = (other) => {
  if (!other) {
    return { year1: 0, year2: 0, year3: 0 };
  }

  let year1 = 0;
  let year2 = 0;
  let year3 = 0;

  // Placement fees
  if (other.placementFees) {
    year1 += other.placementFees.revenueYear1 || 0;
    year2 += other.placementFees.revenueYear2 || 0;
    year3 += other.placementFees.revenueYear3 || 0;
  }

  // Advertising
  if (other.advertising) {
    const monthlyAds = other.advertising.platformAds?.monthly || 0;
    year1 += monthlyAds * 12;
    year2 += monthlyAds * 12;
    year3 += monthlyAds * 12;

    // Sponsored content
    if (other.advertising.sponsoredContent) {
      other.advertising.sponsoredContent.forEach((content) => {
        const total = (content.amount || 0) * (content.duration || 0);
        // Distribute evenly across years if duration spans multiple years
        year1 += total / 3;
        year2 += total / 3;
        year3 += total / 3;
      });
    }
  }

  return {
    year1,
    year2,
    year3,
  };
};

/**
 * Calculate grand totals
 */
exports.calculateGrandTotals = (b2c, b2b, other) => {
  const year1 = b2c.year1 + b2b.year1 + other.year1;
  const year2 = b2c.year2 + b2b.year2 + other.year2;
  const year3 = b2c.year3 + b2b.year3 + other.year3;

  return {
    year1,
    year2,
    year3,
    threeYear: year1 + year2 + year3,
  };
};

/**
 * Calculate growth rate
 */
exports.calculateGrowthRate = (start, end, years = 1) => {
  if (start === 0) return 0;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
};

/**
 * Analyze revenue streams
 */
exports.analyzeRevenueStreams = (revenue) => {
  const b2cTotal = revenue.b2cRevenue.totalB2CThreeYear;
  const b2bTotal = revenue.b2bRevenue.totalB2BThreeYear;
  const otherTotal =
    revenue.otherRevenue.totalOtherYear1 +
    revenue.otherRevenue.totalOtherYear2 +
    revenue.otherRevenue.totalOtherYear3;
  const grandTotal = revenue.totalRevenueThreeYear;

  return {
    b2c: {
      total: b2cTotal,
      percentage: ((b2cTotal / grandTotal) * 100).toFixed(1) + "%",
      yearOverYear: [
        revenue.b2cRevenue.totalB2CYear1,
        revenue.b2cRevenue.totalB2CYear2,
        revenue.b2cRevenue.totalB2CYear3,
      ],
    },
    b2b: {
      total: b2bTotal,
      percentage: ((b2bTotal / grandTotal) * 100).toFixed(1) + "%",
      yearOverYear: [
        revenue.b2bRevenue.totalB2BYear1,
        revenue.b2bRevenue.totalB2BYear2,
        revenue.b2bRevenue.totalB2BYear3,
      ],
    },
    other: {
      total: otherTotal,
      percentage: ((otherTotal / grandTotal) * 100).toFixed(1) + "%",
      yearOverYear: [
        revenue.otherRevenue.totalOtherYear1,
        revenue.otherRevenue.totalOtherYear2,
        revenue.otherRevenue.totalOtherYear3,
      ],
    },
  };
};

/**
 * Generate monthly forecast
 */
exports.generateForecast = (revenue, months = 24) => {
  const forecast = [];
  const monthlyAverage = revenue.totalRevenueThreeYear / 36;
  const growthRate = 0.015; // 1.5% monthly growth

  let currentRevenue = monthlyAverage;

  for (let i = 1; i <= months; i++) {
    // Apply seasonal variations
    const seasonalFactor = getSeasonalFactor(i);
    const monthlyRevenue = currentRevenue * seasonalFactor;

    forecast.push({
      month: i,
      revenue: Math.round(monthlyRevenue),
      cumulative: Math.round(
        forecast.reduce((sum, m) => sum + m.revenue, 0) + monthlyRevenue,
      ),
      growth:
        i > 1
          ? ((monthlyRevenue / forecast[i - 2].revenue - 1) * 100).toFixed(1) +
            "%"
          : "-",
    });

    currentRevenue *= 1 + growthRate;
  }

  return forecast;
};

/**
 * Get seasonal factor for month
 */
function getSeasonalFactor(month) {
  const seasonality = {
    1: 0.9, // January - lower
    2: 0.85, // February - lower
    3: 0.95, // March - normal
    4: 1.0, // April - normal
    5: 1.1, // May - exam season
    6: 1.2, // June - summer peak
    7: 1.15, // July - high
    8: 1.05, // August - normal
    9: 1.1, // September - back to school
    10: 1.0, // October - normal
    11: 0.95, // November - lower
    12: 0.9, // December - holiday season
  };

  const monthOfYear = ((month - 1) % 12) + 1;
  return seasonality[monthOfYear] || 1.0;
}

/**
 * Format currency
 */
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};
