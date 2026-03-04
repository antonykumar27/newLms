// config/redisBull.js
const IORedis = require("ioredis");

const redisBull = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisBull.on("connect", () => {
  console.log("🔥 BullMQ Redis Connected (ioredis)");
});

redisBull.on("error", (err) => {
  console.error("❌ BullMQ Redis Error:", err);
});

module.exports = redisBull;
