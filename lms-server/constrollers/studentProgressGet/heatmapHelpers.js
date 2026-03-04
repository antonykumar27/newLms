// controllers/analytics/studentProgressGet/helpers/heatmapHelpers.js

const { HEATMAP_COLORS } = require("./analyticsConstants");

/**
 * Get heatmap intensity level based on watch time
 * @param {number} watchTime - Watch time in seconds
 * @returns {number} Intensity level (0-4)
 */
exports.getHeatmapIntensity = (watchTime) => {
  if (!watchTime || watchTime === 0) return 0;
  if (watchTime < 900) return 1; // < 15 min
  if (watchTime < 1800) return 2; // 15-30 min
  if (watchTime < 3600) return 3; // 30-60 min
  return 4; // > 60 min
};

/**
 * Get heatmap color based on intensity
 * @param {number} intensity - Intensity level (0-4)
 * @returns {string} Hex color code
 */
exports.getHeatmapColor = (intensity) => {
  const colors = HEATMAP_COLORS || [
    "#ebedf0",
    "#9be9a8",
    "#40c463",
    "#30a14e",
    "#216e39",
  ];
  return colors[intensity] || colors[0];
};

/**
 * Generate heatmap data for a full year
 * @param {Array} heatmapData - Raw heatmap data from database
 * @param {number} year - Year to generate heatmap for
 * @returns {Object} Formatted heatmap data
 */
exports.generateYearHeatmap = (heatmapData, year) => {
  // Create a map of existing data
  const dataMap = new Map();
  heatmapData.forEach((item) => {
    dataMap.set(item._id, {
      intensity: item.intensity,
      videosCompleted: item.videosCompleted,
    });
  });

  // Generate all days of the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const fullYearData = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const existing = dataMap.get(dateStr);

    fullYearData.push({
      date: dateStr,
      intensity: existing ? existing.intensity : 0,
      videosCompleted: existing ? existing.videosCompleted : 0,
      color: this.getHeatmapColor(
        existing ? this.getHeatmapIntensity(existing.intensity) : 0,
      ),
    });
  }

  return fullYearData;
};

/**
 * Group heatmap data by month for easier rendering
 * @param {Array} heatmapData - Formatted heatmap data
 * @returns {Object} Heatmap data grouped by month
 */
exports.groupHeatmapByMonth = (heatmapData) => {
  const months = {};

  heatmapData.forEach((day) => {
    const month = day.date.substring(0, 7); // YYYY-MM format
    if (!months[month]) {
      months[month] = [];
    }
    months[month].push(day);
  });

  return months;
};

/**
 * Calculate heatmap summary statistics
 * @param {Array} heatmapData - Raw heatmap data
 * @returns {Object} Summary statistics
 */
exports.calculateHeatmapSummary = (heatmapData) => {
  const activeDays = heatmapData.filter((d) => d.intensity > 0).length;
  const totalWatchTime = heatmapData.reduce((sum, d) => sum + d.intensity, 0);

  const bestDay = heatmapData.reduce(
    (max, d) => (d.intensity > max.intensity ? d : max),
    { intensity: 0, date: null, videosCompleted: 0 },
  );

  // Calculate streaks in heatmap
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date
  const sorted = [...heatmapData].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  sorted.forEach((day, index) => {
    if (day.intensity > 0) {
      tempStreak++;
      // Check if next day exists and is consecutive
      const nextDay = sorted[index + 1];
      if (nextDay) {
        const currentDate = new Date(day.date);
        const nextDate = new Date(nextDay.date);
        const diffDays = Math.round(
          (nextDate - currentDate) / (1000 * 60 * 60 * 24),
        );

        if (diffDays > 1) {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  });

  // Check last streak
  longestStreak = Math.max(longestStreak, tempStreak);

  // Check if current streak is ongoing
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const todayData = heatmapData.find((d) => d.date === today);
  const yesterdayData = heatmapData.find((d) => d.date === yesterday);

  if (todayData?.intensity > 0) {
    currentStreak = 1;
    // Count backwards to find streak length
    let checkDate = new Date(yesterday);
    while (checkDate >= startDate) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const dayData = heatmapData.find((d) => d.date === dateStr);
      if (dayData?.intensity > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (yesterdayData?.intensity > 0) {
    currentStreak = 1;
  }

  return {
    totalActiveDays: activeDays,
    totalWatchTime,
    averageDailyWatchTime:
      activeDays > 0 ? Math.round(totalWatchTime / activeDays) : 0,
    bestDay: {
      date: bestDay.date,
      watchTime: bestDay.intensity,
      videosCompleted: bestDay.videosCompleted,
    },
    streaks: {
      current: currentStreak,
      longest: longestStreak,
    },
    consistency: {
      daily: activeDays > 0 ? Math.round((activeDays / 365) * 100) : 0,
      weekly: this.calculateWeeklyConsistency(heatmapData),
    },
  };
};

/**
 * Calculate weekly consistency
 * @param {Array} heatmapData - Heatmap data
 * @returns {number} Weekly consistency percentage
 */
exports.calculateWeeklyConsistency = (heatmapData) => {
  const weeks = {};

  heatmapData.forEach((day) => {
    const date = new Date(day.date);
    const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

    if (!weeks[week]) {
      weeks[week] = { total: 0, active: 0 };
    }

    weeks[week].total++;
    if (day.intensity > 0) {
      weeks[week].active++;
    }
  });

  const weeklyScores = Object.values(weeks).map(
    (week) => (week.active / week.total) * 100,
  );

  return weeklyScores.length > 0
    ? Math.round(weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length)
    : 0;
};

/**
 * Get heatmap data for a specific date range
 * @param {Array} heatmapData - Full heatmap data
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Filtered heatmap data
 */
exports.getHeatmapDateRange = (heatmapData, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return heatmapData.filter((day) => {
    const date = new Date(day.date);
    return date >= start && date <= end;
  });
};

/**
 * Format heatmap for chart visualization
 * @param {Array} heatmapData - Heatmap data
 * @returns {Object} Chart-ready data
 */
exports.formatHeatmapForChart = (heatmapData) => {
  const months = this.groupHeatmapByMonth(heatmapData);
  const chartData = [];

  Object.keys(months)
    .sort()
    .forEach((month) => {
      const monthData = months[month];
      const monthName = new Date(month + "-01").toLocaleString("default", {
        month: "short",
      });

      monthData.forEach((day) => {
        chartData.push({
          x: parseInt(day.date.split("-")[2]), // Day of month
          y: monthName,
          value: day.intensity,
          intensity: this.getHeatmapIntensity(day.intensity),
          color: day.color,
          completed: day.videosCompleted,
          date: day.date,
        });
      });
    });

  return chartData;
};
