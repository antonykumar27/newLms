// components/CEODashboard.jsx
import React, { useState, useEffect } from "react";
import {
  useGetPlatformAnalyticsQuery,
  useRefreshPlatformAnalyticsMutation,
  useExportExecutiveReportMutation,
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
  FiUsers,
  FiEye,
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiMap,
  FiAward,
  FiThumbsUp,
  FiZap,
  FiTarget,
  FiDollarSign,
  FiTrendingDown,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
  FiGlobe,
  FiCpu,
  FiSmartphone,
  FiMonitor,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiInfo,
} from "react-icons/fi";
import { FiArrowRight, FiVideo } from "react-icons/fi";

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
  Treemap,
} from "recharts";
import CountUp from "react-countup";

// ===========================================
// 🎯 KPI CARD COMPONENT
// ===========================================
const KPICard = ({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  prefix = "",
  suffix = "",
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <FiArrowUp className="text-green-400" />;
    if (trend < 0) return <FiArrowDown className="text-red-400" />;
    return <FiMinus className="text-gray-400" />;
  };

  const getTrendColor = () => {
    if (!trend) return "text-gray-400";
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
      {/* Animated Background */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${color} blur-3xl`}
      ></div>

      {/* Glowing Border */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-${color.split("-")[1]}-500/10 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`text-${color.split("-")[1]}-400 text-2xl`} />
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendColor()} bg-opacity-10 ${
                trend > 0
                  ? "bg-green-500/10"
                  : trend < 0
                    ? "bg-red-500/10"
                    : "bg-gray-500/10"
              }`}
            >
              {getTrendIcon()}
              <span className="text-xs font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {prefix}
            <CountUp end={value} duration={2} separator="," />
            {suffix}
          </span>
        </div>
        {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
    </div>
  );
};

// ===========================================
// 🎯 METRIC TREND CHART
// ===========================================
const MetricTrendChart = ({ data, title, icon: Icon, color }) => {
  return (
    <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Icon className={`text-${color}-400`} />
          {title}
        </h3>
        <div className="flex gap-2">
          <span className="text-xs text-gray-400">Last 30 days</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`gradient-${color}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={`var(--${color}-500)`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--${color}-500)`}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="value"
              stroke={`var(--${color}-500)`}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ===========================================
// 🎯 USER SEGMENT CARD
// ===========================================
const UserSegmentCard = ({
  segment,
  count,
  percentage,
  color,
  icon: Icon,
  description,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-700/30 p-4 border border-gray-600/30">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`text-${color}-400`} />
        </div>
        <span className={`text-${color}-400 font-bold`}>{percentage}</span>
      </div>
      <h4 className="text-white font-medium mb-1">{segment}</h4>
      <p className="text-2xl font-bold text-white mb-2">
        <CountUp end={count} duration={2} separator="," />
      </p>
      <p className="text-xs text-gray-400">{description}</p>

      {/* Mini Sparkline */}
      <div className="absolute bottom-0 right-0 opacity-20">
        <svg width="60" height="30" viewBox="0 0 60 30">
          <path
            d="M0,15 Q10,5 20,20 T40,10 T60,20"
            stroke={`var(--${color}-500)`}
            fill="none"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

// ===========================================
// 🎯 FEATURE ADOPTION CHART
// ===========================================
const FeatureAdoptionChart = ({ data }) => {
  return (
    <div className="space-y-3">
      {data?.map((feature, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">{feature.feature}</span>
            <span className="text-sm font-medium text-white">
              {feature.usersWhoUseIt} users
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${feature.theirRetention}%`,
                backgroundColor:
                  feature.impact === "High"
                    ? "#10B981"
                    : feature.impact === "Medium"
                      ? "#F59E0B"
                      : "#3B82F6",
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">
              {feature.theirRetention} retention
            </span>
            <span
              className={`text-${
                feature.impact === "High"
                  ? "green"
                  : feature.impact === "Medium"
                    ? "yellow"
                    : "blue"
              }-400`}
            >
              {feature.impact} Impact
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===========================================
// 🎯 CHURN REASONS CHART
// ===========================================
const ChurnReasonsChart = ({ data }) => {
  return (
    <div className="space-y-3">
      {data?.map((reason, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-24 text-sm text-gray-400">{reason.reason}</div>
          <div className="flex-1">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-red-500"
                style={{ width: `${reason.percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="w-16 text-sm text-right text-white">
            {reason.percentage}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===========================================
// 🎯 MAIN CEO DASHBOARD
// ===========================================
const CEODashboard = () => {
  const [days, setDays] = useState(30);
  const [selectedTier, setSelectedTier] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  const { data, isLoading, error, refetch } = useGetPlatformAnalyticsQuery(
    { days, tier: selectedTier !== "all" ? selectedTier : undefined },
    { pollingInterval: 300000 }, // Refresh every 5 minutes
  );

  const [refreshAnalytics, { isLoading: isRefreshing }] =
    useRefreshPlatformAnalyticsMutation();
  const [exportReport, { isLoading: isExporting }] =
    useExportExecutiveReportMutation();

  // Sample trend data (replace with actual API data)
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    // Generate sample trend data
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString(),
        value: Math.floor(Math.random() * 1000) + 500,
      });
    }
    setTrendData(data);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiTrendingUp className="text-purple-400 text-3xl animate-pulse" />
            </div>
          </div>
          <p className="text-white mt-6 animate-pulse text-lg">
            Loading CEO Dashboard...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Preparing your business intelligence
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
            Failed to Load Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-600/20 animate-pulse">
                <FiTrendingUp className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  CEO Intelligence Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <FiGlobe className="text-purple-400" />
                  Platform Overview • Last updated{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
              >
                <option value="all">All Users</option>
                <option value="free">Free Tier</option>
                <option value="premium">Premium Tier</option>
                <option value="enterprise">Enterprise</option>
              </select>

              {/* Days Selector */}
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
                <option value={365}>Last year</option>
              </select>

              {/* Export Button */}
              <button
                onClick={() => exportReport({ days, format: "pdf" })}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all duration-300 disabled:opacity-50 border border-green-500/30 hover:border-green-500/50"
              >
                <FiDownload className={isExporting ? "animate-bounce" : ""} />
                <span>Export Report</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => refreshAnalytics({ days, tier: selectedTier })}
                disabled={isRefreshing}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`text-gray-400 text-xl ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Real-time Users</p>
              <p className="text-xl font-bold text-green-400">
                <CountUp
                  end={analytics?.realtime?.currentlyActive || 1243}
                  duration={2}
                />
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Today's Interactions</p>
              <p className="text-xl font-bold text-blue-400">
                <CountUp
                  end={analytics?.realtime?.todayInteractions || 45231}
                  duration={2}
                  separator=","
                />
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Server Status</p>
              <p className="text-xl font-bold text-purple-400">99.9%</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">API Latency</p>
              <p className="text-xl font-bold text-yellow-400">124ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={FiUsers}
            label="Total Users"
            value={analytics?.executiveSummary?.totalUsers || 15234}
            subValue="+1,234 this month"
            trend={12.5}
            color="from-blue-500 to-cyan-500"
          />
          <KPICard
            icon={FiActivity}
            label="Active Users"
            value={analytics?.executiveSummary?.activeUsers || 8765}
            subValue="57% of total users"
            trend={8.3}
            color="from-green-500 to-emerald-500"
          />
          <KPICard
            icon={FiTarget}
            label="Retention Rate"
            value={
              analytics?.executiveSummary?.retentionRate?.replace("%", "") || 76
            }
            suffix="%"
            trend={-2.1}
            color="from-purple-500 to-pink-500"
          />
          <KPICard
            icon={FiDollarSign}
            label="Lifetime Value"
            value={
              analytics?.executiveSummary?.businessHealth?.lifetimeValue?.replace(
                "$",
                "",
              ) || 245
            }
            prefix="$"
            trend={15.7}
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* DAU/MAU Chart */}
          <MetricTrendChart
            data={trendData}
            title="Daily Active Users"
            icon={FiUsers}
            color="blue"
          />

          {/* Engagement Metrics */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiZap className="text-yellow-400" />
              Engagement Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <p className="text-sm text-gray-400">DAU</p>
                <p className="text-2xl font-bold text-white">
                  <CountUp
                    end={
                      analytics?.executiveSummary?.engagement
                        ?.dailyActiveUsers || 5432
                    }
                    duration={2}
                  />
                </p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <p className="text-sm text-gray-400">WAU</p>
                <p className="text-2xl font-bold text-white">
                  <CountUp
                    end={
                      analytics?.executiveSummary?.engagement
                        ?.weeklyActiveUsers || 9876
                    }
                    duration={2}
                  />
                </p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <p className="text-sm text-gray-400">MAU</p>
                <p className="text-2xl font-bold text-white">
                  <CountUp
                    end={
                      analytics?.executiveSummary?.engagement
                        ?.monthlyActiveUsers || 15234
                    }
                    duration={2}
                  />
                </p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <p className="text-sm text-gray-400">Stickiness</p>
                <p className="text-2xl font-bold text-green-400">
                  {analytics?.executiveSummary?.engagement?.stickiness ||
                    "35.6%"}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Session Time</span>
                <span className="text-white font-medium">
                  {analytics?.executiveSummary?.engagement
                    ?.averageSessionTime || "12m 30s"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Interactions/User</span>
                <span className="text-white font-medium">
                  {analytics?.executiveSummary?.engagement
                    ?.interactionsPerUser || "24.5"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Health & Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Business Health */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiDollarSign className="text-green-400" />
              Business Health
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Paying Users</p>
                <p className="text-2xl font-bold text-white">
                  <CountUp
                    end={
                      analytics?.executiveSummary?.businessHealth
                        ?.payingUsers || 3421
                    }
                    duration={2}
                  />
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {analytics?.executiveSummary?.businessHealth
                    ?.conversionRate || "22.4%"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Churn Rate</p>
                <p className="text-2xl font-bold text-red-400">
                  {analytics?.executiveSummary?.businessHealth?.churnRate ||
                    "3.2%"}
                </p>
              </div>

              {/* Tier Distribution */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400 mb-2">
                  User Distribution by Tier
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Free</span>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Premium</span>
                    <span className="text-white">25%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Enterprise</span>
                    <span className="text-white">10%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Segments */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiUsers className="text-purple-400" />
              User Segments
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <UserSegmentCard
                segment="Power Users"
                count={
                  analytics?.userSegments?.details?.powerUsers?.count || 1234
                }
                percentage={
                  analytics?.userSegments?.details?.powerUsers?.percentage ||
                  "15%"
                }
                color="green"
                icon={FiZap}
                description="High engagement, regular users"
              />
              <UserSegmentCard
                segment="At Risk"
                count={analytics?.userSegments?.details?.atRisk?.count || 567}
                percentage={
                  analytics?.userSegments?.details?.atRisk?.percentage || "7%"
                }
                color="red"
                icon={FiTrendingDown}
                description="Might churn soon"
              />
              <UserSegmentCard
                segment="Casual"
                count={analytics?.userSegments?.details?.casual?.count || 3456}
                percentage={
                  analytics?.userSegments?.details?.casual?.percentage || "42%"
                }
                color="yellow"
                icon={FiUserCheck}
                description="Occasional users"
              />
              <UserSegmentCard
                segment="Dormant"
                count={analytics?.userSegments?.details?.dormant?.count || 890}
                percentage={
                  analytics?.userSegments?.details?.dormant?.percentage || "11%"
                }
                color="gray"
                icon={FiUserX}
                description="No activity in 30 days"
              />
            </div>
          </div>

          {/* Growth Projections */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-400" />
              Growth Projections
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">New Users (This Period)</p>
                <p className="text-2xl font-bold text-white">
                  <CountUp
                    end={analytics?.executiveSummary?.growth?.newUsers || 1234}
                    duration={2}
                  />
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Growth Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {analytics?.executiveSummary?.growth?.growthRate || "+12.5%"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400 mb-2">
                  Next Month Projections
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Users</span>
                  <span className="text-white font-medium">
                    <CountUp
                      end={
                        analytics?.executiveSummary?.growth?.projectedUsers ||
                        18500
                      }
                      duration={2}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Revenue</span>
                  <span className="text-white font-medium">
                    {analytics?.executiveSummary?.growth?.projectedRevenue ||
                      "$125K"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Adoption & Churn Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Feature Adoption */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiStar className="text-yellow-400" />
              Feature Adoption & Impact
            </h3>
            <FeatureAdoptionChart
              data={
                analytics?.featureAdoption?.featureImpact || [
                  {
                    feature: "Video Bookmarks",
                    usersWhoUseIt: 5432,
                    theirRetention: 85,
                    impact: "High",
                  },
                  {
                    feature: "Comments",
                    usersWhoUseIt: 4321,
                    theirRetention: 72,
                    impact: "Medium",
                  },
                  {
                    feature: "Notes",
                    usersWhoUseIt: 3210,
                    theirRetention: 68,
                    impact: "Medium",
                  },
                  {
                    feature: "Downloads",
                    usersWhoUseIt: 2109,
                    theirRetention: 91,
                    impact: "High",
                  },
                  {
                    feature: "Share",
                    usersWhoUseIt: 1098,
                    theirRetention: 45,
                    impact: "Low",
                  },
                ]
              }
            />
          </div>

          {/* Churn Analysis */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingDown className="text-red-400" />
              Churn Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-sm text-gray-400">Overall Churn</p>
                  <p className="text-2xl font-bold text-red-400">
                    {analytics?.churnAnalysis?.overallChurn || "3.2%"}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-sm text-gray-400">Predicted Churn</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {analytics?.churnAnalysis?.predictedChurn || "4.1%"}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-400 mt-4">
                Top Churn Reasons
              </h4>
              <ChurnReasonsChart
                data={
                  analytics?.churnAnalysis?.topReasons || [
                    { reason: "Content too hard", percentage: "35%" },
                    { reason: "No time", percentage: "28%" },
                    { reason: "Technical issues", percentage: "18%" },
                    { reason: "Too expensive", percentage: "12%" },
                    { reason: "Found alternative", percentage: "7%" },
                  ]
                }
              />

              {/* Prevention Strategies */}
              <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-400 mb-2">
                  🎯 Prevention Strategies
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-300 flex items-start gap-2">
                    <FiArrowRight className="text-blue-400 mt-0.5" />
                    Send personalized content recommendations
                  </li>
                  <li className="text-sm text-gray-300 flex items-start gap-2">
                    <FiArrowRight className="text-blue-400 mt-0.5" />
                    Offer 1-month discount for at-risk users
                  </li>
                  <li className="text-sm text-gray-300 flex items-start gap-2">
                    <FiArrowRight className="text-blue-400 mt-0.5" />
                    Improve onboarding for struggling users
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Insights & Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Content */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-green-400" />
              Trending Content
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <FiVideo className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      Introduction to React #{i}
                    </p>
                    <p className="text-xs text-gray-400">
                      1,{i}234 views • +{i * 5}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies Detected */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiAlertCircle className="text-yellow-400" />
              Anomalies Detected
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <p className="text-sm font-medium text-red-400">
                  ⚠️ Unusual Drop in Engagement
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  40% drop in last 2 hours
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-400">
                  ⚠️ High Buffering Rate
                </p>
                <p className="text-xs text-gray-400 mt-1">3 videos affected</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-sm font-medium text-blue-400">
                  ℹ️ Sudden Traffic Spike
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  200% increase from India
                </p>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiSmartphone className="text-purple-400" />
              Device Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiMonitor className="text-blue-400" />
                <span className="flex-1 text-gray-300">Desktop</span>
                <span className="text-white font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: "45%" }}
                ></div>
              </div>

              <div className="flex items-center gap-3">
                <FiSmartphone className="text-green-400" />
                <span className="flex-1 text-gray-300">Mobile</span>
                <span className="text-white font-medium">40%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: "40%" }}
                ></div>
              </div>

              <div className="flex items-center gap-3">
                <FiCpu className="text-purple-400" />
                <span className="flex-1 text-gray-300">Tablet</span>
                <span className="text-white font-medium">15%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{ width: "15%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Recommendations */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAward className="text-yellow-400" />
            Strategic Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics?.recommendations?.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  rec.priority === "High"
                    ? "bg-red-500/10 border border-red-500/20"
                    : rec.priority === "Medium"
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : "bg-blue-500/10 border border-blue-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === "High"
                        ? "bg-red-500/20 text-red-400"
                        : rec.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <h4 className="text-white font-medium mb-1">{rec.area}</h4>
                <p className="text-sm text-gray-300 mb-2">{rec.insight}</p>
                <p className="text-sm text-purple-400">👉 {rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
