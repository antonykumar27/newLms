// components/ActivityHeatmap.jsx
import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const ActivityHeatmap = ({ data = [] }) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Mon", "Wed", "Fri"]; // Simplified for demo

  const getIntensityClass = (value) => {
    if (!value || value === 0) return "bg-gray-100 dark:bg-gray-800";
    if (value < 30) return "bg-green-200 dark:bg-green-900/30";
    if (value < 60) return "bg-green-300 dark:bg-green-700";
    if (value < 90) return "bg-green-500 dark:bg-green-600";
    return "bg-green-700 dark:bg-green-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Calendar 📅
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="w-4 h-4 bg-green-200 dark:bg-green-900/30 rounded"></div>
            <div className="w-4 h-4 bg-green-300 dark:bg-green-700 rounded"></div>
            <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded"></div>
            <div className="w-4 h-4 bg-green-700 dark:bg-green-500 rounded"></div>
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month labels */}
          <div className="flex ml-8 mb-2">
            {months.map((month, i) => (
              <div key={i} className="flex-1 text-xs text-gray-500">
                {month}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-2">
              {days.map((day, i) => (
                <div key={i} className="h-4 text-xs text-gray-500 mb-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Activity squares */}
            <div className="flex-1 grid grid-cols-52 gap-1">
              {Array.from({ length: 52 * 7 }).map((_, i) => {
                const value = data[i] || 0;
                return (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded-sm ${getIntensityClass(value)} transition-colors hover:scale-110 cursor-default`}
                    title={`${value} minutes watched`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs text-gray-500">
        <InformationCircleIcon className="h-4 w-4 mr-1" />
        Last 365 days activity
      </div>
    </div>
  );
};

export default ActivityHeatmap;
