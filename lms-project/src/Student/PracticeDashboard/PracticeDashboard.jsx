// components/PracticeDashboard.jsx
import React, { useState } from "react";

import {
  FaBrain,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaStar,
  FaRocket,
  FaShieldAlt,
  FaBolt,
  FaMedal,
  FaRedo,
  FaFilter,
  FaSearch,
  FaSort,
  FaGraduationCap,
  FaLightbulb,
  FaAward,
  FaChevronRight,
  FaLock,
  FaUnlock,
  FaPlay,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PracticeDashboard = () => {
  const [activeTab, setActiveTab] = useState("recommended"); // recommended, topics, tests, analytics
  const [difficulty, setDifficulty] = useState("all"); // all, easy, medium, hard
  const [topic, setTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ========== ADVANCED PRACTICE DATA ==========
  const practiceData = {
    // Overall Stats
    stats: {
      totalQuestions: 1248,
      answered: 847,
      correct: 712,
      incorrect: 135,
      accuracy: 84,
      streak: 12,
      bestStreak: 24,
      totalQuizzes: 48,
      completedQuizzes: 32,
      averageTime: 45, // seconds per question
      points: 8450,
      rank: "Gold League",
      level: 8,
      nextLevelPoints: 10000,
    },

    // Daily Practice Goal
    dailyGoal: {
      target: 20,
      completed: 15,
      remaining: 5,
      streak: 7,
    },

    // Topics Mastery
    topics: [
      {
        name: "React Hooks",
        total: 156,
        correct: 142,
        accuracy: 91,
        level: "expert",
        icon: "⚛️",
        color: "emerald",
        badges: ["Hook Master", "Fast Learner"],
      },
      {
        name: "JavaScript",
        total: 234,
        correct: 206,
        accuracy: 88,
        level: "advanced",
        icon: "📜",
        color: "yellow",
        badges: ["JS Ninja"],
      },
      {
        name: "Node.js",
        total: 189,
        correct: 142,
        accuracy: 75,
        level: "intermediate",
        icon: "🟢",
        color: "green",
        badges: [],
      },
      {
        name: "System Design",
        total: 98,
        correct: 49,
        accuracy: 50,
        level: "beginner",
        icon: "🏗️",
        color: "red",
        badges: [],
      },
      {
        name: "TypeScript",
        total: 112,
        correct: 92,
        accuracy: 82,
        level: "advanced",
        icon: "🔷",
        color: "blue",
        badges: ["Type Safe"],
      },
      {
        name: "Database",
        total: 145,
        correct: 108,
        accuracy: 74,
        level: "intermediate",
        icon: "🗄️",
        color: "purple",
        badges: [],
      },
    ],

    // Recommended Quizzes (AI based)
    recommended: [
      {
        id: 1,
        title: "React Hooks Deep Dive",
        topic: "React",
        questions: 15,
        time: 20,
        difficulty: "medium",
        accuracy: 85,
        reason: "Based on your recent mistakes",
        completed: false,
        icon: "⚛️",
        xpReward: 150,
        badge: "Hook Master",
      },
      {
        id: 2,
        title: "JavaScript Closures & Scope",
        topic: "JavaScript",
        questions: 12,
        time: 15,
        difficulty: "hard",
        accuracy: 70,
        reason: "Weak area detected",
        completed: false,
        icon: "📜",
        xpReward: 200,
        badge: "Scope Master",
      },
      {
        id: 3,
        title: "System Design: Caching",
        topic: "System Design",
        questions: 10,
        time: 25,
        difficulty: "hard",
        accuracy: 40,
        reason: "Needs improvement",
        completed: false,
        icon: "🏗️",
        xpReward: 250,
        badge: "Cache King",
      },
    ],

    // Recent Quizzes
    recentQuizzes: [
      {
        id: 101,
        title: "React Hooks Quiz",
        date: "2 hours ago",
        score: 92,
        total: 15,
        correct: 14,
        time: "12 min",
        difficulty: "medium",
      },
      {
        id: 102,
        title: "JavaScript Fundamentals",
        date: "Yesterday",
        score: 88,
        total: 20,
        correct: 17,
        time: "18 min",
        difficulty: "easy",
      },
      {
        id: 103,
        title: "Node.js Async Patterns",
        date: "2 days ago",
        score: 75,
        total: 12,
        correct: 9,
        time: "15 min",
        difficulty: "hard",
      },
    ],

    // Available Quizzes by Topic
    availableQuizzes: [
      { topic: "React", count: 24, icon: "⚛️" },
      { topic: "JavaScript", count: 32, icon: "📜" },
      { topic: "TypeScript", count: 18, icon: "🔷" },
      { topic: "Node.js", count: 21, icon: "🟢" },
      { topic: "System Design", count: 15, icon: "🏗️" },
      { topic: "Database", count: 19, icon: "🗄️" },
      { topic: "Algorithms", count: 28, icon: "⚡" },
      { topic: "HTML/CSS", count: 16, icon: "🎨" },
    ],

    // Achievements
    achievements: [
      {
        name: "Quick Learner",
        description: "Complete 10 quizzes",
        progress: 8,
        total: 10,
        icon: "🚀",
      },
      {
        name: "Accuracy King",
        description: "90%+ accuracy in 5 quizzes",
        progress: 3,
        total: 5,
        icon: "🎯",
      },
      {
        name: "Streak Master",
        description: "30 day practice streak",
        progress: 12,
        total: 30,
        icon: "🔥",
      },
      {
        name: "Topic Expert",
        description: "Master 5 topics",
        progress: 2,
        total: 5,
        icon: "👑",
      },
    ],

    // Weak Areas (Need Practice)
    weakAreas: [
      { topic: "System Design", accuracy: 45, questionsNeeded: 30 },
      { topic: "Database Indexing", accuracy: 52, questionsNeeded: 20 },
      { topic: "Async Patterns", accuracy: 60, questionsNeeded: 15 },
    ],

    // Performance Chart Data
    performanceTrend: [
      { week: "Week 1", accuracy: 72, quizzes: 4 },
      { week: "Week 2", accuracy: 75, quizzes: 5 },
      { week: "Week 3", accuracy: 78, quizzes: 6 },
      { week: "Week 4", accuracy: 82, quizzes: 7 },
      { week: "Week 5", accuracy: 84, quizzes: 8 },
      { week: "Week 6", accuracy: 86, quizzes: 9 },
    ],

    // Time Analysis
    bestTime: {
      morning: 75,
      afternoon: 82,
      evening: 91,
      night: 78,
    },

    // Mistakes Analysis
    commonMistakes: [
      {
        topic: "React Hooks",
        mistake: "useEffect dependencies",
        frequency: 12,
      },
      { topic: "JavaScript", mistake: "this keyword binding", frequency: 10 },
      { topic: "System Design", mistake: "Database sharding", frequency: 8 },
    ],
  };

  // Get color based on accuracy
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return "text-emerald-400";
    if (accuracy >= 75) return "text-yellow-400";
    if (accuracy >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 90) return "bg-emerald-500/20";
    if (accuracy >= 75) return "bg-yellow-500/20";
    if (accuracy >= 60) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "easy") return "text-green-400";
    if (difficulty === "medium") return "text-yellow-400";
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
              Practice Arena
            </h1>
            <p className="text-zinc-400 mt-2">
              Master your skills through practice •{" "}
              {practiceData.stats.completedQuizzes}/
              {practiceData.stats.totalQuizzes} quizzes completed
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl px-4 py-2 border border-purple-500/30">
              <p className="text-xs text-purple-400">Daily Goal</p>
              <p className="text-xl font-bold text-white">
                {practiceData.dailyGoal.completed}/
                {practiceData.dailyGoal.target}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl px-4 py-2 border border-orange-500/30">
              <p className="text-xs text-orange-400">Streak</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                <FaFire className="text-orange-400" />{" "}
                {practiceData.stats.streak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FaCheckCircle className="text-emerald-400" />}
            label="Accuracy"
            value={`${practiceData.stats.accuracy}%`}
            subValue={`${practiceData.stats.correct}/${practiceData.stats.answered} correct`}
            trend="+5%"
          />
          <StatCard
            icon={<FaClock className="text-blue-400" />}
            label="Avg Time"
            value={`${practiceData.stats.averageTime}s`}
            subValue="per question"
            trend="-2s"
          />
          <StatCard
            icon={<FaTrophy className="text-yellow-400" />}
            label="Total Points"
            value={practiceData.stats.points.toLocaleString()}
            subValue={practiceData.stats.rank}
            trend="+450"
          />
          <StatCard
            icon={<FaRocket className="text-purple-400" />}
            label="Level {practiceData.stats.level}"
            value={`${practiceData.stats.points}/${practiceData.stats.nextLevelPoints}`}
            subValue="to next level"
            trend="Level 9"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto">
        <div className="flex border-b border-zinc-800 mb-6">
          {[
            { id: "recommended", label: "Recommended", icon: FaStar },
            { id: "topics", label: "Topics", icon: FaBrain },
            { id: "tests", label: "Practice Tests", icon: FaCheckCircle },
            { id: "analytics", label: "Analytics", icon: FaChartLine },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Recommended Tab */}
        {activeTab === "recommended" && (
          <div className="space-y-6">
            {/* Daily Goal Progress */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FaFire className="text-orange-400" />
                  Today's Practice Goal
                </h3>
                <span className="text-sm text-zinc-400">
                  {practiceData.dailyGoal.completed}/
                  {practiceData.dailyGoal.target} questions
                </span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(practiceData.dailyGoal.completed / practiceData.dailyGoal.target) * 100}%`,
                  }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                />
              </div>
              <p className="text-sm text-zinc-400">
                {practiceData.dailyGoal.remaining} more to maintain streak!
              </p>
            </div>

            {/* AI Recommendations */}
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              AI Recommended for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceData.recommended.map((quiz) => (
                <RecommendationCard key={quiz.id} quiz={quiz} />
              ))}
            </div>

            {/* Weak Areas Alert */}
            <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-red-400" />
                Need Practice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {practiceData.weakAreas.map((area) => (
                  <div key={area.topic} className="bg-black/30 rounded-xl p-4">
                    <p className="text-white font-medium mb-2">{area.topic}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">Accuracy</span>
                      <span className="text-sm font-bold text-red-400">
                        {area.accuracy}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full mb-3">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${area.accuracy}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">
                      {area.questionsNeeded} questions recommended
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Quizzes */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                Recent Practice
              </h3>
              <div className="space-y-3">
                {practiceData.recentQuizzes.map((quiz) => (
                  <RecentQuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === "topics" && (
          <div className="space-y-6">
            {/* Topic Mastery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceData.topics.map((topic) => (
                <TopicCard key={topic.name} topic={topic} />
              ))}
            </div>

            {/* Available Quizzes by Topic */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">
                Quick Practice by Topic
              </h3>
              <div className="flex flex-wrap gap-2">
                {practiceData.availableQuizzes.map((q) => (
                  <button
                    key={q.topic}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-emerald-500/20 transition-colors group"
                  >
                    <span className="text-lg">{q.icon}</span>
                    <span className="text-white text-sm">{q.topic}</span>
                    <span className="text-xs text-zinc-500">({q.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Practice Tests Tab */}
        {activeTab === "tests" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search practice tests..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white"
                />
              </div>
              <select className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white">
                <option>All Difficulties</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            {/* Test Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <TestCard key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnalyticCard
                label="Total Questions"
                value={practiceData.stats.answered}
                subValue={`${practiceData.stats.totalQuestions} available`}
              />
              <AnalyticCard
                label="Correct Answers"
                value={practiceData.stats.correct}
                subValue={`${((practiceData.stats.correct / practiceData.stats.answered) * 100).toFixed(1)}%`}
              />
              <AnalyticCard
                label="Incorrect"
                value={practiceData.stats.incorrect}
                subValue={`${((practiceData.stats.incorrect / practiceData.stats.answered) * 100).toFixed(1)}%`}
              />
              <AnalyticCard
                label="Completion"
                value={`${((practiceData.stats.answered / practiceData.stats.totalQuestions) * 100).toFixed(1)}%`}
              />
            </div>

            {/* Performance Trend */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">Performance Trend</h3>
              <div className="h-40 flex items-end justify-between gap-2">
                {practiceData.performanceTrend.map((week) => (
                  <div
                    key={week.week}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${week.accuracy}px` }}
                      className="w-full bg-emerald-500 rounded-t-lg"
                      style={{ maxHeight: "100px" }}
                    />
                    <span className="text-xs text-zinc-500">{week.week}</span>
                    <span className="text-xs text-white">{week.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Time & Mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">
                  Best Practice Time
                </h3>
                <div className="space-y-3">
                  {Object.entries(practiceData.bestTime).map(
                    ([time, value]) => (
                      <div key={time} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400 capitalize">
                            {time}
                          </span>
                          <span className="text-white">{value}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full">
                          <div
                            className={`h-full rounded-full ${
                              value >= 90 ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                <h3 className="font-bold text-white mb-4">Common Mistakes</h3>
                <div className="space-y-4">
                  {practiceData.commonMistakes.map((mistake) => (
                    <div key={mistake.topic} className="flex items-start gap-3">
                      <FaTimesCircle className="text-red-400 mt-1" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {mistake.topic}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {mistake.mistake}
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {mistake.frequency} times
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <FaAward className="text-yellow-400" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {practiceData.achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className="bg-zinc-800/50 rounded-xl p-4"
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="text-white font-medium text-sm mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mb-3">
                      {achievement.description}
                    </p>
                    <div className="h-1.5 bg-zinc-700 rounded-full">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(achievement.progress / achievement.total) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">
                      {achievement.progress}/{achievement.total}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subValue, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800"
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className="text-lg">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-zinc-600 mt-1">{subValue}</p>
    {trend && (
      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
        <FaBolt /> {trend}
      </p>
    )}
  </motion.div>
);

// Recommendation Card
const RecommendationCard = ({ quiz }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-emerald-500/30 transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-3xl">{quiz.icon}</span>
      <span
        className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)} bg-opacity-20`}
      >
        {quiz.difficulty}
      </span>
    </div>

    <h3 className="font-bold text-white mb-2">{quiz.title}</h3>
    <p className="text-xs text-zinc-500 mb-3">{quiz.reason}</p>

    <div className="flex items-center gap-3 text-xs text-zinc-400 mb-4">
      <span className="flex items-center gap-1">
        <FaClock /> {quiz.time} min
      </span>
      <span className="flex items-center gap-1">
        <FaBrain /> {quiz.questions} Q
      </span>
      <span className="flex items-center gap-1 text-yellow-400">
        <FaStar /> {quiz.xpReward} XP
      </span>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            quiz.difficulty === "easy"
              ? "bg-green-400"
              : quiz.difficulty === "medium"
                ? "bg-yellow-400"
                : "bg-red-400"
          }`}
        />
        <span className="text-xs text-zinc-500">Current: {quiz.accuracy}%</span>
      </div>
      <button className="px-4 py-2 bg-emerald-500 rounded-lg text-white text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2">
        <FaPlay className="text-xs" /> Practice
      </button>
    </div>

    {quiz.badge && (
      <div className="mt-3 pt-3 border-t border-zinc-800">
        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
          🏆 {quiz.badge}
        </span>
      </div>
    )}
  </motion.div>
);

// Topic Card
const TopicCard = ({ topic }) => (
  <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
    <div className="flex items-start justify-between mb-4">
      <div>
        <span className="text-2xl mb-2 block">{topic.icon}</span>
        <h3 className="font-bold text-white">{topic.name}</h3>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${getAccuracyBg(topic.accuracy)} ${getAccuracyColor(topic.accuracy)}`}
      >
        {topic.level}
      </span>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Accuracy</span>
        <span className={getAccuracyColor(topic.accuracy)}>
          {topic.accuracy}%
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${topic.accuracy}%` }}
          className={`h-full bg-${topic.color}-500 rounded-full`}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{topic.correct} correct</span>
        <span>{topic.total} total</span>
      </div>
    </div>

    {topic.badges.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {topic.badges.map((badge) => (
          <span
            key={badge}
            className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full"
          >
            {badge}
          </span>
        ))}
      </div>
    )}

    <button className="w-full mt-4 text-sm text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1">
      Practice Now <FaChevronRight className="text-xs" />
    </button>
  </div>
);

// Recent Quiz Card
const RecentQuizCard = ({ quiz }) => (
  <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 hover:border-emerald-500/30 transition-all">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-white">{quiz.title}</h4>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              quiz.score >= 90
                ? "bg-emerald-500/20 text-emerald-400"
                : quiz.score >= 75
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {quiz.score}%
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>{quiz.date}</span>
          <span>•</span>
          <span>
            {quiz.correct}/{quiz.total} correct
          </span>
          <span>•</span>
          <span>{quiz.time}</span>
          <span>•</span>
          <span className={getDifficultyColor(quiz.difficulty)}>
            {quiz.difficulty}
          </span>
        </div>
      </div>
      <button className="p-2 bg-zinc-800 rounded-lg hover:bg-emerald-500/20 transition-colors">
        <FaRedo className="text-zinc-400" />
      </button>
    </div>
  </div>
);

// Test Card
const TestCard = () => (
  <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 hover:border-emerald-500/30 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div>
        <span className="text-2xl mb-2 block">📝</span>
        <h3 className="font-bold text-white">JavaScript Fundamentals</h3>
        <p className="text-xs text-zinc-500 mt-1">30 questions • 45 minutes</p>
      </div>
      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
        medium
      </span>
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <FaCheckCircle /> Passing: 70%
        </span>
        <span className="flex items-center gap-1">
          <FaStar /> 200 XP
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Topics:</span>
        <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">
          Closures
        </span>
        <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">
          Promises
        </span>
        <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">this</span>
      </div>
    </div>

    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
      <FaPlay className="text-sm" /> Start Test
    </button>
  </div>
);

// Analytic Card
const AnalyticCard = ({ label, value, subValue }) => (
  <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
    <p className="text-xs text-zinc-500 mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-xs text-zinc-600 mt-1">{subValue}</p>
  </div>
);

// Helper function for difficulty colors
const getDifficultyColor = (difficulty) => {
  if (difficulty === "easy") return "text-green-400 bg-green-500/20";
  if (difficulty === "medium") return "text-yellow-400 bg-yellow-500/20";
  return "text-red-400 bg-red-500/20";
};

export default PracticeDashboard;
