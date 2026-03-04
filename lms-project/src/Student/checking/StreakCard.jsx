// components/StreakCard.jsx
import React from "react";
import { Flame, Award, TrendingUp } from "lucide-react";

const StreakCard = ({ streak, longest, lastActive }) => {
  return (
    <div className="group bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]"></div>

      {/* Fire Animation */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-300 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Flame className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
            <span className="text-white/80 text-sm">Current Streak</span>
          </div>
          <Award className="w-5 h-5 text-yellow-300" />
        </div>

        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-1 flex items-center justify-center">
            {streak}
            <span className="text-2xl ml-1 text-white/80">days</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Best: {longest}</span>
            </div>
            <div>•</div>
            <div>Last: {lastActive}</div>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-white/80 text-xs mb-1">
            <span>Next milestone: 7 days</span>
            <span>{streak}/7</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(streak / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
