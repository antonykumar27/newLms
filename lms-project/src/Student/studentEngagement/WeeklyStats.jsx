// components/WeeklyStats.jsx
import React from "react";
import { useDashboard } from "./DashboardContext";
import {
  FaChartLine,
  FaBook,
  FaCheckCircle,
  FaPercentage,
} from "react-icons/fa";

const WeeklyStats = () => {
  const { weeklyStats } = useDashboard();

  const stats = [
    {
      icon: FaChartLine,
      label: "Study Time",
      value: `${weeklyStats.studyTime}h`,
      color: "blue",
    },
    {
      icon: FaBook,
      label: "Lessons",
      value: weeklyStats.lessonsCompleted,
      color: "emerald",
    },
    {
      icon: FaCheckCircle,
      label: "Quizzes",
      value: weeklyStats.quizzesPassed,
      color: "purple",
    },
    {
      icon: FaPercentage,
      label: "Accuracy",
      value: `${weeklyStats.accuracy}%`,
      color: "orange",
    },
  ];

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <FaChartLine className="text-emerald-400" />
        This Week
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-zinc-800/50 rounded-xl p-3">
              <Icon className={`text-${stat.color}-400 text-lg mb-1`} />
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className="text-white font-bold text-lg">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-sm text-zinc-400">
          XP Gained:{" "}
          <span className="text-emerald-400 font-bold">
            +{weeklyStats.xpGained}
          </span>
        </p>
      </div>
    </div>
  );
};

export default WeeklyStats;
