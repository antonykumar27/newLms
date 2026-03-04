// services/queues/interactionQueue.js
const {
  interactionQueue,
  analyticsQueue,
  gamificationQueue,
  watchTimeQueue,
  progressQueue,
  dailyActivityQueue,
} = require("./index");
const { InteractionEvent } = require("../events/interactionEvents");

// Helper function to determine if interaction should trigger gamification
const shouldTriggerGamification = (type, normalizedData) => {
  const gamificationEvents = [
    "video_end",
    "video_complete",
    "video_heartbeat",
    "quiz_complete",
    "assignment_submit",
    "course_complete",
    "page_view",
  ];

  if (!gamificationEvents.includes(type)) return false;

  // For heartbeat, only trigger if significant progress
  if (type === "video_heartbeat") {
    const progress = normalizedData.currentTime / normalizedData.duration;
    return progress > 0.3; // Only count if >30% watched
  }

  return true;
};

// Main interaction handler function - distributes to specialized queues
const processInteraction = async (
  interaction,
  normalizedData,
  additionalData = {},
) => {
  const { userId, type, videoId, subjectId, chapterId, pageId } = interaction;

  // Create event
  const event = new InteractionEvent(type, userId, {
    ...interaction,
    normalizedData,
    ...additionalData,
  });

  // Store main interaction (critical path)
  await interactionQueue.add("save-interaction", event.toJSON(), {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    priority: 1,
  });

  // Queue analytics processing (non-critical)
  await analyticsQueue.add(
    "process-analytics",
    {
      userId,
      type,
      videoId,
      subjectId,
      chapterId,
      pageId,
      normalizedData,
      timestamp: new Date(),
    },
    {
      attempts: 2,
      backoff: 1000,
      priority: 2,
    },
  );

  // Queue watch time processing
  if (additionalData.watchTimeMs) {
    await watchTimeQueue.add(
      "process-watch-time",
      {
        userId,
        videoId,
        pageId,
        chapterId,
        subjectId,
        standardId: interaction.standardId,
        currentTime: normalizedData.currentTime,
        totalDuration: normalizedData.duration,
        watchTimeMs: additionalData.watchTimeMs,
        playerEvents: additionalData.playerEvents || [],
        deviceInfo: interaction.deviceInfo,
        sessionId: interaction.sessionId,
        type,
      },
      {
        attempts: 3,
        backoff: 1000,
        priority: 2,
      },
    );
  }

  // Queue progress updates
  if (
    [
      "video_play",
      "video_pause",
      "video_end",
      "video_heartbeat",
      "timeupdate",
    ].includes(type)
  ) {
    await progressQueue.add(
      "update-progress",
      {
        userId,
        videoId,
        pageId,
        chapterId,
        subjectId,
        standardId: interaction.standardId,
        currentTime: normalizedData.currentTime,
        totalDuration: normalizedData.duration,
        type,
      },
      {
        attempts: 3,
        backoff: 1000,
        priority: 2,
      },
    );
  }

  // Queue gamification updates
  if (shouldTriggerGamification(type, normalizedData)) {
    await gamificationQueue.add(
      "process-gamification",
      {
        userId,
        type,
        videoId,
        subjectId,
        chapterId,
        pageId,
        normalizedData,
        timestamp: new Date(),
      },
      {
        attempts: 2,
        backoff: 1000,
        priority: 3,
        delay: 500, // Delay to ensure main interaction is saved
      },
    );
  }

  // Queue daily activity updates
  await dailyActivityQueue.add(
    "update-daily-activity",
    {
      userId,
      type,
      videoId,
      subjectId,
      chapterId,
      pageId,
      normalizedData,
      timestamp: new Date(),
    },
    {
      attempts: 2,
      backoff: 1000,
      priority: 3,
    },
  );

  return event;
};

// Export functions directly
module.exports = {
  processInteraction,
  shouldTriggerGamification,
};
