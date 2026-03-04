// components/VideoDeepDive.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useGetVideoDeepDiveQuery,
  useRefreshVideoDeepDiveMutation,
  useExportVideoDeepDiveMutation,
} from "../../store/api/ProgressApi";
import {
  FiVideo,
  FiEye,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiMap,
  FiAward,
  FiThumbsUp,
  FiThumbsDown,
  FiZap,
  FiTarget,
  FiSkipForward,
  FiSkipBack,
  FiPauseCircle,
  FiPlayCircle,
  FiRotateCcw,
  FiCpu,
  FiSmartphone,
  FiMonitor,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiMinimize2,
  FiVolume2,
  FiVolumeX,
  FiSettings,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import CountUp from "react-countup";

// ===========================================
// 🎯 VIDEO PLAYER PREVIEW COMPONENT
// ===========================================
const VideoPlayerPreview = ({ videoId, heatmapData, currentTime, onSeek }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      onSeek?.(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    if (videoRef.current) {
      const time = (percent / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(percent);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video group">
      {/* Video Element (placeholder - replace with actual video) */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={`https://via.placeholder.com/640x360?text=Video+${videoId}`}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Heatmap Overlay */}
      {showHeatmap && heatmapData && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            {heatmapData.map((point, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 bg-gradient-to-r from-yellow-500 to-red-500"
                style={{
                  left: `${(point.time / videoRef.current?.duration) * 100}%`,
                  width: "2px",
                  opacity: point.engagement / 100,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isPlaying ? (
            <FiPauseCircle className="text-white text-3xl" />
          ) : (
            <FiPlayCircle className="text-white text-3xl" />
          )}
        </button>

        {/* Progress Bar */}
        <div
          onClick={handleSeek}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 cursor-pointer"
        >
          <div
            className="h-full bg-purple-600 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
          <button className="text-white hover:text-purple-400 transition-colors">
            <FiVolume2 />
          </button>
          <div className="flex-1 text-xs text-white">
            {formatTime(videoRef.current?.currentTime)} /{" "}
            {formatTime(videoRef.current?.duration)}
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              showHeatmap
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Heatmap
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// 🎯 ENGAGEMENT HEATMAP COMPONENT
// ===========================================
const EngagementHeatmap = ({ data, onTimeSelect }) => {
  const [hoveredTime, setHoveredTime] = useState(null);

  // Generate sample heatmap data if none provided
  const heatmapData =
    data ||
    Array.from({ length: 100 }, (_, i) => ({
      time: i * 6, // every 6 seconds for 10 min video
      engagement: Math.floor(Math.random() * 60) + 20,
      viewers: Math.floor(Math.random() * 40) + 10,
      action: ["Pause", "Rewind", "Skip", "Play"][
        Math.floor(Math.random() * 4)
      ],
    }));

  const maxEngagement = Math.max(...heatmapData.map((d) => d.engagement));

  return (
    <div className="relative">
      {/* Heatmap Visualization */}
      <div className="flex h-32 gap-0.5">
        {heatmapData.map((point, index) => (
          <div
            key={index}
            className="flex-1 relative group cursor-pointer"
            onMouseEnter={() => setHoveredTime(point.time)}
            onMouseLeave={() => setHoveredTime(null)}
            onClick={() => onTimeSelect?.(point.time)}
          >
            {/* Heat bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${
                point.engagement > 70
                  ? "from-red-500 to-orange-500"
                  : point.engagement > 40
                    ? "from-yellow-500 to-orange-400"
                    : "from-blue-500 to-green-500"
              } transition-all duration-300 group-hover:opacity-80`}
              style={{
                height: `${(point.engagement / maxEngagement) * 100}%`,
              }}
            >
              {/* Action indicator */}
              {point.action && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {point.action} at {formatTime(point.time)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0:00</span>
        <span>2:00</span>
        <span>4:00</span>
        <span>6:00</span>
        <span>8:00</span>
        <span>10:00</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">High engagement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">Medium engagement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-400">Low engagement</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredTime && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-sm px-3 py-2 rounded-lg border border-gray-700">
          Time: {formatTime(hoveredTime)}
        </div>
      )}
    </div>
  );
};

// ===========================================
// 🎯 NAVIGATION POINTS CHART
// ===========================================
const NavigationPointsChart = ({ data }) => {
  const [selectedType, setSelectedType] = useState("all");

  const navigationData = data || {
    rewinds: [
      { time: 125, count: 45, reason: "Complex concept" },
      { time: 320, count: 32, reason: "Missed something" },
      { time: 480, count: 28, reason: "Important point" },
    ],
    skips: [
      { time: 60, count: 38, reason: "Too slow" },
      { time: 210, count: 25, reason: "Already known" },
      { time: 540, count: 42, reason: "Boring" },
    ],
    pauses: [
      { time: 95, count: 52, reason: "Taking notes" },
      { time: 280, count: 44, reason: "Confused" },
      { time: 420, count: 31, reason: "Processing" },
    ],
  };

  const getAllPoints = () => {
    const points = [];
    if (selectedType === "all" || selectedType === "rewinds") {
      points.push(
        ...navigationData.rewinds.map((p) => ({ ...p, type: "rewind" })),
      );
    }
    if (selectedType === "all" || selectedType === "skips") {
      points.push(...navigationData.skips.map((p) => ({ ...p, type: "skip" })));
    }
    if (selectedType === "all" || selectedType === "pauses") {
      points.push(
        ...navigationData.pauses.map((p) => ({ ...p, type: "pause" })),
      );
    }
    return points.sort((a, b) => b.count - a.count);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "rewind":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "skip":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "pause":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "rewind":
        return <FiRotateCcw className="text-yellow-400" />;
      case "skip":
        return <FiSkipForward className="text-blue-400" />;
      case "pause":
        return <FiPauseCircle className="text-purple-400" />;
      default:
        return <FiInfo className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "rewinds", "skips", "pauses"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
              selectedType === type
                ? "bg-purple-600 text-white"
                : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Navigation points list */}
      <div className="space-y-3">
        {getAllPoints().map((point, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl bg-gray-700/30 p-4 hover:bg-gray-700/50 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              {/* Time indicator */}
              <div className="text-center min-w-[60px]">
                <div className="text-xl font-bold text-white">
                  {formatTime(point.time)}
                </div>
                <div className="text-xs text-gray-400">timestamp</div>
              </div>

              {/* Type icon and count */}
              <div className={`p-2 rounded-lg ${getTypeColor(point.type)}`}>
                {getTypeIcon(point.type)}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white capitalize">
                    {point.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    {point.count} users
                  </span>
                </div>
                <p className="text-sm text-gray-400">{point.reason}</p>
              </div>

              {/* Action button */}
              <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-purple-600 rounded-lg text-xs text-white">
                Analyze
              </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700">
              <div
                className={`h-full ${
                  point.type === "rewind"
                    ? "bg-yellow-500"
                    : point.type === "skip"
                      ? "bg-blue-500"
                      : "bg-purple-500"
                }`}
                style={{ width: `${(point.count / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===========================================
// 🎯 DROPOFF CURVE COMPONENT
// ===========================================
const DropoffCurve = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const dropoffData =
    data ||
    Array.from({ length: 20 }, (_, i) => ({
      time: i * 30,
      viewersRemaining: Math.floor(100 - i * 4.5),
      percentage: 100 - i * 4.5,
    }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={dropoffData}
          onMouseMove={(e) =>
            e.activePayload && setHoveredPoint(e.activePayload[0].payload)
          }
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#6B7280"
            tickFormatter={(value) => formatTime(value)}
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
            labelFormatter={(value) => formatTime(value)}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="viewersRemaining"
            name="Viewers Remaining"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="percentage"
            name="Dropoff %"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <ReferenceLine
            x={hoveredPoint?.time}
            stroke="#6B7280"
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Critical point indicator */}
      {data?.criticalPoint && (
        <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-400" />
            <span className="text-sm text-gray-300">
              Critical drop-off at {data.criticalPoint} - {data.survivalRate}{" "}
              survival rate
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================================
// 🎯 PERFORMANCE METRICS CARD
// ===========================================
const PerformanceMetricCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  trend,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gray-700/30 p-4 hover:bg-gray-700/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`text-${color}-400`} />
        </div>
        {trend && (
          <span
            className={`text-xs ${
              trend > 0
                ? "text-green-400"
                : trend < 0
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
    </div>
  );
};

// ===========================================
// 🎯 MAIN VIDEO DEEP DIVE COMPONENT
// ===========================================
const VideoDeepDive = () => {
  const { videoId } = useParams();
  const [selectedTime, setSelectedTime] = useState(null);
  const [viewMode, setViewMode] = useState("heatmap"); // heatmap, navigation, performance
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data, isLoading, error, refetch } = useGetVideoDeepDiveQuery(
    videoId,
    {
      pollingInterval: 60000, // Refresh every minute
    },
  );

  const [refreshAnalytics, { isLoading: isRefreshing }] =
    useRefreshVideoDeepDiveMutation();
  const [exportReport, { isLoading: isExporting }] =
    useExportVideoDeepDiveMutation();

  // Sample heatmap data (replace with actual API data)
  const heatmapData = Array.from({ length: 100 }, (_, i) => ({
    time: i * 6,
    engagement: Math.floor(Math.random() * 60) + 20,
    viewers: Math.floor(Math.random() * 40) + 10,
    action: ["Pause", "Rewind", "Skip", "Play"][Math.floor(Math.random() * 4)],
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiVideo className="text-purple-400 text-3xl animate-pulse" />
            </div>
          </div>
          <p className="text-white mt-6 animate-pulse text-lg">
            Loading Video Intelligence...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Analyzing viewer behavior
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md backdrop-blur-xl">
          <div className="relative">
            <FiAlertCircle className="text-red-500 text-6xl mx-auto mb-4 animate-bounce" />
            <div className="absolute inset-0 bg-red-500/20 blur-3xl"></div>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">
            Failed to Load Video Analytics
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

  const analytics = data?.data;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white ${
        isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : ""
      }`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-600/20">
                <FiVideo className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Video Deep Dive Analytics
                </h1>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <FiInfo className="text-purple-400" />
                  Video ID: {videoId} • {analytics?.summary?.totalViews} views
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Grade Badge */}
              <div
                className={`px-4 py-2 rounded-xl border ${
                  analytics?.summary?.grade === "A"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : analytics?.summary?.grade === "B"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : analytics?.summary?.grade === "C"
                        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                Grade: {analytics?.summary?.grade || "A"}
              </div>

              {/* Export Button */}
              <button
                onClick={() => exportReport({ videoId, format: "pdf" })}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all duration-300 disabled:opacity-50 border border-green-500/30 hover:border-green-500/50"
              >
                <FiDownload className={isExporting ? "animate-bounce" : ""} />
                <span>Export</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => refreshAnalytics(videoId)}
                disabled={isRefreshing}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`text-gray-400 text-xl ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300"
              >
                {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <PerformanceMetricCard
              icon={FiEye}
              label="Total Views"
              value={analytics?.summary?.totalViews || 1234}
              color="blue"
            />
            <PerformanceMetricCard
              icon={FiUsers}
              label="Unique Viewers"
              value={analytics?.summary?.uniqueViewers || 876}
              color="green"
            />
            <PerformanceMetricCard
              icon={FiTarget}
              label="Avg Completion"
              value={analytics?.summary?.avgCompletion || "67%"}
              color="yellow"
              trend={-5}
            />
            <PerformanceMetricCard
              icon={FiClock}
              label="Total Watch Time"
              value={analytics?.summary?.totalWatchTime || "124h"}
              color="purple"
            />
            <PerformanceMetricCard
              icon={FiZap}
              label="Percentile"
              value={analytics?.summary?.percentileVsAverage || "85%"}
              color="pink"
            />
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: "heatmap", label: "Engagement Heatmap", icon: FiMap },
              {
                id: "navigation",
                label: "Navigation Points",
                icon: FiSkipForward,
              },
              { id: "performance", label: "Performance", icon: FiCpu },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  viewMode === tab.id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800/30 text-gray-400 hover:bg-gray-700/30"
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player Section */}
        <div className="mb-8">
          <VideoPlayerPreview
            videoId={videoId}
            heatmapData={heatmapData}
            currentTime={selectedTime}
            onSeek={setSelectedTime}
          />
        </div>

        {/* View Mode Content */}
        {viewMode === "heatmap" && (
          <div className="space-y-6">
            {/* Engagement Heatmap */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiMap className="text-purple-400" />
                Frame-by-Frame Engagement
              </h3>
              <EngagementHeatmap
                data={analytics?.heatmap}
                onTimeSelect={setSelectedTime}
              />
            </div>

            {/* Dropoff Curve */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingDown className="text-red-400" />
                Viewer Dropoff Curve
              </h3>
              <DropoffCurve data={analytics?.dropoff} />
            </div>
          </div>
        )}

        {viewMode === "navigation" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Navigation Points */}
            <div className="lg:col-span-2 rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiSkipForward className="text-yellow-400" />
                Navigation Patterns
              </h3>
              <NavigationPointsChart data={analytics?.navigation} />
            </div>

            {/* Speed Preferences */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiZap className="text-blue-400" />
                Playback Speed Preferences
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-400">
                    {analytics?.playbackSpeeds?.mostUsed || "1.25x"}
                  </span>
                  <p className="text-sm text-gray-400 mt-1">Most used speed</p>
                </div>
                <div className="space-y-2">
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <div key={speed} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-12">
                        {speed}x
                      </span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  💡{" "}
                  {analytics?.playbackSpeeds?.insight ||
                    "Students prefer watching at 1.25x speed"}
                </p>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiSmartphone className="text-green-400" />
                Device Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiMonitor className="text-blue-400" />
                  <span className="flex-1 text-gray-300">Desktop</span>
                  <span className="text-white font-medium">52%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: "52%" }}
                  ></div>
                </div>

                <div className="flex items-center gap-3">
                  <FiSmartphone className="text-green-400" />
                  <span className="flex-1 text-gray-300">Mobile</span>
                  <span className="text-white font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: "35%" }}
                  ></div>
                </div>

                <div className="flex items-center gap-3">
                  <FiCpu className="text-purple-400" />
                  <span className="flex-1 text-gray-300">Tablet</span>
                  <span className="text-white font-medium">13%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: "13%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "performance" && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PerformanceMetricCard
                icon={FiCpu}
                label="Buffering Events"
                value={analytics?.performance?.bufferingEvents || 234}
                subValue={`${analytics?.performance?.usersAffected || "15%"} of users affected`}
                color="red"
                trend={-8}
              />
              <PerformanceMetricCard
                icon={FiClock}
                label="Avg Buffering Time"
                value={analytics?.performance?.avgBufferingTime || "2.3s"}
                subValue="Per buffering event"
                color="yellow"
                trend={12}
              />
              <PerformanceMetricCard
                icon={FiMonitor}
                label="Streaming Quality"
                value={analytics?.performance?.quality || "HD (720p)"}
                subValue="Most common"
                color="green"
              />
            </div>

            {/* Buffering Timeline */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiCpu className="text-red-400" />
                Buffering Timeline
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Array.from({ length: 20 }, (_, i) => ({
                      time: i * 30,
                      buffering: Math.floor(Math.random() * 10),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="time"
                      stroke="#6B7280"
                      tickFormatter={(value) => formatTime(value)}
                    />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "0.75rem",
                      }}
                      labelFormatter={(value) => formatTime(value)}
                    />
                    <Bar
                      dataKey="buffering"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quality Distribution */}
            <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiSettings className="text-purple-400" />
                Quality Distribution
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { quality: "4K", percentage: 15, color: "green" },
                  { quality: "1080p", percentage: 45, color: "blue" },
                  { quality: "720p", percentage: 30, color: "yellow" },
                  { quality: "480p", percentage: 8, color: "orange" },
                  { quality: "360p", percentage: 2, color: "red" },
                ].map((q) => (
                  <div
                    key={q.quality}
                    className="text-center p-4 bg-gray-700/30 rounded-xl"
                  >
                    <p className="text-sm text-gray-400">{q.quality}</p>
                    <p className={`text-2xl font-bold text-${q.color}-400`}>
                      {q.percentage}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAward className="text-yellow-400" />
            Video Improvement Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics?.improvements?.map((improvement, index) => (
              <div
                key={index}
                className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <FiAlertCircle className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">
                      {improvement.issue}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {improvement.suggestion}
                    </p>
                    <p className="text-xs text-green-400">
                      💡 {improvement.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 flex justify-end gap-4">
          <button className="px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl text-gray-300 transition-colors">
            Share Analysis
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors">
            Generate Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default VideoDeepDive;
