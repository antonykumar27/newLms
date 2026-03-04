// components/StreakCard.jsx
import React from "react";
import { FireIcon } from "@heroicons/react/24/solid";

const StreakCard = ({ streak = 0, longest = 0, lastActive }) => {
  const getStreakMessage = () => {
    if (streak === 0) return "Start your learning journey today! 🔥";
    if (streak < 3) return `${streak} day streak! Keep going! 💪`;
    if (streak < 7) return `${streak} days! You're on fire! 🔥🔥`;
    if (streak < 30) return `${streak} day streak! Unstoppable! 🚀`;
    return `${streak} days! LEGENDARY! 👑`;
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orange-100 text-sm">Current Streak</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">{streak}</span>
            <span className="ml-2 text-orange-100">days</span>
          </div>
          <p className="mt-2 text-orange-100 text-sm">
            Longest: {longest} days
          </p>
          <p className="mt-4 text-white/90 font-medium">{getStreakMessage()}</p>
        </div>
        <div className="relative">
          <FireIcon className="h-20 w-20 text-orange-200 animate-pulse" />
          {streak > 0 && (
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white">
              {streak}
            </span>
          )}
        </div>
      </div>

      {/* Next Milestone */}
      <div className="mt-4 pt-4 border-t border-orange-400/30">
        <p className="text-sm text-orange-100">
          Next milestone: {getNextMilestone(streak)} days 🎯
        </p>
        <div className="mt-2 h-2 bg-orange-300/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${(streak % 7) * 14.28}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const getNextMilestone = (current) => {
  if (current < 3) return 3;
  if (current < 7) return 7;
  if (current < 15) return 15;
  if (current < 30) return 30;
  if (current < 50) return 50;
  if (current < 100) return 100;
  return 365;
};

export default StreakCard;
