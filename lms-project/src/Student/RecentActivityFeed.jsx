// components/RecentActivityFeed.jsx
import React from "react";
import {
  PlayIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

const RecentActivityFeed = ({ activities = [], className }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "video":
        return <PlayIcon className="h-4 w-4" />;
      case "quiz":
        return <PuzzlePieceIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30";
      case "quiz":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700";
    }
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity 📋
      </h3>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.pageTitle || "Watched a video"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.subjectName} • {activity.chapterTitle}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {activity.timeSpent > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(activity.timeSpent / 60)} min
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent activity
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Start learning to see your activity here!
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
