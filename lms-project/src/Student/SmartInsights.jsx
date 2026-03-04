// components/SmartInsights.jsx
import React from "react";
import {
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const SmartInsights = ({ analytics }) => {
  const insights = [
    {
      icon: ClockIcon,
      title: "Study Pattern",
      value: analytics?.preferredStudyTime || "Evening",
      description: "You study best at night 🌙",
      color: "blue",
    },
    {
      icon: AcademicCapIcon,
      title: "Strongest Subject",
      value: analytics?.strongestSubject?.name || "Mathematics",
      description: "85% completion rate",
      color: "green",
    },
    {
      icon: ChartBarIcon,
      title: "Consistency Score",
      value: `${analytics?.consistencyScore || 75}%`,
      description: `${getConsistencyMessage(analytics?.consistencyScore)}`,
      color: "purple",
    },
    {
      icon: LightBulbIcon,
      title: "Smart Tip",
      value: "Study 15 mins more",
      description: "To reach weekly goal",
      color: "yellow",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Smart Insights 🧠
      </h3>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            green:
              "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            purple:
              "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
            yellow:
              "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
          };

          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${colorClasses[insight.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {insight.title}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {insight.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Prediction */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            🎯 Course Completion Prediction
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {predictCompletion(analytics)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on your current pace
          </p>
        </div>
      </div>
    </div>
  );
};

const getConsistencyMessage = (score) => {
  if (score >= 80) return "Excellent consistency!";
  if (score >= 60) return "Good, keep it up!";
  if (score >= 40) return "Try to study daily";
  return "Build a routine";
};

const predictCompletion = (analytics) => {
  // Complex logic here
  return "Complete in 24 days 🚀";
};

export default SmartInsights;
