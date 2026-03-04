// components/ActivityHistory.jsx
import React, { useState } from "react";

import {
  FaHistory,
  FaBook,
  FaCode,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaDownload,
  FaEye,
  FaPlay,
  FaStar,
  FaAward,
  FaGraduationCap,
  FaChartLine,
  FaFire,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaFilePdf,
  FaVideo,
  FaQuestionCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ActivityHistory = () => {
  const [timeRange, setTimeRange] = useState("all"); // today, week, month, all
  const [activityType, setActivityType] = useState("all"); // all, lessons, quizzes, achievements
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, xp
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========== COMPLETE ACTIVITY HISTORY DATA ==========
  const activityData = {
    // Summary stats
    summary: {
      totalActivities: 847,
      totalLessons: 324,
      totalQuizzes: 248,
      totalAchievements: 45,
      totalHours: 284,
      totalXP: 8450,
      currentStreak: 12,
      bestStreak: 24,
      mostActiveDay: "Wednesday",
      mostActiveTime: "Evening (6-10 PM)",
    },

    // Daily activity for heatmap
    dailyActivity: [
      { date: "2026-03-01", count: 8, lessons: 3, quizzes: 4, achievements: 1 },
      {
        date: "2026-03-02",
        count: 12,
        lessons: 5,
        quizzes: 6,
        achievements: 1,
      },
      { date: "2026-03-03", count: 5, lessons: 2, quizzes: 3, achievements: 0 },
      {
        date: "2026-03-04",
        count: 15,
        lessons: 6,
        quizzes: 8,
        achievements: 1,
      },
      // ... more days
    ],

    // Weekly summary
    weeklySummary: [
      { week: "Week 1", activities: 45, xp: 850, lessons: 18, quizzes: 24 },
      { week: "Week 2", activities: 52, xp: 920, lessons: 21, quizzes: 28 },
      { week: "Week 3", activities: 48, xp: 880, lessons: 19, quizzes: 26 },
      { week: "Week 4", activities: 58, xp: 1050, lessons: 24, quizzes: 30 },
    ],

    // Complete activity history (100+ entries)
    activities: [
      // Today's activities
      {
        id: 1,
        type: "lesson",
        title: "Completed: React Hooks - useEffect Deep Dive",
        description: "Finished lesson 4 of Advanced React course",
        course: "Advanced React",
        topic: "React Hooks",
        xp: 50,
        time: "2 hours ago",
        date: "2026-03-04T10:30:00",
        duration: 45, // minutes
        status: "completed",
        icon: FaBook,
        color: "blue",
        details: {
          lessonId: "react-104",
          chapter: "Advanced Hooks",
          completedAt: "10:30 AM",
          notes: "Took detailed notes on useEffect cleanup",
        },
      },
      {
        id: 2,
        type: "quiz",
        title: "Scored 92% on React Hooks Quiz",
        description: "15 questions, 14 correct",
        course: "Advanced React",
        topic: "React Hooks",
        xp: 75,
        time: "5 hours ago",
        date: "2026-03-04T07:45:00",
        duration: 12,
        status: "completed",
        icon: FaQuestionCircle,
        color: "purple",
        details: {
          quizId: "quiz-203",
          score: 92,
          correct: 14,
          total: 15,
          timeSpent: "12 min",
          weakAreas: ["useMemo"],
        },
      },

      // Yesterday's activities
      {
        id: 3,
        type: "achievement",
        title: 'Earned "30 Day Streak" Badge',
        description: "Maintained learning streak for 30 days",
        xp: 200,
        time: "1 day ago",
        date: "2026-03-03T20:15:00",
        icon: FaAward,
        color: "yellow",
        details: {
          badgeId: "badge-030",
          rarity: "rare",
          streak: 30,
        },
      },
      {
        id: 4,
        type: "lesson",
        title: "Watched: Node.js Event Loop",
        description: "Completed lesson 3 of Node.js Masterclass",
        course: "Node.js Masterclass",
        topic: "Node.js Core",
        xp: 40,
        time: "1 day ago",
        date: "2026-03-03T15:20:00",
        duration: 35,
        status: "completed",
        icon: FaCode,
        color: "green",
      },
      {
        id: 5,
        type: "quiz",
        title: "Scored 85% on JavaScript Closures",
        description: "10 questions, 8 correct, 2 wrong",
        course: "JavaScript Fundamentals",
        topic: "Closures",
        xp: 60,
        time: "1 day ago",
        date: "2026-03-03T11:10:00",
        duration: 15,
        status: "completed",
        icon: FaQuestionCircle,
        color: "purple",
      },

      // 2 days ago
      {
        id: 6,
        type: "lesson",
        title: "Completed: System Design - Database Sharding",
        description: "Finished chapter 2 of System Design",
        course: "System Design",
        topic: "Databases",
        xp: 55,
        time: "2 days ago",
        date: "2026-03-02T19:30:00",
        duration: 50,
        status: "completed",
        icon: FaBook,
        color: "blue",
      },
      {
        id: 7,
        type: "lesson",
        title: "Watched: TypeScript Advanced Types",
        description: "Lesson 5 of TypeScript course",
        course: "TypeScript Masterclass",
        topic: "Advanced Types",
        xp: 45,
        time: "2 days ago",
        date: "2026-03-02T14:45:00",
        duration: 40,
        status: "completed",
        icon: FaCode,
        color: "blue",
      },
      {
        id: 8,
        type: "achievement",
        title: "Reached Level 12",
        description: "Accumulated 2450 total XP",
        xp: 150,
        time: "2 days ago",
        date: "2026-03-02T09:20:00",
        icon: FaStar,
        color: "emerald",
        details: {
          level: 12,
          xpRequired: 2450,
        },
      },

      // 3 days ago
      {
        id: 9,
        type: "quiz",
        title: "Scored 78% on System Design Quiz",
        description: "8 questions, 6 correct",
        course: "System Design",
        topic: "Caching",
        xp: 45,
        time: "3 days ago",
        date: "2026-03-01T18:15:00",
        duration: 20,
        status: "completed",
        icon: FaQuestionCircle,
        color: "purple",
      },
      {
        id: 10,
        type: "lesson",
        title: "Completed: Python Data Structures",
        description: "Lesson 6 of Python for Data Science",
        course: "Python for Data Science",
        topic: "Data Structures",
        xp: 50,
        time: "3 days ago",
        date: "2026-03-01T12:30:00",
        duration: 45,
        status: "completed",
        icon: FaBook,
        color: "green",
      },

      // More activities...
      {
        id: 11,
        type: "lesson",
        title: "Watched: React Context API",
        description: "Lesson 8 of Advanced React",
        course: "Advanced React",
        topic: "State Management",
        xp: 45,
        time: "4 days ago",
        date: "2026-02-28T16:20:00",
        duration: 35,
        status: "completed",
        icon: FaCode,
        color: "blue",
      },
      {
        id: 12,
        type: "quiz",
        title: "Scored 94% on TypeScript Quiz",
        description: "12 questions, 11 correct",
        course: "TypeScript Masterclass",
        topic: "Type System",
        xp: 80,
        time: "4 days ago",
        date: "2026-02-28T10:45:00",
        duration: 18,
        status: "completed",
        icon: FaQuestionCircle,
        color: "purple",
      },
      {
        id: 13,
        type: "achievement",
        title: 'Earned "100 Problems Solved" Badge',
        description: "Solved 100 coding challenges",
        xp: 100,
        time: "5 days ago",
        date: "2026-02-27T21:30:00",
        icon: FaAward,
        color: "yellow",
      },
      {
        id: 14,
        type: "lesson",
        title: "Completed: Node.js Authentication",
        description: "Lesson 12 of Node.js Masterclass",
        course: "Node.js Masterclass",
        topic: "Authentication",
        xp: 60,
        time: "5 days ago",
        date: "2026-02-27T14:10:00",
        duration: 55,
        status: "completed",
        icon: FaBook,
        color: "green",
      },
      {
        id: 15,
        type: "quiz",
        title: "Scored 88% on Python Quiz",
        description: "15 questions, 13 correct",
        course: "Python for Data Science",
        topic: "Pandas",
        xp: 70,
        time: "6 days ago",
        date: "2026-02-26T17:45:00",
        duration: 22,
        status: "completed",
        icon: FaQuestionCircle,
        color: "purple",
      },
    ],

    // Activity streaks
    streaks: {
      current: 12,
      longest: 24,
      thisWeek: [true, true, true, true, false, true, true],
      monthly: {
        week1: 7,
        week2: 7,
        week3: 6,
        week4: 5,
      },
    },

    // XP history
    xpHistory: [
      { date: "2026-03-01", xp: 150 },
      { date: "2026-03-02", xp: 180 },
      { date: "2026-03-03", xp: 120 },
      { date: "2026-03-04", xp: 200 },
    ],

    // Topic distribution
    topicDistribution: [
      { topic: "React", count: 98, color: "emerald" },
      { topic: "JavaScript", count: 87, color: "yellow" },
      { topic: "Node.js", count: 76, color: "green" },
      { topic: "TypeScript", count: 54, color: "blue" },
      { topic: "System Design", count: 32, color: "purple" },
    ],

    // Milestones
    milestones: [
      { date: "2026-02-15", event: "First 7-day streak", xp: 100 },
      { date: "2026-02-20", event: "Completed 100 lessons", xp: 200 },
      { date: "2026-02-25", event: "Scored 100% on quiz", xp: 150 },
      { date: "2026-03-01", event: "Reached Level 10", xp: 300 },
    ],

    // Filters data
    filters: {
      courses: [
        "Advanced React",
        "Node.js Masterclass",
        "System Design",
        "TypeScript",
        "Python",
      ],
      topics: [
        "React Hooks",
        "JavaScript",
        "Node.js",
        "TypeScript",
        "Python",
        "System Design",
      ],
      types: ["Lessons", "Quizzes", "Achievements"],
    },
  };

  // Filter activities based on selected filters
  const filteredActivities = activityData.activities.filter((activity) => {
    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const activityDate = new Date(activity.date);
      const diffDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));

      if (timeRange === "today" && diffDays > 0) return false;
      if (timeRange === "week" && diffDays > 7) return false;
      if (timeRange === "month" && diffDays > 30) return false;
    }

    // Activity type filter
    if (activityType !== "all" && activity.type !== activityType) return false;

    // Search filter
    if (
      searchQuery &&
      !activity.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
    if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
    if (sortBy === "xp") return b.xp - a.xp;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Group activities by date
  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach((activity) => {
      const date = new Date(activity.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(paginatedActivities);

  // Get activity icon color
  const getActivityColor = (type) => {
    switch (type) {
      case "lesson":
        return "bg-blue-500/20 text-blue-400";
      case "quiz":
        return "bg-purple-500/20 text-purple-400";
      case "achievement":
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
              <FaHistory className="text-emerald-400" />
              Activity History
            </h1>
            <p className="text-zinc-400 mt-2">
              Track your complete learning journey •{" "}
              {activityData.summary.totalActivities} total activities
            </p>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-colors">
            <FaDownload /> Export History
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FaBook className="text-blue-400" />}
            label="Lessons"
            value={activityData.summary.totalLessons}
            trend="+12 this week"
          />
          <StatCard
            icon={<FaQuestionCircle className="text-purple-400" />}
            label="Quizzes"
            value={activityData.summary.totalQuizzes}
            trend="+8 this week"
          />
          <StatCard
            icon={<FaAward className="text-yellow-400" />}
            label="Achievements"
            value={activityData.summary.totalAchievements}
            trend="+3 this month"
          />
          <StatCard
            icon={<FaStar className="text-emerald-400" />}
            label="Total XP"
            value={activityData.summary.totalXP.toLocaleString()}
            trend="+450 this week"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Activity Type */}
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="all">All Activities</option>
            <option value="lesson">Lessons</option>
            <option value="quiz">Quizzes</option>
            <option value="achievement">Achievements</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="xp">Highest XP</option>
          </select>

          {/* Clear Filters */}
          {(timeRange !== "all" || activityType !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setTimeRange("all");
                setActivityType("all");
                setSearchQuery("");
                setSortBy("newest");
              }}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Stats & Insights */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-2xl p-6 border border-orange-500/30">
            <h3 className="text-sm font-medium text-orange-400 mb-4">
              CURRENT STREAK
            </h3>
            <div className="text-3xl font-bold text-white mb-2">
              {activityData.streaks.current} days
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Longest: {activityData.streaks.longest} days
            </p>

            {/* Weekly streak indicator */}
            <div className="flex gap-1">
              {activityData.streaks.thisWeek.map((active, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full ${
                    active ? "bg-orange-400" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">This week</p>
          </div>

          {/* Most Active Times */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4">Activity Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Most Active Day</span>
                <span className="text-emerald-400">
                  {activityData.summary.mostActiveDay}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Peak Time</span>
                <span className="text-blue-400">
                  {activityData.summary.mostActiveTime}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Avg Daily</span>
                <span className="text-white">
                  {(activityData.summary.totalActivities / 90).toFixed(1)}{" "}
                  activities
                </span>
              </div>
            </div>
          </div>

          {/* Topic Distribution */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4">Topics Studied</h3>
            <div className="space-y-3">
              {activityData.topicDistribution.map((topic) => (
                <div key={topic.topic} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{topic.topic}</span>
                    <span className="text-white">{topic.count}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full">
                    <div
                      className={`h-full bg-${topic.color}-500 rounded-full`}
                      style={{ width: `${(topic.count / 100) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              Milestones
            </h3>
            <div className="space-y-4">
              {activityData.milestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {milestone.event}
                    </p>
                    <p className="text-xs text-zinc-500">{milestone.date}</p>
                    <p className="text-xs text-emerald-400 mt-1">
                      +{milestone.xp} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="lg:col-span-3">
          {/* Results count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-zinc-400">
              Showing {paginatedActivities.length} of{" "}
              {filteredActivities.length} activities
            </p>
            <p className="text-xs text-zinc-600">Last updated: Just now</p>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <h3 className="text-lg font-semibold text-white">{date}</h3>
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-xs text-zinc-500">
                    {activities.length} activities
                  </span>
                </div>

                {/* Activities */}
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedActivity(activity)}
                      className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl ${getActivityColor(activity.type)} flex items-center justify-center`}
                        >
                          <activity.icon />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                                {activity.title}
                              </h4>
                              <p className="text-sm text-zinc-500 mt-1">
                                {activity.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-emerald-400 font-bold">
                                +{activity.xp} XP
                              </span>
                              <p className="text-xs text-zinc-600 mt-1">
                                {activity.time}
                              </p>
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="flex items-center gap-4 mt-3 text-xs">
                            {activity.course && (
                              <span className="flex items-center gap-1 text-zinc-500">
                                <FaBook /> {activity.course}
                              </span>
                            )}
                            {activity.duration && (
                              <span className="flex items-center gap-1 text-zinc-500">
                                <FaClock /> {activity.duration} min
                              </span>
                            )}
                            {activity.topic && (
                              <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                                {activity.topic}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* View Details Arrow */}
                        <FaChevronRight className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-zinc-800 rounded-lg disabled:opacity-50"
              >
                <FaChevronLeft className="text-white" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-zinc-800 rounded-lg disabled:opacity-50"
              >
                <FaChevronRight className="text-white" />
              </button>
            </div>
          )}

          {/* Load More */}
          {paginatedActivities.length < filteredActivities.length && (
            <div className="text-center mt-6">
              <button className="text-emerald-400 hover:text-emerald-300 text-sm">
                Load More Activities
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetailModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-zinc-500 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
    </div>
    {trend && <p className="text-xs text-emerald-400 mt-2">{trend}</p>}
  </div>
);

// Activity Detail Modal
const ActivityDetailModal = ({ activity, onClose }) => (
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
      className="bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${getActivityColor(activity.type)} flex items-center justify-center text-xl`}
          >
            <activity.icon />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Activity Details</h3>
            <p className="text-sm text-zinc-400">{activity.time}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium text-white">{activity.title}</h4>
          <p className="text-zinc-400 mt-1">{activity.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">XP Earned</p>
            <p className="text-lg font-bold text-emerald-400">+{activity.xp}</p>
          </div>
          {activity.duration && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-1">Duration</p>
              <p className="text-lg font-bold text-white">
                {activity.duration} min
              </p>
            </div>
          )}
        </div>

        {/* Activity-specific details */}
        {activity.type === "quiz" && activity.details && (
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
            <h5 className="text-sm font-medium text-purple-400 mb-3">
              Quiz Results
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Score</span>
                <span className="text-white font-bold">
                  {activity.details.score}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Correct</span>
                <span className="text-emerald-400">
                  {activity.details.correct}/{activity.details.total}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Time Spent</span>
                <span className="text-white">{activity.details.timeSpent}</span>
              </div>
            </div>
          </div>
        )}

        {activity.type === "achievement" && activity.details && (
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
            <h5 className="text-sm font-medium text-yellow-400 mb-3">
              Achievement Details
            </h5>
            <p className="text-sm text-zinc-300">
              {activity.details.rarity === "rare"
                ? "🎉 Rare Badge Unlocked!"
                : "Badge Earned"}
            </p>
          </div>
        )}

        {/* Full details */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <h5 className="text-sm font-medium text-white mb-3">Full Details</h5>
          <pre className="text-xs text-zinc-400 overflow-auto">
            {JSON.stringify(activity.details || activity, null, 2)}
          </pre>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Helper function for activity colors
const getActivityColor = (type) => {
  switch (type) {
    case "lesson":
      return "bg-blue-500/20 text-blue-400";
    case "quiz":
      return "bg-purple-500/20 text-purple-400";
    case "achievement":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-emerald-500/20 text-emerald-400";
  }
};

export default ActivityHistory;
