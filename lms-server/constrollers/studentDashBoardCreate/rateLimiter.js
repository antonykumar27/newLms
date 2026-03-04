const Interaction = require("../../models/interaction");
const { RATE_LIMIT_CONFIG } = require("./constants");

// ==============================================
// RATE LIMITING MIDDLEWARE
// ==============================================
const checkRateLimit = async (userId, type, videoId, pageId) => {
  const rateLimitMs = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;

  if (rateLimitMs <= 0) return null;

  const recentInteraction = await Interaction.findOne({
    userId,
    type,
    videoId,
    pageId,
    eventTime: { $gte: new Date(Date.now() - rateLimitMs) },
  })
    .sort({ eventTime: -1 })
    .lean();

  if (recentInteraction) {
    const timeSinceLast =
      Date.now() - new Date(recentInteraction.eventTime).getTime();
    if (timeSinceLast < rateLimitMs) {
      const waitSeconds = Math.ceil((rateLimitMs - timeSinceLast) / 1000);
      return waitSeconds;
    }
  }

  return null;
};

module.exports = checkRateLimit;
