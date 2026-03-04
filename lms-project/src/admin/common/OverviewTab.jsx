// components/tabs/OverviewTab.jsx
import React from "react";
import {
  FiTarget,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiZap,
  FiAward,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const OverviewTab = ({ profile, days }) => {
  // Sample activity data (replace with real data)
  const activityData = Array.from({ length: days }, (_, i) => ({
    date: new Date(
      Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000,
    ).toLocaleDateString(),
    interactions: Math.floor(Math.random() * 50) + 10,
    engagement: Math.floor(Math.random() * 30) + 70,
  }));

  const stats = [
    {
      label: "Engagement Score",
      value: profile?.engagement?.score,
      suffix: "/100",
      icon: FiZap,
      color: "from-yellow-500 to-orange-500",
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      level: profile?.engagement?.level,
    },
    {
      label: "Completion Rate",
      value: profile?.learningStyle?.completionRate?.replace("%", ""),
      suffix: "%",
      icon: FiTarget,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
      text: "text-green-400",
    },
    {
      label: "Total Interactions",
      value: profile?.stats?.totalInteractions,
      icon: FiTrendingUp,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
    },
    {
      label: "Avg. Session",
      value: profile?.learningStyle?.averageSessionLength,
      icon: FiClock,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
    },
    {
      label: "Videos Watched",
      value: profile?.stats?.uniqueVideosWatched,
      icon: FiAward,
      color: "from-indigo-500 to-blue-500",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
    },
    {
      label: "Active Streak",
      value: profile?.activity?.streak,
      suffix: " days",
      icon: FiCalendar,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-500/10",
      text: "text-pink-400",
    },
  ];

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${stat.color} blur-3xl`}
            ></div>

            {/* Content */}
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="text-2xl" />
                </div>
                {stat.level && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(stat.level)}`}
                  >
                    {stat.level}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-lg text-gray-400 ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Decorative Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-400" />
            Activity Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.75rem",
                    color: "#F3F4F6",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="interactions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#activityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiZap className="text-yellow-400" />
            Engagement Metrics
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    88 *
                    (1 - (profile?.engagement?.score || 0) / 100)
                  }
                  className="text-yellow-400 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-white">
                  {profile?.engagement?.score}
                </span>
                <span className="text-sm text-gray-400">out of 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔍 Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <p className="text-sm text-gray-400">Learning Pattern</p>
            <p className="text-lg font-semibold text-blue-400">
              {profile?.learningStyle?.primary}
            </p>
          </div>
          <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <p className="text-sm text-gray-400">Peak Time</p>
            <p className="text-lg font-semibold text-purple-400">
              {profile?.learningStyle?.preferredTime}
            </p>
          </div>
          <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10">
            <p className="text-sm text-gray-400">Consistency</p>
            <p className="text-lg font-semibold text-green-400">
              {profile?.learningStyle?.consistency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
