// components/HeatmapWidget.jsx
import React, { useState } from "react";
import { useDashboard } from "./DashboardContext";
import { FaFire, FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const HeatmapWidget = () => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const { heatmap, streak } = useDashboard();

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  const getColor = (count) => {
    if (count === 0) return "bg-zinc-800";
    if (count === 1) return "bg-emerald-900";
    if (count === 2) return "bg-emerald-700";
    if (count === 3) return "bg-emerald-500";
    return "bg-emerald-400";
  };

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

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <FaCalendarAlt className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Learning Activity</h3>
            <p className="text-xs text-zinc-500">
              {streak.totalHours} hours total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-xl">
          <FaFire className="text-orange-400" />
          <span className="font-bold text-white">{streak.current}</span>
          <span className="text-xs text-zinc-400">day streak</span>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex mb-2 text-xs text-zinc-600 pl-8">
        {months.map((month) => (
          <div key={month} className="flex-1 text-center">
            {month}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-1">
        {/* Day Labels */}
        <div className="text-xs text-zinc-600 space-y-1 pr-2">
          <div>Mon</div>
          <div>Wed</div>
          <div>Fri</div>
        </div>

        {/* Weeks */}
        <div className="flex-1 flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
          {weeks.slice(0, 52).map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <motion.div
                  key={dIdx}
                  whileHover={{ scale: 1.3 }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-4 h-4 rounded-sm cursor-pointer ${getColor(day.count)} hover:ring-2 hover:ring-emerald-400/50`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
          >
            <div className="flex items-center gap-3 text-sm">
              <div
                className={`w-3 h-3 rounded-sm ${getColor(hoveredDay.count)}`}
              />
              <span className="text-zinc-300">
                {hoveredDay.date}: {hoveredDay.count} activities •{" "}
                {hoveredDay.topic}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-zinc-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            </div>
            <span className="text-zinc-500">More</span>
          </div>
        </div>

        <div className="text-zinc-600">
          {heatmap.filter((d) => d.count > 0).length} active days
        </div>
      </div>
    </div>
  );
};

export default HeatmapWidget;
