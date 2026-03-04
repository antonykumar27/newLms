// components/ProgressCard.jsx
import React from "react";
import { BookOpen, CheckCircle, Target, TrendingUp } from "lucide-react";

const ProgressCard = ({ completed, total, chaptersDone, totalChapters }) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Course Progress
        </h3>
        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {percentage}%
        </span>
      </div>

      {/* Circular Progress - Optional, can replace with bar */}
      <div className="relative h-32 flex items-center justify-center mb-4">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="50"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="56"
            cy="56"
            r="50"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
            className="text-purple-600 dark:text-purple-400 transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{completed}</div>
            <div className="text-xs text-gray-500">videos</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Chapters</span>
          </div>
          <div className="text-xl font-bold">
            {chaptersDone}/{totalChapters}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Completed</span>
          </div>
          <div className="text-xl font-bold">{completed}</div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">This week's progress</span>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>+12%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
