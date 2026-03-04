// components/StreakCard.jsx
import React from "react";
import { FaFire, FaCalendarCheck, FaTrophy, FaClock } from "react-icons/fa";

const StreakCard = () => {
  const streakData = {
    current: 12,
    best: 24,
    totalHours: 128,
    weeklyGoal: 10,
    weeklyProgress: 7,
  };

  return (
    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 top-10 w-40 h-40 rounded-full bg-white" />
        <FaFire className="absolute -bottom-10 -left-10 text-[10rem] rotate-12" />
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-orange-100 mb-4 flex items-center gap-2">
          <FaFire /> Current Streak
        </h3>

        <div className="text-5xl font-black mb-2">
          {streakData.current} days
        </div>
        <p className="text-orange-100 text-sm mb-6">
          Best: {streakData.best} days
        </p>

        {/* Weekly Goal */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Weekly Goal</span>
            <span>
              {streakData.weeklyProgress}/{streakData.weeklyGoal} days
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: `${(streakData.weeklyProgress / streakData.weeklyGoal) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white/10 rounded-lg p-3">
            <FaClock className="mb-1" />
            <p className="text-xs text-orange-100">Total Hours</p>
            <p className="font-bold">{streakData.totalHours}h</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <FaTrophy className="mb-1" />
            <p className="text-xs text-orange-100">Longest</p>
            <p className="font-bold">{streakData.best} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
