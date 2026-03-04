// ==============================================
// VALIDATION FUNCTIONS
// ==============================================

const isValidForStreak = (type, normalizedData) => {
  console.log("type", type);
  console.log("normalizedData", normalizedData);
  if (
    type === "video_heartbeat" ||
    type === "video_end" ||
    type === "video_complete"
  ) {
    if (normalizedData.duration > 0) {
      const progress = normalizedData.currentTime / normalizedData.duration;
      return progress > 0.3;
    }
    return true;
  }
  if (type.includes("quiz") || type.includes("assignment")) return true;
  if (type === "page_view") return normalizedData.timeSpent > 120;
  return false;
};

module.exports = {
  isValidForStreak,
};
