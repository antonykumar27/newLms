// seeder/badgeSeeder.js - WITHOUT badgeId (USE THIS)
const badges = [
  {
    name: "First Steps",
    description: "Watch your first video",
    category: "completion",
    criteria: { type: "first_video" },
    assets: {
      icon: "🎬",
      iconType: "emoji",
      color: "#4CAF50",
    },
    tier: "bronze",
    points: 10,
    isActive: true,
  },
  {
    name: "7 Day Streak",
    description: "Maintain a 7-day learning streak",
    category: "streak",
    criteria: { type: "streak", threshold: 7 },
    assets: {
      icon: "🔥",
      iconType: "emoji",
      color: "#FF9800",
    },
    tier: "silver",
    points: 50,
    isActive: true,
  },
  {
    name: "30 Day Champion",
    description: "Learn for 30 days in a row",
    category: "streak",
    criteria: { type: "streak", threshold: 30 },
    assets: {
      icon: "🏆",
      iconType: "emoji",
      color: "#FFD700",
    },
    tier: "gold",
    points: 200,
    isActive: true,
  },
  {
    name: "100 Day Legend",
    description: "Achieve a 100-day learning streak",
    category: "streak",
    criteria: { type: "streak", threshold: 100 },
    assets: {
      icon: "👑",
      iconType: "emoji",
      color: "#9C27B0",
    },
    tier: "legendary",
    points: 500,
    isActive: true,
  },
];

module.exports = badges;
