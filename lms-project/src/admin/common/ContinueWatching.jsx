// components/ContinueWatching.jsx
import React from "react";
import {
  PlayIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useGetContinueWatchingQuery } from "../../store/api/ProgressApi";
import { formatDistanceToNow } from "date-fns";

const ContinueWatching = ({ limit = 10 }) => {
  const { data, isLoading, error } = useGetContinueWatchingQuery(limit);

  if (isLoading) {
    return <ContinueWatchingSkeleton />;
  }

  if (error || !data?.data?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <PlayIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Videos in Progress
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start watching some videos to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Continue Watching
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.data.map((item) => (
          <div
            key={item.videoId}
            className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              {/* Thumbnail Placeholder */}
              <div className="relative flex-shrink-0 w-32 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon className="h-8 w-8 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                  {formatDuration(item.timeLeft)} left
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                  {item.videoId?.title || "Untitled Video"}
                </h3>

                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{item.subjectId?.name || "No Subject"}</span>
                  <span>•</span>
                  <span>{item.chapterId?.name || "No Chapter"}</span>
                  <span>•</span>
                  <span>{item.pageId?.title || "No Page"}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.progress}%
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Last watched{" "}
                    {formatDistanceToNow(new Date(item.lastWatchedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue <ArrowRightIcon className="h-3 w-3 inline" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.data.length >= limit && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View All
          </button>
        </div>
      )}
    </div>
  );
};

// Skeleton
const ContinueWatchingSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex space-x-4">
          <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ContinueWatching;
