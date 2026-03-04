// components/PlatformAnalytics.jsx
import React, { useState } from "react";
import {
  GlobeAltIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useGetPlatformAnalyticsQuery } from "../../store/api/ProgressApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PlatformAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { data, isLoading, error, refetch } =
    useGetPlatformAnalyticsQuery(dateRange);

  // Show loading skeleton
  if (isLoading) return <PlatformSkeleton />;

  // Show error state
  if (error) return <PlatformError error={error} onRetry={refetch} />;

  const analytics = data?.data;
  const overview = analytics?.overview || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with animation */}
        <div className="mb-6 md:mb-8 animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Analytics
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Overall platform performance and metrics
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 md:mb-8 animate-slideIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <OverviewCard
            icon={GlobeAltIcon}
            label="Total Sessions"
            value={overview.totalSessions?.toLocaleString() || "0"}
            color="blue"
          />
          <OverviewCard
            icon={UsersIcon}
            label="Unique Viewers"
            value={overview.uniqueViewers?.toLocaleString() || "0"}
            color="purple"
          />
          <OverviewCard
            icon={ClockIcon}
            label="Total Watch Time"
            value={overview.totalWatchTime || "0s"}
            color="green"
          />
          <OverviewCard
            icon={ChartBarIcon}
            label="Avg Engagement"
            value={
              overview.averageEngagement
                ? `${overview.averageEngagement}%`
                : "0%"
            }
            color="orange"
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.completionRate || "0"}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg Session Duration
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.averageWatchTime || "0s"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics?.popularContent?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Popular Videos
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics?.dailyActiveUsers?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Days Tracked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Active Users Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Active Users
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics?.dailyActiveUsers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#F9FAFB",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Active Users"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#10B981"
                strokeWidth={2}
                name="Sessions"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Content Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Content
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unique Viewers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Watch Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analytics?.popularContent?.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.title || "Untitled"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.views?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.uniqueViewers?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.avgWatchTime || "0s"}
                    </td>
                  </tr>
                ))}
                {(!analytics?.popularContent ||
                  analytics.popularContent.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No data available for the selected date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== Helper Components ==========

// Overview Card Component
const OverviewCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 md:p-3 bg-gradient-to-r ${colors[color]} rounded-lg shadow-lg`}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const PlatformSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>

      {/* Filter Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 md:mb-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>

      {/* Secondary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-[350px] bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error Component
const PlatformError = ({ error, onRetry }) => {
  // Get error message
  const errorMessage =
    error?.data?.error || error?.message || "An unexpected error occurred";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 md:p-8 text-center animate-fadeIn">
          {/* Error Icon */}
          <div className="mb-4">
            <svg
              className="h-12 w-12 md:h-16 md:w-16 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h3 className="text-lg md:text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to Load Platform Analytics
          </h3>
          <p className="text-sm md:text-base text-red-600 dark:text-red-400 mb-6">
            {errorMessage}
          </p>

          {/* Retry Button */}
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
