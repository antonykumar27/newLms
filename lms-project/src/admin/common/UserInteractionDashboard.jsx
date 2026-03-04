// components/UserInteractionDashboard.jsx
import React, { useState } from "react";
import {
  useGetUserInteractionProfileQuery,
  useRefreshUserProfileMutation,
} from "../../store/api/ProgressApi";
import {
  FiActivity,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiAlertCircle,
  FiHeart,
  FiStar,
  FiRefreshCw,
  FiUser,
  FiVideo,
  FiBookOpen,
  FiThumbsUp,
  FiMessageCircle,
  FiBookmark,
  FiZap,
  FiTarget,
  FiAward,
  FiAlertTriangle,
  FiSkipForward,
  FiPauseCircle,
  FiHelpCircle,
  FiChevronRight,
  FiBarChart2,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../common/AuthContext"; // adjust if needed

// ===========================================
// 📊 OVERVIEW TAB COMPONENT
// ===========================================
const OverviewTab = ({ profile, days }) => {
  // Sample activity data (replace with real data from API)
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

// ===========================================
// 📊 ENGAGEMENT TAB COMPONENT
// ===========================================
const EngagementTab = ({ profile }) => {
  const interactionData = [
    { name: "Plays", value: 45, color: "#3B82F6" },
    { name: "Pauses", value: 30, color: "#F59E0B" },
    { name: "Seeks", value: 15, color: "#10B981" },
    { name: "Completions", value: 10, color: "#8B5CF6" },
  ];

  const dailyEngagement = [
    { day: "Mon", engagement: 85 },
    { day: "Tue", engagement: 72 },
    { day: "Wed", engagement: 90 },
    { day: "Thu", engagement: 78 },
    { day: "Fri", engagement: 65 },
    { day: "Sat", engagement: 45 },
    { day: "Sun", engagement: 30 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FiThumbsUp className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Likes</p>
              <p className="text-xl font-bold text-white">24</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FiMessageCircle className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Comments</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FiBookmark className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bookmarks</p>
              <p className="text-xl font-bold text-white">8</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <FiClock className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Watch Time</p>
              <p className="text-xl font-bold text-white">
                {profile?.stats?.totalWatchTime || "0s"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interaction Distribution */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Interaction Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interactionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {interactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.75rem",
                    color: "#F3F4F6",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Engagement */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Engagement
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.75rem",
                    color: "#F3F4F6",
                  }}
                />
                <Bar
                  dataKey="engagement"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 📊 LEARNING STYLE TAB COMPONENT
// ===========================================
const LearningStyleTab = ({ profile }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Style Card */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Learning Pattern
          </h3>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">📚</div>
            <h4 className="text-2xl font-bold text-purple-400 mb-2">
              {profile?.learningStyle?.primary}
            </h4>
            <p className="text-gray-400">
              Based on session frequency and duration
            </p>
          </div>
        </div>

        {/* Session Details */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Session Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Average Session</span>
              <span className="text-white font-semibold">
                {profile?.learningStyle?.averageSessionLength}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Preferred Time</span>
              <span className="text-white font-semibold">
                {profile?.learningStyle?.preferredTime}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Consistency</span>
              <span className="text-white font-semibold">
                {profile?.learningStyle?.consistency}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-white font-semibold">
                {profile?.learningStyle?.completionRate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 📊 STRUGGLE POINTS TAB COMPONENT
// ===========================================
const StrugglePointsTab = ({ profile }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const strugglePoints = profile?.struggleIndicators?.points || [];
  const needsHelp = profile?.struggleIndicators?.needsHelp;

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "rewind":
        return <FiRefreshCw className="text-yellow-400" />;
      case "skip":
        return <FiSkipForward className="text-blue-400" />;
      case "pause":
        return <FiPauseCircle className="text-purple-400" />;
      default:
        return <FiAlertCircle className="text-red-400" />;
    }
  };

  if (!strugglePoints.length) {
    return (
      <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-12 text-center">
        <FiHeart className="text-green-400 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Struggle Points Found
        </h3>
        <p className="text-gray-400">
          This learner is watching smoothly without any issues!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Warning Banner */}
      {needsHelp && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <FiAlertTriangle className="text-red-400 text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                ⚠️ Intervention Recommended
              </h3>
              <p className="text-gray-300">
                This student is showing significant struggle patterns. Consider
                providing additional support or resources.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Struggle Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strugglePoints.map((point, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPoint(point)}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {getActionIcon(point.action)}
                </div>
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm border border-yellow-500/20">
                  {point.count}x
                </span>
              </div>

              <h4 className="text-lg font-semibold text-white mb-2">
                At {point.timeInVideo}
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Action: <span className="text-yellow-400">{point.action}</span>
              </p>
              <p className="text-sm text-gray-300 bg-gray-700/30 p-3 rounded-xl">
                💡 {point.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Point Modal */}
      {selectedPoint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Struggle Point Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                {getActionIcon(selectedPoint.action)}
                <div>
                  <p className="text-sm text-gray-400">Action</p>
                  <p className="text-white font-semibold">
                    {selectedPoint.action}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <FiClock className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Time in Video</p>
                  <p className="text-white font-semibold">
                    {selectedPoint.timeInVideo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <FiAlertCircle className="text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Frequency</p>
                  <p className="text-white font-semibold">
                    {selectedPoint.count} times
                  </p>
                </div>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-xl">
                <p className="text-yellow-400 font-medium mb-2">
                  Recommendation
                </p>
                <p className="text-gray-300">{selectedPoint.recommendation}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================================
// 📊 PREFERENCES TAB COMPONENT
// ===========================================
const PreferencesTab = ({ profile }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Subjects */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Favorite Subjects
          </h3>
          {profile?.preferences?.favoriteSubjects?.length > 0 ? (
            <div className="space-y-3">
              {profile.preferences.favoriteSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-white">Subject {subject.id}</span>
                  <span className="ml-auto text-sm text-gray-400">
                    {subject.count} interactions
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No subject data available
            </p>
          )}
        </div>

        {/* Content Preferences */}
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Content Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Video Length</span>
              <span className="text-white font-semibold">
                {profile?.preferences?.favoriteVideoLength}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Interaction Density</span>
              <span className="text-white font-semibold">
                {profile?.preferences?.interactionDensity}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
              <span className="text-gray-400">Completion vs Start</span>
              <span className="text-white font-semibold">
                {profile?.preferences?.completionVsStart}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 📊 TIMELINE TAB COMPONENT
// ===========================================
const TimelineTab = ({ profile }) => {
  // Generate sample timeline data
  const timelineData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(
      Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
    ).toLocaleDateString(),
    interactions: Math.floor(Math.random() * 40) + 10,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Activity Timeline */}
      <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Weekly Activity
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
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
              <Line
                type="monotone"
                dataKey="interactions"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <p className="text-sm text-gray-400">Daily Average</p>
          <p className="text-2xl font-bold text-white">
            {profile?.activity?.dailyAverage}
          </p>
        </div>
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <p className="text-sm text-gray-400">Current Streak</p>
          <p className="text-2xl font-bold text-white">
            {profile?.activity?.streak} days
          </p>
        </div>
        <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-4">
          <p className="text-sm text-gray-400">Longest Streak</p>
          <p className="text-2xl font-bold text-white">
            {profile?.activity?.longestStreak} days
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 📊 CHURN PREDICTION CARD (Optional component)
// ===========================================
const ChurnPredictionCard = ({ churnData }) => {
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FiTrendingDown className="text-red-400" />
        Churn Prediction
      </h3>

      <div className="space-y-4">
        {/* Risk Level */}
        <div
          className={`p-4 rounded-xl border ${getRiskColor(churnData?.risk)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Risk Level</span>
            <span className="font-bold text-lg">{churnData?.risk}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                churnData?.risk === "High"
                  ? "bg-red-500"
                  : churnData?.risk === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${churnData?.probability || 0}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1 text-gray-400">
            {churnData?.probability}% probability
          </p>
        </div>

        {/* Risk Factors */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Risk Factors:</p>
          <ul className="space-y-2">
            {churnData?.factors?.map((factor, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <FiAlertTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Action */}
        <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start gap-3">
            <FiHelpCircle className="text-blue-400 text-xl" />
            <div>
              <p className="text-sm text-gray-400 mb-1">Recommended Action</p>
              <p className="text-white font-medium">
                {churnData?.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 📊 MAIN DASHBOARD COMPONENT
// ===========================================
const UserInteractionDashboard = () => {
  const { user } = useAuth();

  const userId = user.user._id; // ✅ separate variable

  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error, refetch } = useGetUserInteractionProfileQuery(
    { userId, days },
    { pollingInterval: 30000 }, // Refresh every 30 seconds
  );

  const [refreshProfile, { isLoading: isRefreshing }] =
    useRefreshUserProfileMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 animate-pulse">
            Loading interaction intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Failed to Load</h3>
          <p className="text-gray-400">
            {error.data?.error || "Something went wrong"}
          </p>
          <button
            onClick={refetch}
            className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profile = data?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg shadow-blue-500/20">
                <FiActivity className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Learning Intelligence Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Advanced analytics for user {profile?.userId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Days Selector */}
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={() => refreshProfile({ userId, days })}
                disabled={isRefreshing}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`text-gray-400 text-xl ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "overview", label: "Overview", icon: FiTrendingUp },
              { id: "engagement", label: "Engagement", icon: FiActivity },
              { id: "learning", label: "Learning Style", icon: FiBookOpen },
              {
                id: "struggles",
                label: "Struggle Points",
                icon: FiAlertCircle,
              },
              { id: "preferences", label: "Preferences", icon: FiHeart },
              { id: "timeline", label: "Timeline", icon: FiCalendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-gray-800/30 text-gray-400 hover:bg-gray-700/30"
                }`}
              >
                <tab.icon className="text-lg" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab profile={profile} days={days} />
        )}
        {activeTab === "engagement" && <EngagementTab profile={profile} />}
        {activeTab === "learning" && <LearningStyleTab profile={profile} />}
        {activeTab === "struggles" && <StrugglePointsTab profile={profile} />}
        {activeTab === "preferences" && <PreferencesTab profile={profile} />}
        {activeTab === "timeline" && <TimelineTab profile={profile} />}
      </div>
    </div>
  );
};

export default UserInteractionDashboard;
