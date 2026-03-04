// components/StudentAnalytics.jsx
import React, { useState } from "react";
import { useDashboard } from "../studentEngagement/DashboardContext";
import {
  FaChartLine,
  FaClock,
  FaBook,
  FaCheckCircle,
  FaCalendarAlt,
  FaBrain,
  FaFire,
  FaArrowUp,
  FaArrowDown,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaTrophy,
  FaStar,
  FaGraduationCap,
} from "react-icons/fa";
import { motion } from "framer-motion";

const StudentAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d
  const { user, courses } = useDashboard();

  // ========== STUDENT ANALYTICS DATA ==========
  const analytics = {
    // Weekly study time
    weeklyStudyTime: [
      { day: "Mon", hours: 2.5, completed: true, color: "bg-emerald-500" },
      { day: "Tue", hours: 1.0, completed: true, color: "bg-emerald-400" },
      { day: "Wed", hours: 3.0, completed: true, color: "bg-emerald-600" },
      { day: "Thu", hours: 0, completed: false, color: "bg-zinc-700" },
      { day: "Fri", hours: 2.0, completed: true, color: "bg-emerald-500" },
      { day: "Sat", hours: 4.0, completed: true, color: "bg-emerald-600" },
      { day: "Sun", hours: 2.5, completed: true, color: "bg-emerald-500" },
    ],

    // Topic mastery (Strong vs Weak)
    topicMastery: [
      {
        topic: "React Hooks",
        mastery: 92,
        status: "strong",
        trend: "+12%",
        icon: "⚛️",
      },
      {
        topic: "JavaScript",
        mastery: 88,
        status: "strong",
        trend: "+8%",
        icon: "📜",
      },
      {
        topic: "Node.js",
        mastery: 75,
        status: "average",
        trend: "+15%",
        icon: "🟢",
      },
      {
        topic: "Database",
        mastery: 68,
        status: "average",
        trend: "+10%",
        icon: "🗄️",
      },
      {
        topic: "System Design",
        mastery: 45,
        status: "weak",
        trend: "+5%",
        icon: "🏗️",
      },
      {
        topic: "TypeScript",
        mastery: 82,
        status: "strong",
        trend: "+20%",
        icon: "🔷",
      },
    ],

    // Learning trends (Week over week)
    learningTrends: [
      { week: "Week 1", hours: 12, accuracy: 75 },
      { week: "Week 2", hours: 15, accuracy: 78 },
      { week: "Week 3", hours: 18, accuracy: 82 },
      { week: "Week 4", hours: 22, accuracy: 86 },
      { week: "Week 5", hours: 20, accuracy: 84 },
      { week: "Week 6", hours: 25, accuracy: 89 },
    ],

    // Best study time analysis
    bestStudyTime: {
      morning: {
        productivity: 75,
        hours: 8,
        icon: <FaSun className="text-yellow-400" />,
      },
      afternoon: {
        productivity: 82,
        hours: 12,
        icon: <FaCloudSun className="text-orange-400" />,
      },
      evening: {
        productivity: 94,
        hours: 15,
        icon: <FaMoon className="text-blue-400" />,
      },
      night: {
        productivity: 68,
        hours: 5,
        icon: <FaMoon className="text-indigo-400" />,
      },
    },

    // Quiz accuracy by topic
    quizAccuracy: [
      { topic: "React", accuracy: 92, attempts: 15 },
      { topic: "JavaScript", accuracy: 88, attempts: 12 },
      { topic: "Node.js", accuracy: 76, attempts: 8 },
      { topic: "Database", accuracy: 65, attempts: 6 },
      { topic: "System Design", accuracy: 45, attempts: 4 },
    ],

    // Daily goals completion
    dailyGoals: [
      { date: "Mon", completed: 3, target: 5 },
      { date: "Tue", completed: 2, target: 5 },
      { date: "Wed", completed: 4, target: 5 },
      { date: "Thu", completed: 0, target: 5 },
      { date: "Fri", completed: 3, target: 5 },
      { date: "Sat", completed: 5, target: 5 },
      { date: "Sun", completed: 4, target: 5 },
    ],

    // Focus score by time
    focusScore: {
      morning: 65,
      afternoon: 75,
      evening: 92,
      night: 70,
    },

    // Summary stats
    summary: {
      totalHours: 128,
      avgDaily: 3.2,
      bestWeek: 25,
      consistency: 86,
      strongTopics: 3,
      weakTopics: 1,
      currentStreak: 12,
      bestStreak: 24,
    },
  };

  // Get mastery color
  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return "text-emerald-400";
    if (mastery >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getMasteryBg = (mastery) => {
    if (mastery >= 80) return "bg-emerald-500/20";
    if (mastery >= 60) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaChartLine className="text-emerald-400" />
              Learning Analytics
            </h1>
            <p className="text-zinc-400 mt-2">
              Understand your learning patterns and improve
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-xl">
            {[
              { value: "7d", label: "Week" },
              { value: "30d", label: "Month" },
              { value: "90d", label: "Quarter" },
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

      {/* Main Analytics Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<FaClock className="text-blue-400" />}
            label="Total Hours"
            value={analytics.summary.totalHours}
            subValue="This month"
            trend="+12%"
          />
          <SummaryCard
            icon={<FaBrain className="text-purple-400" />}
            label="Avg Daily"
            value={`${analytics.summary.avgDaily}h`}
            subValue="Last 30 days"
            trend="+0.5h"
          />
          <SummaryCard
            icon={<FaFire className="text-orange-400" />}
            label="Current Streak"
            value={`${analytics.summary.currentStreak}d`}
            subValue={`Best: ${analytics.summary.bestStreak}d`}
            trend="+2"
          />
          <SummaryCard
            icon={<FaTrophy className="text-yellow-400" />}
            label="Consistency"
            value={`${analytics.summary.consistency}%`}
            subValue="Last 30 days"
            trend="+5%"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Study Time Chart */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaClock className="text-emerald-400" />
                Weekly Study Time
              </h3>
              <span className="text-xs text-zinc-500">Last 7 days</span>
            </div>

            <div className="space-y-4">
              {analytics.weeklyStudyTime.map((day) => (
                <div key={day.day} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{day.day}</span>
                    <span className="text-white font-medium">{day.hours}h</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.hours / 5) * 100}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full ${day.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-sm text-zinc-400">
                Total: <span className="text-white font-bold">15 hours</span>{" "}
                this week
              </p>
            </div>
          </div>

          {/* Topic Mastery - Strong vs Weak */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FaBrain className="text-emerald-400" />
                Topic Mastery
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  ● Strong
                </span>
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  ● Average
                </span>
                <span className="flex items-center gap-1 text-xs text-red-400">
                  ● Weak
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {analytics.topicMastery.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{topic.icon}</span>
                      <span className="text-white text-sm">{topic.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={getMasteryColor(topic.mastery)}>
                        {topic.mastery}%
                      </span>
                      <span className="text-xs text-emerald-400">
                        {topic.trend}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.mastery}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${
                        topic.mastery >= 80
                          ? "bg-emerald-500"
                          : topic.mastery >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement Tips */}
            <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <FaStar /> Focus on{" "}
                <span className="font-bold">System Design</span> to improve
                overall score
              </p>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Trends */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-emerald-400" />
              Learning Trend
            </h3>

            <div className="space-y-3">
              {analytics.learningTrends.slice(-4).map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{week.week}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">{week.hours}h</span>
                    <span
                      className={`text-xs ${
                        week.accuracy > 85
                          ? "text-emerald-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {week.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <FaArrowUp /> +15% improvement from last month
              </p>
            </div>
          </div>

          {/* Best Study Time */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-400" />
              Best Study Time
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <FaMoon className="text-blue-400 text-xl" />
                  <div>
                    <p className="text-white font-medium">
                      Evening (6 PM - 10 PM)
                    </p>
                    <p className="text-xs text-zinc-400">
                      94% productivity • 15 hours this month
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(analytics.bestStudyTime).map(([time, data]) => (
                  <div key={time} className="flex items-center gap-2">
                    {data.icon}
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 capitalize">{time}</span>
                        <span className="text-white">{data.productivity}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${data.productivity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz Accuracy */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-400" />
              Quiz Accuracy
            </h3>

            <div className="space-y-4">
              {analytics.quizAccuracy.map((quiz) => (
                <div key={quiz.topic} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{quiz.topic}</span>
                    <span className="text-white font-medium">
                      {quiz.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        quiz.accuracy >= 80
                          ? "bg-emerald-500"
                          : quiz.accuracy >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${quiz.accuracy}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600">
                    {quiz.attempts} attempts
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <FaBrain className="text-emerald-400" />
            Learning Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              icon="🚀"
              title="Peak Performance"
              description="You learn best in evenings with 94% focus"
            />
            <InsightCard
              icon="📈"
              title="Improving Trend"
              description="15% increase in study time this month"
            />
            <InsightCard
              icon="🎯"
              title="Focus Area"
              description="System Design needs 5 more hours"
            />
          </div>

          <div className="mt-4 p-4 bg-black/30 rounded-xl">
            <p className="text-sm text-zinc-300">
              💡 <span className="text-emerald-400 font-medium">Tip:</span>{" "}
              Based on your pattern, schedule difficult topics like System
              Design during your peak hours (evening) for better retention.
            </p>
          </div>
        </div>

        {/* Daily Goals Completion Chart */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-400" />
              Daily Goals Completion
            </h3>
            <span className="text-xs text-zinc-500">Target: 5 lessons/day</span>
          </div>

          <div className="flex items-end justify-between h-40 gap-2">
            {analytics.dailyGoals.map((day) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="relative w-full flex justify-center">
                  {/* Completed bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.completed / 5) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-0 w-8 bg-emerald-500 rounded-t-lg"
                    style={{ maxHeight: "100px" }}
                  />
                  {/* Target indicator */}
                  <div
                    className="absolute bottom-0 w-8 border-t-2 border-dashed border-yellow-500"
                    style={{ bottom: "100px" }}
                  />
                </div>
                <span className="text-xs text-zinc-500 mt-2">{day.date}</span>
                <div className="flex gap-1 text-xs">
                  <span className="text-emerald-400">{day.completed}</span>
                  <span className="text-zinc-600">/5</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-zinc-400">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                Completed
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <div className="w-3 h-3 border-2 border-dashed border-yellow-500 rounded" />
                Target
              </span>
            </div>
            <span className="text-zinc-400">
              Completion Rate:{" "}
              <span className="text-emerald-400 font-bold">68%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SummaryCard = ({ icon, label, value, subValue, trend }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-zinc-500 text-xs mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-600 mt-1">{subValue}</p>
      </div>
      <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
    </div>
    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
      <FaArrowUp /> {trend}
    </div>
  </div>
);

const InsightCard = ({ icon, title, description }) => (
  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
    <div className="text-2xl mb-2">{icon}</div>
    <h4 className="text-white font-medium text-sm mb-1">{title}</h4>
    <p className="text-xs text-zinc-400">{description}</p>
  </div>
);

export default StudentAnalytics;
