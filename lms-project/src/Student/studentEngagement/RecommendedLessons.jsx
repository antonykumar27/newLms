// components/RecommendedLessons.jsx
import React from "react";
import { useDashboard } from "./DashboardContext";
import { FaClock, FaSignal, FaPlay } from "react-icons/fa";

const RecommendedLessons = () => {
  const { recommended } = useDashboard();

  const getLevelColor = (level) => {
    if (level === "beginner") return "text-green-400";
    if (level === "intermediate") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <h3 className="font-bold text-white mb-4">Recommended for You</h3>

      <div className="space-y-3">
        {recommended.map((lesson) => (
          <div
            key={lesson.id}
            className="group p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">
                {lesson.title}
              </h4>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-500 rounded-lg transition-all">
                <FaPlay className="text-white text-xs" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-zinc-500">
                <FaClock /> {lesson.duration}
              </span>
              <span
                className={`flex items-center gap-1 ${getLevelColor(lesson.level)}`}
              >
                <FaSignal /> {lesson.level}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-center text-sm text-zinc-400 hover:text-white py-2 transition-colors">
        View All Recommendations →
      </button>
    </div>
  );
};

export default RecommendedLessons;
