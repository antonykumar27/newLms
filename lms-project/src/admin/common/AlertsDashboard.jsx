// components/AlertsDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  useGetAlertsQuery,
  useAcknowledgeAlertMutation,
  useMuteAlertMutation,
  useGetAlertHistoryQuery,
} from "../../store/api/ProgressApi";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiAlertOctagon,
  FiBell,
  FiBellOff,
  FiCheck,
  FiX,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiVideo,
  FiCpu,
  FiZap,
  FiUserX,
  FiUserCheck,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiMap,
  FiAward,
  FiThumbsUp,
  FiThumbsDown,
  FiSkipForward,
  FiSkipBack,
  FiPauseCircle,
  FiPlayCircle,
  FiRotateCcw,
  FiCpu as FiCpuIcon,
  FiSmartphone,
  FiMonitor,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiMinimize2,
  FiVolume2,
  FiVolumeX,
  FiSettings,
  FiMail,
  FiMessageSquare,
  FiSend,
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
import CountUp from "react-countup";
import { toast } from "react-toastify";

// ===========================================
// 🎯 ALERT CARD COMPONENT
// ===========================================
const AlertCard = ({ alert, onAcknowledge, onMute }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <FiAlertOctagon className="text-red-400 text-xl" />;
      case "high":
        return <FiAlertTriangle className="text-orange-400 text-xl" />;
      case "medium":
        return <FiAlertCircle className="text-yellow-400 text-xl" />;
      case "info":
        return <FiInfo className="text-blue-400 text-xl" />;
      default:
        return <FiBell className="text-gray-400 text-xl" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          glow: "rgba(239, 68, 68, 0.3)",
        };
      case "high":
        return {
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          text: "text-orange-400",
          glow: "rgba(249, 115, 22, 0.3)",
        };
      case "medium":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          glow: "rgba(234, 179, 8, 0.3)",
        };
      case "info":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          glow: "rgba(59, 130, 246, 0.3)",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          border: "border-gray-500/30",
          text: "text-gray-400",
          glow: "rgba(107, 114, 128, 0.3)",
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "ENGAGEMENT_DROP":
        return <FiTrendingDown className="text-orange-400" />;
      case "SUSPICIOUS_ACTIVITY":
        return <FiUserX className="text-red-400" />;
      case "BUFFERING_ISSUES":
        return <FiCpuIcon className="text-yellow-400" />;
      case "STUDENTS_STRUGGLING":
        return <FiAlertCircle className="text-orange-400" />;
      case "TRENDING_CONTENT":
        return <FiTrendingUp className="text-green-400" />;
      default:
        return <FiBell className="text-gray-400" />;
    }
  };

  const colors = getSeverityColor(alert.severity);
  const timeAgo = getTimeAgo(new Date(alert.timestamp));

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl ${colors.bg} border ${colors.border} backdrop-blur-xl transition-all duration-500 ${
        isHovered ? "scale-[1.02] shadow-2xl" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered ? `0 20px 40px -10px ${colors.glow}` : "none",
      }}
    >
      {/* Animated Background */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-${colors.text.split("-")[1]}-500/10 to-transparent blur-3xl`}
      ></div>

      {/* Glowing Border Animation */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}
            >
              {getSeverityIcon(alert.severity)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {alert.type?.replace(/_/g, " ")}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.bg}`}
                >
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <FiClock className="text-xs" />
                {timeAgo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAcknowledge?.(alert.id)}
              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors group/btn"
              title="Acknowledge"
            >
              <FiCheck className="text-green-400 group-hover/btn:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => onMute?.(alert.id)}
              className="p-2 hover:bg-gray-500/20 rounded-lg transition-colors group/btn"
              title="Mute"
            >
              <FiBellOff className="text-gray-400 group-hover/btn:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-500/20 rounded-lg transition-colors"
            >
              {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          </div>
        </div>

        {/* Message */}
        <p className="text-white mb-4">{alert.message}</p>

        {/* Action */}
        {alert.action && (
          <div
            className={`p-3 rounded-xl ${colors.bg} border ${colors.border} mb-4`}
          >
            <p className="text-sm">
              <span className="text-gray-400">Recommended action: </span>
              <span className="text-white">{alert.action}</span>
            </p>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-700/50 animate-slideDown">
            {/* Affected Items */}
            {alert.affectedVideos && alert.affectedVideos.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Affected Videos
                </h4>
                <div className="space-y-2">
                  {alert.affectedVideos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <FiVideo className="text-gray-400" />
                      <span className="text-white">{video}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alert.users && alert.users.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Affected Users
                </h4>
                <div className="space-y-2">
                  {alert.users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <FiUsers className="text-gray-400" />
                      <span className="text-white">{user}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2">
                <FiEye />
                Investigate
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2">
                <FiSend />
                Notify Team
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
          <div
            className={`h-full transition-all duration-1000 ${
              alert.severity === "critical"
                ? "bg-red-500"
                : alert.severity === "high"
                  ? "bg-orange-500"
                  : alert.severity === "medium"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
            }`}
            style={{ width: `${Math.random() * 100}%` }}
          ></div>
        </div>

        {/* Pulse Animation for Critical Alerts */}
        {alert.severity === "critical" && (
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================================
// 🎯 ALERT STATS CARD
// ===========================================
const AlertStatsCard = ({ icon: Icon, label, value, change, color }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6 hover:border-gray-600/50 transition-all duration-500">
      {/* Animated Background */}
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
          {change && (
            <span
              className={`text-sm ${
                change > 0
                  ? "text-green-400"
                  : change < 0
                    ? "text-red-400"
                    : "text-gray-400"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">
          <CountUp end={value} duration={2} />
        </p>
      </div>
    </div>
  );
};

// ===========================================
// 🎯 TRENDING VIDEO CARD
// ===========================================
const TrendingVideoCard = ({ video, index }) => {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-xl transition-colors group">
      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
        #{index + 1}
      </div>
      <div className="flex-1">
        <p className="text-sm text-white group-hover:text-green-400 transition-colors">
          {video.title || `Video ${video.id}`}
        </p>
        <p className="text-xs text-gray-400">
          {video.views} views • +{video.growth}% growth
        </p>
      </div>
      <div className="text-green-400">
        <FiTrendingUp />
      </div>
    </div>
  );
};

// ===========================================
// 🎯 STRUGGLING STUDENT CARD
// ===========================================
const StrugglingStudentCard = ({ student }) => {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-xl transition-colors group">
      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
        {student.name?.charAt(0) || "S"}
      </div>
      <div className="flex-1">
        <p className="text-sm text-white group-hover:text-orange-400 transition-colors">
          {student.name || "Student"}
        </p>
        <p className="text-xs text-gray-400">
          Struggling at {student.video} • {student.time}
        </p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-purple-600 rounded-lg text-xs text-white">
        Help
      </button>
    </div>
  );
};

// ===========================================
// 🎯 MAIN ALERTS DASHBOARD
// ===========================================
const AlertsDashboard = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const audioRef = useRef(null);

  const { data, isLoading, error, refetch } = useGetAlertsQuery(undefined, {
    pollingInterval: autoRefresh ? 30000 : 0,
  });

  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [muteAlert] = useMuteAlertMutation();
  const { data: historyData } = useGetAlertHistoryQuery({ days: 7 });

  // Play sound for new critical alerts
  useEffect(() => {
    if (data?.data?.critical?.length > 0 && soundEnabled) {
      // Play alert sound
      const audio = new Audio("/alert-sound.mp3");
      audio.play().catch(() => {});

      // Show toast for critical alerts
      data.data.critical.forEach((alert) => {
        toast.error(alert.message, {
          duration: 5000,
          icon: "🚨",
        });
      });
    }
  }, [data, soundEnabled]);

  // Filter alerts
  const filteredAlerts =
    data?.data?.all?.filter((alert) => {
      if (filter !== "all" && alert.severity?.toLowerCase() !== filter)
        return false;
      if (
        searchTerm &&
        !alert.message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-red-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiBell className="text-red-400 text-3xl animate-pulse" />
            </div>
          </div>
          <p className="text-white mt-6 animate-pulse text-lg">
            Loading Alert System...
          </p>
          <p className="text-gray-400 text-sm mt-2">Monitoring for issues</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md backdrop-blur-xl">
          <div className="relative">
            <FiAlertOctagon className="text-red-500 text-6xl mx-auto mb-4 animate-bounce" />
            <div className="absolute inset-0 bg-red-500/20 blur-3xl"></div>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">
            Failed to Load Alerts
          </h3>
          <p className="text-gray-400">
            {error.data?.error || "Something went wrong"}
          </p>
          <button
            onClick={refetch}
            className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg shadow-red-600/20 relative">
                <FiBell className="text-white text-2xl" />
                {data?.data?.critical?.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-xs items-center justify-center">
                      {data.data.critical.length}
                    </span>
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Real-time Alerts System
                </h1>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <FiClock className="text-red-400" />
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-gray-300 focus:outline-none focus:border-red-500/50 transition-all duration-300"
              >
                <option value="all">All Alerts</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="info">Info</option>
              </select>

              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  autoRefresh
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-800/50 text-gray-400"
                }`}
                title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
              >
                <FiRefreshCw
                  className={autoRefresh ? "animate-spin-slow" : ""}
                />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  soundEnabled
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-gray-800/50 text-gray-400"
                }`}
                title={soundEnabled ? "Sound on" : "Sound off"}
              >
                {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
              </button>

              {/* Refresh Button */}
              <button
                onClick={refetch}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300"
              >
                <FiRefreshCw className="text-gray-400 text-xl" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <AlertStatsCard
              icon={FiAlertOctagon}
              label="Critical Alerts"
              value={data?.data?.critical?.length || 0}
              color="from-red-500 to-red-600"
              change={12}
            />
            <AlertStatsCard
              icon={FiAlertTriangle}
              label="High Priority"
              value={data?.data?.high?.length || 0}
              color="from-orange-500 to-orange-600"
              change={-5}
            />
            <AlertStatsCard
              icon={FiAlertCircle}
              label="Medium Priority"
              value={data?.data?.medium?.length || 0}
              color="from-yellow-500 to-yellow-600"
              change={8}
            />
            <AlertStatsCard
              icon={FiInfo}
              label="Info Alerts"
              value={data?.data?.info?.length || 0}
              color="from-blue-500 to-blue-600"
              change={0}
            />
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiBell className="text-red-400" />
              Active Alerts ({filteredAlerts.length})
            </h2>

            {filteredAlerts.length === 0 ? (
              <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-12 text-center">
                <div className="relative">
                  <FiBellOff className="text-gray-400 text-5xl mx-auto mb-4" />
                  <div className="absolute inset-0 bg-green-500/20 blur-3xl"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  All Clear!
                </h3>
                <p className="text-gray-400">No active alerts at the moment</p>
              </div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <AlertCard
                  key={index}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onMute={muteAlert}
                />
              ))
            )}
          </div>

          {/* Right Column - Real-time Insights */}
          <div className="space-y-6">
            {/* Alert History Chart */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-purple-400" />
                Alert History (7 days)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      historyData || [
                        { day: "Mon", critical: 2, high: 4, medium: 6 },
                        { day: "Tue", critical: 1, high: 3, medium: 5 },
                        { day: "Wed", critical: 3, high: 5, medium: 7 },
                        { day: "Thu", critical: 2, high: 4, medium: 4 },
                        { day: "Fri", critical: 4, high: 6, medium: 8 },
                        { day: "Sat", critical: 1, high: 2, medium: 3 },
                        { day: "Sun", critical: 0, high: 1, medium: 2 },
                      ]
                    }
                  >
                    <defs>
                      <linearGradient
                        id="criticalGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#EF4444"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#EF4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "0.75rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="critical"
                      stroke="#EF4444"
                      fill="url(#criticalGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trending Videos */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-green-400" />
                Trending Content
              </h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <TrendingVideoCard
                    key={i}
                    video={{
                      id: i,
                      title: `Introduction to React ${i}`,
                      views: 1234 + i * 100,
                      growth: 15 + i * 2,
                    }}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Struggling Students */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiUsers className="text-orange-400" />
                Students Needing Help
              </h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <StrugglingStudentCard
                    key={i}
                    student={{
                      name: `Student ${i}`,
                      video: "React Hooks",
                      time: "5:30",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiCpuIcon className="text-blue-400" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Server Status</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Healthy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Latency</span>
                  <span className="text-yellow-400">124ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-green-400">0.02%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="text-white">1,234</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors flex items-center justify-center gap-2">
                  <FiMail />
                  Notify All Admins
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2">
                  <FiDownload />
                  Export Alert Log
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors flex items-center justify-center gap-2">
                  <FiSettings />
                  Alert Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
};

export default AlertsDashboard;
