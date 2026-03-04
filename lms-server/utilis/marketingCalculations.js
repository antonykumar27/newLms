/**
 * Calculate digital marketing totals
 */
exports.calculateDigitalTotals = (digital) => {
  if (!digital) {
    return {
      seoMonthly: 0,
      socialMonthly: 0,
      adsMonthly: 0,
      emailMonthly: 0,
    };
  }

  // SEO totals
  const seoMonthly =
    (digital.seo?.keywordResearch?.monthly || 0) +
    (digital.seo?.onPageOptimization?.monthly || 0) +
    (digital.seo?.linkBuilding?.monthly || 0) +
    (digital.seo?.contentMarketing?.monthly || 0);

  // Social media totals
  const platformTotal =
    digital.socialMedia?.platforms?.reduce(
      (sum, p) => sum + (p.monthlyBudget || 0),
      0,
    ) || 0;

  const socialMonthly =
    platformTotal +
    (digital.socialMedia?.contentCreation?.monthly || 0) +
    (digital.socialMedia?.communityManagement?.monthly || 0);

  // Paid ads totals
  const adsMonthly =
    (digital.paidAds?.googleAds?.monthly || 0) +
    (digital.paidAds?.facebookAds?.monthly || 0) +
    (digital.paidAds?.instagramAds?.monthly || 0) +
    (digital.paidAds?.youtubeAds?.monthly || 0);

  // Email marketing totals
  const emailMonthly =
    (digital.emailMarketing?.platform?.monthly || 0) +
    (digital.emailMarketing?.newsletterCreation?.monthly || 0) +
    (digital.emailMarketing?.automation?.monthly || 0);

  return {
    seoMonthly,
    socialMonthly,
    adsMonthly,
    emailMonthly,
  };
};

/**
 * Calculate traditional marketing totals
 */
exports.calculateTraditionalTotals = (traditional) => {
  if (!traditional) return { yearly: 0 };

  // Print ads total
  const newspaperTotal =
    traditional.printAds?.newspapers?.reduce(
      (sum, ad) => sum + ad.costPerAd * ad.adsPerYear,
      0,
    ) || 0;

  const magazineTotal =
    traditional.printAds?.magazines?.reduce(
      (sum, ad) => sum + ad.costPerAd * ad.adsPerYear,
      0,
    ) || 0;

  const brochuresTotal =
    (traditional.printAds?.brochures?.design || 0) +
    (traditional.printAds?.brochures?.printing || 0);

  // Events total
  const fairTotal =
    traditional.eventsAndSponsorships?.educationFairs?.reduce(
      (sum, fair) => sum + fair.cost * fair.perYear,
      0,
    ) || 0;

  const visitsTotal =
    (traditional.eventsAndSponsorships?.collegeVisits?.costPerVisit || 0) *
    (traditional.eventsAndSponsorships?.collegeVisits?.visitsPerYear || 0);

  const sponsorshipsTotal =
    traditional.eventsAndSponsorships?.sponsorships?.reduce(
      (sum, s) => sum + (s.amount || 0),
      0,
    ) || 0;

  const yearly =
    newspaperTotal +
    magazineTotal +
    brochuresTotal +
    fairTotal +
    visitsTotal +
    sponsorshipsTotal;

  return { yearly };
};

/**
 * Calculate business development totals
 */
exports.calculateBDTotals = (bd) => {
  if (!bd) return { monthly: 0, yearly: 0 };

  const monthly =
    bd.salesTeam?.reduce(
      (sum, member) => sum + (member.totalCompensation || 0),
      0,
    ) || 0;

  return {
    monthly,
    yearly: monthly * 12,
  };
};

/**
 * Calculate grand totals
 */
exports.calculateGrandTotals = (digital, traditional, bd) => {
  const monthly =
    digital.seoMonthly +
    digital.socialMonthly +
    digital.adsMonthly +
    digital.emailMonthly +
    bd.monthly;

  const yearly = monthly * 12 + (traditional.yearly || 0);
  const threeYear = yearly * 3;

  return {
    monthly,
    yearly,
    threeYear,
  };
};

/**
 * Calculate ROI
 */
exports.calculateROI = (marketing, revenue) => {
  const totalSpend = marketing.totalMarketingThreeYear;
  const totalRevenue = revenue.digital + revenue.traditional + revenue.bd;

  return ((totalRevenue - totalSpend) / totalSpend) * 100;
};

/**
 * Calculate Customer Acquisition Cost (CAC)
 */
exports.calculateCAC = (marketing, customers) => {
  return marketing.totalMarketingThreeYear / customers;
};

/**
 * Analyze channel performance
 */
exports.analyzeChannelPerformance = (marketing, revenue) => {
  const channels = [];

  // Digital channels
  channels.push({
    name: "SEO",
    spend: marketing.digitalMarketing.seo.totalThreeYear,
    revenue: revenue.digital * 0.3, // Assume 30% from SEO
    roi:
      (
        ((revenue.digital * 0.3 -
          marketing.digitalMarketing.seo.totalThreeYear) /
          marketing.digitalMarketing.seo.totalThreeYear) *
        100
      ).toFixed(2) + "%",
  });

  channels.push({
    name: "Social Media",
    spend: marketing.digitalMarketing.socialMedia.totalThreeYear,
    revenue: revenue.digital * 0.25, // Assume 25% from social
    roi:
      (
        ((revenue.digital * 0.25 -
          marketing.digitalMarketing.socialMedia.totalThreeYear) /
          marketing.digitalMarketing.socialMedia.totalThreeYear) *
        100
      ).toFixed(2) + "%",
  });

  channels.push({
    name: "Paid Ads",
    spend: marketing.digitalMarketing.paidAds.totalThreeYear,
    revenue: revenue.digital * 0.35, // Assume 35% from ads
    roi:
      (
        ((revenue.digital * 0.35 -
          marketing.digitalMarketing.paidAds.totalThreeYear) /
          marketing.digitalMarketing.paidAds.totalThreeYear) *
        100
      ).toFixed(2) + "%",
  });

  // Traditional channels
  if (marketing.traditionalMarketing?.totalYearly) {
    channels.push({
      name: "Traditional",
      spend: marketing.traditionalMarketing.totalYearly * 3,
      revenue: revenue.traditional,
      roi:
        (
          ((revenue.traditional -
            marketing.traditionalMarketing.totalYearly * 3) /
            (marketing.traditionalMarketing.totalYearly * 3)) *
          100
        ).toFixed(2) + "%",
    });
  }

  // Business Development
  if (marketing.businessDevelopment?.totalBDYearly) {
    channels.push({
      name: "Business Development",
      spend: marketing.businessDevelopment.totalBDYearly * 3,
      revenue: revenue.bd,
      roi:
        (
          ((revenue.bd - marketing.businessDevelopment.totalBDYearly * 3) /
            (marketing.businessDevelopment.totalBDYearly * 3)) *
          100
        ).toFixed(2) + "%",
    });
  }

  return channels.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
};

/**
 * Generate marketing insights
 */
exports.generateMarketingInsights = (channelPerformance) => {
  const insights = [];

  channelPerformance.forEach((channel) => {
    const roi = parseFloat(channel.roi);

    if (roi > 200) {
      insights.push(
        `✅ ${channel.name} is performing exceptionally well with ${channel.roi} ROI. Consider increasing budget.`,
      );
    } else if (roi > 100) {
      insights.push(
        `📈 ${channel.name} has good ROI at ${channel.roi}. Maintain current strategy.`,
      );
    } else if (roi > 0) {
      insights.push(
        `🔄 ${channel.name} is profitable but could be optimized. Current ROI: ${channel.roi}`,
      );
    } else {
      insights.push(
        `⚠️ ${channel.name} needs attention. Negative ROI of ${channel.roi}. Review strategy.`,
      );
    }
  });

  return insights;
};

/**
 * Calculate marketing efficiency ratio
 */
exports.calculateMER = (revenue, marketingSpend) => {
  return (revenue / marketingSpend).toFixed(2);
};

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
