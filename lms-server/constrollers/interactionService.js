// ==========================================
// services/interactionService.js
// ==========================================
class InteractionService {
  async process(data) {
    // Just validation and save
    const interaction = await this.saveInteraction(data);

    // Emit event - don't process directly
    await this.emitEvent("interaction.created", {
      interactionId: interaction._id,
      userId: data.userId,
      type: data.type,
      metadata: data,
    });

    return interaction;
  }
}

// ==========================================
// services/queueService.js (Bull/Redis)
// ==========================================
const Queue = require("bull");
const analyticsQueue = new Queue("analytics processing");

analyticsQueue.process(async (job) => {
  const { type, userId, data } = job.data;

  switch (type) {
    case "streak":
      await streakService.update(userId, data);
      break;
    case "badges":
      await badgeService.check(userId, data);
      break;
    case "heatmap":
      await heatmapService.update(userId, data);
      break;
  }
});
