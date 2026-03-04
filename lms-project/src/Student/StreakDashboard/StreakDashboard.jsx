// StreakDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaFire,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCalendarAlt,
  FaTrophy,
  FaChartLine,
  FaCrown,
  FaBolt,
  FaStar,
  FaClock,
  FaArrowRight,
  FaGem,
  FaMedal,
  FaAward,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useGetUserMetricsQuery } from "../../store/api/StudentAllDetailsGetAndSend";
const StreakDashboard = () => {
  const [activeTab, setActiveTab] = useState("main");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: streak, isLoading, refetch, error } = useGetUserMetricsQuery();
  console.log("streak", streak);
  // ===== SIMPLIFIED STREAK DATA =====
  const streakData = {
    // Core streak info
    current: 12,
    best: 24,
    startDate: "February 21, 2026",

    // Today's status
    today: {
      completed: true,
      lessons: 3,
      minutes: 25,
      xp: 145,
      lastActive: "2 hours ago",
    },

    // Next milestone
    nextMilestone: {
      target: 30,
      reward: "🔥 Rare Badge + 500 XP",
      daysRemaining: 18,
      estimatedDate: "March 22, 2026",
    },

    // Streak protection
    protection: {
      freezes: 2,
      total: 3,
      nextFreeze: "5 days",
    },

    // Calendar data (March 2026)
    calendar: {
      month: "March 2026",
      days: Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        // Active days: March 1-4 are active
        if (day <= 4) {
          return {
            date: day,
            active: true,
            productive: day === 4,
            freeze: false,
            xp: day === 4 ? 220 : 140 + day * 10,
          };
        }
        // Future days
        return {
          date: day,
          active: false,
          productive: false,
          freeze: false,
          xp: 0,
        };
      }),
    },

    // Weekly stats
    weekly: {
      active: 5,
      total: 7,
      productive: 2,
    },

    // Achievements (simplified)
    achievements: {
      current: [
        { name: "7 Day Streak", achieved: true, date: "Feb 27, 2026" },
        { name: "14 Day Streak", achieved: false, progress: 12, target: 14 },
        { name: "30 Day Streak", achieved: false, progress: 12, target: 30 },
        { name: "Perfect Week", achieved: true, count: 3 },
      ],
      special: [
        { name: "Weekend Warrior", progress: 8, target: 10 },
        { name: "Early Bird", progress: 12, target: 20 },
      ],
    },

    // Motivational quotes
    quotes: [
      {
        text: "Small daily improvements are the key to staggering long-term results.",
        author: "Unknown",
      },
      {
        text: "Consistency is what transforms average into excellence.",
        author: "Unknown",
      },
      {
        text: "Your streak is proof of your dedication. Keep going!",
        author: "Streak Master",
      },
    ],

    // Danger zones
    warnings: {
      atRisk: false,
      message: "You usually miss Thursdays - stay strong today!",
      recommendation: "Schedule 30 minutes this evening",
    },
  };

  // Progress percentage
  const progressPercentage =
    (streakData.current / streakData.nextMilestone.target) * 100;

  // Random quote
  const [dailyQuote] = useState(
    streakData.quotes[Math.floor(Math.random() * streakData.quotes.length)],
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* ===== FIXED BACKGROUND PATTERN - NOW WITH pointer-events-none ===== */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, orange 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ===== MAIN CONTENT WRAPPER - WITH PROPER MARGIN FOR SIDEBAR ===== */}
      <div className="relative z-10 p-4 md:p-6">
        {/* Main Container */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Streak Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {streakData.calendar.month} • Last active{" "}
                {streakData.today.lastActive}
              </p>
            </div>

            {/* Freeze Badge */}
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-xl border border-gray-700">
              <FaShieldAlt className="text-blue-400" />
              <span className="text-white font-medium">
                {streakData.protection.freezes}
              </span>
              <span className="text-xs text-gray-400">freezes</span>
            </div>
          </motion.div>

          {/* ===== SECTION 1: HERO STREAK CARD ===== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden"
            >
              {/* Main Streak Card */}
              <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-orange-600 rounded-3xl p-6 md:p-8 text-white">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -right-10 -top-10 text-[10rem]"
                  >
                    <FaFire />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -left-10 -bottom-10 text-[10rem]"
                  >
                    <FaFire />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Streak Display */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                    {/* Large Streak Number */}
                    <div className="flex items-center gap-3">
                      <div className="text-6xl md:text-8xl font-black">
                        {streakData.current}
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                          Day Streak
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <FaFire className="text-yellow-300" />
                          </motion.div>
                        </div>
                        <p className="text-orange-200 text-sm md:text-base">
                          Started {streakData.startDate}
                        </p>
                        <p className="text-orange-300 text-xs mt-1">
                          Best: {streakData.best} days
                        </p>
                      </div>
                    </div>

                    {/* Next Milestone Quick View */}
                    <div className="md:ml-auto bg-black/20 backdrop-blur-sm rounded-2xl p-4 w-full md:w-auto">
                      <p className="text-xs text-orange-200 mb-1">
                        NEXT MILESTONE
                      </p>
                      <p className="text-xl font-bold">
                        {streakData.nextMilestone.target} Days
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <FaCrown className="text-yellow-300" />
                        <span className="text-orange-100">
                          {streakData.nextMilestone.reward}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 max-w-2xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-orange-100">
                        Progress to 30 days
                      </span>
                      <span className="text-orange-100 font-medium">
                        {streakData.current}/{streakData.nextMilestone.target}
                      </span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-orange-200 mt-2">
                      🎯 {streakData.nextMilestone.daysRemaining} days to go •
                      Est. {streakData.nextMilestone.estimatedDate}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ===== SECTION 2: TODAY'S STATUS (CRITICAL) ===== */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            {streakData.today.completed ? (
              // ✅ User studied today
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                      className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center"
                    >
                      <FaCheckCircle className="text-emerald-400 text-3xl" />
                    </motion.div>

                    <div>
                      <h2 className="text-white font-bold text-lg md:text-xl flex items-center gap-2">
                        Today's Progress
                        <span className="text-xs bg-emerald-500/30 text-emerald-400 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      </h2>

                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400 text-sm" />
                          <span className="text-gray-300 text-sm">
                            {streakData.today.minutes} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaBolt className="text-yellow-400 text-sm" />
                          <span className="text-gray-300 text-sm">
                            {streakData.today.xp} XP
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaStar className="text-purple-400 text-sm" />
                          <span className="text-gray-300 text-sm">
                            {streakData.today.lessons} lessons
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    Continue Learning
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                </div>
              </div>
            ) : (
              // ⚠️ User hasn't studied - Show urgency
              <div className="bg-gradient-to-br from-yellow-600/20 to-red-600/20 rounded-2xl p-6 border border-yellow-500/30 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center"
                    >
                      <FaExclamationTriangle className="text-yellow-400 text-3xl" />
                    </motion.div>

                    <div>
                      <h2 className="text-white font-bold text-lg md:text-xl">
                        Your streak is at risk!
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Study today to keep your {streakData.current} day streak
                        alive
                      </p>
                      <p className="text-yellow-400 text-xs mt-2">
                        💡 {streakData.warnings.recommendation}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(249,115,22,0.4)",
                        "0 0 0 10px rgba(249,115,22,0)",
                        "0 0 0 0 rgba(249,115,22,0.4)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    Start Learning Now
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* ===== SECTION 3: CALENDAR & QUICK STATS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Calendar (Takes 2 columns on desktop) */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="md:col-span-2"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 h-full">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-400" />
                    {streakData.calendar.month}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-gray-400">Active</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-gray-400">Productive</span>
                    </span>
                  </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="text-center text-xs text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for March 2026 (starts on Sunday) */}
                  {[...Array(6)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days */}
                  {streakData.calendar.days.map((day, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer
                        ${
                          day.active
                            ? day.productive
                              ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white"
                              : "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-900/50 text-gray-700"
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{day.date}</span>
                      {day.active && <FaFire className="text-[8px] mt-1" />}
                      {day.productive && (
                        <span className="text-[8px] text-white">⭐</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Weekly Summary */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">This week:</span>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400">
                        {streakData.weekly.active}/{streakData.weekly.total}{" "}
                        days
                      </span>
                      <span className="text-yellow-400">
                        {streakData.weekly.productive} productive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 h-full">
                <h3 className="text-white font-bold mb-4">Quick Stats</h3>

                <div className="space-y-4">
                  {/* Freezes */}
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FaShieldAlt className="text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        Streak Freezes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">
                        {streakData.protection.freezes}
                      </span>
                      <span className="text-gray-500 text-xs">
                        /{streakData.protection.total}
                      </span>
                    </div>
                  </div>

                  {/* XP This Week */}
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FaBolt className="text-yellow-400" />
                      <span className="text-gray-300 text-sm">
                        XP This Week
                      </span>
                    </div>
                    <span className="text-white font-bold">1,450</span>
                  </div>

                  {/* Best Streak */}
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-400" />
                      <span className="text-gray-300 text-sm">Best Streak</span>
                    </div>
                    <span className="text-white font-bold">
                      {streakData.best} days
                    </span>
                  </div>

                  {/* Consistency */}
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FaChartLine className="text-emerald-400" />
                      <span className="text-gray-300 text-sm">Consistency</span>
                    </div>
                    <span className="text-white font-bold">86%</span>
                  </div>
                </div>

                {/* Motivational Mini Quote */}
                <div className="mt-4 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <p className="text-xs text-orange-400 italic">
                    "{dailyQuote.text}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ===== SECTION 4: ACHIEVEMENTS PREVIEW ===== */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <FaAward className="text-yellow-400" />
                  Achievements
                </h3>
                <button
                  onClick={() => setActiveTab("achievements")}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  View all
                  <FaArrowRight className="text-[10px]" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Achievement 1 */}
                <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                  <div className="w-10 h-10 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaFire className="text-emerald-400" />
                  </div>
                  <p className="text-white text-sm font-medium">7 Day Streak</p>
                  <p className="text-xs text-gray-500">Achieved</p>
                </div>

                {/* Achievement 2 */}
                <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                  <div className="w-10 h-10 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaGem className="text-yellow-400" />
                  </div>
                  <p className="text-white text-sm font-medium">
                    14 Day Streak
                  </p>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>

                {/* Achievement 3 */}
                <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                  <div className="w-10 h-10 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaCrown className="text-purple-400" />
                  </div>
                  <p className="text-white text-sm font-medium">
                    30 Day Streak
                  </p>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-2">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: "40%" }}
                    />
                  </div>
                </div>

                {/* Achievement 4 */}
                <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                  <div className="w-10 h-10 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                    <FaMedal className="text-blue-400" />
                  </div>
                  <p className="text-white text-sm font-medium">Perfect Week</p>
                  <p className="text-xs text-emerald-400">x3</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== TABBED CONTENT (Secondary) ===== */}
          <AnimatePresence mode="wait">
            {activeTab !== "main" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                {/* Statistics Tab */}
                {activeTab === "stats" && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-white font-bold text-lg mb-4">
                      Detailed Statistics
                    </h3>

                    <div className="space-y-6">
                      {/* Weekly Pattern */}
                      <div>
                        <p className="text-gray-400 text-sm mb-2">
                          Weekly Activity Pattern
                        </p>
                        <div className="flex items-end h-32 gap-2">
                          {[
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ].map((day, i) => (
                            <div
                              key={day}
                              className="flex-1 flex flex-col items-center gap-2"
                            >
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{
                                  height: [20, 40, 60, 30, 50, 70, 80][i],
                                }}
                                className="w-full bg-emerald-500 rounded-t-lg"
                              />
                              <span className="text-xs text-gray-500">
                                {day}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-400">
                            Avg. Daily Time
                          </p>
                          <p className="text-white font-bold text-lg">24 min</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-400">Best Day</p>
                          <p className="text-white font-bold text-lg">
                            Saturday
                          </p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-400">Total XP</p>
                          <p className="text-white font-bold text-lg">12,450</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-400">
                            Longest Streak
                          </p>
                          <p className="text-white font-bold text-lg">
                            24 days
                          </p>
                        </div>
                      </div>

                      {/* Risk Analysis */}
                      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-red-400 text-sm font-medium mb-2">
                          ⚠ Risk Analysis
                        </p>
                        <p className="text-gray-300 text-sm">
                          {streakData.warnings.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === "achievements" && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-white font-bold text-lg mb-4">
                      All Achievements
                    </h3>

                    <div className="space-y-4">
                      {streakData.achievements.current.map((achievement, i) => (
                        <div key={i} className="p-4 bg-gray-900/50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FaTrophy
                                className={
                                  achievement.achieved
                                    ? "text-yellow-400"
                                    : "text-gray-600"
                                }
                              />
                              <span className="text-white font-medium">
                                {achievement.name}
                              </span>
                            </div>
                            {achievement.achieved ? (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                                Achieved
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                {achievement.progress}/{achievement.target}
                              </span>
                            )}
                          </div>
                          {!achievement.achieved && achievement.progress && (
                            <div className="h-2 bg-gray-800 rounded-full">
                              <div
                                className="h-full bg-yellow-500 rounded-full"
                                style={{
                                  width: `${(achievement.progress / achievement.target) * 100}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== FIXED BOTTOM NAVIGATION - HIDDEN ON DESKTOP, WITH pointer-events-auto ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:hidden z-30 pointer-events-auto"
      >
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-1 border border-gray-700 shadow-2xl">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("main")}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                ${
                  activeTab === "main"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <FaFire />
              <span>Main</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                ${
                  activeTab === "stats"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <FaChartLine />
              <span>Stats</span>
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                ${
                  activeTab === "achievements"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <FaAward />
              <span>Achieve</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StreakDashboard;
