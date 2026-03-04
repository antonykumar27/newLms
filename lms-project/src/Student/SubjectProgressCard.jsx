// components/SubjectProgressCard.jsx
import React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const SubjectProgressCard = ({
  subject,
  isExpanded,
  onToggle,
  onChapterClick,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Subject Header */}
      <div
        onClick={onToggle}
        className="p-4 lg:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {subject?.icon && (
                <img
                  src={subject?.icon}
                  alt={subject?.subjectName}
                  className="w-8 h-8 rounded-lg"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subject?.subjectName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subject?.progress?.totalChapters || 0} Chapters
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {subject?.progress?.progressPercentage || 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{
                    width: `${subject?.progress?.progressPercentage || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 ml-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chapters
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {subject?.progress?.chaptersCompleted || 0}/
                {subject?.progress?.totalChapters || 0}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Watch Time
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {subject?.progress?.formattedWatchTime || "0 min"}
              </p>
            </div>
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Chapters */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 lg:p-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Chapters
          </h4>
          <div className="space-y-2">
            {subject.chapters?.map((chapter) => (
              <button
                key={chapter.chapterId}
                onClick={() => onChapterClick(chapter.chapterId)}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Ch {chapter.chapterNumber}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {chapter.title}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {chapter.progress?.pagesCompleted || 0}/
                    {chapter.progress?.totalPages || 0} pages
                  </span>
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${chapter.progress?.progressPercentage || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectProgressCard;
