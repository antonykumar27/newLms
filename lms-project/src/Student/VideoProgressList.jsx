// components/VideoProgressList.jsx
import React, { useState } from "react";
import { PlayIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

const VideoProgressList = ({ videos = [], onVideoClick }) => {
  const [filter, setFilter] = useState("all");

  const filteredVideos = videos.filter((video) => {
    if (filter === "completed") return video.completed;
    if (filter === "inProgress") return !video.completed && video.progress > 0;
    if (filter === "notStarted") return video.progress === 0;
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 p-4 overflow-x-auto">
          {["all", "inProgress", "completed", "notStarted"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                filter === f
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {f === "all" && "All Videos"}
              {f === "inProgress" && "In Progress"}
              {f === "completed" && "Completed"}
              {f === "notStarted" && "Not Started"}
            </button>
          ))}
        </div>
      </div>

      {/* Video List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => onVideoClick(video.videoId)}
            >
              <div className="flex items-center space-x-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.videoTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {video.videoTitle}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {video.subjectName} • {video.chapterTitle}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          video.completed ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {video.progress}%
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {video.formattedWatchTime || "0 min"}
                    </span>
                    {video.lastWatchedFromNow && (
                      <span>• {video.lastWatchedFromNow}</span>
                    )}
                  </div>
                </div>

                {/* Play Button */}
                <button className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <PlayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No videos found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoProgressList;
