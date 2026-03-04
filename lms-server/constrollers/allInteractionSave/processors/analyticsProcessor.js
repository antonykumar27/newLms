// services/processors/analyticsProcessor.js
const Video = require("../../models/videoModel");
const StandardSubject = require("../../models/standardSubjectSchema");
const DailyInteraction = require("../../models/dailyInteraction");
const DailyUniqueUser = require("../../models/dailyUniqueUserSchema");

module.exports = async (job) => {
  const {
    userId,
    type,
    videoId,
    subjectId,
    chapterId,
    pageId,
    normalizedData,
  } = job.data;
  const today = new Date().toISOString().split("T")[0];

  try {
    // Update video analytics
    if (videoId) {
      await updateVideoAnalytics(videoId, type, userId, normalizedData);
    }

    // Update subject analytics
    if (subjectId) {
      await StandardSubject.findByIdAndUpdate(subjectId, {
        $inc: { [`analytics.interactions.${type}`]: 1 },
        $set: { "analytics.lastInteraction": new Date() },
      });
    }

    // Update daily analytics
    await updateDailyAnalytics(today, {
      userId,
      type,
      videoId,
      subjectId,
      chapterId,
      pageId,
      normalizedData,
    });

    // Update unique users
    if (videoId) {
      await updateUniqueUsers(today, videoId, userId);
    }

    console.log(`✅ Analytics processed: ${type} for user ${userId}`);
  } catch (error) {
    console.error("❌ Analytics processor error:", error);
    throw error; // Let Bull handle retry
  }
};

async function updateVideoAnalytics(videoId, type, userId, normalizedData) {
  const update = {
    $inc: { [`analytics.${type}`]: 1 },
    $set: { "analytics.lastActivity": new Date() },
  };

  if (type === "video_view") {
    update.$inc["analytics.totalViews"] = 1;
    update.$addToSet = { "analytics.uniqueViewers": userId };
  }

  await Video.findByIdAndUpdate(videoId, update);
}

async function updateDailyAnalytics(date, data) {
  const {
    type,
    videoId,
    subjectId,
    standardId,
    chapterId,
    pageId,
    normalizedData,
  } = data;

  let watchDuration = 0;
  let segment = null;

  if (type === "video_heartbeat" && normalizedData.currentTime) {
    const segmentSize = 10;
    segment = Math.floor(normalizedData.currentTime / segmentSize);
    watchDuration = 10;
  }

  await DailyInteraction.findOneAndUpdate(
    {
      date,
      ...(videoId && { videoId }),
      ...(pageId && { pageId }),
      ...(subjectId && { subjectId }),
    },
    {
      $inc: {
        "metrics.totalViews": type === "video_view" ? 1 : 0,
        [`metrics.interactions.${type}`]: 1,
        "metrics.totalWatchTime": watchDuration,
      },
      $set: {
        lastUpdated: new Date(),
        standardId,
        subjectId,
        ...(videoId && { videoId }),
        ...(pageId && { pageId }),
        ...(chapterId && { chapterId }),
      },
    },
    { upsert: true },
  );

  // Update watch segments
  if (segment !== null && videoId) {
    await updateWatchSegments(date, videoId, segment, watchDuration);
  }
}

async function updateWatchSegments(date, videoId, segment, watchDuration) {
  const result = await DailyInteraction.updateOne(
    { date, videoId, "metrics.watchSegments.segment": segment },
    {
      $inc: {
        "metrics.watchSegments.$.watchCount": 1,
        "metrics.watchSegments.$.totalTime": watchDuration,
      },
    },
  );

  if (result.matchedCount === 0) {
    await DailyInteraction.updateOne(
      { date, videoId },
      {
        $push: {
          "metrics.watchSegments": {
            segment,
            watchCount: 1,
            totalTime: watchDuration,
          },
        },
      },
    );
  }
}

async function updateUniqueUsers(date, videoId, userId) {
  await DailyUniqueUser.findOneAndUpdate(
    { date, videoId, userId },
    {
      $set: { lastSeen: new Date() },
      $inc: { interactions: 1 },
    },
    { upsert: true },
  );

  const uniqueCount = await DailyUniqueUser.countDocuments({ date, videoId });
  await DailyInteraction.updateOne(
    { date, videoId },
    { $set: { "metrics.uniqueUserCount": uniqueCount } },
  );
}
