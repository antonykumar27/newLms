/**
 * Calculate cloud hosting totals
 */
exports.calculateCloudTotals = (cloudHosting) => {
  if (!cloudHosting) return { monthly: 0, yearly: 0, threeYear: 0 };

  const monthly =
    (cloudHosting.backendServers?.monthly || 0) +
    (cloudHosting.databaseServers?.monthly || 0) +
    (cloudHosting.redisServers?.monthly || 0);

  return {
    monthly,
    yearly: monthly * 12,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate storage and CDN totals
 */
exports.calculateStorageTotals = (storageAndCDN) => {
  if (!storageAndCDN) return { monthly: 0, threeYear: 0 };

  const monthly =
    (storageAndCDN.videoStorage?.monthlyCost || 0) +
    (storageAndCDN.cdn?.monthlyCost || 0) +
    (storageAndCDN.backups?.totalMonthly || 0);

  return {
    monthly,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate third-party services totals
 */
exports.calculateThirdPartyTotals = (thirdParty) => {
  if (!thirdParty) return { monthly: 0, threeYear: 0 };

  const monthly =
    (thirdParty.emailService?.monthlyCost || 0) +
    (thirdParty.smsService?.monthlyCost || 0) +
    (thirdParty.paymentGateway?.monthlyFee || 0) +
    (thirdParty.videoConferencing?.monthlyCost || 0) +
    (thirdParty.monitoring?.totalMonthly || 0);

  return {
    monthly,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate grand totals
 */
exports.calculateGrandTotals = (
  cloudTotals,
  storageTotals,
  thirdPartyTotals,
) => {
  const monthly =
    cloudTotals.monthly + storageTotals.monthly + thirdPartyTotals.monthly;

  return {
    monthly,
    yearly: monthly * 12,
    threeYear: monthly * 36,
  };
};

/**
 * Suggest cost optimizations
 */
exports.suggestOptimizations = (infrastructure) => {
  const suggestions = [];

  // Check backend server utilization
  if (infrastructure.cloudHosting.backendServers.tier === "large") {
    suggestions.push({
      category: "Backend Servers",
      suggestion: "Consider right-sizing: Large tier might be over-provisioned",
      savings: infrastructure.cloudHosting.backendServers.monthly * 12 * 0.3,
      difficulty: "medium",
      action: "Monitor CPU usage for 2 weeks, then downgrade if below 40%",
    });
  }

  // Check database tier
  if (infrastructure.cloudHosting.databaseServers.tier === "m30") {
    suggestions.push({
      category: "Database",
      suggestion: "Database tier M30 might be excessive for early stage",
      savings: 8200 * 12, // Difference between M30 and M20
      difficulty: "medium",
      action: "Check connection count and storage usage, consider M20",
    });
  }

  // Check CDN provider
  if (infrastructure.storageAndCDN.cdn.provider === "awsCloudfront") {
    suggestions.push({
      category: "CDN",
      suggestion:
        "Cloudflare free tier could replace AWS CloudFront for small scale",
      savings: infrastructure.storageAndCDN.cdn.monthlyCost * 12,
      difficulty: "hard",
      action: "Migrate to Cloudflare free plan (needs DNS changes)",
    });
  }

  // Check monitoring tools
  if (infrastructure.thirdPartyServices.monitoring.datadog?.monthly > 0) {
    suggestions.push({
      category: "Monitoring",
      suggestion:
        "Replace Datadog with open-source alternatives (Prometheus + Grafana)",
      savings:
        infrastructure.thirdPartyServices.monitoring.datadog.monthly * 12,
      difficulty: "hard",
      action: "Set up self-hosted monitoring stack",
    });
  }

  // Check backup strategy
  if (infrastructure.storageAndCDN.backups.retention > 30) {
    suggestions.push({
      category: "Backups",
      suggestion: "Reduce backup retention to 30 days to save storage costs",
      savings: infrastructure.storageAndCDN.backups.totalMonthly * 0.3 * 12,
      difficulty: "easy",
      action: "Adjust backup retention policy",
    });
  }

  return suggestions;
};

/**
 * Compare different providers
 */
exports.compareProviders = (requirements) => {
  const providers = {
    aws: {
      name: "AWS",
      backendMonthly: 4000,
      databaseMonthly: 4500,
      cdnCost: 0.085, // per GB
      storageCost: 0.023, // per GB/month
      advantages: ["Market leader", "Most services", "Enterprise support"],
      disadvantages: ["Complex pricing", "High cost"],
    },
    digitalocean: {
      name: "DigitalOcean",
      backendMonthly: 3000,
      databaseMonthly: 3500,
      cdnCost: 0.05,
      storageCost: 0.02,
      advantages: ["Simple pricing", "Developer friendly", "Good docs"],
      disadvantages: ["Limited services", "No serverless"],
    },
    render: {
      name: "Render",
      backendMonthly: 3500,
      databaseMonthly: 4000,
      cdnCost: 0.04,
      storageCost: 0.015,
      advantages: ["Easy deployment", "Auto SSL", "Good for startups"],
      disadvantages: ["Newer platform", "Limited regions"],
    },
  };

  const comparison = [];

  for (const [key, provider] of Object.entries(providers)) {
    const estimatedMonthly =
      provider.backendMonthly +
      provider.databaseMonthly +
      (requirements.bandwidth || 100) * provider.cdnCost +
      (requirements.storage || 50) * provider.storageCost;

    comparison.push({
      provider: provider.name,
      estimatedMonthly,
      estimatedYearly: estimatedMonthly * 12,
      advantages: provider.advantages,
      disadvantages: provider.disadvantages,
      score: calculateProviderScore(provider, requirements),
    });
  }

  // Sort by score (higher is better)
  return comparison.sort((a, b) => b.score - a.score);
};

/**
 * Calculate provider score
 */
function calculateProviderScore(provider, requirements) {
  let score = 70; // Base score

  if (requirements.needEnterprise && provider.name === "AWS") score += 20;
  if (requirements.startup && provider.name === "Render") score += 15;
  if (requirements.simple && provider.name === "DigitalOcean") score += 15;

  return score;
}

/**
 * Estimate scaling costs
 */
exports.estimateScaling = (currentInfra, targetUsers) => {
  const currentUsers = 1000; // Assume 1000 users for current tier
  const scaleFactor = targetUsers / currentUsers;

  const estimates = {
    currentUsers,
    targetUsers,
    scaleFactor,
    backend: {
      current: currentInfra.cloudHosting?.backendServers?.monthly || 3700,
      projected: Math.ceil(
        (currentInfra.cloudHosting?.backendServers?.monthly || 3700) *
          scaleFactor,
      ),
    },
    database: {
      current: currentInfra.cloudHosting?.databaseServers?.monthly || 4100,
      projected: Math.ceil(
        (currentInfra.cloudHosting?.databaseServers?.monthly || 4100) *
          scaleFactor *
          1.2,
      ), // Database scales faster
    },
    storage: {
      current: currentInfra.storageAndCDN?.videoStorage?.monthlyStorage || 100,
      projected: Math.ceil(100 * scaleFactor * 1.5), // Storage grows faster
    },
    bandwidth: {
      current: currentInfra.storageAndCDN?.cdn?.monthlyBandwidth || 500,
      projected: Math.ceil(500 * scaleFactor * 1.3), // Bandwidth grows faster
    },
  };

  estimates.totalMonthly =
    estimates.backend.projected +
    estimates.database.projected +
    estimates.storage.projected * 41 + // ₹41 per GB for storage
    estimates.bandwidth.projected * 8.5; // ₹8.5 per GB for bandwidth

  estimates.recommendations = [];

  if (scaleFactor > 5) {
    estimates.recommendations.push("Consider moving to dedicated servers");
  }
  if (estimates.storage.projected > 1000) {
    estimates.recommendations.push(
      "Implement storage optimization and cleanup policies",
    );
  }
  if (estimates.bandwidth.projected > 5000) {
    estimates.recommendations.push("Negotiate custom CDN pricing");
  }

  return estimates;
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
