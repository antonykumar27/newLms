// components/DailyGoal.jsx
import React from "react";
import { useDashboard } from "./DashboardContext";
import { FaBullseye, FaCheckCircle, FaClock } from "react-icons/fa"; // Changed FaTarget to FaBullseye

const DailyGoal = () => {
  const { dailyGoal } = useDashboard();
  const progress = (dailyGoal.completed / dailyGoal.target) * 100;

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <FaBullseye className="absolute -right-5 -bottom-5 text-[8rem]" />{" "}
        {/* Changed here */}
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-emerald-100 mb-4 flex items-center gap-2">
          <FaBullseye /> Daily Goal {/* Changed here */}
        </h3>

        <div className="text-3xl font-black mb-1">
          {dailyGoal.completed}/{dailyGoal.target}
        </div>
        <p className="text-emerald-100 text-sm mb-4">lessons completed</p>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-2">
            <FaClock className="text-sm mb-1" />
            <p className="text-xs text-emerald-100">Minutes</p>
            <p className="font-bold">{dailyGoal.minutesLearned}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <FaCheckCircle className="text-sm mb-1" />
            <p className="text-xs text-emerald-100">Quizzes</p>
            <p className="font-bold">{dailyGoal.quizzesDone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGoal;
