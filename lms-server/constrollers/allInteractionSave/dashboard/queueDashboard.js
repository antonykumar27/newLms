// services/dashboard/queueDashboard.js
const express = require("express");
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const {
  interactionQueue,
  analyticsQueue,
  gamificationQueue,
  watchTimeQueue,
  progressQueue,
} = require("../queues");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullAdapter(interactionQueue),
    new BullAdapter(analyticsQueue),
    new BullAdapter(gamificationQueue),
    new BullAdapter(watchTimeQueue),
    new BullAdapter(progressQueue),
  ],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(process.env.QUEUE_DASHBOARD_PORT || 3002, () => {
  console.log(
    `🚀 Queue dashboard running on port ${process.env.QUEUE_DASHBOARD_PORT || 3002}`,
  );
  console.log(
    `📊 View at http://localhost:${process.env.QUEUE_DASHBOARD_PORT || 3002}/admin/queues`,
  );
});
