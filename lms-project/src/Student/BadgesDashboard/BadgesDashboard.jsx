// components/BadgesDashboard.jsx
import React, { useState } from "react";

import {
  FaTrophy,
  FaFire,
  FaRocket,
  FaBrain,
  FaStar,
  FaLock,
  FaUnlock,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaUsers,
  FaCode,
  FaBook,
  FaMedal,
  FaCrown,
  FaGem,
  FaBolt,
  FaShieldAlt,
  FaAward,
  FaCertificate,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaEye,
  FaShare,
  FaTwitter,
  FaFacebook,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BadgesDashboard = () => {
  const [activeTab, setActiveTab] = useState("all"); // all, earned, locked, rare
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  // ========== MASTER BADGES DATA ==========
  const badgesData = {
    // Summary stats
    stats: {
      totalBadges: 48,
      earned: 12,
      locked: 36,
      rare: 3,
      legendary: 1,
      points: 2450,
      rank: "Silver Collector",
      nextRank: "Gold Collector",
      progressToNext: 45,
    },

    // Badge categories
    categories: [
      { id: "all", name: "All Badges", count: 48, icon: FaAward },
      {
        id: "streak",
        name: "Streak Master",
        count: 6,
        icon: FaFire,
        color: "orange",
      },
      {
        id: "learning",
        name: "Learning Path",
        count: 12,
        icon: FaBook,
        color: "blue",
      },
      {
        id: "quiz",
        name: "Quiz Champion",
        count: 8,
        icon: FaBrain,
        color: "purple",
      },
      {
        id: "coding",
        name: "Code Master",
        count: 10,
        icon: FaCode,
        color: "emerald",
      },
      {
        id: "social",
        name: "Social Learner",
        count: 5,
        icon: FaUsers,
        color: "green",
      },
      {
        id: "special",
        name: "Special Events",
        count: 7,
        icon: FaStar,
        color: "yellow",
      },
    ],

    // All badges with details
    badges: [
      // STREAK BADGES (6)
      {
        id: 1,
        name: "7 Day Streak",
        description: "Maintain a 7-day learning streak",
        category: "streak",
        rarity: "common",
        icon: "🔥",
        color: "orange",
        earned: true,
        earnedDate: "2026-02-15",
        progress: 100,
        requirement: "7 consecutive days",
        xpReward: 100,
        tier: 1,
        animation: "fire",
        stats: { days: 7 },
      },
      {
        id: 2,
        name: "30 Day Streak",
        description: "Maintain a 30-day learning streak",
        category: "streak",
        rarity: "rare",
        icon: "⚡",
        color: "orange",
        earned: true,
        earnedDate: "2026-03-01",
        progress: 100,
        requirement: "30 consecutive days",
        xpReward: 300,
        tier: 2,
        animation: "lightning",
        stats: { days: 30 },
      },
      {
        id: 3,
        name: "100 Day Streak",
        description: "Maintain a 100-day learning streak",
        category: "streak",
        rarity: "epic",
        icon: "🔥🔥",
        color: "red",
        earned: false,
        progress: 42,
        current: 42,
        target: 100,
        requirement: "100 consecutive days",
        xpReward: 1000,
        tier: 3,
        animation: "inferno",
        stats: { days: 100 },
      },
      {
        id: 4,
        name: "Weekend Warrior",
        description: "Study on 10 weekends",
        category: "streak",
        rarity: "common",
        icon: "🌅",
        color: "yellow",
        earned: true,
        earnedDate: "2026-02-10",
        progress: 100,
        requirement: "10 weekend study sessions",
        xpReward: 150,
      },
      {
        id: 5,
        name: "Early Bird",
        description: "Study before 7 AM for 30 days",
        category: "streak",
        rarity: "rare",
        icon: "🐦",
        color: "amber",
        earned: false,
        progress: 65,
        current: 19,
        target: 30,
        requirement: "30 early morning sessions",
        xpReward: 250,
      },
      {
        id: 6,
        name: "Night Owl",
        description: "Study after 10 PM for 30 days",
        category: "streak",
        rarity: "rare",
        icon: "🦉",
        color: "indigo",
        earned: false,
        progress: 40,
        current: 12,
        target: 30,
        requirement: "30 night sessions",
        xpReward: 250,
      },

      // LEARNING PATH BADGES (12)
      {
        id: 7,
        name: "React Master",
        description: "Complete all React courses",
        category: "learning",
        rarity: "epic",
        icon: "⚛️",
        color: "emerald",
        earned: false,
        progress: 75,
        current: 3,
        target: 4,
        requirement: "Complete 4 React courses",
        xpReward: 500,
        courses: ["React Basics", "React Hooks", "Advanced React", "Next.js"],
      },
      {
        id: 8,
        name: "Node.js Ninja",
        description: "Complete all Node.js courses",
        category: "learning",
        rarity: "epic",
        icon: "🟢",
        color: "green",
        earned: false,
        progress: 50,
        current: 2,
        target: 4,
        requirement: "Complete 4 Node.js courses",
        xpReward: 500,
      },
      {
        id: 9,
        name: "TypeScript Wizard",
        description: "Master TypeScript",
        category: "learning",
        rarity: "rare",
        icon: "🔷",
        color: "blue",
        earned: true,
        earnedDate: "2026-02-20",
        progress: 100,
        requirement: "Complete TypeScript path",
        xpReward: 300,
      },
      {
        id: 10,
        name: "System Design Architect",
        description: "Complete System Design track",
        category: "learning",
        rarity: "legendary",
        icon: "🏗️",
        color: "purple",
        earned: false,
        progress: 30,
        current: 1,
        target: 4,
        requirement: "Complete 4 System Design courses",
        xpReward: 1000,
        isLegendary: true,
      },
      {
        id: 11,
        name: "Database Expert",
        description: "Master database concepts",
        category: "learning",
        rarity: "rare",
        icon: "🗄️",
        color: "cyan",
        earned: false,
        progress: 60,
        current: 3,
        target: 5,
        requirement: "Complete 5 database courses",
        xpReward: 400,
      },

      // QUIZ CHAMPION BADGES (8)
      {
        id: 12,
        name: "Quiz Master",
        description: "Score 100% on 10 quizzes",
        category: "quiz",
        rarity: "rare",
        icon: "🎯",
        color: "purple",
        earned: true,
        earnedDate: "2026-02-25",
        progress: 100,
        requirement: "10 perfect scores",
        xpReward: 300,
        stats: { perfectQuizzes: 10 },
      },
      {
        id: 13,
        name: "Speed Demon",
        description: "Complete quiz in under 2 minutes",
        category: "quiz",
        rarity: "rare",
        icon: "⚡",
        color: "yellow",
        earned: true,
        earnedDate: "2026-02-18",
        progress: 100,
        requirement: "5 fast completions",
        xpReward: 250,
      },
      {
        id: 14,
        name: "Accuracy King",
        description: "Maintain 95%+ accuracy for 20 quizzes",
        category: "quiz",
        rarity: "epic",
        icon: "👑",
        color: "gold",
        earned: false,
        progress: 75,
        current: 15,
        target: 20,
        requirement: "20 quizzes with 95%+ accuracy",
        xpReward: 600,
      },
      {
        id: 15,
        name: "JavaScript Guru",
        description: "Score 90%+ on all JS quizzes",
        category: "quiz",
        rarity: "rare",
        icon: "📜",
        color: "yellow",
        earned: true,
        earnedDate: "2026-02-22",
        progress: 100,
        requirement: "Pass all JS quizzes",
        xpReward: 300,
      },

      // CODE MASTER BADGES (10)
      {
        id: 16,
        name: "100 Problems Solved",
        description: "Solve 100 coding challenges",
        category: "coding",
        rarity: "common",
        icon: "💻",
        color: "emerald",
        earned: true,
        earnedDate: "2026-02-05",
        progress: 100,
        requirement: "100 problems",
        xpReward: 100,
        stats: { problems: 100 },
      },
      {
        id: 17,
        name: "500 Problems Solved",
        description: "Solve 500 coding challenges",
        category: "coding",
        rarity: "epic",
        icon: "🚀",
        color: "emerald",
        earned: false,
        progress: 48,
        current: 240,
        target: 500,
        requirement: "500 problems",
        xpReward: 1000,
      },
      {
        id: 18,
        name: "Algorithm Master",
        description: "Solve 50 algorithm problems",
        category: "coding",
        rarity: "rare",
        icon: "🧮",
        color: "blue",
        earned: false,
        progress: 60,
        current: 30,
        target: 50,
        requirement: "50 algorithm problems",
        xpReward: 400,
      },

      // SOCIAL LEARNER BADGES (5)
      {
        id: 19,
        name: "Team Player",
        description: "Join 5 study groups",
        category: "social",
        rarity: "common",
        icon: "👥",
        color: "green",
        earned: true,
        earnedDate: "2026-02-12",
        progress: 100,
        requirement: "5 study groups",
        xpReward: 100,
      },
      {
        id: 20,
        name: "Mentor",
        description: "Help 10 students",
        category: "social",
        rarity: "epic",
        icon: "👨‍🏫",
        color: "blue",
        earned: false,
        progress: 40,
        current: 4,
        target: 10,
        requirement: "10 students helped",
        xpReward: 500,
      },

      // SPECIAL EVENT BADGES (7)
      {
        id: 21,
        name: "Hackathon Winner",
        description: "Win a coding hackathon",
        category: "special",
        rarity: "legendary",
        icon: "🏆",
        color: "gold",
        earned: false,
        progress: 0,
        requirement: "1st place in hackathon",
        xpReward: 2000,
        isLegendary: true,
        event: "Annual Hackathon 2026",
      },
      {
        id: 22,
        name: "Beta Tester",
        description: "Test new features",
        category: "special",
        rarity: "rare",
        icon: "🧪",
        color: "purple",
        earned: true,
        earnedDate: "2026-01-15",
        progress: 100,
        requirement: "Participate in beta testing",
        xpReward: 300,
      },
    ],

    // Rare & Legendary badges
    rareBadges: [
      { id: 10, name: "System Design Architect", rarity: "legendary" },
      { id: 21, name: "Hackathon Winner", rarity: "legendary" },
      { id: 3, name: "100 Day Streak", rarity: "epic" },
      { id: 17, name: "500 Problems Solved", rarity: "epic" },
    ],

    // Recent unlocks
    recentUnlocks: [
      { name: "30 Day Streak", date: "2 days ago", icon: "⚡" },
      { name: "JavaScript Guru", date: "5 days ago", icon: "📜" },
      { name: "Quiz Master", date: "1 week ago", icon: "🎯" },
    ],

    // Next badges to unlock
    nextBadges: [
      {
        name: "100 Day Streak",
        progress: 42,
        remaining: "58 days",
        icon: "🔥🔥",
        estimated: "in 2 months",
      },
      {
        name: "500 Problems Solved",
        progress: 48,
        remaining: "260 problems",
        icon: "🚀",
        estimated: "in 3 weeks",
      },
      {
        name: "System Design Architect",
        progress: 30,
        remaining: "3 courses",
        icon: "🏗️",
        estimated: "in 1 month",
      },
    ],

    // Badge tiers
    tiers: {
      bronze: { min: 0, max: 10, name: "Bronze Collector" },
      silver: { min: 11, max: 25, name: "Silver Collector" },
      gold: { min: 26, max: 40, name: "Gold Collector" },
      platinum: { min: 41, max: 48, name: "Platinum Master" },
    },
  };

  // Filter badges based on active tab and search
  const filteredBadges = badgesData.badges.filter((badge) => {
    // Search filter
    if (
      searchQuery &&
      !badge.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Tab filter
    if (activeTab === "earned" && !badge.earned) return false;
    if (activeTab === "locked" && badge.earned) return false;
    if (activeTab === "rare" && !["epic", "legendary"].includes(badge.rarity))
      return false;

    // Category filter
    if (category !== "all" && badge.category !== category) return false;

    return true;
  });

  // Get badge color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "from-zinc-500 to-zinc-600";
      case "rare":
        return "from-blue-500 to-purple-500";
      case "epic":
        return "from-purple-500 to-pink-500";
      case "legendary":
        return "from-yellow-400 to-orange-500";
      default:
        return "from-emerald-500 to-cyan-500";
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case "common":
        return "bg-zinc-500/20 text-zinc-400";
      case "rare":
        return "bg-blue-500/20 text-blue-400";
      case "epic":
        return "bg-purple-500/20 text-purple-400";
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-emerald-500/20 text-emerald-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaTrophy className="text-yellow-400" />
              Achievements Gallery
            </h1>
            <p className="text-zinc-400 mt-2">
              {badgesData.stats.earned} of {badgesData.stats.totalBadges} badges
              earned • {badgesData.stats.rare} rare •{" "}
              {badgesData.stats.legendary} legendary
            </p>
          </div>

          {/* Collector Rank */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl px-6 py-3 border border-emerald-500/30">
            <p className="text-xs text-emerald-400 mb-1">COLLECTOR RANK</p>
            <p className="text-xl font-bold text-white">
              {badgesData.stats.rank}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${badgesData.stats.progressToNext}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500">
                {badgesData.stats.progressToNext}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Next: {badgesData.stats.nextRank}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<FaAward />}
            label="Total Badges"
            value={badgesData.stats.totalBadges}
          />
          <StatCard
            icon={<FaCheckCircle className="text-emerald-400" />}
            label="Earned"
            value={badgesData.stats.earned}
          />
          <StatCard
            icon={<FaLock className="text-zinc-500" />}
            label="Locked"
            value={badgesData.stats.locked}
          />
          <StatCard
            icon={<FaGem className="text-purple-400" />}
            label="Rare"
            value={badgesData.stats.rare}
          />
          <StatCard
            icon={<FaCrown className="text-yellow-400" />}
            label="Legendary"
            value={badgesData.stats.legendary}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Categories & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Categories */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaFilter className="text-emerald-400" />
              Categories
            </h3>
            <div className="space-y-2">
              {badgesData.categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      category === cat.id
                        ? `bg-${cat.color}-500/20 border border-${cat.color}-500/30`
                        : "hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`text-${cat.color}-400`} />
                      <span className="text-sm text-white">{cat.name}</span>
                    </div>
                    <span className={`text-xs text-${cat.color}-400`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Unlocks */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaClock className="text-emerald-400" />
              Recently Earned
            </h3>
            <div className="space-y-3">
              {badgesData.recentUnlocks.map((unlock, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{unlock.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {unlock.name}
                    </p>
                    <p className="text-xs text-zinc-500">{unlock.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Badges */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaRocket className="text-emerald-400" />
              Next to Unlock
            </h3>
            <div className="space-y-4">
              {badgesData.nextBadges.map((badge, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{badge.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {badge.name}
                      </p>
                      <p className="text-xs text-zinc-500">{badge.estimated}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600">
                    {badge.remaining} remaining
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Badges Grid */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
            {[
              {
                id: "all",
                label: "All Badges",
                count: badgesData.stats.totalBadges,
              },
              { id: "earned", label: "Earned", count: badgesData.stats.earned },
              { id: "locked", label: "Locked", count: badgesData.stats.locked },
              {
                id: "rare",
                label: "Rare & Legendary",
                count: badgesData.stats.rare + badgesData.stats.legendary,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs ${
                    activeTab === tab.id ? "text-white/80" : "text-zinc-600"
                  }`}
                >
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedBadge(badge)}
                className={`
                  relative bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 
                  border-2 transition-all cursor-pointer group
                  ${
                    badge.earned
                      ? `border-${badge.color}-500/30 hover:border-${badge.color}-500`
                      : "border-zinc-800 hover:border-zinc-700"
                  }
                `}
              >
                {/* Rarity indicator */}
                {badge.rarity === "legendary" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs">
                    👑
                  </div>
                )}

                {/* Badge icon */}
                <div
                  className={`
                  text-4xl mb-3 text-center transform group-hover:scale-110 transition-transform
                  ${!badge.earned && "opacity-50"}
                `}
                >
                  {badge.icon}
                </div>

                {/* Badge name */}
                <h3
                  className={`text-sm font-bold text-center mb-2 ${
                    badge.earned ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {badge.name}
                </h3>

                {/* Progress bar for locked badges */}
                {!badge.earned && badge.progress && (
                  <div className="space-y-1">
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-zinc-600">
                      {badge.progress}%
                    </p>
                  </div>
                )}

                {/* Earned badge */}
                {badge.earned && (
                  <div className="absolute bottom-2 right-2">
                    <FaCheckCircle className="text-emerald-400 text-sm" />
                  </div>
                )}

                {/* Rarity badge */}
                <div
                  className={`
                  absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full
                  ${getRarityBadge(badge.rarity)}
                `}
                >
                  {badge.rarity}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <FaAward className="text-5xl text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No badges found
              </h3>
              <p className="text-zinc-500">
                Try adjusting your filters or search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetailModal
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-emerald-400">{icon}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

// Badge Detail Modal
const BadgeDetailModal = ({ badge, onClose }) => {
  const rarityColors = {
    common: "zinc",
    rare: "blue",
    epic: "purple",
    legendary: "yellow",
  };

  const color = rarityColors[badge.rarity] || "emerald";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`
              w-16 h-16 rounded-2xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 
              flex items-center justify-center text-4xl
              ${badge.earned ? "" : "opacity-50"}
            `}
            >
              {badge.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{badge.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`
                  text-xs px-2 py-0.5 rounded-full capitalize
                  ${
                    badge.rarity === "legendary"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : badge.rarity === "epic"
                        ? "bg-purple-500/20 text-purple-400"
                        : badge.rarity === "rare"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-zinc-500/20 text-zinc-400"
                  }
                `}
                >
                  {badge.rarity}
                </span>
                {badge.earned && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Earned
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-zinc-300 mb-4">{badge.description}</p>

        {/* Requirement */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-zinc-400 mb-1">Requirement</p>
          <p className="text-white font-medium">{badge.requirement}</p>
        </div>

        {/* Progress */}
        {!badge.earned && badge.progress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progress</span>
              <span className="text-white">
                {badge.current}/{badge.target}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${color}-500 rounded-full`}
                style={{ width: `${badge.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">XP Reward</p>
            <p className="text-lg font-bold text-emerald-400">
              +{badge.xpReward} XP
            </p>
          </div>
          {badge.earned && badge.earnedDate && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-1">Earned on</p>
              <p className="text-sm text-white">{badge.earnedDate}</p>
            </div>
          )}
        </div>

        {/* Share buttons */}
        {badge.earned && (
          <div className="flex gap-2">
            <button className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
              <FaTwitter /> Tweet
            </button>
            <button className="flex-1 bg-[#4267B2] hover:bg [#365899] text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
              <FaFacebook /> Share
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BadgesDashboard;
