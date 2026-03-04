// components/ProgressWidget.jsx
import React from "react";
import { useDashboard } from "./DashboardContext";
import { FaBook, FaCheckCircle, FaClock } from "react-icons/fa";

const ProgressWidget = () => {
  const { courses, overallProgress } = useDashboard();

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FaBook className="text-emerald-400" />
          Course Progress
        </h3>
        <span className="text-sm text-zinc-400">
          Overall {overallProgress}%
        </span>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Individual Courses */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{course.title}</p>
                <p className="text-xs text-zinc-500">
                  {course.completedLessons}/{course.totalLessons} lessons
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {course.progress}%
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${course.color}-500 rounded-full`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressWidget;
