// components/UserEngagementReport.jsx
import React, { useState } from "react";
import {
  UserIcon,
  CalendarIcon,
  FireIcon,
  ClockIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useGetUserEngagementReportQuery } from "../../store/api/ProgressApi";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "../../common/AuthContext"; // adjust if needed

const UserEngagementReport = () => {
  const { user } = useAuth();
  const userId = user?.user?._id;
  const [days, setDays] = useState(30);
  const { data, isLoading, error, refetch } = useGetUserEngagementReportQuery({
    userId,
    days,
  });

  if (isLoading) return <EngagementSkeleton />;
  if (error) return <EngagementError error={error} onRetry={refetch} />;

  const report = data?.data;
  const overview = report?.overview || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Engagement Report
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Detailed learning analytics and activity tracking
          </p>
        </div>

        {/* Days Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 md:mb-8 animate-slideIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Period:
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <OverviewCard
            icon={CalendarIcon}
            label="Active Days"
            value={overview.activeDays || 0}
            color="blue"
          />
          <OverviewCard
            icon={FireIcon}
            label="Current Streak"
            value={`${overview.currentStreak || 0} days`}
            color="orange"
          />
          <OverviewCard
            icon={FireIcon}
            label="Longest Streak"
            value={`${overview.longestStreak || 0} days`}
            color="red"
          />
          <OverviewCard
            icon={ClockIcon}
            label="Avg Daily Time"
            value={overview.averageDailyTime || "0s"}
            color="green"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Summary Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Sessions
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.totalSessions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Watch Time
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.totalWatchTime || "0s"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.completionRate || "0%"}
                </span>
              </div>
            </div>
          </div>

          {/* Subject Breakdown Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subjects Overview
            </h3>
            <div className="space-y-3">
              {report?.subjectBreakdown?.slice(0, 3).map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                    {subject.subjectName}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {subject.totalWatchTime}
                  </span>
                </div>
              ))}
              {(report?.subjectBreakdown?.length || 0) > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  +{report?.subjectBreakdown?.length - 3} more subjects
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subject Breakdown Detailed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subject-wise Activity
            </h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {report?.subjectBreakdown?.map((subject, index) => {
                const totalSeconds = parseInt(subject.totalWatchTime) || 0;
                const maxTime = Math.max(
                  ...(report?.subjectBreakdown?.map(
                    (s) => parseInt(s.totalWatchTime) || 0,
                  ) || [1]),
                );
                const percentage =
                  maxTime > 0 ? (totalSeconds / maxTime) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {subject.subjectName}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.totalWatchTime}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{subject.sessions || 0} sessions</span>
                      <span>{subject.videosWatched || 0} videos</span>
                      <span>{subject.completions || 0} completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {report?.recentActivity?.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <PlayIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.video || "Untitled Video"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activity.subject || "No Subject"} •{" "}
                      {activity.chapter || "No Chapter"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.date), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {activity.watchTime}
                      </span>
                    </div>
                    {activity.completed && (
                      <span className="inline-block mt-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Completed ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!report?.recentActivity ||
                report.recentActivity.length === 0) && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent activity found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// Skeleton Component
const EngagementSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>

      {/* Filter Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 md:mb-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
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

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Error Component
const EngagementError = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 md:p-8 text-center animate-fadeIn">
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
        <h3 className="text-lg md:text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Failed to Load Engagement Data
        </h3>
        <p className="text-sm md:text-base text-red-600 dark:text-red-400 mb-4">
          {error?.data?.error ||
            error?.message ||
            "An unexpected error occurred"}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

export default UserEngagementReport;
