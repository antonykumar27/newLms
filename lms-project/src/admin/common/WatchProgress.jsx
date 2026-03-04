// components/WatchProgress.jsx
import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
  EyeIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { format, formatDistanceToNow } from "date-fns";
import { useGetUserWatchProgressQuery } from "../../store/api/ProgressApi";
import { useParams } from "react-router-dom";

const WatchProgress = () => {
  // const { videoId, lessonId } = useParams();
  const videoId = "698e9b8447879eb2ad3eb168";
  const pageId = "698c6ee46c129748c536fd8f";

  const { data, isLoading, error, refetch } = useGetUserWatchProgressQuery(
    { videoId, pageId },
    {
      skip: !videoId || !pageId,
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    },
  );
  if (isLoading) {
    return <WatchProgressSkeleton />;
  }

  if (error) {
    return <WatchProgressError error={error} onRetry={refetch} />;
  }
  const refectch = () => {
    refetch();
  };
  const progress = data?.data;
  const isFirstTime = progress?.firstTime || false;

  if (isFirstTime) {
    return <FirstTimeView />;
  }

  const progressPercentage = progress?.progress || 0;
  const isCompleted = progress?.completed || false;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Watch Progress
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track your learning journey
                </p>
                <button
                  onClick={refectch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md 
             hover:bg-blue-700 active:scale-95 transition-all duration-200"
                >
                  Reload
                </button>
              </div>
            </div>

            {isCompleted && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-full shadow-lg animate-pulse">
                <CheckCircleIcon className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">
                  Completed! 🎉
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Progress
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {progressPercentage}%
            </span>
          </div>
          <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                isCompleted
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-25 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ClockIcon}
            label="Last Position"
            value={formatDuration(progress?.lastPosition || 0)}
            color="indigo"
          />
          <StatCard
            icon={EyeIcon}
            label="Total Watch Time"
            value={formatDuration(progress?.totalWatchTime || 0)}
            color="purple"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Unique Watch Time"
            value={formatDuration(progress?.uniqueWatchTime || 0)}
            color="green"
          />
          <StatCard
            icon={ArrowPathIcon}
            label="Times Watched"
            value={`${progress?.repeatCount || 0}x`}
            color="orange"
          />
        </div>

        {/* Additional Info */}
        {(progress?.videoDuration || progress?.firstWatchedAt) && (
          <div className="px-6 pb-6">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {progress?.videoDuration > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <ClockIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Duration:{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDuration(progress.videoDuration)}
                      </span>
                    </span>
                  </div>
                )}

                {progress?.firstWatchedAt && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <CalendarIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      First watched:{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {format(
                          new Date(progress.firstWatchedAt),
                          "MMM d, yyyy",
                        )}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300 ${colors[color]}"></div>
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 bg-gradient-to-br ${colors[color]} rounded-lg shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader
const WatchProgressSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error Component
const WatchProgressError = ({ error, onRetry }) => (
  <div className="w-full max-w-4xl mx-auto p-4">
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
      <div className="mb-4">
        <svg
          className="h-12 w-12 mx-auto text-red-500"
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
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
        Failed to Load Progress
      </h3>
      <p className="text-red-600 dark:text-red-400 mb-4">
        {error?.data?.error || "An unexpected error occurred"}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// First Time View
const FirstTimeView = () => (
  <div className="w-full max-w-4xl mx-auto p-4">
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8 text-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6 shadow-xl animate-bounce">
          <PlayCircleIcon className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Ready to Start Learning!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          This will be your first time watching this video. We'll track your
          progress as you go!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span>Track progress</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <span>Save position</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="h-5 w-5 text-purple-500" />
            <span>Get insights</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helper function
const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export default WatchProgress;
