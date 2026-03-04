// components/CourseAnalyticsDashboard.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetCourseAnalyticsQuery,
  useRefreshCourseAnalyticsMutation,
  useExportCourseReportMutation,
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
  FiVideo,
  FiBookOpen,
  FiUsers,
  FiEye,
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiMap,
  FiAward,
  FiThumbsUp,
  FiMessageCircle,
  FiBookmark,
  FiZap,
  FiTarget,
  FiAward as FiTrophy,
  FiSkipForward,
  FiPauseCircle,
  FiHelpCircle,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiMaximize2,
  FiMinimize2,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ===========================================
// 🎯 VIDEO PERFORMANCE CARD COMPONENT
// ===========================================
const VideoPerformanceCard = ({ video, onClick, isSelected }) => {
  const getWarningColor = (warnings) => {
    if (!warnings || warnings.length === 0) return "border-green-500/20";
    if (warnings.some((w) => w.includes("High"))) return "border-red-500/30";
    if (warnings.some((w) => w.includes("Excessive")))
      return "border-yellow-500/30";
    return "border-blue-500/30";
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gray-800/30 border ${getWarningColor(video.warnings)} backdrop-blur-xl p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 cursor-pointer ${
        isSelected ? "ring-2 ring-purple-500" : ""
      }`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Video Title */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <FiVideo className="text-purple-400 text-2xl" />
          </div>
          {video.metrics?.completionRate && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                parseInt(video.metrics.completionRate) > 70
                  ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : parseInt(video.metrics.completionRate) > 40
                    ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}
            >
              {video.metrics.completionRate}
            </span>
          )}
        </div>

        <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {video.title || `Video ${video.videoId}`}
        </h4>

        {/* Quick Stats */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Views</span>
            <span className="text-white font-medium">
              {video.metrics?.totalViews || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Unique Viewers</span>
            <span className="text-white font-medium">
              {video.metrics?.uniqueViewers || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Avg Watch Time</span>
            <span className="text-white font-medium">
              {video.metrics?.avgWatchTime || "0s"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Engagement</span>
            <span
              className={`font-medium ${getEngagementColor(video.metrics?.engagementScore)}`}
            >
              {video.metrics?.engagementScore || 0}
            </span>
          </div>
        </div>

        {/* Warning Indicators */}
        {video.warnings && video.warnings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-300">{video.warnings[0]}</div>
            </div>
          </div>
        )}

        {/* Decorative Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

// ===========================================
// 🎯 VIDEO DETAIL MODAL COMPONENT
// ===========================================
const VideoDetailModal = ({ video, onClose }) => {
  if (!video) return null;

  // Sample frame data (replace with actual data from API)
  const frameData = Array.from({ length: 20 }, (_, i) => ({
    time: i * 30,
    engagement: Math.floor(Math.random() * 40) + 40,
    viewers: Math.floor(Math.random() * 30) + 10,
  }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {video.title || "Video Details"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Video ID: {video.videoId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <FiMinimize2 className="text-gray-400 text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-white">
                {video.metrics?.totalViews}
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Unique Viewers</p>
              <p className="text-2xl font-bold text-white">
                {video.metrics?.uniqueViewers}
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {video.metrics?.completionRate}
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Avg Watch Time</p>
              <p className="text-2xl font-bold text-white">
                {video.metrics?.avgWatchTime}
              </p>
            </div>
          </div>

          {/* Engagement Heatmap */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Engagement Heatmap
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={frameData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#6B7280"
                    tickFormatter={(value) =>
                      `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`
                    }
                  />
                  <YAxis yAxisId="left" stroke="#6B7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.75rem",
                      color: "#F3F4F6",
                    }}
                    labelFormatter={(value) =>
                      `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`
                    }
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="viewers"
                    fill="#8B5CF6"
                    name="Viewers"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="engagement"
                    stroke="#F59E0B"
                    name="Engagement %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drop-off Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Drop-off Point
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">
                  {video.metrics?.dropOffPoint}
                </div>
                <p className="text-gray-400">
                  {video.metrics?.dropOffPercentage} of viewers leave here
                </p>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Interaction Rates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pause Frequency</span>
                  <span className="text-white font-medium">
                    {video.metrics?.pauseFrequency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Seek Frequency</span>
                  <span className="text-white font-medium">
                    {video.metrics?.seekFrequency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rewatch Count</span>
                  <span className="text-white font-medium">
                    {video.metrics?.rewatchCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {video.warnings && video.warnings.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                ⚠️ Improvement Needed
              </h3>
              <ul className="space-y-2">
                {video.warnings.map((warning, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-300"
                  >
                    <FiAlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 🎯 OVERVIEW METRICS CARD
// ===========================================
const OverviewMetricCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  trend,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6 hover:border-gray-600/50 transition-all duration-500">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${color} blur-3xl`}
      ></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-${color.split("-")[1]}-500/10 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`text-${color.split("-")[1]}-400 text-2xl`} />
          </div>
          {trend && (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                trend > 0
                  ? "text-green-400 bg-green-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
      </div>
    </div>
  );
};

// ===========================================
// 🎯 FUNNEL CHART COMPONENT
// ===========================================
const FunnelChart = ({ data }) => {
  const funnelData = [
    { name: "Started", value: data?.started || 0, color: "#3B82F6" },
    { name: "25% Watched", value: data?.watched25 || 0, color: "#8B5CF6" },
    { name: "50% Watched", value: data?.watched50 || 0, color: "#EC4899" },
    { name: "75% Watched", value: data?.watched75 || 0, color: "#F59E0B" },
    { name: "Completed", value: data?.completed || 0, color: "#10B981" },
  ];

  return (
    <div className="space-y-3">
      {funnelData.map((stage, index) => {
        const width = (stage.value / funnelData[0].value) * 100;
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{stage.name}</span>
              <span className="text-white font-medium">{stage.value}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${width}%`, backgroundColor: stage.color }}
              ></div>
            </div>
          </div>
        );
      })}
      {data?.conversionRate && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Conversion Rate</span>
            <span className="text-2xl font-bold text-green-400">
              {data.conversionRate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================================
// 🎯 MAIN COURSE ANALYTICS DASHBOARD
// ===========================================
const CourseAnalyticsDashboard = () => {
  const { subjectId } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const { data, isLoading, error, refetch } = useGetCourseAnalyticsQuery(
    { subjectId, startDate, endDate },
    { pollingInterval: 60000 }, // Refresh every minute
  );

  const [refreshAnalytics, { isLoading: isRefreshing }] =
    useRefreshCourseAnalyticsMutation();
  const [exportReport, { isLoading: isExporting }] =
    useExportCourseReportMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4 animate-pulse">
            Loading course intelligence...
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
          <h3 className="text-white text-xl font-bold mb-2">
            Failed to Load Course Analytics
          </h3>
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

  const analytics = data?.data;

  // Filter videos based on search and severity
  const filteredVideos =
    analytics?.videoPerformance?.filter((video) => {
      const matchesSearch =
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.videoId?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterSeverity === "all") return matchesSearch;
      if (filterSeverity === "problematic") {
        return matchesSearch && video.warnings && video.warnings.length > 0;
      }
      return matchesSearch;
    }) || [];

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
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/20">
                <FiBookOpen className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Course Intelligence Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Advanced analytics for course {analytics?.courseId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Range Picker */}
              <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2">
                <FiCalendar className="text-gray-400" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Start date"
                  className="bg-transparent text-gray-300 w-24 focus:outline-none"
                />
                <span className="text-gray-600">-</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="End date"
                  className="bg-transparent text-gray-300 w-24 focus:outline-none"
                />
              </div>

              {/* Export Button */}
              <button
                onClick={() => exportReport({ subjectId, startDate, endDate })}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                <FiDownload className={isExporting ? "animate-bounce" : ""} />
                <span>Export</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() =>
                  refreshAnalytics({ subjectId, startDate, endDate })
                }
                disabled={isRefreshing}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`text-gray-400 text-xl ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <OverviewMetricCard
              icon={FiUsers}
              label="Total Students"
              value={analytics?.overview?.totalStudents}
              color="from-blue-500 to-cyan-500"
            />
            <OverviewMetricCard
              icon={FiActivity}
              label="Total Interactions"
              value={analytics?.overview?.totalInteractions}
              subValue={`Avg ${analytics?.overview?.avgInteractionsPerStudent} per student`}
              color="from-purple-500 to-pink-500"
            />
            <OverviewMetricCard
              icon={FiZap}
              label="Engagement Rate"
              value={analytics?.overview?.engagementRate}
              color="from-yellow-500 to-orange-500"
              trend={+5}
            />
            <OverviewMetricCard
              icon={FiTarget}
              label="Avg Completion"
              value="67%"
              color="from-green-500 to-emerald-500"
              trend={-2}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-2 text-gray-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Videos</option>
              <option value="problematic">Problematic Only</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-gray-700/30 transition-colors"
            >
              {viewMode === "grid" ? <FiBarChart2 /> : <FiPieChart />}
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiVideo className="text-purple-400" />
              Videos ({filteredVideos.length})
            </h2>
            <div
              className={`space-y-4 ${viewMode === "grid" ? "grid grid-cols-1" : ""}`}
            >
              {filteredVideos.map((video, index) => (
                <VideoPerformanceCard
                  key={index}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                  isSelected={selectedVideo?.videoId === video.videoId}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Funnel Analysis */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-400" />
                Completion Funnel
              </h3>
              <FunnelChart data={analytics?.funnel} />
              {analytics?.funnel?.criticalDropoff && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-sm text-red-400">
                    ⚠️ Critical Drop-off: {analytics.funnel.criticalDropoff}
                  </p>
                </div>
              )}
            </div>

            {/* Problem Areas */}
            {analytics?.problemAreas?.hasProblems && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <FiAlertCircle />
                  Problem Areas ({analytics.problemAreas.videos.length})
                </h3>
                <div className="space-y-3">
                  {analytics.problemAreas.videos.map((problem, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          problem.severity === "High"
                            ? "bg-red-500/20"
                            : "bg-yellow-500/20"
                        }`}
                      >
                        <FiAlertCircle
                          className={
                            problem.severity === "High"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-white font-medium">
                            {problem.title || "Unknown Video"}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              problem.severity === "High"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {problem.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {problem.issue}
                        </p>
                        <p className="text-sm text-purple-400 mt-2">
                          💡 {problem.suggestedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Patterns */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiClock className="text-purple-400" />
                Time-based Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-sm text-gray-400">Peak Hours</p>
                  <p className="text-lg font-semibold text-white">
                    {analytics?.timePatterns?.peakHours?.length > 0
                      ? analytics.timePatterns.peakHours.join(", ")
                      : "10 AM - 2 PM"}
                  </p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-sm text-gray-400">Weekend vs Weekday</p>
                  <p className="text-lg font-semibold text-white">
                    {analytics?.timePatterns?.weekdayVsWeekend || "65:35"}
                  </p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-sm text-gray-400">Best Time to Publish</p>
                  <p className="text-lg font-semibold text-white">
                    {analytics?.timePatterns?.bestTimeToPublish || "10:00 AM"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analytics?.recommendations &&
              analytics.recommendations.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FiAward className="text-purple-400" />
                    Smart Recommendations
                  </h3>
                  <div className="space-y-3">
                    {analytics.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-xl"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            rec.priority === "High"
                              ? "bg-red-500/20"
                              : rec.priority === "Medium"
                                ? "bg-yellow-500/20"
                                : "bg-blue-500/20"
                          }`}
                        >
                          <FiZap
                            className={
                              rec.priority === "High"
                                ? "text-red-400"
                                : rec.priority === "Medium"
                                  ? "text-yellow-400"
                                  : "text-blue-400"
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-white font-medium">
                              {rec.area}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                rec.priority === "High"
                                  ? "bg-red-500/20 text-red-400"
                                  : rec.priority === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            {rec.insight}
                          </p>
                          <p className="text-sm text-purple-400 mt-2">
                            👉 {rec.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Video Detail Modal */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default CourseAnalyticsDashboard;
