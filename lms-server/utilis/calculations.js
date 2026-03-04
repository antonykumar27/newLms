/**
 * Calculate instructor totals based on period
 */
exports.calculateInstructorTotals = (instructorCosts, period = "monthly") => {
  if (!instructorCosts) return 0;

  let total = 0;

  // Full-time teachers
  if (instructorCosts.fullTimeTeachers) {
    total += instructorCosts.fullTimeTeachers.reduce((sum, teacher) => {
      if (period === "monthly") return sum + (teacher.monthlySalary || 0);
      if (period === "yearly") return sum + (teacher.yearlySalary || 0);
      if (period === "threeYear") return sum + (teacher.threeYearSalary || 0);
      return sum;
    }, 0);
  }

  // Part-time teachers
  if (instructorCosts.partTimeTeachers) {
    total += instructorCosts.partTimeTeachers.reduce((sum, teacher) => {
      const monthly = teacher.monthlyPayment || 0;
      if (period === "monthly") return sum + monthly;
      if (period === "yearly") return sum + monthly * 12;
      if (period === "threeYear") return sum + monthly * 36;
      return sum;
    }, 0);
  }

  // Guest lecturers
  if (instructorCosts.guestLecturers) {
    total += instructorCosts.guestLecturers.reduce((sum, guest) => {
      const perSession = guest.oneTimeFee || 0;
      const sessionsPerYear = guest.sessionsPerYear || 0;
      if (period === "monthly")
        return sum + (perSession * sessionsPerYear) / 12;
      if (period === "yearly") return sum + perSession * sessionsPerYear;
      if (period === "threeYear") return sum + perSession * sessionsPerYear * 3;
      return sum;
    }, 0);
  }

  // Content writers
  if (instructorCosts.contentWriters) {
    total += instructorCosts.contentWriters.reduce((sum, writer) => {
      const monthly = writer.monthlyCost || 0;
      if (period === "monthly") return sum + monthly;
      if (period === "yearly") return sum + monthly * 12;
      if (period === "threeYear") return sum + monthly * 36;
      return sum;
    }, 0);
  }

  // Video editors
  if (instructorCosts.videoEditors) {
    total += instructorCosts.videoEditors.reduce((sum, editor) => {
      const monthly = editor.monthlyCost || 0;
      if (period === "monthly") return sum + monthly;
      if (period === "yearly") return sum + monthly * 12;
      if (period === "threeYear") return sum + monthly * 36;
      return sum;
    }, 0);
  }

  return total;
};

/**
 * Calculate production totals based on period
 */
exports.calculateProductionTotals = (contentProduction, period = "monthly") => {
  if (!contentProduction) return 0;

  let total = 0;

  // Video production
  if (contentProduction.videoProduction) {
    const monthlyVideo = contentProduction.videoProduction.monthlyCost || 0;
    if (period === "monthly") total += monthlyVideo;
    if (period === "threeYear")
      total += contentProduction.videoProduction.threeYearCost || 0;
  }

  // Graphic design
  if (contentProduction.graphicDesign) {
    const monthlyGraphic = contentProduction.graphicDesign.monthlyCost || 0;
    if (period === "monthly") total += monthlyGraphic;
    if (period === "threeYear") total += monthlyGraphic * 36;
  }

  // Animation
  if (contentProduction.animation) {
    const monthlyAnimation = contentProduction.animation.monthlyCost || 0;
    if (period === "monthly") total += monthlyAnimation;
    if (period === "threeYear") total += monthlyAnimation * 36;
  }

  return total;
};

/**
 * Calculate grand total for 3 years
 */
exports.calculateGrandTotal = (data) => {
  let total = 0;

  // Studio equipment (one-time)
  total += data.studioEquipment?.totalStudioEquipment || 0;

  // Instructor costs (3 years)
  total += data.instructorCosts?.totalInstructorThreeYear || 0;

  // Production costs (3 years)
  total += data.contentProduction?.totalProductionThreeYear || 0;

  return total;
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
