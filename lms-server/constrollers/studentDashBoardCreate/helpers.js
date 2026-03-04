// ==============================================
// HELPER FUNCTIONS
// ==============================================

const getDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    return "mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  return "desktop";
};

const normalizeLanguage = (lang) => lang || "en-US";

module.exports = {
  getDeviceType,
  normalizeLanguage,
};
