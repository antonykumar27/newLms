const Video = require("../../models/videoModel");
const StandardSubject = require("../../models/standardSubjectSchema");

// ==============================================
// UPDATE ANALYTICS COUNTERS
// ==============================================
const updateAnalyticsCounters = async (
  type,
  subjectId,
  videoId,
  userId,
  normalizedData,
  additionalData = {},
) => {
  console.log("type", type);
  try {
    switch (type) {
      case "video_play":
      case "video_pause":
      case "video_end":
      case "video_seek":
      case "video_heartbeat":
        if (videoId) {
          await Video.findByIdAndUpdate(videoId, {
            $inc: { [`analytics.${type}`]: 1 },
            $set: { "analytics.lastActivity": new Date() },
          });
        }
        break;

      case "timeupdate":
        if (videoId) {
          const update = {
            $inc: {
              "analytics.totalViews": 1,
              ...(additionalData.viewDuration && {
                "analytics.totalWatchTime": additionalData.viewDuration,
              }),
            },
            $addToSet: { "analytics.uniqueViewers": userId },
            $set: { "analytics.lastView": new Date() },
          };
          await Video.findByIdAndUpdate(videoId, update);
        }
        break;
    }

    // First, ensure the document exists with default values
    await StandardSubject.updateOne(
      { _id: subjectId },
      {
        $setOnInsert: {
          analytics: {
            interactions: {
              video_play: 0,
              video_pause: 0,
              video_end: 0,
              video_seek: 0,
              video_heartbeat: 0,
              timeupdate: 0,
            },
            lastInteraction: new Date(),
          },
        },
      },
      { upsert: true },
    );

    // Then, increment the specific interaction counter
    await StandardSubject.findByIdAndUpdate(subjectId, {
      $inc: { [`analytics.interactions.${type}`]: 1 },
      $set: { "analytics.lastInteraction": new Date() },
    });
  } catch (error) {
    console.error("Error updating analytics counters:", error);
  }
};

module.exports = updateAnalyticsCounters;
