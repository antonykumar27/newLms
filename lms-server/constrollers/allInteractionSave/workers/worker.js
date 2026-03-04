// services/workers/worker.js
const { workerQueue } = require("../queues");
const analyticsProcessor = require("../processors/analyticsProcessor");
const gamificationProcessor = require("../processors/gamificationProcessor");
const watchTimeProcessor = require("../processors/watchTimeProcessor");
const progressProcessor = require("../processors/progressProcessor");

// Register processors
workerQueue.process("analytics", analyticsProcessor);
workerQueue.process("gamification", gamificationProcessor);
workerQueue.process("watchTime", watchTimeProcessor);
workerQueue.process("progress", progressProcessor);

console.log("🚀 Worker started and listening for jobs");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await workerQueue.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker...");
  await workerQueue.close();
  process.exit(0);
});
