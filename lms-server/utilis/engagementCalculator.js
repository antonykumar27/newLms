/**
 * Calculate engagement score (0-100)
 */
const calculateEngagementScore = (metrics) => {
  let score = 0;

  // 40% weight to watch time (target 30 mins = 1800 sec)
  const watchTimeScore = Math.min((metrics.totalWatchTime / 1800) * 40, 40);

  // 30% weight to interactions (target 50 interactions)
  const interactionScore = Math.min((metrics.totalInteractions / 50) * 30, 30);

  // 20% weight to quiz performance
  const quizScore = (metrics.averageQuizScore / 100) * 20;

  // 10% weight to consistency
  const consistencyScore = metrics.isValidLearningDay ? 10 : 0;

  score = watchTimeScore + interactionScore + quizScore + consistencyScore;

  return Math.min(Math.round(score), 100);
};

/**
 * Check if valid learning day
 */
const isValidLearningDay = (metrics) => {
  const hasEnoughWatchTime = metrics.totalWatchTime >= 600; // 10 mins
  const hasEnoughInteractions = metrics.totalInteractions >= 20;
  return hasEnoughWatchTime || hasEnoughInteractions;
};

module.exports = {
  calculateEngagementScore,
  isValidLearningDay,
};
