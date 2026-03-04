/**
 * Calculate office space totals
 */
exports.calculateOfficeTotals = (office) => {
  if (!office) return { monthly: 0, threeYear: 0 };

  const monthly =
    (office.monthlyRent || 0) +
    (office.maintenance?.monthly || 0) +
    (office.utilities?.electricity || 0) +
    (office.utilities?.water || 0) +
    (office.utilities?.internet || 0);

  return {
    monthly,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate salary totals
 */
exports.calculateSalaryTotals = (salaries) => {
  if (!salaries || !Array.isArray(salaries)) {
    return { monthly: 0, yearly: 0, threeYear: 0 };
  }

  const monthly = salaries.reduce((sum, dept) => {
    return sum + (dept.totalCompensation || 0) * (dept.count || 0);
  }, 0);

  return {
    monthly,
    yearly: monthly * 12,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate legal compliance totals
 */
exports.calculateLegalTotals = (legal) => {
  if (!legal) return { yearly: 0, threeYear: 0 };

  const oneTime =
    (legal.companyRegistration?.oneTime || 0) +
    (legal.gstRegistration?.oneTime || 0) +
    (legal.trademarks?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0);

  const monthlyRetainers = legal.legalRetainers?.monthly || 0;

  const yearlyInsurance =
    (legal.insurance?.professionalIndemnity?.yearly || 0) +
    (legal.insurance?.cyberLiability?.yearly || 0);

  const yearly = monthlyRetainers * 12 + yearlyInsurance;
  const threeYear = monthlyRetainers * 36 + yearlyInsurance * 3 + oneTime;

  return {
    yearly,
    threeYear,
  };
};

/**
 * Calculate technology tools totals
 */
exports.calculateTechTotals = (tech) => {
  if (!tech) return { monthly: 0, threeYear: 0 };

  const productivityMonthly =
    tech.productivityTools?.reduce(
      (sum, tool) => sum + (tool.monthlyCost || 0),
      0,
    ) || 0;

  const communicationMonthly =
    tech.communicationTools?.reduce(
      (sum, tool) => sum + (tool.monthlyCost || 0),
      0,
    ) || 0;

  const accountingMonthly =
    tech.accountingTools?.reduce(
      (sum, tool) => sum + (tool.monthlyCost || 0),
      0,
    ) || 0;

  const monthly =
    productivityMonthly + communicationMonthly + accountingMonthly;

  return {
    monthly,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate grand totals
 */
exports.calculateGrandTotals = (office, salaries, legal, tech) => {
  const monthly =
    office.monthly + salaries.monthly + tech.monthly + legal.yearly / 12;

  return {
    monthly,
    yearly: monthly * 12,
    threeYear: monthly * 36,
  };
};

/**
 * Calculate per employee costs
 */
exports.calculatePerEmployeeCost = (operational, totalEmployees) => {
  if (totalEmployees === 0) return {};

  return {
    office: operational.officeSpace.totalMonthly / totalEmployees,
    salaries: operational.totalSalaryMonthly / totalEmployees,
    tech: operational.technologyTools.totalMonthly / totalEmployees,
    legal: operational.legalCompliance.totalYearly / 12 / totalEmployees,
    total: operational.totalOperationalMonthly / totalEmployees,
  };
};

/**
 * Generate efficiency metrics
 */
exports.generateEfficiencyMetrics = (operational, totalEmployees) => {
  const salaryPerEmployee = operational.totalSalaryMonthly / totalEmployees;
  const officePerEmployee =
    operational.officeSpace.totalMonthly / totalEmployees;
  const techPerEmployee =
    operational.technologyTools.totalMonthly / totalEmployees;

  return {
    ratios: {
      salaryToTotal:
        (
          (operational.totalSalaryMonthly /
            operational.totalOperationalMonthly) *
          100
        ).toFixed(1) + "%",
      officeToTotal:
        (
          (operational.officeSpace.totalMonthly /
            operational.totalOperationalMonthly) *
          100
        ).toFixed(1) + "%",
      techToTotal:
        (
          (operational.technologyTools.totalMonthly /
            operational.totalOperationalMonthly) *
          100
        ).toFixed(1) + "%",
    },
    perEmployee: {
      salary: salaryPerEmployee,
      office: officePerEmployee,
      tech: techPerEmployee,
    },
    benchmarks: {
      salaryBenchmark:
        salaryPerEmployee > 40000 ? "Above average" : "Within range",
      officeBenchmark: officePerEmployee > 10000 ? "High" : "Reasonable",
      techBenchmark: techPerEmployee > 5000 ? "Tech heavy" : "Efficient",
    },
  };
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
