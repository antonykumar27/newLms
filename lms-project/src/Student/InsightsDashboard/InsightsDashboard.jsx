// components/InsightsDashboard.jsx
import React, { useState } from "react";

import {
  FaChartLine,
  FaBrain,
  FaClock,
  FaBook,
  FaFire,
  FaStar,
  FaTrophy,
  FaMedal,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaBolt,
  FaRocket,
  FaGem,
  FaCrown,
  FaAward,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaEye,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const InsightsDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d"); // 7d, 30d, 90d, 1y
  const [insightType, setInsightType] = useState("overview"); // overview, performance, patterns, predictions
  const [selectedMetric, setSelectedMetric] = useState(null);

  // ========== MASTER INSIGHTS DATA ==========
  const insightsData = {
    // Overview Stats
    overview: {
      totalStudyTime: 284, // hours
      avgDailyTime: 3.2,
      totalLessons: 324,
      totalQuizzes: 248,
      avgAccuracy: 84,
      totalXP: 8450,
      currentStreak: 12,
      bestStreak: 24,
      consistencyScore: 86,
      focusScore: 78,
    },

    // Performance Metrics
    performance: {
      weekly: [
        { week: "Week 1", studyTime: 18, accuracy: 75, quizzes: 12, xp: 450 },
        { week: "Week 2", studyTime: 22, accuracy: 78, quizzes: 15, xp: 520 },
        { week: "Week 3", studyTime: 25, accuracy: 82, quizzes: 18, xp: 680 },
        { week: "Week 4", studyTime: 28, accuracy: 85, quizzes: 20, xp: 750 },
        { week: "Week 5", studyTime: 24, accuracy: 84, quizzes: 17, xp: 620 },
        { week: "Week 6", studyTime: 30, accuracy: 88, quizzes: 22, xp: 890 },
      ],

      monthly: [
        { month: "Jan", studyTime: 95, accuracy: 72, quizzes: 45, xp: 1850 },
        { month: "Feb", studyTime: 110, accuracy: 78, quizzes: 52, xp: 2100 },
        { month: "Mar", studyTime: 125, accuracy: 84, quizzes: 60, xp: 2450 },
      ],

      topics: [
        {
          name: "React",
          accuracy: 92,
          timeSpent: 85,
          quizzes: 42,
          level: "expert",
        },
        {
          name: "JavaScript",
          accuracy: 88,
          timeSpent: 92,
          quizzes: 38,
          level: "advanced",
        },
        {
          name: "Node.js",
          accuracy: 75,
          timeSpent: 68,
          quizzes: 28,
          level: "intermediate",
        },
        {
          name: "TypeScript",
          accuracy: 82,
          timeSpent: 45,
          quizzes: 24,
          level: "advanced",
        },
        {
          name: "System Design",
          accuracy: 45,
          timeSpent: 32,
          quizzes: 12,
          level: "beginner",
        },
        {
          name: "Database",
          accuracy: 68,
          timeSpent: 38,
          quizzes: 18,
          level: "intermediate",
        },
      ],
    },

    // Learning Patterns
    patterns: {
      bestTimeOfDay: {
        morning: { productivity: 75, hours: 45, label: "6AM - 12PM" },
        afternoon: { productivity: 82, hours: 68, label: "12PM - 6PM" },
        evening: { productivity: 94, hours: 124, label: "6PM - 10PM" },
        night: { productivity: 68, hours: 47, label: "10PM - 6AM" },
      },

      bestDayOfWeek: {
        Monday: { productivity: 85, hours: 38 },
        Tuesday: { productivity: 82, hours: 35 },
        Wednesday: { productivity: 88, hours: 42 },
        Thursday: { productivity: 79, hours: 32 },
        Friday: { productivity: 75, hours: 28 },
        Saturday: { productivity: 95, hours: 58 },
        Sunday: { productivity: 92, hours: 51 },
      },

      consistencyPatterns: {
        daily: [true, true, true, false, true, true, true, true, false, true],
        weekly: [5, 6, 4, 7, 5, 6, 7], // days per week
        monthly: [22, 24, 26, 23, 25], // days per month
      },

      studySessions: {
        avgDuration: 45, // minutes
        preferredLength: "30-60 min",
        breaks: "Every 2 sessions",
        peakFocus: "Evening sessions",
      },
    },

    // Predictions & Recommendations
    predictions: {
      nextMilestone: {
        type: "level",
        target: 15,
        current: 12,
        estimated: "April 15, 2026",
        xpNeeded: 550,
        confidence: 85,
      },

      weeklyProjection: {
        nextWeek: { lessons: 28, quizzes: 22, xp: 950 },
        nextMonth: { lessons: 110, quizzes: 85, xp: 3800 },
        nextQuarter: { lessons: 320, quizzes: 250, xp: 11000 },
      },

      recommendations: [
        {
          type: "focus",
          title: "Focus on System Design",
          description: "Your weakest topic. 20 hours recommended.",
          impact: "+35% mastery",
          priority: "high",
          deadline: "2 weeks",
        },
        {
          type: "schedule",
          title: "Optimize Study Time",
          description: "You perform best in evenings (94% focus)",
          impact: "+15% efficiency",
          priority: "medium",
        },
        {
          type: "quiz",
          title: "Practice JavaScript Quizzes",
          description: "Close to next mastery level",
          impact: "+200 XP",
          priority: "medium",
        },
        {
          type: "streak",
          title: "Maintain Current Streak",
          description: "12 days away from personal best",
          impact: "🔥 Rare badge",
          priority: "high",
        },
      ],

      riskAreas: [
        {
          topic: "System Design",
          risk: "Falling behind",
          daysSincePractice: 7,
          recommendedAction: "Start today",
        },
        {
          topic: "Database Indexing",
          risk: "Low accuracy (52%)",
          daysSincePractice: 4,
          recommendedAction: "Practice quiz",
        },
      ],
    },

    // Comparative Analytics
    comparison: {
      vsPeers: {
        overall: "Top 15%",
        accuracy: "Top 10%",
        streak: "Top 25%",
        consistency: "Top 20%",
      },

      vsPrevious: {
        studyTime: "+12%",
        accuracy: "+5%",
        quizzes: "+8%",
        xp: "+15%",
      },

      benchmarks: {
        averageXP: 3250,
        yourXP: 8450,
        averageStreak: 8,
        yourStreak: 12,
        averageAccuracy: 72,
        yourAccuracy: 84,
      },
    },

    // Advanced Analytics
    advanced: {
      learningVelocity: 18.5, // XP per day
      retentionRate: 86, // percentage
      masteryGrowth: [
        { month: "Jan", mastery: 65 },
        { month: "Feb", mastery: 72 },
        { month: "Mar", mastery: 78 },
      ],

      topicRelationships: {
        "React ↔ JavaScript": 0.92,
        "Node.js ↔ Database": 0.78,
        "TypeScript ↔ React": 0.85,
      },

      optimalSchedule: {
        Monday: { time: "7-9 PM", topic: "React" },
        Tuesday: { time: "7-9 PM", topic: "Node.js" },
        Wednesday: { time: "7-9 PM", topic: "System Design" },
        Thursday: { time: "7-9 PM", topic: "JavaScript" },
        Friday: { time: "7-9 PM", topic: "Review" },
        Saturday: { time: "10-12 AM", topic: "Projects" },
        Sunday: { time: "4-6 PM", topic: "Practice" },
      },
    },
  };

  // Calculate trends
  const getTrend = (current, previous) => {
    if (current > previous)
      return {
        icon: FaArrowUp,
        color: "text-emerald-400",
        value: `+${(((current - previous) / previous) * 100).toFixed(0)}%`,
      };
    if (current < previous)
      return {
        icon: FaArrowDown,
        color: "text-red-400",
        value: `-${(((previous - current) / previous) * 100).toFixed(0)}%`,
      };
    return { icon: FaMinus, color: "text-zinc-400", value: "0%" };
  };

  // Get performance color
  const getPerformanceColor = (value) => {
    if (value >= 90) return "text-emerald-400";
    if (value >= 75) return "text-yellow-400";
    if (value >= 60) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaBrain className="text-emerald-400" />
              Learning Insights
            </h1>
            <p className="text-zinc-400 mt-2">
              AI-powered analytics to optimize your learning journey
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-xl">
            {[
              { value: "7d", label: "Week" },
              { value: "30d", label: "Month" },
              { value: "90d", label: "Quarter" },
              { value: "1y", label: "Year" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range.value
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <OverviewCard
            icon={<FaClock className="text-blue-400" />}
            label="Study Time"
            value={`${insightsData.overview.totalStudyTime}h`}
            trend={getTrend(insightsData.overview.totalStudyTime, 250)}
          />
          <OverviewCard
            icon={<FaBrain className="text-purple-400" />}
            label="Avg Daily"
            value={`${insightsData.overview.avgDailyTime}h`}
            trend={getTrend(insightsData.overview.avgDailyTime, 2.8)}
          />
          <OverviewCard
            icon={<FaBook className="text-emerald-400" />}
            label="Lessons"
            value={insightsData.overview.totalLessons}
            trend={getTrend(insightsData.overview.totalLessons, 290)}
          />
          <OverviewCard
            icon={<FaStar className="text-yellow-400" />}
            label="Accuracy"
            value={`${insightsData.overview.avgAccuracy}%`}
            trend={getTrend(insightsData.overview.avgAccuracy, 78)}
          />
          <OverviewCard
            icon={<FaFire className="text-orange-400" />}
            label="Streak"
            value={`${insightsData.overview.currentStreak}d`}
            trend={getTrend(insightsData.overview.currentStreak, 8)}
          />
          <OverviewCard
            icon={<FaTrophy className="text-yellow-400" />}
            label="Total XP"
            value={insightsData.overview.totalXP}
            trend={getTrend(insightsData.overview.totalXP, 7200)}
          />
          <OverviewCard
            icon={<FaGem className="text-purple-400" />}
            label="Consistency"
            value={`${insightsData.overview.consistencyScore}%`}
            trend={getTrend(insightsData.overview.consistencyScore, 80)}
          />
          <OverviewCard
            icon={<FaBolt className="text-blue-400" />}
            label="Focus Score"
            value={`${insightsData.overview.focusScore}%`}
            trend={getTrend(insightsData.overview.focusScore, 72)}
          />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {[
            { id: "overview", label: "Overview", icon: FaChartLine },
            { id: "performance", label: "Performance", icon: FaStar },
            { id: "patterns", label: "Patterns", icon: FaBrain },
            { id: "predictions", label: "Predictions", icon: FaRocket },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setInsightType(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  insightType === tab.id
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {insightType === "overview" && (
          <div className="space-y-6">
            {/* Performance Trend Chart */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-6">Performance Trend</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {insightsData.performance.weekly.map((week, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${week.studyTime * 2}px` }}
                      className="w-full bg-emerald-500 rounded-t-lg relative group"
                      style={{ maxHeight: "120px" }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {week.studyTime}h • {week.accuracy}%
                      </div>
                    </motion.div>
                    <span className="text-xs text-zinc-500">W{i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Best Week</p>
                  <p className="text-lg font-bold text-white">Week 6</p>
                  <p className="text-xs text-emerald-400">30 hours • 88%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Average</p>
                  <p className="text-lg font-bold text-white">24.5 hours</p>
                  <p className="text-xs text-emerald-400">+12% growth</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Projection</p>
                  <p className="text-lg font-bold text-white">32 hours</p>
                  <p className="text-xs text-emerald-400">Next week</p>
                </div>
              </div>
            </div>

            {/* Topic Mastery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insightsData.performance.topics.map((topic) => (
                <motion.div
                  key={topic.name}
                  whileHover={{ y: -5 }}
                  className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">{topic.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        {topic.quizzes} quizzes
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        topic.level === "expert"
                          ? "bg-purple-500/20 text-purple-400"
                          : topic.level === "advanced"
                            ? "bg-blue-500/20 text-blue-400"
                            : topic.level === "intermediate"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {topic.level}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Accuracy</span>
                      <span className={getPerformanceColor(topic.accuracy)}>
                        {topic.accuracy}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          topic.accuracy >= 90
                            ? "bg-emerald-500"
                            : topic.accuracy >= 75
                              ? "bg-yellow-500"
                              : topic.accuracy >= 60
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-zinc-400">Time Spent</span>
                      <span className="text-white">{topic.timeSpent}h</span>
                    </div>
                  </div>

                  {topic.accuracy < 70 && (
                    <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <FaExclamationTriangle /> Needs practice
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
                <h4 className="text-sm font-medium text-emerald-400 mb-4">
                  vs. Peers
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Overall</span>
                    <span className="text-white font-bold">
                      {insightsData.comparison.vsPeers.overall}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Accuracy</span>
                    <span className="text-white font-bold">
                      {insightsData.comparison.vsPeers.accuracy}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Streak</span>
                    <span className="text-white font-bold">
                      {insightsData.comparison.vsPeers.streak}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-6 border border-blue-500/30">
                <h4 className="text-sm font-medium text-blue-400 mb-4">
                  vs. Last Month
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Study Time</span>
                    <span className="text-emerald-400 font-bold">
                      {insightsData.comparison.vsPrevious.studyTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Accuracy</span>
                    <span className="text-emerald-400 font-bold">
                      {insightsData.comparison.vsPrevious.accuracy}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">XP Gain</span>
                    <span className="text-emerald-400 font-bold">
                      {insightsData.comparison.vsPrevious.xp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30">
                <h4 className="text-sm font-medium text-purple-400 mb-4">
                  Benchmarks
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Your XP</span>
                    <span className="text-white font-bold">
                      {insightsData.comparison.benchmarks.yourXP}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Average</span>
                    <span className="text-zinc-400">
                      {insightsData.comparison.benchmarks.averageXP}
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full mt-1">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${(insightsData.comparison.benchmarks.yourXP / 10000) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {insightType === "performance" && (
          <div className="space-y-6">
            {/* Detailed Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accuracy Trend */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">Accuracy Trend</h3>
                <div className="space-y-4">
                  {insightsData.performance.weekly.map((week, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Week {i + 1}</span>
                        <span className="text-white">{week.accuracy}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${week.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <FaArrowUp /> +13% improvement over 6 weeks
                  </p>
                </div>
              </div>

              {/* XP Breakdown */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">XP Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Lessons</span>
                      <span className="text-blue-400">3,240 XP (38%)</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "38%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Quizzes</span>
                      <span className="text-purple-400">2,960 XP (35%)</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: "35%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Achievements</span>
                      <span className="text-yellow-400">2,250 XP (27%)</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: "27%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-zinc-500">Best Day</p>
                    <p className="text-sm text-white font-bold">450 XP</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Average</p>
                    <p className="text-sm text-white font-bold">95 XP/day</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Projected</p>
                    <p className="text-sm text-emerald-400 font-bold">
                      120 XP/day
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Velocity */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
              <h3 className="font-bold text-white mb-4">Learning Velocity</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-zinc-400">Current Speed</p>
                  <p className="text-2xl font-bold text-white">
                    {insightsData.advanced.learningVelocity} XP/day
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Retention Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {insightsData.advanced.retentionRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Time to Level 15</p>
                  <p className="text-2xl font-bold text-yellow-400">24 days</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Mastery Growth</p>
                  <p className="text-2xl font-bold text-purple-400">+13%</p>
                </div>
              </div>
            </div>

            {/* Topic Relationships */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">Topic Relationships</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(insightsData.advanced.topicRelationships).map(
                  ([relation, strength]) => (
                    <div
                      key={relation}
                      className="bg-zinc-800/30 rounded-xl p-4"
                    >
                      <p className="text-white text-sm mb-2">{relation}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${strength * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-emerald-400">
                          {(strength * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">
                        Strong correlation
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {insightType === "patterns" && (
          <div className="space-y-6">
            {/* Best Time Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time of Day */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">Best Time of Day</h3>
                <div className="space-y-4">
                  {Object.entries(insightsData.patterns.bestTimeOfDay).map(
                    ([time, data]) => (
                      <div key={time} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {time === "morning" && (
                              <FaSun className="text-yellow-400" />
                            )}
                            {time === "afternoon" && (
                              <FaCloudSun className="text-orange-400" />
                            )}
                            {time === "evening" && (
                              <FaMoon className="text-blue-400" />
                            )}
                            {time === "night" && (
                              <FaMoon className="text-indigo-400" />
                            )}
                            <span className="text-white capitalize">
                              {time}
                            </span>
                          </div>
                          <span className="text-sm text-zinc-400">
                            {data.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                data.productivity >= 90
                                  ? "bg-emerald-500"
                                  : data.productivity >= 80
                                    ? "bg-blue-500"
                                    : data.productivity >= 70
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                              }`}
                              style={{ width: `${data.productivity}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-white">
                            {data.productivity}%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {data.hours} hours total
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <FaBolt /> Peak productivity: Evenings (94%)
                  </p>
                </div>
              </div>

              {/* Best Day of Week */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">Best Day of Week</h3>
                <div className="space-y-3">
                  {Object.entries(insightsData.patterns.bestDayOfWeek).map(
                    ([day, data]) => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="w-20 text-sm text-zinc-400">
                          {day}
                        </span>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${data.productivity}%` }}
                          />
                        </div>
                        <span className="text-sm text-white w-12">
                          {data.productivity}%
                        </span>
                        <span className="text-xs text-zinc-500">
                          {data.hours}h
                        </span>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-zinc-800/30 rounded-lg p-3">
                    <p className="text-xs text-zinc-400">Most Consistent</p>
                    <p className="text-white font-bold">Wednesday</p>
                  </div>
                  <div className="bg-zinc-800/30 rounded-lg p-3">
                    <p className="text-xs text-zinc-400">Most Productive</p>
                    <p className="text-white font-bold">Saturday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Session Patterns */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">
                Study Session Patterns
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {insightsData.patterns.studySessions.avgDuration}
                  </p>
                  <p className="text-xs text-zinc-500">Avg Duration (min)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-400">
                    {insightsData.patterns.studySessions.preferredLength}
                  </p>
                  <p className="text-xs text-zinc-500">Preferred Length</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">
                    {insightsData.patterns.studySessions.breaks}
                  </p>
                  <p className="text-xs text-zinc-500">Break Pattern</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">
                    {insightsData.patterns.studySessions.peakFocus}
                  </p>
                  <p className="text-xs text-zinc-500">Peak Focus</p>
                </div>
              </div>

              {/* Consistency Pattern */}
              <div className="space-y-2">
                <p className="text-sm text-zinc-400 mb-2">
                  Daily Consistency (Last 10 days)
                </p>
                <div className="flex gap-1">
                  {insightsData.patterns.consistencyPatterns.daily.map(
                    (active, i) => (
                      <div key={i} className="flex-1">
                        <div
                          className={`h-8 rounded-lg ${active ? "bg-emerald-500" : "bg-zinc-800"}`}
                        />
                        <p className="text-xs text-center text-zinc-600 mt-1">
                          D{i + 1}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Heatmap */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">
                Weekly Activity Heatmap
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs text-zinc-500 py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
                {[...Array(35)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      Math.random() > 0.3
                        ? "bg-emerald-500"
                        : Math.random() > 0.6
                          ? "bg-emerald-700"
                          : Math.random() > 0.8
                            ? "bg-emerald-900"
                            : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {insightType === "predictions" && (
          <div className="space-y-6">
            {/* Next Milestone */}
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="font-bold text-white mb-4">
                Next Milestone Prediction
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Target</p>
                  <p className="text-3xl font-bold text-white">
                    Level {insightsData.predictions.nextMilestone.target}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Current: Level{" "}
                    {insightsData.predictions.nextMilestone.current}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Estimated Date</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {insightsData.predictions.nextMilestone.estimated}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Confidence:{" "}
                    {insightsData.predictions.nextMilestone.confidence}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 mb-1">XP Needed</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {insightsData.predictions.nextMilestone.xpNeeded} XP
                  </p>
                  <div className="h-2 bg-zinc-800 rounded-full mt-2">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${(insightsData.overview.totalXP / (insightsData.overview.totalXP + insightsData.predictions.nextMilestone.xpNeeded)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FaBrain className="text-emerald-400" />
                AI-Powered Recommendations
              </h3>

              <div className="space-y-4">
                {insightsData.predictions.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      rec.priority === "high"
                        ? "bg-red-500/10 border-red-500/30"
                        : rec.priority === "medium"
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "bg-blue-500/10 border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {rec.type === "focus" && (
                            <FaExclamationTriangle
                              className={
                                rec.priority === "high"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }
                            />
                          )}
                          {rec.type === "schedule" && (
                            <FaClock className="text-blue-400" />
                          )}
                          {rec.type === "quiz" && (
                            <FaStar className="text-purple-400" />
                          )}
                          {rec.type === "streak" && (
                            <FaFire className="text-orange-400" />
                          )}
                          <h4 className="text-white font-medium">
                            {rec.title}
                          </h4>
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">
                          {rec.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-emerald-400">{rec.impact}</span>
                          {rec.deadline && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-500">
                                Due: {rec.deadline}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors">
                        Apply
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risk Areas */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-400" />
                Risk Areas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsData.predictions.riskAreas.map((risk, i) => (
                  <div
                    key={i}
                    className="bg-red-500/10 rounded-xl p-4 border border-red-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <FaTimesCircle className="text-red-400 mt-1" />
                      <div>
                        <h4 className="text-white font-medium">{risk.topic}</h4>
                        <p className="text-sm text-red-400 mb-2">{risk.risk}</p>
                        <p className="text-xs text-zinc-500 mb-2">
                          {risk.daysSincePractice} days since last practice
                        </p>
                        <button className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-full transition-colors">
                          {risk.recommendedAction}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProjectionCard
                title="Next Week"
                lessons={
                  insightsData.predictions.weeklyProjection.nextWeek.lessons
                }
                quizzes={
                  insightsData.predictions.weeklyProjection.nextWeek.quizzes
                }
                xp={insightsData.predictions.weeklyProjection.nextWeek.xp}
                color="blue"
              />
              <ProjectionCard
                title="Next Month"
                lessons={
                  insightsData.predictions.weeklyProjection.nextMonth.lessons
                }
                quizzes={
                  insightsData.predictions.weeklyProjection.nextMonth.quizzes
                }
                xp={insightsData.predictions.weeklyProjection.nextMonth.xp}
                color="purple"
              />
              <ProjectionCard
                title="Next Quarter"
                lessons={
                  insightsData.predictions.weeklyProjection.nextQuarter.lessons
                }
                quizzes={
                  insightsData.predictions.weeklyProjection.nextQuarter.quizzes
                }
                xp={insightsData.predictions.weeklyProjection.nextQuarter.xp}
                color="emerald"
              />
            </div>

            {/* Optimal Schedule */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">
                Your Optimal Study Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {Object.entries(insightsData.advanced.optimalSchedule).map(
                  ([day, data]) => (
                    <div
                      key={day}
                      className="bg-zinc-800/30 rounded-lg p-3 text-center"
                    >
                      <p className="text-xs text-zinc-500 mb-1">
                        {day.slice(0, 3)}
                      </p>
                      <p className="text-sm text-white font-medium">
                        {data.time}
                      </p>
                      <p className="text-xs text-emerald-400 mt-1">
                        {data.topic}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export & Share Footer */}
      <div className="max-w-7xl mx-auto mt-8 flex justify-end gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors">
          <FaDownload /> Export Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors">
          <FaShare /> Share Insights
        </button>
      </div>
    </div>
  );
};

// Overview Card Component
const OverviewCard = ({ icon, label, value, trend }) => {
  const TrendIcon = trend.icon;
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-3 border border-zinc-800">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <div className={`flex items-center gap-1 text-xs ${trend.color} mt-1`}>
        <TrendIcon className="text-xs" />
        <span>{trend.value}</span>
      </div>
    </div>
  );
};

// Projection Card Component
const ProjectionCard = ({ title, lessons, quizzes, xp, color }) => (
  <div
    className={`bg-${color}-500/10 rounded-xl p-4 border border-${color}-500/30`}
  >
    <h4 className="text-sm font-medium text-white mb-3">{title}</h4>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Lessons</span>
        <span className="text-white font-bold">{lessons}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Quizzes</span>
        <span className="text-white font-bold">{quizzes}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">XP</span>
        <span className={`text-${color}-400 font-bold`}>{xp}</span>
      </div>
    </div>
  </div>
);

export default InsightsDashboard;
