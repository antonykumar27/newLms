// components/BadgesCard.jsx
import React from "react";
import {
  FaFire,
  FaRocket,
  FaStar,
  FaBrain,
  FaCode,
  FaUsers,
  FaTrophy,
  FaLock,
} from "react-icons/fa";

const BadgesCard = () => {
  const badges = [
    {
      name: "7 Day Streak",
      icon: FaFire,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      unlocked: true,
    },
    {
      name: "Quick Learner",
      icon: FaRocket,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      unlocked: true,
    },
    {
      name: "Quiz Master",
      icon: FaBrain,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      unlocked: true,
    },
    {
      name: "Team Player",
      icon: FaUsers,
      color: "text-green-400",
      bg: "bg-green-400/10",
      unlocked: false,
    },
    {
      name: "Code Wizard",
      icon: FaCode,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      unlocked: false,
    },
    {
      name: "Champion",
      icon: FaTrophy,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      unlocked: false,
    },
  ];

  const earnedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FaStar className="text-yellow-400" />
          Badges
        </h3>
        <span className="text-xs text-zinc-500">
          {earnedCount}/{badges.length} earned
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center p-2
                ${badge.unlocked ? badge.bg : "bg-zinc-800/50"}
                ${badge.unlocked ? "hover:scale-105" : "opacity-50"}
                transition-all cursor-pointer relative group
              `}
            >
              {!badge.unlocked && (
                <FaLock className="absolute top-1 right-1 text-zinc-600 text-[8px]" />
              )}
              <Icon
                className={`text-xl mb-1 ${badge.unlocked ? badge.color : "text-zinc-600"}`}
              />
              <span className="text-[10px] text-center text-zinc-400">
                {badge.name}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-zinc-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  {badge.unlocked ? "Earned" : "Locked"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-center text-sm text-zinc-400 hover:text-white py-2 transition-colors">
        View All Badges →
      </button>
    </div>
  );
};

export default BadgesCard;
