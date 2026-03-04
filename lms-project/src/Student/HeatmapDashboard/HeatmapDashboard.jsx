// components/HeatmapDashboard.jsx
import React, { useState } from "react";

import {
  FaCalendarAlt,
  FaFire,
  FaChartLine,
  FaClock,
  FaBook,
  FaStar,
  FaTrophy,
  FaBrain,
  FaFilter,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const HeatmapDashboard = () => {
  const [viewMode, setViewMode] = useState("year"); // year, month, week
  const [metricType, setMetricType] = useState("activity"); // activity, hours, xp, lessons
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // ========== COMPLETE HEATMAP DATA ==========
  const heatmapData = {
    // Summary stats
    summary: {
      totalActiveDays: 284,
      totalInactiveDays: 81,
      currentStreak: 12,
      bestStreak: 24,
      totalHours: 328,
      averageDaily: 3.2,
      bestDay: "2026-03-01",
      worstDay: "2026-02-15",
      consistency: 78,
      peakMonth: "February",
    },

    // Yearly data (2026)
    yearly: {
      2026: {
        total: 284,
        byMonth: [
          {
            month: "Jan",
            days: 24,
            hours: 78,
            xp: 1850,
            lessons: 42,
            quizzes: 28,
          },
          {
            month: "Feb",
            days: 26,
            hours: 92,
            xp: 2100,
            lessons: 48,
            quizzes: 32,
          },
          {
            month: "Mar",
            days: 22,
            hours: 85,
            xp: 1950,
            lessons: 44,
            quizzes: 30,
          },
          { month: "Apr", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "May", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Jun", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Jul", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Aug", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Sep", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Oct", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Nov", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
          { month: "Dec", days: 0, hours: 0, xp: 0, lessons: 0, quizzes: 0 },
        ],
      },
    },

    // Monthly data (March 2026)
    monthly: {
      month: "March 2026",
      days: 31,
      activeDays: 22,
      totalHours: 85,
      averageDaily: 3.8,
      bestWeek: "Week 1",

      weeks: [
        {
          week: 1,
          days: [
            {
              date: "2026-03-01",
              day: 1,
              active: true,
              hours: 4.5,
              lessons: 5,
              quizzes: 3,
              xp: 220,
              topic: "React",
              intensity: 5,
            },
            {
              date: "2026-03-02",
              day: 2,
              active: true,
              hours: 3.0,
              lessons: 4,
              quizzes: 2,
              xp: 180,
              topic: "Node.js",
              intensity: 4,
            },
            {
              date: "2026-03-03",
              day: 3,
              active: true,
              hours: 3.5,
              lessons: 4,
              quizzes: 3,
              xp: 190,
              topic: "TypeScript",
              intensity: 4,
            },
            {
              date: "2026-03-04",
              day: 4,
              active: true,
              hours: 4.0,
              lessons: 5,
              quizzes: 4,
              xp: 210,
              topic: "React",
              intensity: 5,
            },
            {
              date: "2026-03-05",
              day: 5,
              active: true,
              hours: 2.5,
              lessons: 3,
              quizzes: 2,
              xp: 140,
              topic: "JavaScript",
              intensity: 3,
            },
            {
              date: "2026-03-06",
              day: 6,
              active: true,
              hours: 5.0,
              lessons: 6,
              quizzes: 4,
              xp: 250,
              topic: "System Design",
              intensity: 5,
            },
            {
              date: "2026-03-07",
              day: 7,
              active: true,
              hours: 4.5,
              lessons: 5,
              quizzes: 3,
              xp: 230,
              topic: "Node.js",
              intensity: 5,
            },
          ],
        },
        {
          week: 2,
          days: [
            {
              date: "2026-03-08",
              day: 8,
              active: true,
              hours: 3.0,
              lessons: 4,
              quizzes: 2,
              xp: 160,
              topic: "React",
              intensity: 3,
            },
            {
              date: "2026-03-09",
              day: 9,
              active: true,
              hours: 4.0,
              lessons: 5,
              quizzes: 3,
              xp: 200,
              topic: "TypeScript",
              intensity: 4,
            },
            {
              date: "2026-03-10",
              day: 10,
              active: true,
              hours: 3.5,
              lessons: 4,
              quizzes: 3,
              xp: 185,
              topic: "JavaScript",
              intensity: 4,
            },
            {
              date: "2026-03-11",
              day: 11,
              active: false,
              hours: 0,
              lessons: 0,
              quizzes: 0,
              xp: 0,
              topic: null,
              intensity: 0,
            },
            {
              date: "2026-03-12",
              day: 12,
              active: true,
              hours: 4.5,
              lessons: 5,
              quizzes: 4,
              xp: 225,
              topic: "System Design",
              intensity: 5,
            },
            {
              date: "2026-03-13",
              day: 13,
              active: true,
              hours: 3.0,
              lessons: 4,
              quizzes: 2,
              xp: 170,
              topic: "Node.js",
              intensity: 3,
            },
            {
              date: "2026-03-14",
              day: 14,
              active: true,
              hours: 5.0,
              lessons: 6,
              quizzes: 5,
              xp: 260,
              topic: "React",
              intensity: 5,
            },
          ],
        },
        {
          week: 3,
          days: [
            {
              date: "2026-03-15",
              day: 15,
              active: true,
              hours: 4.0,
              lessons: 5,
              quizzes: 3,
              xp: 210,
              topic: "TypeScript",
              intensity: 4,
            },
            {
              date: "2026-03-16",
              day: 16,
              active: true,
              hours: 3.5,
              lessons: 4,
              quizzes: 3,
              xp: 190,
              topic: "JavaScript",
              intensity: 4,
            },
            {
              date: "2026-03-17",
              day: 17,
              active: true,
              hours: 4.5,
              lessons: 5,
              quizzes: 4,
              xp: 235,
              topic: "System Design",
              intensity: 5,
            },
            {
              date: "2026-03-18",
              day: 18,
              active: false,
              hours: 0,
              lessons: 0,
              quizzes: 0,
              xp: 0,
              topic: null,
              intensity: 0,
            },
            {
              date: "2026-03-19",
              day: 19,
              active: true,
              hours: 3.0,
              lessons: 4,
              quizzes: 2,
              xp: 165,
              topic: "Node.js",
              intensity: 3,
            },
            {
              date: "2026-03-20",
              day: 20,
              active: true,
              hours: 5.0,
              lessons: 6,
              quizzes: 5,
              xp: 270,
              topic: "React",
              intensity: 5,
            },
            {
              date: "2026-03-21",
              day: 21,
              active: true,
              hours: 4.0,
              lessons: 5,
              quizzes: 3,
              xp: 215,
              topic: "TypeScript",
              intensity: 4,
            },
          ],
        },
        {
          week: 4,
          days: [
            {
              date: "2026-03-22",
              day: 22,
              active: true,
              hours: 3.5,
              lessons: 4,
              quizzes: 3,
              xp: 195,
              topic: "JavaScript",
              intensity: 4,
            },
            {
              date: "2026-03-23",
              day: 23,
              active: true,
              hours: 4.5,
              lessons: 5,
              quizzes: 4,
              xp: 240,
              topic: "System Design",
              intensity: 5,
            },
            {
              date: "2026-03-24",
              day: 24,
              active: true,
              hours: 3.0,
              lessons: 4,
              quizzes: 2,
              xp: 175,
              topic: "Node.js",
              intensity: 3,
            },
            {
              date: "2026-03-25",
              day: 25,
              active: false,
              hours: 0,
              lessons: 0,
              quizzes: 0,
              xp: 0,
              topic: null,
              intensity: 0,
            },
            {
              date: "2026-03-26",
              day: 26,
              active: true,
              hours: 5.0,
              lessons: 6,
              quizzes: 5,
              xp: 280,
              topic: "React",
              intensity: 5,
            },
            {
              date: "2026-03-27",
              day: 27,
              active: true,
              hours: 4.0,
              lessons: 5,
              quizzes: 3,
              xp: 220,
              topic: "TypeScript",
              intensity: 4,
            },
            {
              date: "2026-03-28",
              day: 28,
              active: true,
              hours: 3.5,
              lessons: 4,
              quizzes: 3,
              xp: 200,
              topic: "JavaScript",
              intensity: 4,
            },
          ],
        },
        {
          week: 5,
          days: [
            {
              date: "2026-03-29",
              day: 29,
              active: true,
              hours: 4.5,
              lessons: 5,
              quizzes: 4,
              xp: 245,
              topic: "System Design",
              intensity: 5,
            },
            {
              date: "2026-03-30",
              day: 30,
              active: true,
              hours: 3.0,
              lessons: 4,
              quizzes: 2,
              xp: 180,
              topic: "Node.js",
              intensity: 3,
            },
            {
              date: "2026-03-31",
              day: 31,
              active: true,
              hours: 5.0,
              lessons: 6,
              quizzes: 5,
              xp: 290,
              topic: "React",
              intensity: 5,
            },
          ],
        },
      ],
    },

    // Topic distribution
    topics: {
      React: { days: 45, hours: 168, xp: 4250, lessons: 89, quizzes: 56 },
      "Node.js": { days: 38, hours: 142, xp: 3600, lessons: 72, quizzes: 48 },
      TypeScript: { days: 32, hours: 118, xp: 2950, lessons: 58, quizzes: 42 },
      JavaScript: { days: 42, hours: 156, xp: 3950, lessons: 82, quizzes: 52 },
      "System Design": {
        days: 28,
        hours: 98,
        xp: 2450,
        lessons: 48,
        quizzes: 32,
      },
    },

    // Intensity levels
    intensityLevels: [
      {
        level: 0,
        label: "No activity",
        color: "bg-zinc-800",
        text: "text-zinc-600",
      },
      {
        level: 1,
        label: "Very Light",
        color: "bg-emerald-900",
        text: "text-emerald-800",
        hours: "< 1h",
      },
      {
        level: 2,
        label: "Light",
        color: "bg-emerald-700",
        text: "text-emerald-600",
        hours: "1-2h",
      },
      {
        level: 3,
        label: "Moderate",
        color: "bg-emerald-500",
        text: "text-emerald-400",
        hours: "2-4h",
      },
      {
        level: 4,
        label: "Active",
        color: "bg-emerald-400",
        text: "text-emerald-300",
        hours: "4-6h",
      },
      {
        level: 5,
        label: "Very Active",
        color: "bg-emerald-300",
        text: "text-emerald-200",
        hours: "6h+",
      },
    ],

    // Patterns
    patterns: {
      bestDay: "Saturday",
      worstDay: "Thursday",
      bestTime: "Evening (6-10 PM)",
      mostConsistent: "Week 1",
      mostProductive: "Week 4",

      weeklyAverage: [4.2, 3.8, 4.5, 3.2, 4.0, 5.2, 4.8], // hours per weekday

      monthlyTrend: [
        { week: 1, average: 4.2, total: 29.5 },
        { week: 2, average: 3.8, total: 26.5 },
        { week: 3, average: 4.0, total: 28.0 },
        { week: 4, average: 4.2, total: 29.5 },
        { week: 5, average: 4.5, total: 13.5 },
      ],

      streaks: {
        longest: 12,
        current: 12,
        thisMonth: [5, 7, 6, 4, 3],
      },
    },

    // Achievements related to heatmap
    achievements: [
      {
        name: "Perfect Week",
        description: "7 days active",
        achieved: 3,
        total: 5,
      },
      {
        name: "Weekend Warrior",
        description: "10 weekends active",
        achieved: 8,
        total: 10,
      },
      {
        name: "Early Bird",
        description: "Morning study",
        achieved: 15,
        total: 30,
      },
      {
        name: "Night Owl",
        description: "Late night study",
        achieved: 22,
        total: 30,
      },
    ],

    // Predictions
    predictions: {
      monthEnd: 28,
      nextMonth: 26,
      streakRisk: "Low",
      recommendedFocus: "System Design",
    },
  };

  // Get intensity color based on hours
  const getIntensityColor = (hours) => {
    if (hours === 0) return "bg-zinc-800";
    if (hours < 1) return "bg-emerald-900";
    if (hours < 2) return "bg-emerald-700";
    if (hours < 4) return "bg-emerald-500";
    if (hours < 6) return "bg-emerald-400";
    return "bg-emerald-300";
  };

  // Get intensity level
  const getIntensityLevel = (hours) => {
    if (hours === 0) return 0;
    if (hours < 1) return 1;
    if (hours < 2) return 2;
    if (hours < 4) return 3;
    if (hours < 6) return 4;
    return 5;
  };

  // Month days for current view
  const monthDays = heatmapData.monthly.weeks.flatMap((week) => week.days);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaCalendarAlt className="text-emerald-400" />
              Activity Heatmap
            </h1>
            <p className="text-zinc-400 mt-2">
              Visualize your learning journey •{" "}
              {heatmapData.summary.totalActiveDays} active days in 2026
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {/* View Mode */}
            <div className="flex bg-zinc-800/50 p-1 rounded-xl">
              {[
                { id: "year", label: "Year" },
                { id: "month", label: "Month" },
                { id: "week", label: "Week" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode.id
                      ? "bg-emerald-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Metric Type */}
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white"
            >
              <option value="activity">Activity</option>
              <option value="hours">Study Hours</option>
              <option value="xp">XP Earned</option>
              <option value="lessons">Lessons</option>
            </select>

            {/* Export */}
            <button className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white">
              <FaDownload />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <SummaryCard
            icon={<FaFire className="text-orange-400" />}
            label="Current Streak"
            value={`${heatmapData.summary.currentStreak} days`}
          />
          <SummaryCard
            icon={<FaTrophy className="text-yellow-400" />}
            label="Best Streak"
            value={`${heatmapData.summary.bestStreak} days`}
          />
          <SummaryCard
            icon={<FaClock className="text-blue-400" />}
            label="Total Hours"
            value={`${heatmapData.summary.totalHours}h`}
          />
          <SummaryCard
            icon={<FaStar className="text-purple-400" />}
            label="Avg Daily"
            value={`${heatmapData.summary.averageDaily}h`}
          />
          <SummaryCard
            icon={<FaBrain className="text-emerald-400" />}
            label="Consistency"
            value={`${heatmapData.summary.consistency}%`}
          />
          <SummaryCard
            icon={<FaChartLine className="text-green-400" />}
            label="Active Days"
            value={heatmapData.summary.totalActiveDays}
          />
          <SummaryCard
            icon={<FaCalendarAlt className="text-red-400" />}
            label="Peak Month"
            value={heatmapData.summary.peakMonth}
          />
        </div>
      </div>

      {/* Main Heatmap */}
      <div className="max-w-7xl mx-auto">
        {/* Year View */}
        {viewMode === "year" && (
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            {/* Year selector */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">
                2026 Learning Activity
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                  <FaChevronLeft />
                </button>
                <span className="px-4 py-2 bg-zinc-800 rounded-lg text-white">
                  2026
                </span>
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Month labels */}
            <div className="flex mb-2 text-xs text-zinc-500">
              <div className="w-16"></div>
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month) => (
                <div key={month} className="flex-1 text-center">
                  {month}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="w-16 text-xs text-zinc-500 space-y-1">
                <div>Mon</div>
                <div>Wed</div>
                <div>Fri</div>
              </div>

              {/* Weeks */}
              <div className="flex-1 grid grid-cols-53 gap-1">
                {[...Array(53)].map((_, weekIndex) => (
                  <div key={weekIndex} className="space-y-1">
                    {[...Array(7)].map((_, dayIndex) => {
                      // Generate dummy data for demo
                      const randomHours = Math.random() * 6;
                      return (
                        <motion.div
                          key={dayIndex}
                          whileHover={{ scale: 1.5, zIndex: 10 }}
                          onMouseEnter={() =>
                            setHoveredCell({
                              week: weekIndex,
                              day: dayIndex,
                              hours: randomHours,
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-4 h-4 rounded-sm cursor-pointer transition-all ${getIntensityColor(randomHours)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-xs text-zinc-500">Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-sm bg-zinc-800" />
                  <div className="w-4 h-4 rounded-sm bg-emerald-900" />
                  <div className="w-4 h-4 rounded-sm bg-emerald-700" />
                  <div className="w-4 h-4 rounded-sm bg-emerald-500" />
                  <div className="w-4 h-4 rounded-sm bg-emerald-400" />
                  <div className="w-4 h-4 rounded-sm bg-emerald-300" />
                </div>
                <span className="text-xs text-zinc-500">More</span>
              </div>
              <div className="text-xs text-zinc-500">
                {heatmapData.summary.totalActiveDays} active days • Click for
                details
              </div>
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredCell && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <p className="text-sm text-white">
                    Week {hoveredCell.week + 1}, Day {hoveredCell.day + 1}:{" "}
                    {hoveredCell.hours.toFixed(1)} hours
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Month View */}
        {viewMode === "month" && (
          <div className="space-y-6">
            {/* Month selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">March 2026</h2>
              <div className="flex gap-2">
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                  <FaChevronLeft />
                </button>
                <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                  <option>March 2026</option>
                  <option>February 2026</option>
                  <option>January 2026</option>
                </select>
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Month stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MonthStat
                label="Active Days"
                value={`${heatmapData.monthly.activeDays}/${heatmapData.monthly.days}`}
              />
              <MonthStat
                label="Total Hours"
                value={`${heatmapData.monthly.totalHours}h`}
              />
              <MonthStat
                label="Daily Avg"
                value={`${heatmapData.monthly.averageDaily}h`}
              />
              <MonthStat
                label="Best Week"
                value={heatmapData.monthly.bestWeek}
              />
              <MonthStat
                label="Projected"
                value={`${heatmapData.predictions.monthEnd} days`}
              />
            </div>

            {/* Weekly breakdown */}
            {heatmapData.monthly.weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800"
              >
                <h3 className="text-sm font-medium text-zinc-400 mb-3">
                  Week {week.week}
                </h3>

                {/* Week days header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs text-zinc-500"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Week cells */}
                <div className="grid grid-cols-7 gap-2">
                  {week.days.map((day, dayIndex) => {
                    const intensity = getIntensityLevel(day.hours);
                    return (
                      <motion.div
                        key={dayIndex}
                        whileHover={{ scale: 1.1 }}
                        onMouseEnter={() => setHoveredCell(day)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`
                          aspect-square rounded-lg p-2 cursor-pointer
                          ${getIntensityColor(day.hours)}
                          ${day.date === "2026-03-04" ? "ring-2 ring-orange-500" : ""}
                        `}
                      >
                        <div className="h-full flex flex-col">
                          <span className="text-xs font-medium text-white">
                            {day.day}
                          </span>
                          {day.active && (
                            <span className="text-[10px] text-white/70 mt-auto">
                              {day.hours}h
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Week summary */}
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-zinc-500">
                    Total:{" "}
                    {week.days.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
                  </span>
                  <span className="text-emerald-400">
                    Avg:{" "}
                    {(
                      week.days.reduce((sum, d) => sum + d.hours, 0) / 7
                    ).toFixed(1)}
                    h/day
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className="space-y-6">
            {/* Week selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Week 1, March 2026
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                  <FaChevronLeft />
                </button>
                <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                  <option>Week 1 (Mar 1-7)</option>
                  <option>Week 2 (Mar 8-14)</option>
                  <option>Week 3 (Mar 15-21)</option>
                </select>
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Week stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <WeekStat
                label="Total Hours"
                value="27h"
                trend="+12% vs last week"
              />
              <WeekStat label="Lessons" value="32" trend="+8 vs last week" />
              <WeekStat label="Quizzes" value="21" trend="85% accuracy" />
              <WeekStat label="XP Earned" value="1,420" trend="+210 XP" />
            </div>

            {/* Hourly breakdown */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-6">Daily Breakdown</h3>

              <div className="space-y-4">
                {heatmapData.monthly.weeks[0].days.map((day) => (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-400 w-24">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-sm text-white">
                          {day.topic || "No activity"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-white">{day.hours}h</span>
                        <span className="text-xs text-emerald-400">
                          {day.xp} XP
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(day.hours / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topics pie */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">Topics This Week</h3>
                <div className="space-y-3">
                  {Object.entries(heatmapData.topics)
                    .slice(0, 5)
                    .map(([topic, data]) => (
                      <div key={topic} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">{topic}</span>
                          <span className="text-white">{data.hours}h</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(data.hours / 168) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Intensity legend */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">Intensity Levels</h3>
                <div className="space-y-3">
                  {heatmapData.intensityLevels.map((level) => (
                    <div key={level.level} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded ${level.color}`} />
                      <span className="flex-1 text-sm text-zinc-400">
                        {level.label}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {level.hours || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patterns */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaBrain className="text-emerald-400" />
              Learning Patterns
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-2">Best Day</p>
                <p className="text-lg text-white">
                  {heatmapData.patterns.bestDay}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Peak Time</p>
                <p className="text-lg text-white">
                  {heatmapData.patterns.bestTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">Most Consistent</p>
                <p className="text-lg text-white">
                  {heatmapData.patterns.mostConsistent}
                </p>
              </div>

              {/* Weekly pattern chart */}
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Weekly Pattern</p>
                <div className="flex items-end h-20 gap-1">
                  {heatmapData.patterns.weeklyAverage.map((hours, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${hours * 8}px` }}
                        className="w-full bg-emerald-500 rounded-t"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              Heatmap Achievements
            </h3>

            <div className="space-y-4">
              {heatmapData.achievements.map((ach, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{ach.name}</span>
                    <span className="text-zinc-400">
                      {ach.achieved}/{ach.total}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(ach.achieved / ach.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">{ach.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
              <p className="text-sm text-emerald-400">
                Next: Weekend Warrior (2 more weekends)
              </p>
            </div>
          </div>

          {/* Predictions */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-emerald-400" />
              Predictions
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1">
                  Month End Projection
                </p>
                <p className="text-2xl font-bold text-white">
                  {heatmapData.predictions.monthEnd} days
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Next Month</p>
                <p className="text-2xl font-bold text-white">
                  {heatmapData.predictions.nextMonth} days
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Streak Risk</p>
                <p className="text-lg text-emerald-400">
                  {heatmapData.predictions.streakRisk}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Focus On</p>
                <p className="text-lg text-white">
                  {heatmapData.predictions.recommendedFocus}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-black/30 rounded-lg">
              <p className="text-sm text-white">
                💡 Based on your patterns, focus on System Design this week
              </p>
            </div>
          </div>
        </div>

        {/* Topic Mastery Heatmap */}
        <div className="mt-8 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
          <h3 className="font-bold text-white mb-6">Topic Mastery Heatmap</h3>

          <div className="grid grid-cols-5 gap-4">
            {Object.entries(heatmapData.topics).map(([topic, data]) => (
              <div key={topic} className="text-center">
                <div className="relative mb-2">
                  <div className="w-full h-24 bg-zinc-800 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.hours / 168) * 100}%` }}
                      className="absolute bottom-0 w-full bg-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-sm text-white font-medium">{topic}</p>
                <p className="text-xs text-zinc-500">{data.hours}h</p>
                <p className="text-xs text-emerald-400">{data.xp} XP</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, label, value }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-3 border border-zinc-800">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
    <p className="text-lg font-bold text-white">{value}</p>
  </div>
);

// Month Stat Component
const MonthStat = ({ label, value }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <p className="text-xs text-zinc-500 mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

// Week Stat Component
const WeekStat = ({ label, value, trend }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <p className="text-xs text-zinc-500 mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-xs text-emerald-400 mt-1">{trend}</p>
  </div>
);

export default HeatmapDashboard;
