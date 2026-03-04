// components/QuickStats.jsx
import React from "react";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const QuickStats = ({ overall, className }) => {
  const stats = [
    {
      label: "Overall Progress",
      value: `${overall?.achievements?.overallCompletion || 0}%`,
      icon: ChartBarIcon,
      color: "blue",
      trend: "+5%",
    },
    {
      label: "Watch Time",
      value: overall?.video?.formattedTotalTime || "0 min",
      icon: ClockIcon,
      color: "purple",
    },
    {
      label: "Videos Done",
      value: overall?.video?.completedVideos || 0,
      icon: CheckCircleIcon,
      color: "green",
      subtext: `of ${overall?.video?.totalVideos || 0}`,
    },
    {
      label: "Quiz Score",
      value: `${overall?.quiz?.averageScore || 0}%`,
      icon: AcademicCapIcon,
      color: "yellow",
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 ${className}`}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 lg:p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-1.5 lg:p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600 dark:bg-${stat.color}-900/30 dark:text-${stat.color}-400`}
            >
              <stat.icon className="h-3 w-3 lg:h-4 lg:w-4" />
            </div>
            {stat.trend && (
              <span className="text-[10px] lg:text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded">
                {stat.trend}
              </span>
            )}
          </div>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>
          {stat.subtext && (
            <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-500 mt-1">
              {stat.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
