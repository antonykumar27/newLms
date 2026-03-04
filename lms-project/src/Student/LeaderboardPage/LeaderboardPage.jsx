// components/LeaderboardPage.jsx
import React, { useState, useEffect } from "react";
import { useDashboard } from "../studentEngagement/DashboardContext";
import {
  FaTrophy,
  FaCrown,
  FaMedal,
  FaStar,
  FaFire,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaUsers,
  FaUserFriends,
  FaRocket,
  FaBolt,
  FaGem,
  FaAward,
  FaCertificate,
  FaClock,
  FaEye,
  FaShare,
  FaBell,
  FaGift,
  FaBattleNet,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LeaderboardPage = () => {
  const [timeFrame, setTimeFrame] = useState("weekly"); // daily, weekly, monthly, allTime
  const [category, setCategory] = useState("overall"); // overall, frontend, backend, systemDesign
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRewards, setShowRewards] = useState(false);

  const { user } = useDashboard();

  // ========== MASTER LEADERBOARD DATA ==========
  const leaderboardData = {
    // Current user stats
    currentUser: {
      id: "user_123",
      name: "Abhishek",
      rank: 3,
      previousRank: 4,
      xp: 5450,
      level: 12,
      avatar: "https://i.pravatar.cc/150?img=7",
      streak: 12,
      badges: 8,
      coursesCompleted: 4,
      quizzesPassed: 32,
      accuracy: 84,
      country: "IN",
      title: "Full Stack Developer",
      joinDate: "2025-09-15",
      followers: 128,
      following: 45,
    },

    // Ranking stats
    rankingStats: {
      totalParticipants: 15420,
      activeThisWeek: 8234,
      newThisWeek: 342,
      averageXP: 3250,
      top1XP: 8450,
      top10XP: 7200,
      top100XP: 5800,
    },

    // Time frames
    timeFrames: {
      daily: { label: "Today", icon: FaClock },
      weekly: { label: "This Week", icon: FaCalendarAlt },
      monthly: { label: "This Month", icon: FaChartLine },
      allTime: { label: "All Time", icon: FaTrophy },
    },

    // Categories
    categories: [
      { id: "overall", label: "Overall", icon: FaTrophy, color: "yellow" },
      { id: "frontend", label: "Frontend", icon: FaGem, color: "emerald" },
      { id: "backend", label: "Backend", icon: FaRocket, color: "blue" },
      {
        id: "systemDesign",
        label: "System Design",
        icon: FaBattleNet,
        color: "purple",
      },
      { id: "devops", label: "DevOps", icon: FaFire, color: "orange" },
      {
        id: "dataScience",
        label: "Data Science",
        icon: FaChartLine,
        color: "green",
      },
    ],

    // Rewards for top performers
    rewards: {
      rank1: { xp: 1000, badge: "Legend", gems: 500 },
      rank2: { xp: 750, badge: "Master", gems: 300 },
      rank3: { xp: 500, badge: "Expert", gems: 200 },
      rank4_10: { xp: 250, badge: "Pro", gems: 100 },
      rank11_50: { xp: 100, gems: 50 },
    },

    // Leaderboard entries (50+ users)
    entries: [
      // Top 3 - Special styling
      {
        id: 1,
        rank: 1,
        name: "Rahul",
        xp: 8450,
        level: 18,
        avatar: "https://i.pravatar.cc/150?img=1",
        change: "up",
        streak: 45,
        badges: 15,
        country: "IN",
        title: "Code Master",
        achievements: ["Legendary", "Streak King", "Quiz Master"],
        followers: 1250,
      },
      {
        id: 2,
        rank: 2,
        name: "Priya",
        xp: 7920,
        level: 17,
        avatar: "https://i.pravatar.cc/150?img=2",
        change: "same",
        streak: 38,
        badges: 14,
        country: "IN",
        title: "Algorithm Queen",
        achievements: ["Master Coder", "Bug Hunter"],
        followers: 980,
      },
      {
        id: 3,
        rank: 3,
        name: "Abhishek",
        xp: 5450,
        level: 12,
        avatar: "https://i.pravatar.cc/150?img=7",
        change: "up",
        streak: 12,
        badges: 8,
        country: "IN",
        title: "Full Stack Dev",
        achievements: ["Fast Learner"],
        followers: 128,
        isUser: true,
      },
      // More entries
      {
        id: 4,
        rank: 4,
        name: "Amal",
        xp: 5210,
        level: 12,
        avatar: "https://i.pravatar.cc/150?img=3",
        change: "down",
        streak: 8,
        badges: 7,
        country: "IN",
        title: "React Dev",
      },
      {
        id: 5,
        rank: 5,
        name: "Neha",
        xp: 4980,
        level: 11,
        avatar: "https://i.pravatar.cc/150?img=4",
        change: "down",
        streak: 10,
        badges: 7,
        country: "IN",
        title: "UI Specialist",
      },
      {
        id: 6,
        rank: 6,
        name: "Sarah",
        xp: 4750,
        level: 11,
        avatar: "https://i.pravatar.cc/150?img=5",
        change: "up",
        streak: 15,
        badges: 8,
        country: "US",
        title: "Backend Expert",
      },
      {
        id: 7,
        rank: 7,
        name: "Mike",
        xp: 4520,
        level: 10,
        avatar: "https://i.pravatar.cc/150?img=6",
        change: "up",
        streak: 7,
        badges: 6,
        country: "UK",
        title: "DevOps Engineer",
      },
      {
        id: 8,
        rank: 8,
        name: "John",
        xp: 4340,
        level: 10,
        avatar: "https://i.pravatar.cc/150?img=8",
        change: "down",
        streak: 5,
        badges: 5,
        country: "CA",
        title: "Data Scientist",
      },
      {
        id: 9,
        rank: 9,
        name: "Emma",
        xp: 4120,
        level: 9,
        avatar: "https://i.pravatar.cc/150?img=9",
        change: "up",
        streak: 9,
        badges: 6,
        country: "AU",
        title: "ML Engineer",
      },
      {
        id: 10,
        rank: 10,
        name: "David",
        xp: 3980,
        level: 9,
        avatar: "https://i.pravatar.cc/150?img=10",
        change: "down",
        streak: 4,
        badges: 4,
        country: "DE",
        title: "Security Expert",
      },
      // More entries...
      {
        id: 11,
        rank: 11,
        name: "Lisa",
        xp: 3850,
        level: 8,
        avatar: "https://i.pravatar.cc/150?img=11",
      },
      {
        id: 12,
        rank: 12,
        name: "Tom",
        xp: 3720,
        level: 8,
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      {
        id: 13,
        rank: 13,
        name: "Anna",
        xp: 3640,
        level: 8,
        avatar: "https://i.pravatar.cc/150?img=13",
      },
      {
        id: 14,
        rank: 14,
        name: "Chris",
        xp: 3510,
        level: 7,
        avatar: "https://i.pravatar.cc/150?img=14",
      },
      {
        id: 15,
        rank: 15,
        name: "Maria",
        xp: 3420,
        level: 7,
        avatar: "https://i.pravatar.cc/150?img=15",
      },
    ],

    // Recent achievers
    recentAchievers: [
      {
        name: "Rahul",
        achievement: "Completed 50 Day Streak",
        time: "5 min ago",
        xp: "+500",
      },
      {
        name: "Priya",
        achievement: "Perfect Score on React Quiz",
        time: "12 min ago",
        xp: "+300",
      },
      {
        name: "Amal",
        achievement: "Leveled Up to 12",
        time: "1 hour ago",
        xp: "+200",
      },
    ],

    // Milestones
    milestones: [
      { rank: 1, reward: "🏆 Legend Badge + 1000 XP" },
      { rank: 2, reward: "🥈 Master Badge + 750 XP" },
      { rank: 3, reward: "🥉 Expert Badge + 500 XP" },
      { rank: "4-10", reward: "⭐ Pro Badge + 250 XP" },
      { rank: "11-50", reward: "💎 100 XP + 50 Gems" },
      { rank: "51-100", reward: "🔰 50 XP" },
    ],
  };

  // Filter leaderboard based on search
  const filteredEntries = leaderboardData.entries.filter((entry) =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get rank change icon
  const getRankChange = (change) => {
    if (change === "up") return <FaArrowUp className="text-emerald-400" />;
    if (change === "down") return <FaArrowDown className="text-red-400" />;
    return <FaMinus className="text-zinc-500" />;
  };

  // Get rank medal
  const getRankMedal = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-400 text-xl" />;
    if (rank === 2) return <FaMedal className="text-zinc-400 text-xl" />;
    if (rank === 3) return <FaMedal className="text-amber-600 text-xl" />;
    return (
      <span className="text-zinc-600 font-mono w-6 text-center">{rank}</span>
    );
  };

  // Calculate XP needed for next rank
  const xpToNextRank = () => {
    const currentRank = leaderboardData.currentUser.rank;
    const nextRankEntry = leaderboardData.entries.find(
      (e) => e.rank === currentRank - 1,
    );
    if (!nextRankEntry) return 0;
    return nextRankEntry.xp - leaderboardData.currentUser.xp;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaTrophy className="text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-zinc-400 mt-2">
              {leaderboardData.rankingStats.totalParticipants.toLocaleString()}{" "}
              learners competing • You're #{leaderboardData.currentUser.rank} of{" "}
              {leaderboardData.rankingStats.totalParticipants}
            </p>
          </div>

          {/* Time Frame Selector */}
          <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-xl">
            {Object.entries(leaderboardData.timeFrames).map(
              ([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  onClick={() => setTimeFrame(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFrame === key
                      ? "bg-emerald-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="text-xs" />
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Stats & Milestones */}
        <div className="lg:col-span-1 space-y-6">
          {/* Your Rank Card */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
            <h3 className="text-sm font-medium text-emerald-400 mb-4">
              YOUR RANK
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={leaderboardData.currentUser.avatar}
                  alt={leaderboardData.currentUser.name}
                  className="w-16 h-16 rounded-full border-2 border-emerald-400"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold">
                  #{leaderboardData.currentUser.rank}
                </div>
              </div>

              <div>
                <p className="text-white font-bold text-lg">
                  {leaderboardData.currentUser.name}
                </p>
                <p className="text-xs text-zinc-400">
                  Level {leaderboardData.currentUser.level}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getRankChange(leaderboardData.currentUser.change)}
                  <span className="text-xs text-zinc-500">
                    {leaderboardData.currentUser.previousRank
                      ? `from #${leaderboardData.currentUser.previousRank}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total XP</span>
                <span className="text-white font-bold">
                  {leaderboardData.currentUser.xp.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Streak</span>
                <span className="text-orange-400 flex items-center gap-1">
                  <FaFire /> {leaderboardData.currentUser.streak} days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Badges</span>
                <span className="text-purple-400">
                  {leaderboardData.currentUser.badges}
                </span>
              </div>
            </div>

            {/* XP to next rank */}
            {xpToNextRank() > 0 && (
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-zinc-400 mb-1">
                  XP to #{leaderboardData.currentUser.rank - 1}
                </p>
                <p className="text-lg font-bold text-white">
                  {xpToNextRank()} XP
                </p>
                <div className="h-2 bg-zinc-800 rounded-full mt-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaFilter className="text-emerald-400" />
              Categories
            </h3>
            <div className="space-y-2">
              {leaderboardData.categories.map((cat) => {
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
                      <span className="text-sm text-white">{cat.label}</span>
                    </div>
                    <span className={`text-xs text-${cat.color}-400`}>124</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestones & Rewards */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaGift className="text-emerald-400" />
              Rank Rewards
            </h3>
            <div className="space-y-3">
              {leaderboardData.milestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-400 font-mono">
                    {milestone.rank}
                  </span>
                  <span className="text-zinc-300">{milestone.reward}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaAward className="text-emerald-400" />
              Recent Achievers
            </h3>
            <div className="space-y-4">
              {leaderboardData.recentAchievers.map((achiever, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <FaStar className="text-emerald-400 text-xs" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {achiever.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {achiever.achievement}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-zinc-600">{achiever.time}</span>
                      <span className="text-emerald-400">{achiever.xp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Leaderboard Table */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<FaUsers className="text-blue-400" />}
              label="Total"
              value={leaderboardData.rankingStats.totalParticipants.toLocaleString()}
            />
            <StatCard
              icon={<FaFire className="text-orange-400" />}
              label="Active This Week"
              value={leaderboardData.rankingStats.activeThisWeek.toLocaleString()}
            />
            <StatCard
              icon={<FaRocket className="text-purple-400" />}
              label="Top 1 XP"
              value={leaderboardData.rankingStats.top1XP.toLocaleString()}
            />
            <StatCard
              icon={<FaChartLine className="text-emerald-400" />}
              label="Average XP"
              value={leaderboardData.rankingStats.averageXP.toLocaleString()}
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search rank or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Leaderboard Table */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 text-xs font-medium text-zinc-500">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-2 text-right">XP</div>
              <div className="col-span-2 text-right">Level</div>
              <div className="col-span-2 text-right">Streak</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-800">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedUser(entry)}
                  className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors ${
                    entry.isUser
                      ? "bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "hover:bg-zinc-800/50"
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center gap-1">
                    {getRankMedal(entry.rank)}
                    {entry.rank <= 3 && (
                      <span className="ml-1 text-xs">
                        {entry.rank === 1
                          ? "👑"
                          : entry.rank === 2
                            ? "🥈"
                            : "🥉"}
                      </span>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${entry.isUser ? "text-emerald-400" : "text-white"}`}
                      >
                        {entry.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600">
                          {entry.title || "Learner"}
                        </span>
                        {entry.country && (
                          <span className="text-xs text-zinc-600">
                            {entry.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="col-span-2 text-right">
                    <p className="text-white font-medium">
                      {entry.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-600">XP</p>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 text-right">
                    <p className="text-white font-medium">{entry.level}</p>
                    <p className="text-xs text-zinc-600">Level</p>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 text-right flex items-center justify-end gap-1">
                    <FaFire
                      className={`text-xs ${entry.streak > 0 ? "text-orange-400" : "text-zinc-600"}`}
                    />
                    <span className="text-white font-medium">
                      {entry.streak}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View More Button */}
            <div className="p-4 border-t border-zinc-800 text-center">
              <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                View Full Leaderboard (50+)
              </button>
            </div>
          </div>

          {/* Weekly Top Performers */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaBolt className="text-yellow-400" />
              Top Performers This Week
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboardData.entries.slice(0, 3).map((performer) => (
                <div
                  key={performer.id}
                  className="bg-zinc-800/50 rounded-xl p-4 text-center"
                >
                  <div className="relative inline-block">
                    <img
                      src={performer.avatar}
                      alt={performer.name}
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                    />
                    {performer.rank === 1 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        👑
                      </div>
                    )}
                  </div>
                  <p className="text-white font-medium">{performer.name}</p>
                  <p className="text-xs text-zinc-500 mb-2">
                    {performer.title}
                  </p>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="text-yellow-400">{performer.xp} XP</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-orange-400 flex items-center gap-1">
                      <FaFire /> {performer.streak}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>

      {/* Rewards Modal */}
      <AnimatePresence>
        {showRewards && <RewardsModal onClose={() => setShowRewards(false)} />}
      </AnimatePresence>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

// User Profile Modal
const UserProfileModal = ({ user, onClose }) => (
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
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-sm text-zinc-400">
              Rank #{user.rank} • Level {user.level}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Total XP</p>
          <p className="text-lg font-bold text-white">{user.xp}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Streak</p>
          <p className="text-lg font-bold text-orange-400">
            {user.streak} days
          </p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Badges</p>
          <p className="text-lg font-bold text-purple-400">{user.badges}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Followers</p>
          <p className="text-lg font-bold text-blue-400">{user.followers}</p>
        </div>
      </div>

      {user.achievements && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white mb-3">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {user.achievements.map((ach, i) => (
              <span
                key={i}
                className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full"
              >
                {ach}
              </span>
            ))}
          </div>
        </div>
      )}

      <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors">
        Follow {user.name}
      </button>
    </motion.div>
  </motion.div>
);

// Rewards Modal
const RewardsModal = ({ onClose }) => (
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
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaGift className="text-emerald-400" />
        Rank Rewards
      </h3>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4 p-3 bg-yellow-500/10 rounded-lg">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
            👑
          </div>
          <div>
            <p className="text-white font-medium">Rank 1</p>
            <p className="text-sm text-zinc-400">
              1000 XP • Legend Badge • 500 Gems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg">
          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
            🥈
          </div>
          <div>
            <p className="text-white font-medium">Rank 2</p>
            <p className="text-sm text-zinc-400">
              750 XP • Master Badge • 300 Gems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg">
          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
            🥉
          </div>
          <div>
            <p className="text-white font-medium">Rank 3</p>
            <p className="text-sm text-zinc-400">
              500 XP • Expert Badge • 200 Gems
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors"
      >
        Close
      </button>
    </motion.div>
  </motion.div>
);

export default LeaderboardPage;
