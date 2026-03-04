// components/tabs/EngagementTab.jsx
import React from "react";
import {
  FiThumbsUp,
  FiMessageCircle,
  FiBookmark,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

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

export default EngagementTab;
